import React, { useState, useEffect, useRef } from 'react';

import { useAppState } from '../context/AppStateContext';
import { Truck, Navigation, Key, MapPin, Power, Bike, FileText, User, CreditCard, Camera, ExternalLink, CheckCircle, Clock, Phone } from 'lucide-react';
import { DriverHeroVisual } from '../components/DriverHeroVisual';
import { DriverActiveRide } from '../components/DriverActiveRide';

const useScrollReveal = (dependency) => {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-up';
    const els = document.querySelectorAll(selectors);
    els.forEach(el => el.classList.remove('is-visible'));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    setTimeout(() => { els.forEach(el => observer.observe(el)); }, 50);
    return () => observer.disconnect();
  }, [dependency]);
};

export const DriverDashboard = () => {
  
  const { drivers, activeDriverId, setActiveDriverId, orders, acceptOrder, showToast, verifyPickupOtp, verifyDeliveryOtp, updateOrderStatus } = useAppState();

  const activeDriver = drivers.find(d => d.id === activeDriverId) || drivers[0];
  const [isOnline, setIsOnline] = useState(activeDriver.isOnline);
  const [showKycModal, setShowKycModal] = useState(false);

  const [inputPickupOtp, setInputPickupOtp] = useState('');
  const [inputDeliveryOtp, setInputDeliveryOtp] = useState('');

  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        if (['home', 'earnings', 'history'].includes(hash)) {
          setActiveTab(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const assignedOrder = orders.find(o => o.driverId === activeDriver.id && o.status !== 'Delivered');
  const availableOrders = orders.filter(o => o.status === 'Food Ready' && !o.driverId);
  const completedOrders = orders.filter(o => o.driverId === activeDriver.id && o.status === 'Delivered');
  const allMyOrders = orders.filter(o => o.driverId === activeDriver.id);

  useScrollReveal(activeDriverId + '-' + (assignedOrder ? 'assigned' : 'free') + '-' + activeTab);

  const handleToggleOnline = () => {
    if (activeDriver.status !== 'Verified') {
      showToast("Verification pending KYC review! You cannot go online.", "error");
      return;
    }
    setIsOnline(!isOnline);
    showToast(isOnline ? "Driver status: Offline" : "Driver status: Online & receiving nearby requests!", isOnline ? "info" : "success");
  };

  const handlePickupOtpSubmit = (e) => {
    e.preventDefault();
    if (assignedOrder && verifyPickupOtp(assignedOrder.id, inputPickupOtp)) {
      updateOrderStatus(assignedOrder.id, 'Picked Up');
      setInputPickupOtp('');
      openMapNewTab();
    }
  };

  const handleDeliveryOtpSubmit = (e) => {
    e.preventDefault();
    if (assignedOrder && verifyDeliveryOtp(assignedOrder.id, inputDeliveryOtp)) {
      updateOrderStatus(assignedOrder.id, 'Delivered');
      showToast("Order Completed Successfully!", "success");
      setInputDeliveryOtp('');
    }
  };

  const openMapNewTab = () => {
    window.open(window.location.origin + '/#driver-map-' + assignedOrder.id, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 0 80px' }}>
      <div className="noise-overlay" />
      
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: 60, marginTop: 20 }}>
          {/* Left Text */}
          <div>
            <div className="section-badge reveal" style={{ marginBottom: 20, background: 'rgba(13,148,136,0.1)', color: '#0D9488', borderColor: 'rgba(13,148,136,0.2)' }}>
              Driver Portal
            </div>
            
            <div className="reveal reveal-delay-1" style={{ marginBottom: 16 }}>
              <h1 style={{ fontSize: '3.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-heading)', margin: 0, lineHeight: 1.05 }}>
                {activeDriver.name}
              </h1>
            </div>

            <p className="reveal reveal-delay-2" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 440, marginBottom: 28, lineHeight: 1.6 }}>
              Vehicle: <strong style={{ color: 'var(--text-heading)' }}>{activeDriver.vehicle}</strong><br />
              Area: {activeDriver.area} <br />
              Rating: ⭐ <strong style={{ color: '#F97316' }}>{activeDriver.rating}</strong>
            </p>

            <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={handleToggleOnline}
                style={{
                  background: isOnline ? '#15803D' : 'var(--bg-card)',
                  border: isOnline ? 'none' : '1.5px solid var(--border-medium)',
                  color: isOnline ? 'white' : 'var(--text-heading)',
                  padding: '14px 32px', borderRadius: 99,
                  fontWeight: 700, fontFamily: 'var(--font-ui)', fontSize: '0.95rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: isOnline ? '0 8px 32px rgba(21,128,61,0.3)' : 'var(--shadow-sm)',
                  transition: 'all 0.3s var(--ease-spring)'
                }}
              >
                <Power size={18} /> {isOnline ? 'ONLINE & READY' : 'OFFLINE'}
              </button>
              
              <button onClick={() => setShowKycModal(true)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={16} /> KYC Docs
              </button>
            </div>
            
            <div className="reveal reveal-delay-4" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ 
                background: activeDriver.status === 'Verified' ? 'rgba(21,128,61,0.1)' : 'rgba(249,115,22,0.1)',
                color: activeDriver.status === 'Verified' ? '#15803D' : '#F97316',
                border: activeDriver.status === 'Verified' ? '1px solid rgba(21,128,61,0.2)' : '1px solid rgba(249,115,22,0.2)',
                fontSize: '0.72rem', padding: '4px 12px', borderRadius: 99, fontWeight: 700, letterSpacing: '0.06em'
              }}>
                {activeDriver.status === 'Verified' ? '✅ ' : '⚠️ '}
                {activeDriver.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Right Visual */}
          <div className="reveal-scale">
            <DriverHeroVisual />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="reveal reveal-delay-1" style={{ display: 'flex', gap: 12, marginBottom: 30, borderBottom: '1px solid var(--border-light)', paddingBottom: 14 }}>
          {[
            { id: 'home', label: '🗺️ Route Dashboard' },
            { id: 'earnings', label: '💰 Earnings & Payments' },
            { id: 'history', label: '📜 Delivery History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { window.location.hash = tab.id; }}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)' : 'transparent',
                border: activeTab === tab.id ? 'none' : '1px solid transparent',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                padding: '10px 22px', borderRadius: 99,
                fontSize: '0.9rem', fontFamily: 'var(--font-ui)', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.3s var(--ease-spring)',
                boxShadow: activeTab === tab.id ? '0 6px 20px rgba(13, 148, 136, 0.3)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'home' && (
          <div className="reveal">
            {/* Driver Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 36 }}>
              <div className="card reveal-scale reveal-delay-1 card-lift" style={{ padding: 26, background: 'rgba(21,128,61,0.03)', border: '1px solid rgba(21,128,61,0.1)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Today's Earnings</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: '#15803D', margin: '8px 0 4px' }}>
                  ₹{activeDriver.earningsToday}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Direct bank payout</span>
              </div>

              <div className="card reveal-scale reveal-delay-2 card-lift" style={{ padding: 26, background: 'rgba(13,148,136,0.03)', border: '1px solid rgba(13,148,136,0.1)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Trips Completed Today</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: '#0D9488', margin: '8px 0 4px' }}>
                  {activeDriver.tripsToday} <span style={{ fontSize: '1.2rem', fontWeight: 500 }}>Trips</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>100% On-time delivery rate</span>
              </div>

              <div className="card reveal-scale reveal-delay-3 card-lift" style={{ padding: 26, background: 'rgba(249,115,22,0.03)', border: '1px solid rgba(249,115,22,0.1)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Wallet Balance</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: '#F97316', margin: '8px 0 4px' }}>
                  ₹1,420
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Auto-withdrawn weekly</span>
              </div>
            </div>

            {/* Active Assigned Order */}
            {assignedOrder && (
              <div className="card reveal" style={{ padding: 36, marginBottom: 40, border: '2px solid rgba(13,148,136,0.4)', boxShadow: '0 16px 40px rgba(13,148,136,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#0D9488', display: 'inline-block' }} />
                    <span style={{ color: '#0D9488', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', fontFamily: 'var(--font-ui)' }}>
                      ACTIVE ASSIGNED
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--text-heading)' }}>{assignedOrder.id}</h3>
                  </div>
                  <button onClick={openMapNewTab} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#10B981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 99, fontWeight: 700, cursor: 'pointer' }}>
                    <ExternalLink size={18} /> Open Navigation Map (New Tab)
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 30 }}>
                  <div style={{ background: 'rgba(249,115,22,0.06)', padding: 22, borderRadius: 20, border: '1.5px solid rgba(249,115,22,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: '#F97316', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={16} /> PICKUP (Exact Location)
                      </span>
                      {assignedOrder.paymentMode === 'emergency' && (
                        <span style={{ background: 'rgba(249,115,22,0.18)', color: '#EA580C', padding: '3px 9px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 800 }}>
                          ⚡ SOLO RAPID PICKUP
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--text-heading)', fontWeight: 800, fontSize: '1.1rem' }}>{assignedOrder.parentName}</div>
                    <div style={{ 
                      color: 'var(--text-heading)', 
                      fontSize: '0.9rem', 
                      lineHeight: 1.5, 
                      marginTop: 8, 
                      background: 'rgba(255,255,255,0.05)', 
                      padding: '10px 14px', 
                      borderRadius: 12, 
                      border: '1px solid rgba(249,115,22,0.15)',
                      fontWeight: 600
                    }}>
                      📍 <strong>Address Details:</strong><br />
                      {assignedOrder.pickupAddress}
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(assignedOrder.pickupAddress)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'linear-gradient(135deg, #F97316, #EA580C)',
                          color: '#FFF', padding: '8px 14px', borderRadius: 10,
                          fontSize: '0.76rem', fontWeight: 800, textDecoration: 'none',
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          boxShadow: '0 4px 12px rgba(249,115,22,0.25)'
                        }}
                      >
                        <Navigation size={13} /> Open in Google Maps
                      </a>
                      <a
                        href={`tel:${assignedOrder.parentPhone || '+919444155667'}`}
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          color: '#059669', border: '1px solid rgba(16,185,129,0.3)',
                          padding: '8px 14px', borderRadius: 10,
                          fontSize: '0.76rem', fontWeight: 800, textDecoration: 'none',
                          display: 'inline-flex', alignItems: 'center', gap: 6
                        }}
                      >
                        <Phone size={13} /> Call Parent
                      </a>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(13,148,136,0.05)', padding: 20, borderRadius: 20, border: '1px solid rgba(13,148,136,0.1)' }}>
                    <span style={{ color: '#0D9488', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Navigation size={15} /> DROP (School / Work)
                    </span>
                    <div style={{ color: 'var(--text-heading)', fontWeight: 600, fontSize: '1.05rem' }}>{assignedOrder.studentName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>{assignedOrder.schoolName} ({assignedOrder.classDept})</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                      <a
                        href={assignedOrder.schoolMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(assignedOrder.schoolName + ', Tamil Nadu')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#0D9488',
                          color: '#FFF',
                          padding: '8px 14px',
                          borderRadius: 99,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none'
                        }}
                      >
                        <Navigation size={13} /> Navigate to School Gate (Google Maps) ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* STEP 1: Pickup OTP */}
                {['Driver Assigned', 'Arrived at Pickup'].includes(assignedOrder.status) && (
                  <div className="reveal-up" style={{ background: 'rgba(249,115,22,0.05)', border: '1px dashed rgba(249,115,22,0.3)', borderRadius: 24, padding: 26 }}>
                    <h4 style={{ color: '#F97316', fontSize: '1.1rem', marginBottom: 10, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Key size={18} /> Step 1: Verify Pickup OTP at Parent's Doorstep
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                      Once you arrive, ask parent for the 4-digit Pickup OTP. (Demo OTP: <strong style={{ color: 'var(--text-heading)' }}>{assignedOrder.pickupOtp}</strong>)
                    </p>
                    <form onSubmit={handlePickupOtpSubmit} style={{ display: 'flex', gap: 14 }}>
                      <input type="text" placeholder="Enter 4-Digit Pickup OTP" value={inputPickupOtp} onChange={(e) => setInputPickupOtp(e.target.value)} className="field-input" style={{ flex: 1, letterSpacing: '3px', fontWeight: 600 }} />
                      <button type="submit" className="btn-saffron">Verify & Confirm Pickup</button>
                    </form>
                  </div>
                )}

                {/* STEP 2: Delivery OTP */}
                {['Picked Up', 'On The Way', 'Arrived at School'].includes(assignedOrder.status) && (
                  <div className="reveal-up" style={{ background: 'rgba(13,148,136,0.05)', border: '1px dashed rgba(13,148,136,0.3)', borderRadius: 24, padding: 26 }}>
                    <h4 style={{ color: '#0D9488', fontSize: '1.1rem', marginBottom: 10, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Key size={18} /> Step 2: Verify Delivery OTP at School Gate
                    </h4>
                    {assignedOrder.status === 'Arrived at School' ? (
                      <>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
                          Hand over food to school gate staff or student and enter their Delivery OTP. (Demo OTP: <strong style={{ color: 'var(--text-heading)' }}>{assignedOrder.deliveryOtp}</strong>)
                        </p>
                        <form onSubmit={handleDeliveryOtpSubmit} style={{ display: 'flex', gap: 14 }}>
                          <input type="text" placeholder="Enter 4-Digit Delivery OTP" value={inputDeliveryOtp} onChange={(e) => setInputDeliveryOtp(e.target.value)} className="field-input" style={{ flex: 1, letterSpacing: '3px', fontWeight: 600 }} />
                          <button type="submit" className="btn-teal">Complete Delivery & Collect Earnings</button>
                        </form>
                      </>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                        Please use the Navigation Map to reach the school. The OTP verification will unlock once you arrive.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Nearby Requests */}
            <div>
              <h3 className="reveal-left" style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: 24, color: 'var(--text-heading)' }}>
                📡 Nearby Delivery Requests in {activeDriver.area} ({availableOrders.length})
              </h3>

              {!isOnline ? (
                <div className="card reveal-scale" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  You are currently <strong style={{ color: 'var(--text-heading)' }}>OFFLINE</strong>. Go <strong style={{ color: '#15803D' }}>ONLINE</strong> to receive nearby delivery requests.
                </div>
              ) : availableOrders.length === 0 ? (
                <div className="card reveal-scale" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No pending delivery requests nearby. Searching for parents preparing lunch...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                  {availableOrders.map((ord, i) => (
                    <div key={ord.id} className={`card reveal-scale reveal-delay-${(i%3)+1} card-lift`} style={{ padding: 26, border: '1px solid rgba(249,115,22,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <span style={{ color: '#F97316', fontWeight: 700, fontSize: '0.9rem' }}>{ord.id}</span>
                        <span style={{ color: '#15803D', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem' }}>Earn ₹{Math.round(ord.price * 0.85)}</span>
                      </div>

                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ background: 'rgba(249,115,22,0.06)', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(249,115,22,0.18)' }}>
                          <span style={{ color: '#F97316', fontWeight: 800, display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: 2 }}>📍 Detailed Pickup Location:</span>
                          <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.4 }}>{ord.pickupAddress}</span>
                        </div>
                        <div><span style={{ color: 'var(--text-heading)', marginRight: 6 }}>🏫 Drop School:</span> <strong>{ord.schoolName}</strong> ({ord.distanceKm} km)</div>
                        <div><span style={{ color: 'var(--text-heading)', marginRight: 6 }}>⏰ Target Bell:</span> {ord.lunchTime}</div>
                        <div>
                          <span style={{ color: 'var(--text-heading)', marginRight: 6 }}>💳 Ride Type:</span> 
                          <strong style={{ color: ord.paymentMode === 'emergency' ? '#F97316' : '#10B981' }}>{ord.paymentMode === 'emergency' ? '⚡ Emergency Solo Dispatch (Escrow)' : 'Monthly Contract'}</strong>
                        </div>
                      </div>

                      <button onClick={() => acceptOrder(ord.id, activeDriver.id)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Accept Delivery Request
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

                  {/* EARNINGS TAB */}
          {activeTab === 'earnings' && (
            <div className="reveal">
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: 24, color: 'var(--text-heading)' }}>
                Earnings Breakdown
              </h3>
              
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 40 }}>
                  <div className="card" style={{ padding: 30, background: 'linear-gradient(135deg, rgba(21,128,61,0.05) 0%, rgba(21,128,61,0.15) 100%)', border: '1px solid rgba(21,128,61,0.2)' }}>
                    <h4 style={{ color: '#15803D', fontSize: '1.1rem', marginBottom: 12 }}>Emergency Deliveries</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#15803D', marginBottom: 8 }}>₹850</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>100% pre-paid by parents into LunchMate Escrow. Instant payout on delivery completion.</p>
                  </div>
                  <div className="card" style={{ padding: 30, background: 'linear-gradient(135deg, rgba(13,148,136,0.05) 0%, rgba(13,148,136,0.15) 100%)', border: '1px solid rgba(13,148,136,0.2)' }}>
                    <h4 style={{ color: '#0D9488', fontSize: '1.1rem', marginBottom: 12 }}>Monthly Contracts</h4>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#0D9488', marginBottom: 8 }}>₹570</div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>60% advance paid to platform. Final settlement occurs at end of 28-day cycle.</p>
                  </div>
                </div>
          </div>
        )}
      </div>
    </div>
  );
};







export default DriverDashboard;
