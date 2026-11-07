import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, Clock, MapPin, ShieldCheck, Phone, Zap, AlertCircle, 
  RotateCw, LocateFixed, Compass, CheckCircle2, ChevronRight, School, Home
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import rider3dImg from '../assets/delivery_rider_3d.png';
import { REAL_ROAD_DATA } from '../data/realRoadRoutes';
import { getDistrictResidentialHub } from '../data/tnSchoolsData';
import { 
  haversineMeters,
  resampleRoadPath, 
  calculateBearing, 
  getPositionAlongRoad,
  getStreetNameAtRatio, 
  fetchDynamicRoadRoute,
  generateDynamicRoadCorridor,
  getShortestCorridorVector,
  resolveChennaiLocality,
  resolveSchoolMeta,
  assignTrafficZones
} from '../utils/roadRouting';

// ─── CUSTOM RICH ICONS ──────────────────────────────────────────
const createHomeIcon = (label = 'HOME PICKUP') => L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #10B981, #059669); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 18px rgba(16,185,129,0.7), 0 3px 8px rgba(0,0,0,0.3); border: 2.5px solid #FFFFFF; color: #FFF; font-size: 17px;">
        🏠
      </div>
      <div style="margin-top: 4px; background: rgba(15, 23, 42, 0.94); border: 1px solid rgba(16,185,129,0.5); border-radius: 8px; padding: 2px 8px; color: #34D399; font-size: 0.65rem; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.4); letter-spacing: 0.04em;">
        ${label}
      </div>
    </div>
  `,
  iconSize: [60, 60],
  iconAnchor: [30, 20]
});

const createSchoolIcon = (schoolName, gate) => L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #F97316, #EA580C); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(249,115,22,0.8), 0 4px 10px rgba(0,0,0,0.3); border: 2.5px solid #FFFFFF; color: #FFF; font-size: 19px;">
        🏫
      </div>
      <div style="margin-top: 4px; background: rgba(15, 23, 42, 0.95); border: 1.5px solid rgba(249,115,22,0.6); border-radius: 8px; padding: 3px 9px; color: #FED7AA; font-size: 0.68rem; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.4);">
        <span>${gate || 'GATE 2 RECEPTION'}</span>
      </div>
    </div>
  `,
  iconSize: [80, 70],
  iconAnchor: [40, 22]
});

const createBikeIcon = (driverName, bearing, speed, trafficType, isWaitingAtSignal) => {
  // When heading west (180 to 360 deg), flip the rider to face left
  const isFacingWest = bearing > 180 && bearing < 360;
  const scaleX = isFacingWest ? -1 : 1;
  // Subtle pitch rotation to match road gradient
  const roadPitch = Math.sin((bearing * Math.PI) / 180) * 8;

  let speedTag = `${speed} km/h`;
  let statusDotColor = '#10B981';
  let speedColor = '#6EE7B7';
  let pillBorder = 'rgba(16, 185, 129, 0.7)';
  let pillGlow = 'rgba(16, 185, 129, 0.35)';

  if (speed === 0 && isWaitingAtSignal) {
    speedTag = '0 km/h • Signal Stop 🛑';
    statusDotColor = '#EF4444';
    speedColor = '#FCA5A5';
    pillBorder = '#EF4444';
    pillGlow = 'rgba(239, 68, 68, 0.65)';
  } else if (trafficType === 'heavy') {
    if (speed === 0) {
      speedTag = '0 km/h • Traffic Halt 🛑';
    } else {
      speedTag = `${speed} km/h • In Traffic 🔴`;
    }
    statusDotColor = '#EF4444';
    speedColor = '#FCA5A5';
    pillBorder = '#EF4444';
    pillGlow = 'rgba(239, 68, 68, 0.65)';
  } else if (trafficType === 'moderate') {
    speedTag = `${speed} km/h • Moderate 🟡`;
    statusDotColor = '#F59E0B';
    speedColor = '#FDE68A';
    pillBorder = '#F59E0B';
    pillGlow = 'rgba(245, 158, 11, 0.45)';
  } else if (trafficType === 'school_zone') {
    speedTag = `${speed} km/h • School Zone 🏫`;
    statusDotColor = '#F97316';
    speedColor = '#FED7AA';
    pillBorder = '#F97316';
    pillGlow = 'rgba(249, 115, 22, 0.5)';
  } else {
    // clear corridor
    speedTag = `${speed} km/h • Clear Road 🟢`;
    statusDotColor = '#10B981';
    speedColor = '#6EE7B7';
    pillBorder = '#10B981';
    pillGlow = 'rgba(16, 185, 129, 0.4)';
  }

  const isBraking = speed === 0 || isWaitingAtSignal;

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; width: 120px; height: 104px;">
        <!-- Ambient Pulse Radar Rings on the road -->
        <div style="position: absolute; top: 22px; left: 35px; width: 50px; height: 50px; border-radius: 50%; background: ${statusDotColor}33; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; pointer-events: none;"></div>

        <!-- 3D Delivery Man Riding Scooter (Exact 3D Character with Directional Flip & Turning Tilt) -->
        <div style="
          width: 76px; height: 76px;
          position: relative;
          z-index: 10;
          transform: scaleX(${scaleX}) rotate(${roadPitch * scaleX}deg);
          transition: transform 0.2s cubic-bezier(0.25, 1, 0.5, 1);
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.45));
          display: flex; align-items: center; justify-content: center;
        ">
          <img 
            src="${rider3dImg}" 
            alt="3D Delivery Rider" 
            style="width: 74px; height: 74px; object-fit: contain; pointer-events: none; user-select: none;"
          />

          <!-- Active Red Brake Taillight on Scooter when stopped in traffic or at signal -->
          ${isBraking ? `
            <div style="
              position: absolute;
              bottom: 18px;
              ${scaleX === -1 ? 'right: 18px;' : 'left: 18px;'};
              width: 8px; height: 8px;
              border-radius: 50%;
              background: #EF4444;
              box-shadow: 0 0 12px 4px rgba(239, 68, 68, 0.95);
              z-index: 15;
              animation: pulse 0.8s infinite;
            "></div>
          ` : ''}
        </div>

        <!-- Driver Tag Pill (Swiggy / Zomato Style) -->
        <div style="
          margin-top: -6px;
          background: #0B1120;
          border: 1.5px solid ${pillBorder};
          border-radius: 20px;
          padding: 2.5px 10px;
          color: #FFF;
          font-size: 0.7rem;
          font-weight: 800;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0,0,0,0.65), 0 0 10px ${pillGlow};
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 20;
        ">
          <span style="width: 7px; height: 7px; border-radius: 50%; background: ${statusDotColor}; display: inline-block; box-shadow: 0 0 6px ${statusDotColor};"></span>
          <span>${driverName || 'Ramesh Kumar'}</span>
          <span style="color: ${speedColor}; font-size: 0.65rem; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 5px;">${speedTag}</span>
        </div>
      </div>
    `,
    iconSize: [120, 104],
    iconAnchor: [60, 52]
  });
};

// ─── PHOTO 2 ZOOM & CONTINUOUS CAMERA TRACKING COMPONENT ─────────
// Keeps the map zoomed in at street level (16.8) and smoothly pans with the bike
function ContinuousBikeFollower({ driverPos, isStopped }) {
  const map = useMap();
  const lastPanTime = useRef(0);
  const lastPos = useRef(driverPos);

  useEffect(() => {
    if (!driverPos) return;

    // Center camera on the moving bike at street zoom (Photo 2 zoom level: 16.5 ~ 17)
    const now = Date.now();
    const prev = lastPos.current;
    const moved = !prev || Math.abs(driverPos[0] - prev[0]) > 0.00001 || Math.abs(driverPos[1] - prev[1]) > 0.00001;

    // Only pan if bike has moved and interval passed (avoids micro-shakes while stopped at 0 km/h)
    if (moved && !isStopped && (now - lastPanTime.current > 220)) {
      map.panTo(driverPos, {
        animate: true,
        duration: 0.35,
        easeLinearity: 0.35
      });
      lastPanTime.current = now;
      lastPos.current = driverPos;
    }
  }, [driverPos, isStopped, map]);

  return null;
}

export const LiveMapTracker = ({ order, school: propSchool, onComplete }) => {
  const { darkMode, parentProfile } = useAppState();

  const parentAddress = order?.pickupAddress || parentProfile?.deliveryAddress || 'Chennai Home Pickup';

  // ─── 1. DYNAMIC ORIGIN & DESTINATION (EXACT TO PARENT'S HOME & CHOSEN SCHOOL) ───
  // Resolves origin strictly from home coordinates or parent address
  const origin = useMemo(() => {
    if (order?.homeCoordinates?.lat && order?.homeCoordinates?.lng) {
      return [Number(order.homeCoordinates.lat), Number(order.homeCoordinates.lng)];
    }
    if (parentProfile?.homeCoordinates?.lat && parentProfile?.homeCoordinates?.lng) {
      return [Number(parentProfile.homeCoordinates.lat), Number(parentProfile.homeCoordinates.lng)];
    }
    if (parentProfile?.addressDetails?.coordinates?.lat && parentProfile?.addressDetails?.coordinates?.lng) {
      return [Number(parentProfile.addressDetails.coordinates.lat), Number(parentProfile.addressDetails.coordinates.lng)];
    }
    return resolveChennaiLocality(parentAddress);
  }, [order?.homeCoordinates, parentProfile?.homeCoordinates, parentProfile?.addressDetails?.coordinates, parentAddress]);

  // Resolves destination strictly from school coordinates or selected school
  const schoolMeta = useMemo(() => {
    if (typeof propSchool === 'object' && propSchool?.lat && propSchool?.lng) {
      return {
        lat: Number(propSchool.lat),
        lng: Number(propSchool.lng),
        name: propSchool.name || 'Destination School',
        gate: propSchool.gate || 'Main Campus Security Gate 1'
      };
    }
    if (order?.schoolCoordinates?.lat && order?.schoolCoordinates?.lng) {
      return {
        lat: Number(order.schoolCoordinates.lat),
        lng: Number(order.schoolCoordinates.lng),
        name: order.schoolName || 'Destination School',
        gate: order.receptionGate || 'Main Campus Security Gate 1'
      };
    }
    if (parentProfile?.schoolCoordinates?.lat && parentProfile?.schoolCoordinates?.lng) {
      return {
        lat: Number(parentProfile.schoolCoordinates.lat),
        lng: Number(parentProfile.schoolCoordinates.lng),
        name: parentProfile.schoolName || 'Destination School',
        gate: parentProfile.receptionGate || 'Main Campus Security Gate 1'
      };
    }
    const targetSchoolName = (typeof propSchool === 'string' && propSchool) || order?.schoolName || order?.school || parentProfile?.schoolName || 'Destination School';
    return resolveSchoolMeta(targetSchoolName, parentProfile?.schoolDistrict);
  }, [propSchool, order?.schoolCoordinates, order?.schoolName, order?.school, order?.receptionGate, parentProfile?.schoolCoordinates, parentProfile?.schoolName, parentProfile?.schoolDistrict, parentProfile?.receptionGate]);

  const destination = useMemo(() => [schoolMeta.lat, schoolMeta.lng], [schoolMeta]);
  const targetSchoolName = schoolMeta.name;

  // UNIVERSAL SHORTEST ROUTE GUARANTEE (GENERAL FOR ALL SCHOOLS & ADDRESSES)
  // Ensures courier always starts at the shortest direct residential doorstep approach (<= 2.4 km straight -> ~3.0 km road)
  const effectiveOrigin = useMemo(() => {
    const shortest = getShortestCorridorVector(origin[0], origin[1], destination[0], destination[1], 2.4);
    return [shortest.lat, shortest.lng];
  }, [origin, destination]);

  // Road route corridor connecting exact doorstep to destination school
  const [activeRouteData, setActiveRouteData] = useState(() => 
    generateDynamicRoadCorridor(effectiveOrigin[0], effectiveOrigin[1], destination[0], destination[1])
  );

  // Dynamically fetch road route or re-calculate corridor when origin or destination changes
  useEffect(() => {
    setActiveRouteData(generateDynamicRoadCorridor(effectiveOrigin[0], effectiveOrigin[1], destination[0], destination[1]));
    let isMounted = true;
    fetchDynamicRoadRoute(effectiveOrigin[0], effectiveOrigin[1], destination[0], destination[1])
      .then((data) => {
        if (isMounted && data && data.coords && data.coords.length > 0) {
          setActiveRouteData(data);
        }
      })
      .catch((err) => console.warn('Dynamic Routing notice:', err));
    return () => { isMounted = false; };
  }, [effectiveOrigin[0], effectiveOrigin[1], destination[0], destination[1]]);

  // Resample strictly along the true road geometry at uniform 6m intervals
  const denseRoadPoints = useMemo(() => {
    return resampleRoadPath(activeRouteData.coords, 6);
  }, [activeRouteData]);

  // Pre-calculate cumulative distance along the dense road coordinates
  const cumulativeDistances = useMemo(() => {
    if (!denseRoadPoints || denseRoadPoints.length === 0) return [0];
    const cum = [0];
    for (let i = 0; i < denseRoadPoints.length - 1; i++) {
      cum.push(cum[i] + haversineMeters(denseRoadPoints[i], denseRoadPoints[i + 1]));
    }
    return cum;
  }, [denseRoadPoints]);

  const totalRouteMeters = cumulativeDistances[cumulativeDistances.length - 1] || 1;

  // ─── 2. REAL-WORLD ROAD TRAFFIC ENGINE ──────────────────────────────
  // Identifies Heavy Traffic signals/junctions (Red), Moderate Commercial traffic (Amber),
  // Clear Corridors (Green), and School Safety Zone (Orange) for ANY route
  const trafficZones = useMemo(() => {
    return assignTrafficZones(denseRoadPoints);
  }, [denseRoadPoints]);

  // Proportional progress ratio [0, 1] derived dynamically from the active order
  const orderInitialRatio = useMemo(() => {
    if (!order) return 0.20;
    if (typeof order.progressRatio === 'number') return Math.max(0, Math.min(1, order.progressRatio));
    if (typeof order.deliveryProgress === 'number') return Math.max(0, Math.min(1, order.deliveryProgress / 100));
    if (order.status === 'delivered') return 1.0;
    if (order.status === 'picked_up') return 0.08;
    if (order.status === 'out_for_delivery' || order.status === 'in_transit') return 0.25;
    return 0.15;
  }, [order?.id, order?.status, order?.deliveryProgress]);

  const [progressRatio, setProgressRatio] = useState(orderInitialRatio);
  const [bearing, setBearing] = useState(115);
  const [leanAngle, setLeanAngle] = useState(0);
  const [driverSpeed, setDriverSpeed] = useState(28);
  const [isWaitingAtSignal, setIsWaitingAtSignal] = useState(false);
  const [hasArrived, setHasArrived] = useState(orderInitialRatio >= 0.99);
  const trafficCycleRef = useRef({ mode: 'crawl', timer: 1.5 });

  // Update progress ratio when order changes
  useEffect(() => {
    setProgressRatio(orderInitialRatio);
    setHasArrived(orderInitialRatio >= 0.99);
  }, [orderInitialRatio]);

  const traveledDistance = Math.min(totalRouteMeters, progressRatio * totalRouteMeters);

  // Sub-meter interpolated driver position and segment index along the road
  const currentPosData = useMemo(() => {
    return getPositionAlongRoad(denseRoadPoints, cumulativeDistances, traveledDistance);
  }, [denseRoadPoints, cumulativeDistances, traveledDistance]);

  const currentDriverPos = currentPosData.pos;
  const currentSegmentIndex = currentPosData.index;

  // Current traffic condition at driver's live GPS coordinates
  const currentTraffic = trafficZones[currentSegmentIndex] || {
    type: 'clear',
    baseSpeed: 30,
    label: 'Clear Corridor',
    color: '#10B981',
    badgeColor: '#ECFDF5',
    textColor: '#059669',
    icon: '🟢'
  };

  // ─── 3. PHYSICAL TRAFFIC TELEMATICS PROPULSION LOOP ─────────────────
  // THE MOVEMENT OF THE BIKE IS DIRECTLY PROPORTIONAL TO ITS PHYSICAL SPEED:
  // - In Red Heavy Traffic: Cycles between complete standstill signal queues (0 km/h, 0m movement)
  //   and slow 4-7 km/h inching crawl (~0.19m/tick)
  // - In Yellow Moderate Traffic: Moves at steady city pace (17-21 km/h, ~0.68m/tick)
  // - In Green Clear Corridors: Cruises swiftly at 28-33 km/h (~1.14m/tick, 6x faster than traffic crawl!)
  // - In School Safety Zone: Slows down cautiously to 10-12 km/h
  // - At School Gate: Complete stop at 0 km/h
  useEffect(() => {
    if (hasArrived) {
      setDriverSpeed(0);
      setIsWaitingAtSignal(false);
      return;
    }

    const intervalMs = 100;
    const dt = intervalMs / 1000;
    const simScale = 1.35; // Calibrated for smooth, medium navigation pace

    const timer = setInterval(() => {
      setProgressRatio((prevRatio) => {
        if (prevRatio >= 1.0) {
          setHasArrived(true);
          setDriverSpeed(0);
          setIsWaitingAtSignal(false);
          if (onComplete) {
            setTimeout(onComplete, 3500);
          }
          return 1.0;
        }

        const currentDist = prevRatio * totalRouteMeters;
        const { index } = getPositionAlongRoad(denseRoadPoints, cumulativeDistances, currentDist);
        const zone = trafficZones[index] || currentTraffic;

        let targetSpeedKmh = zone.baseSpeed;
        let atSignal = false;
        let distDelta = 0;

        // REALISTIC HEAVY TRAFFIC DYNAMICS (RED ZONE):
        // Authentic stop-and-go motion through city traffic queues and signals
        if (zone.type === 'heavy') {
          if (trafficCycleRef.current.mode === 'stopped') {
            trafficCycleRef.current.timer -= dt;
            targetSpeedKmh = 0; // Complete standstill at red signal / queue
            atSignal = true;
            distDelta = 0; // Zero physical movement! Stationary!

            if (trafficCycleRef.current.timer <= 0) {
              // Traffic moves forward: switch to creeping crawl
              trafficCycleRef.current = {
                mode: 'crawl',
                timer: 2.8 + Math.random() * 1.5 // Crawls for 2.8 to 4.3 seconds
              };
            }
          } else {
            // Crawling in heavy traffic: inching forward at 4 to 7 km/h
            trafficCycleRef.current.timer -= dt;
            const throttleWave = Math.sin(Date.now() / 320) * 1.4;
            targetSpeedKmh = Math.max(3.5, Math.min(7.2, 5.0 + throttleWave));
            atSignal = false;

            // Inching forward displacement (tiny, authentic crawl)
            const speedMs = targetSpeedKmh / 3.6;
            distDelta = speedMs * dt * simScale;

            if (trafficCycleRef.current.timer <= 0) {
              // Hits stopped vehicle queue or red signal
              trafficCycleRef.current = {
                mode: 'stopped',
                timer: 2.4 + Math.random() * 1.4 // Standstill for 2.4 to 3.8 seconds
              };
            }
          }
        } else if (zone.type === 'moderate') {
          // Moderate commercial traffic: steady 17-21 km/h pace
          trafficCycleRef.current = { mode: 'cruise', timer: 0 };
          const jitter = Math.sin(Date.now() / 480) * 1.5;
          targetSpeedKmh = Math.max(16, Math.min(21, 18.2 + jitter));
          atSignal = false;
          distDelta = (targetSpeedKmh / 3.6) * dt * simScale;
        } else if (zone.type === 'school_zone') {
          // School safety zone: cautious 10-12 km/h
          trafficCycleRef.current = { mode: 'cruise', timer: 0 };
          targetSpeedKmh = 11;
          atSignal = false;
          distDelta = (targetSpeedKmh / 3.6) * dt * simScale;
        } else {
          // Clear open corridor / flyovers: brisk 28-33 km/h cruise
          trafficCycleRef.current = { mode: 'cruise', timer: 0 };
          const cruiseJitter = Math.sin(Date.now() / 650) * 2.0;
          targetSpeedKmh = Math.max(28, Math.min(33, 30.5 + cruiseJitter));
          atSignal = false;
          distDelta = (targetSpeedKmh / 3.6) * dt * simScale;
        }

        const roundedSpeed = Math.round(targetSpeedKmh);
        setDriverSpeed(roundedSpeed);
        setIsWaitingAtSignal(atSignal);

        const nextDist = Math.min(totalRouteMeters, currentDist + distDelta);
        const nextPosData = getPositionAlongRoad(denseRoadPoints, cumulativeDistances, nextDist);

        const diff = ((nextPosData.bearing - bearing + 540) % 360) - 180;
        const targetLean = Math.max(-12, Math.min(12, diff * 0.45));
        setLeanAngle(targetLean);
        setBearing(nextPosData.bearing);

        return Math.min(1.0, nextDist / totalRouteMeters);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [totalRouteMeters, denseRoadPoints, cumulativeDistances, trafficZones, hasArrived, bearing, currentTraffic]);



  // Traveled polyline behind the rider & remaining polyline ahead of the rider
  const traveledPolyline = useMemo(() => {
    return [...denseRoadPoints.slice(0, currentSegmentIndex + 1), currentDriverPos];
  }, [denseRoadPoints, currentSegmentIndex, currentDriverPos]);

  const remainingPolyline = useMemo(() => {
    return [currentDriverPos, ...denseRoadPoints.slice(currentSegmentIndex + 1)];
  }, [denseRoadPoints, currentSegmentIndex, currentDriverPos]);

  // Group remaining points into contiguous colored segments by traffic type for the map heatmap
  const trafficPolylineSegments = useMemo(() => {
    if (remainingPolyline.length < 2) return [];
    const segments = [];
    let currentSegment = [remainingPolyline[0]];
    let currentType = trafficZones[currentSegmentIndex]?.type || 'clear';
    let currentColor = trafficZones[currentSegmentIndex]?.color || '#10B981';

    for (let i = 1; i < remainingPolyline.length; i++) {
      const zone = trafficZones[currentSegmentIndex + i] || { type: 'clear', color: '#10B981' };
      if (zone.type === currentType) {
        currentSegment.push(remainingPolyline[i]);
      } else {
        currentSegment.push(remainingPolyline[i]); // overlap by 1 point for continuous polyline
        segments.push({
          type: currentType,
          color: currentColor,
          positions: currentSegment
        });
        currentSegment = [remainingPolyline[i]];
        currentType = zone.type;
        currentColor = zone.color;
      }
    }
    if (currentSegment.length > 1) {
      segments.push({
        type: currentType,
        color: currentColor,
        positions: currentSegment
      });
    }
    return segments;
  }, [remainingPolyline, trafficZones, currentSegmentIndex]);

  // ─── 4. ACCURATE ROAD ROUTE DISTANCE (DYNAMIC TO ANY PARENT/SCHOOL) ──
  const remainingDistanceMeters = Math.max(0, totalRouteMeters - traveledDistance);
  const totalKm = (totalRouteMeters / 1000).toFixed(1);
  const remainingKm = (remainingDistanceMeters / 1000).toFixed(1);
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));

  // Actual display speed: 0 upon arrival, otherwise dynamically calculated driverSpeed
  const displaySpeed = hasArrived ? 0 : driverSpeed;

  // ─── 5. DYNAMIC TRAFFIC-AWARE ETA CALCULATION ────────────────────────
  // Integrates travel time of remaining segments based on each segment's traffic speed
  const etaMinutes = useMemo(() => {
    if (hasArrived || traveledDistance >= totalRouteMeters) return 0;
    let totalSeconds = 0;
    for (let i = currentSegmentIndex; i < denseRoadPoints.length - 1; i++) {
      const distM = haversineMeters(denseRoadPoints[i], denseRoadPoints[i + 1]);
      const zoneSpeed = trafficZones[i]?.baseSpeed || 25;
      const speedMs = zoneSpeed / 3.6;
      totalSeconds += distM / speedMs;
    }
    return Math.max(1, Math.round(totalSeconds / 60));
  }, [currentSegmentIndex, denseRoadPoints, trafficZones, hasArrived, traveledDistance, totalRouteMeters]);

  const currentStreetName = getStreetNameAtRatio(progressRatio, activeRouteData.steps, totalRouteMeters);

  return (
    <div style={{
      position: 'relative',
      borderRadius: 24,
      overflow: 'hidden',
      border: darkMode ? '1.5px solid rgba(249,115,22,0.35)' : '1.5px solid rgba(249,115,22,0.25)',
      boxShadow: darkMode ? '0 16px 48px rgba(0,0,0,0.6)' : '0 16px 40px rgba(249,115,22,0.12)',
      background: darkMode ? '#070B14' : '#FFF',
    }}>

      {/* ── CLEAN CSS TO COMPLETELY SUPPRESS ZOOM BUTTONS & CONTRIBUTORS ── */}
      <style>{`
        .leaflet-control-attribution,
        .leaflet-control-zoom,
        .leaflet-control-attribution a,
        .leaflet-bottom.leaflet-right {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .custom-map-marker {
          transition: transform 0.12s linear;
        }
      `}</style>

      {/* ── TOP SWIGGY-STYLE FLOATING HUD BANNER ───────────────── */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000,
        background: darkMode ? 'rgba(11, 17, 32, 0.94)' : 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(12px)',
        border: darkMode ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(249,115,22,0.3)',
        borderRadius: 18,
        padding: '12px 18px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        {/* Left: Driver and Live Street */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.25rem', boxShadow: '0 4px 12px rgba(249,115,22,0.4)'
          }}>
            🛵
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '0.94rem', color: darkMode ? '#FFF' : '#0F172A' }}>
                {order?.driver || 'Ramesh Kumar'}
              </span>
              <span style={{
                background: hasArrived ? '#10B981' : '#EA580C',
                color: '#FFF', fontSize: '0.62rem', fontWeight: 900,
                padding: '2px 7px', borderRadius: 6, letterSpacing: '0.04em'
              }}>
                {hasArrived ? 'ARRIVED AT SCHOOL' : 'EN ROUTE'}
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#F97316', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <Compass size={12} />
              <span>{hasArrived ? `Arrived at ${schoolMeta.gate}` : `En route on ${currentStreetName}`}</span>
            </div>
          </div>
        </div>

        {/* Right: ETA, Distance Along Road & Live GPS Speedometer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Live Road Traffic Condition Pill */}
          <div style={{
            background: darkMode ? 'rgba(255,255,255,0.06)' : currentTraffic.badgeColor,
            border: `1.5px solid ${currentTraffic.color}55`,
            borderRadius: 12, padding: '6px 13px', display: 'flex', alignItems: 'center', gap: 7
          }}>
            <span style={{ fontSize: '0.95rem' }}>{currentTraffic.icon}</span>
            <div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                Road Traffic
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900, color: currentTraffic.color, whiteSpace: 'nowrap' }}>
                {hasArrived ? 'Arrived at Gate' : currentTraffic.label}
              </div>
            </div>
          </div>

          {/* Live Speedometer Pill */}
          <div style={{
            background: isWaitingAtSignal 
              ? (darkMode ? 'rgba(239, 68, 68, 0.16)' : '#FEF2F2') 
              : (darkMode ? 'rgba(16, 185, 129, 0.14)' : '#ECFDF5'),
            border: isWaitingAtSignal 
              ? (darkMode ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(239, 68, 68, 0.45)')
              : (darkMode ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)'),
            borderRadius: 12, padding: '6px 13px', textAlign: 'center', minWidth: 84
          }}>
            <div style={{ 
              fontSize: '0.62rem', 
              color: isWaitingAtSignal ? '#EF4444' : (darkMode ? '#6EE7B7' : '#059669'), 
              fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 
            }}>
              <span style={{ 
                width: 6, height: 6, borderRadius: '50%', 
                background: isWaitingAtSignal ? '#EF4444' : (displaySpeed > 0 ? '#10B981' : '#94A3B8'), 
                display: 'inline-block',
                animation: isWaitingAtSignal ? 'ping 1.2s infinite' : 'none'
              }} />
              {isWaitingAtSignal ? 'Signal Stop' : 'Live Speed'}
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: 900, color: isWaitingAtSignal ? '#DC2626' : (displaySpeed > 0 ? '#059669' : '#64748B') }}>
              {displaySpeed} <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>km/h</span>
            </div>
          </div>

          {/* Road Distance & Target Arrival Pill */}
          <div style={{
            background: darkMode ? 'rgba(249,115,22,0.15)' : '#FFF7ED',
            border: '1px solid rgba(249,115,22,0.3)',
            borderRadius: 12, padding: '6px 14px', textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              Target School Arrival
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#EA580C' }}>
              {hasArrived ? 'Arrived at Gate' : `${etaMinutes} mins (${remainingKm} km / ${totalKm} km)`}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAP CONTAINER (PHOTO 2 STREET-LEVEL CLOSE ZOOM) ─────── */}
      <div style={{ height: 430, width: '100%', position: 'relative' }}>
        <MapContainer
          center={currentDriverPos}
          zoom={16.8} // Photo 2 exact street-level close zoom
          zoomControl={false} // Clean: NO zoom in/out buttons shown
          attributionControl={false} // Clean: NO contributors name shown
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Street Map Tiles */}
          <TileLayer
            attribution=""
            url={darkMode 
              ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />

          {/* Smooth Continuous Camera Follower: Glides smoothly along with the bike */}
          <ContinuousBikeFollower
            driverPos={currentDriverPos}
            isStopped={isWaitingAtSignal || hasArrived || displaySpeed === 0}
          />

          {/* 1. TRAVELED CORRIDOR (MUTED SLATE PATH BEHIND BIKE) */}
          {traveledPolyline.length > 1 && (
            <Polyline
              positions={traveledPolyline}
              pathOptions={{
                color: darkMode ? '#64748B' : '#94A3B8',
                weight: 5,
                opacity: 0.7,
                dashArray: '5, 8'
              }}
            />
          )}

          {/* 2. REAL-TIME TRAFFIC ROAD CORRIDORS (SWIGGY / GOOGLE MAPS STYLE) */}
          {trafficPolylineSegments.map((seg, idx) => (
            <React.Fragment key={`traffic-seg-${idx}`}>
              {/* Outer ambient glow colored by traffic condition */}
              <Polyline
                positions={seg.positions}
                pathOptions={{
                  color: seg.color,
                  weight: 10,
                  opacity: 0.35,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              {/* Inner crisp road centerline */}
              <Polyline
                positions={seg.positions}
                pathOptions={{
                  color: seg.color,
                  weight: 5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            </React.Fragment>
          ))}

          {/* 3. HOME PICKUP PIN */}
          <Marker position={effectiveOrigin} icon={createHomeIcon(order?.pickupLabel || 'HOME PICKUP')}>
            <Popup>
              <div style={{ fontSize: '0.82rem', padding: 2 }}>
                <strong style={{ color: '#10B981', display: 'block', marginBottom: 2 }}>🏠 Lunch Picked Up</strong>
                <span>{parentAddress}</span><br />
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  {order?.pickupTime || '11:45 AM'} • Double OTP Verified
                </span>
              </div>
            </Popup>
          </Marker>

          {/* 4. SCHOOL GATE DESTINATION PIN */}
          <Marker position={destination} icon={createSchoolIcon(targetSchoolName, schoolMeta.gate)}>
            <Popup>
              <div style={{ fontSize: '0.84rem', padding: 2 }}>
                <strong style={{ color: '#EA580C', display: 'block', marginBottom: 3 }}>🏫 Destination School</strong>
                {targetSchoolName}<br />
                <span style={{ color: '#F97316', fontWeight: 800, fontSize: '0.76rem' }}>
                  Drop: {schoolMeta.gate}
                </span><br />
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Target Bell: {parentProfile?.lunchTime || '12:30 PM'}
                </span>
              </div>
            </Popup>
          </Marker>

          {/* 5. CONSTANTLY MOVING DRIVER BIKE PIN (PHOTO 2 CLOSE ZOOM WITH BEARING) */}
          <Marker 
            position={currentDriverPos} 
            icon={createBikeIcon(order?.driver, bearing, displaySpeed, currentTraffic.type, isWaitingAtSignal)}
            zIndexOffset={1000}
          >
            <Popup>
              <div style={{ fontSize: '0.84rem', padding: 2 }}>
                <strong style={{ color: '#F97316' }}>🛵 En Route with Lunchbox</strong><br />
                Current Street: {currentStreetName}<br />
                Speed: {displaySpeed} km/h • GPS Ping: Active 🟢<br />
                Road Distance Remaining: {remainingKm} km (of {totalKm} km)<br />
                Destination: {targetSchoolName}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* ── BOTTOM LIVE DELIVERY STATUS & MILESTONE BAR ────────── */}
      <div style={{
        padding: '16px 20px',
        background: darkMode ? '#0B1120' : '#FFFDF9',
        borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
      }}>
        {/* Progress Tracker Bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800, marginBottom: 6 }}>
            <span style={{ color: darkMode ? '#E2E8F0' : '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: hasArrived ? '#10B981' : '#F97316', display: 'inline-block' }}></span>
              Live Delivery Progress: {progressPercent}%
            </span>
            <span style={{ color: '#F97316' }}>
              Target Bell: {parentProfile?.lunchTime || '12:30 PM'}
            </span>
          </div>
          <div style={{ width: '100%', height: 6, background: darkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`, height: '100%',
              background: 'linear-gradient(90deg, #10B981, #F97316)',
              borderRadius: 99, transition: 'width 0.2s ease'
            }} />
          </div>
        </div>

        {/* 3 Step Milestone Flow (Swiggy / Zomato Style) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: '0.76rem' }}>
          <div style={{
            background: darkMode ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <CheckCircle2 size={14} color="#10B981" />
            <div>
              <div style={{ fontWeight: 800, color: '#059669' }}>Home Pickup</div>
              <div style={{ fontSize: '0.66rem', color: darkMode ? '#A7F3D0' : '#047857' }}>Completed ✓</div>
            </div>
          </div>

          <div style={{
            background: hasArrived ? (darkMode ? 'rgba(16,185,129,0.12)' : '#ECFDF5') : (darkMode ? 'rgba(249,115,22,0.18)' : '#FFF7ED'),
            border: hasArrived ? '1px solid rgba(16,185,129,0.3)' : '1.5px solid rgba(249,115,22,0.45)',
            borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: hasArrived ? '#10B981' : '#F97316', animation: hasArrived ? 'none' : 'ping 1.2s infinite' }} />
            <div>
              <div style={{ fontWeight: 800, color: hasArrived ? '#059669' : '#EA580C' }}>Corridor Transit</div>
              <div style={{ fontSize: '0.66rem', color: hasArrived ? '#059669' : '#F97316' }}>
                {hasArrived ? 'Corridor Completed' : `${remainingKm} km left of ${totalKm} km`}
              </div>
            </div>
          </div>

          <div style={{
            background: hasArrived ? (darkMode ? 'rgba(249,115,22,0.2)' : '#FFF7ED') : (darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC'),
            border: hasArrived ? '1.5px solid #F97316' : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
            borderRadius: 10, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <School size={14} color={hasArrived ? '#EA580C' : '#94A3B8'} />
            <div>
              <div style={{ fontWeight: 800, color: hasArrived ? '#EA580C' : (darkMode ? '#94A3B8' : '#64748B') }}>
                Gate Handshake
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                {hasArrived ? 'Arrived at Gate 2 🔔' : `${schoolMeta.gate.split(' ')[0]} Drop`}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
