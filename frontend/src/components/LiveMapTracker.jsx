import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Clock, Key, Zap, Star, TrendingUp, Phone } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';

// Create custom icons for the map
const homeIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #F97316, #D97706); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(249,115,22,0.8); color: white; font-size: 14px; border: 2px solid white;">🏠</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const schoolIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #0D9488, #0F766E); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(13,148,136,0.8); color: white; font-size: 14px; border: 2px solid white;">🏫</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const getBikeIcon = (driverName) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="position: relative; display: flex; flex-direction: column; align-items: center; margin-top: -20px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #FF9F1C, #F97316); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 24px rgba(255,159,28,0.9); font-size: 22px; z-index: 1000; border: 2px solid white;">🛵</div>
          <div style="margin-top: 4px; background: rgba(10,18,36,0.92); backdrop-filter: blur(10px); border: 1px solid rgba(255,159,28,0.5); border-radius: 10px; padding: 3px 10px; color: #FF9F1C; font-size: 0.7rem; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">${driverName}</div>
         </div>`,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

// Realistic route arrays from a single home to different schools
export const ROUTES = {
  'DPS Anna Nagar': [
    [13.0838, 80.2100],
    [13.0845, 80.2120],
    [13.0848, 80.2140],
    [13.0850, 80.2150],
    [13.0860, 80.2155],
    [13.0870, 80.2160],
    [13.0875, 80.2175],
    [13.0880, 80.2190],
    [13.0890, 80.2195],
    [13.0900, 80.2200],
  ],
  'KV Ashok Nagar': [
    [13.0838, 80.2100],
    [13.0780, 80.2105],
    [13.0750, 80.2110],
    [13.0710, 80.2130],
    [13.0650, 80.2150],
    [13.0600, 80.2170],
    [13.0550, 80.2185],
    [13.0450, 80.2200],
  ],
  'Velammal Surapet': [
    [13.0838, 80.2100],
    [13.0900, 80.2050],
    [13.0950, 80.1950],
    [13.1000, 80.1850],
    [13.1100, 80.1700],
    [13.1200, 80.1550],
  ]
};

// Helper to interpolate between coordinates for smooth gliding
const getInterpolatedPosition = (pct, route) => {
  if (pct <= 0) return route[0];
  if (pct >= 100) return route[route.length - 1];
  
  const exactIndex = (pct / 100) * (route.length - 1);
  const lowerIndex = Math.floor(exactIndex);
  const upperIndex = Math.ceil(exactIndex);
  
  if (lowerIndex === upperIndex) return route[lowerIndex];
  
  const segmentPct = exactIndex - lowerIndex;
  const p1 = route[lowerIndex];
  const p2 = route[upperIndex];
  
  const lat = p1[0] + (p2[0] - p1[0]) * segmentPct;
  const lng = p1[1] + (p2[1] - p1[1]) * segmentPct;
  
  return [lat, lng];
};

export const LiveMapTracker = ({ order, school = 'DPS Anna Nagar' }) => {
  const { darkMode } = useAppState();
  const [driverProgress, setDriverProgress] = useState(10);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!order || order.status === 'Delivered') return;
    const interval = setInterval(() => {
      setDriverProgress(prev => (prev >= 98 ? 98 : prev + 1.2));
      setTick(t => t + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, [order]);

  if (!order) return null;

  const steps = [
    { label: 'Food Ready',      icon: '🍲', done: true },
    { label: 'Driver Assigned', icon: '🛵', done: ['Driver Assigned','Arrived at Pickup','Picked Up','On The Way','Arrived at School','Delivered'].includes(order.status) },
    { label: 'Picked Up',       icon: '📍', done: ['Picked Up','On The Way','Arrived at School','Delivered'].includes(order.status) },
    { label: 'On The Way',      icon: '🚀', done: ['On The Way','Arrived at School','Delivered'].includes(order.status) },
    { label: 'Delivered ✅',    icon: '🍲', done: order.status === 'Delivered' },
  ];

  const currentStep = steps.filter(s => s.done).length - 1;
  const pct = Math.round(driverProgress);
  const route = ROUTES[school] || ROUTES['DPS Anna Nagar'];
  const driverPosition = getInterpolatedPosition(driverProgress, route);
  
  const mapBounds = useMemo(() => {
    return L.latLngBounds(route);
  }, [route]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── MAP CARD ─────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: darkMode ? '0 24px 72px rgba(0,0,0,0.55), 0 0 0 1px rgba(46,196,182,0.18)' : '0 16px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(46,196,182,0.2)',
        height: 340,
        zIndex: 0
      }}>
        {darkMode && (
          <style>
            {`
              .leaflet-tile-pane {
                filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
              }
            `}
          </style>
        )}
        {/* Real Interactive Map using Leaflet */}
        <MapContainer bounds={mapBounds} boundsOptions={{ padding: [50, 50] }} zoomControl={false} style={{ width: '100%', height: '100%', zIndex: 0, background: darkMode ? '#111' : '#f8f9fa' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <Polyline positions={route} color="#0D9488" weight={5} opacity={0.3} dashArray="8, 8" />
          <Polyline positions={route} color="#F97316" weight={6} opacity={0.8} />

          <Marker position={route[0]} icon={homeIcon} />
          <Marker position={route[route.length - 1]} icon={schoolIcon} />
          <Marker position={driverPosition} icon={getBikeIcon(order.driverName)} />
        </MapContainer>

        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: 'rgba(6,13,31,0.88)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(46,196,182,0.4)',
          borderRadius: 20, padding: '6px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          zIndex: 1000
        }}>
          <Clock size={14} color="#2EC4B6" />
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>ETA:</span>
          <strong style={{ color: '#2EC4B6', fontSize: '0.88rem', letterSpacing: '0.02em' }}>{order.estArrival}</strong>
        </div>

        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(239,68,68,0.18)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(239,68,68,0.5)',
          borderRadius: 20, padding: '5px 14px',
          display: 'flex', alignItems: 'center', gap: 7,
          zIndex: 1000
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px #EF4444', display: 'inline-block', animation: 'ping 1.4s infinite' }} />
          <span style={{ color: '#EF4444', fontSize: '0.76rem', fontWeight: 800, letterSpacing: '0.08em' }}>LIVE</span>
        </div>

        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(6,13,31,0.88)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '6px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          whiteSpace: 'nowrap',
          zIndex: 1000
        }}>
          <TrendingUp size={14} color="#F97316" />
          <div style={{ width: 90, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #F97316, #2EC4B6)', borderRadius: 2, transition: 'width 1.2s ease' }} />
          </div>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.76rem', fontWeight: 700 }}>{pct}% complete</span>
        </div>
      </div>

      {/* ── DRIVER CARD ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: darkMode
          ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #FDF9F4 100%)',
        backdropFilter: 'blur(20px)',
        border: darkMode
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(249,115,22,0.2)',
        borderRadius: 20, padding: '18px 22px',
        boxShadow: darkMode
          ? '0 8px 32px rgba(0,0,0,0.3)'
          : '0 8px 28px rgba(249,115,22,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 54, height: 54, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316, #D97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
              fontSize: 22,
            }}>🧑</div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 16, height: 16, borderRadius: '50%',
              background: '#10B981',
              border: darkMode ? '2px solid #0D1B30' : '2px solid white',
              boxShadow: '0 0 8px rgba(16,185,129,0.8)',
            }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ color: darkMode ? 'white' : '#1A120B', fontWeight: 700, fontSize: '1.05rem' }}>{order.driverName}</span>
              <span style={{
                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
                color: '#10B981', fontSize: '0.64rem', fontWeight: 700,
                padding: '2px 8px', borderRadius: 6, letterSpacing: '0.06em',
              }}>✓ VERIFIED</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: darkMode ? 'rgba(255,255,255,0.45)' : 'rgba(74,63,53,0.65)', fontSize: '0.8rem' }}>TVS Jupiter • TN-07-BX-4421</span>
              <span style={{ color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', fontSize: '0.7rem' }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#FBBF24', fontSize: '0.78rem', fontWeight: 600 }}>
                <Star size={12} fill="#FBBF24" color="#FBBF24" /> 4.9
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            background: darkMode
              ? 'linear-gradient(135deg, rgba(46,196,182,0.15), rgba(46,196,182,0.08))'
              : 'linear-gradient(135deg, #0D9488, #0F766E)',
            border: '1.5px solid rgba(46,196,182,0.45)',
            color: darkMode ? '#2EC4B6' : 'white',
            padding: '10px 20px', borderRadius: 14,
            fontWeight: 700, fontSize: '0.86rem',
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
          }}>
            <Phone size={14} /> Call Driver
          </button>
        </div>
      </div>

      {/* ── OTP CARDS ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pickup OTP */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: darkMode
            ? 'linear-gradient(135deg, rgba(249,115,22,0.16) 0%, rgba(217,119,6,0.10) 100%)'
            : 'linear-gradient(135deg, #F97316 0%, #D97706 100%)',
          border: '1.5px solid rgba(249,115,22,0.45)',
          borderRadius: 22, padding: '24px 20px',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(249,115,22,0.35)',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 10, padding: '5px 12px', marginBottom: 14,
          }}>
            <Key size={14} color="white" />
            <span style={{ color: 'white', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pickup OTP</span>
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '2.8rem', fontWeight: 900,
            letterSpacing: '12px',
            color: '#FFFFFF',
            textShadow: '0 0 30px rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.3)',
            lineHeight: 1, marginBottom: 12,
          }}>
            {order.pickupOtp}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '7px 12px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.76rem', fontWeight: 600 }}>👉 Give to driver at pickup</span>
          </div>
        </div>

        {/* Delivery OTP */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: darkMode
            ? 'linear-gradient(135deg, rgba(46,196,182,0.16) 0%, rgba(13,148,136,0.10) 100%)'
            : 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          border: '1.5px solid rgba(46,196,182,0.45)',
          borderRadius: 22, padding: '24px 20px',
          textAlign: 'center',
          boxShadow: '0 12px 40px rgba(46,196,182,0.35)',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 10, padding: '5px 12px', marginBottom: 14,
          }}>
            <ShieldCheck size={14} color="white" />
            <span style={{ color: 'white', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Delivery OTP</span>
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '2.8rem', fontWeight: 900,
            letterSpacing: '12px',
            color: '#FFFFFF',
            textShadow: '0 0 30px rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.3)',
            lineHeight: 1, marginBottom: 12,
          }}>
            {order.deliveryOtp}
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '7px 12px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.76rem', fontWeight: 600 }}>🏫 Sent to school gate staff</span>
          </div>
        </div>
      </div>

      {/* ── PROGRESS TIMELINE ─────────────────────────────────────────── */}
      <div style={{
        background: darkMode
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #FDF9F4 100%)',
        backdropFilter: 'blur(20px)',
        border: darkMode
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid rgba(249,115,22,0.15)',
        borderRadius: 22, padding: '22px 24px',
        boxShadow: darkMode
          ? '0 8px 32px rgba(0,0,0,0.25)'
          : '0 8px 28px rgba(249,115,22,0.10)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Zap size={16} color="#F97316" />
          <span style={{ color: darkMode ? 'rgba(255,255,255,0.8)' : '#1A120B', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.04em' }}>DELIVERY PROGRESS</span>
          <span style={{
            marginLeft: 'auto',
            background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
            color: '#F97316', fontSize: '0.72rem', fontWeight: 800,
            padding: '3px 10px', borderRadius: 8,
          }}>
            {steps.filter(s => s.done).length} / {steps.length} Steps
          </span>
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            position: 'absolute', top: 20, left: '10%', right: '10%', height: 3,
            background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            borderRadius: 2, zIndex: 0,
          }}>
            <div style={{
              height: '100%',
              width: `${((steps.filter(s=>s.done).length - 1) / (steps.length - 1)) * 100}%`,
              background: 'linear-gradient(90deg, #F97316, #2EC4B6)',
              borderRadius: 2,
              transition: 'width 0.8s ease',
              boxShadow: '0 0 12px rgba(46,196,182,0.4)',
            }} />
          </div>

          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isDone = step.done;
            return (
              <div key={idx} style={{ textAlign: 'center', flex: 1, zIndex: 2 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', margin: '0 auto 10px',
                  background: isDone
                    ? 'linear-gradient(135deg, #F97316, #2EC4B6)'
                    : darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  border: isActive
                    ? '2px solid #F97316'
                    : isDone
                    ? '2px solid transparent'
                    : darkMode ? '2px solid rgba(255,255,255,0.12)' : '2px solid rgba(0,0,0,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isDone ? '1.2rem' : '0.9rem',
                  boxShadow: isActive ? '0 0 20px rgba(249,115,22,0.4)' : 'none',
                  transition: 'all 0.4s ease',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                }}>
                  {isDone ? step.icon : (
                    <span style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: '0.78rem', fontWeight: 700 }}>{idx + 1}</span>
                  )}
                </div>
                <div style={{
                  fontSize: '0.68rem', fontWeight: isDone ? 700 : 400,
                  color: isDone
                    ? (darkMode ? 'rgba(255,255,255,0.9)' : '#1A120B')
                    : (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'),
                  lineHeight: 1.3,
                  transition: 'color 0.4s ease',
                }}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
