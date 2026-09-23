import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Phone, CheckCircle, Navigation, Clock, ShieldCheck, MapPin, X } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

// Icons
const homeIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #F97316, #D97706); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(249,115,22,0.8); color: white; font-size: 14px; border: 2px solid white;">🏠</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});

const schoolIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #0D9488, #0F766E); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(13,148,136,0.8); color: white; font-size: 14px; border: 2px solid white;">🏫</div>`,
  iconSize: [32, 32], iconAnchor: [16, 16],
});

const getBikeIcon = (driverName) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="position: relative; display: flex; flex-direction: column; align-items: center; margin-top: -20px;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #FF9F1C, #F97316); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 24px rgba(255,159,28,0.9); font-size: 22px; z-index: 1000; border: 2px solid white;">🛵</div>
          <div style="margin-top: 4px; background: rgba(10,18,36,0.92); backdrop-filter: blur(10px); border: 1px solid rgba(255,159,28,0.5); border-radius: 10px; padding: 3px 10px; color: #FF9F1C; font-size: 0.7rem; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">${driverName}</div>
         </div>`,
  iconSize: [60, 60], iconAnchor: [30, 30],
});

const ROUTES = {
  toHome: [
    [13.0800, 80.2000], [13.0815, 80.2030], [13.0825, 80.2060], [13.0838, 80.2100],
  ],
  toSchool: [
    [13.0838, 80.2100], [13.0845, 80.2120], [13.0860, 80.2155], [13.0880, 80.2190], [13.0900, 80.2200],
  ]
};

export const DriverActiveRide = ({ order, onBack }) => {
  const { verifyPickupOtp, verifyDeliveryOtp, showToast, darkMode, updateOrderStatus } = useAppState();
  const [timeLeft, setTimeLeft] = useState(300);
  const [pickupOtp, setPickupOtp] = useState('');
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [isSimulatingDriving, setIsSimulatingDriving] = useState(false);
  const [driverProgress, setDriverProgress] = useState(0);

  const isHeadingToPickup = order.status === 'Driver Assigned';
  const isAtPickup = order.status === 'Arrived at Pickup';
  const isHeadingToSchool = ['Picked Up', 'On The Way'].includes(order.status);
  const isAtSchool = order.status === 'Arrived at School';

  const routeKey = (isHeadingToPickup || isAtPickup) ? 'toHome' : 'toSchool';
  const currentRoute = ROUTES[routeKey];
  const mapBounds = L.latLngBounds(currentRoute);

  useEffect(() => {
    let timer;
    if (isAtPickup && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isAtPickup, timeLeft]);

  useEffect(() => {
    let timer;
    if (isSimulatingDriving) {
      timer = setInterval(() => {
        setDriverProgress(prev => {
          if (prev >= 100) {
            setIsSimulatingDriving(false);
            if (isHeadingToPickup) updateOrderStatus(order.id, 'Arrived at Pickup');
            if (isHeadingToSchool) updateOrderStatus(order.id, 'Arrived at School');
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isSimulatingDriving, isHeadingToPickup, isHeadingToSchool, order.id, updateOrderStatus]);

  const startNavigation = () => {
    setDriverProgress(0);
    setIsSimulatingDriving(true);
    showToast("Navigation started. Driving...", "info");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ":" + (s < 10 ? '0' : '') + s;
  };

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

  const driverPosition = isSimulatingDriving 
    ? getInterpolatedPosition(driverProgress, currentRoute) 
    : isAtPickup ? currentRoute[currentRoute.length - 1] : currentRoute[0];

  const handlePickup = (e) => {
    e.preventDefault();
    if(verifyPickupOtp(order.id, pickupOtp)) {
      updateOrderStatus(order.id, 'Picked Up');
      setDriverProgress(0);
    }
  };

  const handleDelivery = (e) => {
    e.preventDefault();
    if(verifyDeliveryOtp(order.id, deliveryOtp)) {
      updateOrderStatus(order.id, 'Delivered');
      showToast("Order Completed Successfully!", "success");
      onBack();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'var(--bg-base)', display: 'grid', gridTemplateColumns: '1fr 400px',
      fontFamily: 'var(--font-ui)'
    }}>
      <div style={{ position: 'relative', height: '100%' }}>
        {darkMode && (
          <style>
            {".leaflet-tile-pane { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }"}
          </style>
        )}
        <MapContainer bounds={mapBounds} boundsOptions={{ padding: [80, 80] }} zoomControl={false} style={{ width: '100%', height: '100%', background: darkMode ? '#111' : '#f8f9fa' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={currentRoute} color="#F97316" weight={6} opacity={0.8} />
          
          <Marker position={currentRoute[currentRoute.length - 1]} icon={(isHeadingToPickup || isAtPickup) ? homeIcon : schoolIcon} />
          <Marker position={driverPosition} icon={getBikeIcon(order.driverName)} />
        </MapContainer>
        
        <div style={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, 
          background: 'rgba(10,18,36,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', 
          padding: '12px 24px', borderRadius: 99, color: 'white', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <Navigation size={18} color="#10B981" />
          <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>
            {isHeadingToPickup ? 'NAVIGATING TO PICKUP' : 
             isAtPickup ? 'WAITING AT PICKUP' : 
             isHeadingToSchool ? 'NAVIGATING TO DROP' : 'ARRIVED AT DESTINATION'}
          </span>
        </div>
      </div>

      <div style={{ background: darkMode ? '#0a0a0a' : '#fff', borderLeft: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        <div style={{ padding: '24px 30px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>ACTIVE RIDE</div>
            <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-heading)' }}>{order.id}</div>
          </div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
          
          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316' }}>
                {(isHeadingToPickup || isAtPickup) ? <MapPin /> : <ShieldCheck />}
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {(isHeadingToPickup || isAtPickup) ? 'PICKUP ADDRESS' : 'DROP ADDRESS'}
                </div>
                <div style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '1.05rem', marginTop: 4 }}>
                  {(isHeadingToPickup || isAtPickup) ? order.pickupAddress : order.deliveryAddress}
                </div>
              </div>
            </div>
            
            {(isHeadingToPickup || isHeadingToSchool) && !isSimulatingDriving && (
              <button onClick={startNavigation} className="btn-teal" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.1rem' }}>
                <Navigation size={20} /> START NAVIGATION
              </button>
            )}
            {isSimulatingDriving && (
              <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: 16, fontWeight: 700 }}>
                Driving to destination... (Simulating)
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '0 0 30px' }} />

          {isAtPickup && (
            <div className="reveal-up" style={{ background: 'rgba(249,115,22,0.05)', borderRadius: 20, padding: 24, border: '1px solid rgba(249,115,22,0.2)' }}>
              <h3 style={{ color: '#EA580C', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: 16 }}>Arrived at Pickup</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: 'var(--bg-card)', padding: '12px 16px', borderRadius: 12 }}>
                <Clock color="#EA580C" />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WAITING TIMER</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#EA580C', fontFamily: 'var(--font-display)' }}>{formatTime(timeLeft)}</div>
                </div>
              </div>

              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 20, background: 'var(--bg-card)' }}>
                <Phone size={18} /> Call Parent ({order.parentPhone})
              </button>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                You have arrived at the pickup location. Please return to the original Dashboard tab to enter the 4-digit Pickup OTP provided by the parent.
              </p>
              <button className="btn-saffron" style={{ width: '100%', justifyContent: 'center' }} onClick={onBack}>
                Close Tab & Return to Dashboard
              </button>
            </div>
          )}

          {isAtSchool && (
            <div className="reveal-up" style={{ background: 'rgba(13,148,136,0.05)', borderRadius: 20, padding: 24, border: '1px solid rgba(13,148,136,0.2)' }}>
              <h3 style={{ color: '#0F766E', fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: 16 }}>Arrived at Drop</h3>
              
              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 20, background: 'var(--bg-card)' }}>
                <Phone size={18} /> Call Student/Gate
              </button>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                You have arrived at the drop-off location. Please return to the original Dashboard tab to enter the 4-digit Delivery OTP to complete the ride.
              </p>
              <button className="btn-teal" style={{ width: '100%', justifyContent: 'center' }} onClick={onBack}>
                Close Tab & Return to Dashboard
              </button>
            </div>
          )}

          <div style={{ marginTop: 30, background: 'var(--bg-card)', padding: 20, borderRadius: 16, border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 12, letterSpacing: '0.05em' }}>PAYMENT DETAILS</h4>
            
            {order.paymentMode === 'monthly' ? (
              <div>
                <div style={{ fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><CheckCircle size={16}/> Monthly Contract Active</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.5 }}>No cash to collect today. 60% advance paid to platform. Balance settled at cycle end (28 days).</div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 700, color: '#F97316', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>Emergency Delivery Order</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.5 }}>Collect ,1{Math.round(order.price * 0.6)} (Advance) before trip starts via Cash/GPay. Remaining ,1{Math.round(order.price * 0.4)} upon completion.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
