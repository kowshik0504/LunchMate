import React, { useState, useEffect, useRef } from 'react';

import { useAppState } from '../context/AppStateContext';
import { LiveMapTracker } from '../components/LiveMapTracker';
import { subscriptionPlans } from '../data/mockData';
import { School, Utensils, Calendar, FileText, ShieldCheck, MapPin, Zap, ChefHat, Play, Pause, ArrowRight } from 'lucide-react';
import { ParentHeroVisual } from '../components/ParentHeroVisual';

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

export const ParentDashboard = () => {
  
  const { darkMode, activeRole, setActiveRole, orders, createOrder, showToast, updatePaymentStatus } = useAppState();

  const [activeTab, setActiveTab] = useState('orders');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isSubPaused, setIsSubPaused] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState('DPS Anna Nagar');

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        if (['orders', 'emergency', 'subscription', 'reports'].includes(hash)) {
          setActiveTab(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const activeOrder = orders.find(o => o.parentId === 'PAR-123' && o.status !== 'Delivered');
  const pendingPaymentOrder = orders.find(o => o.parentId === 'PAR-123' && o.status === 'Delivered' && o.paymentStatus === 'Advance Paid');
  
  useScrollReveal(activeTab + '-' + (activeOrder ? 'active' : 'none'));

  const [emergencyData, setEmergencyData] = useState({
    studentName: 'Aravind Sundaram',
    schoolName: 'DAV Higher Secondary School, Gopalapuram',
    classDept: 'Class 9-B',
    lunchTime: '12:30 PM',
    pickupAddress: 'Anna Nagar East, Chennai',
    recipientType: 'School Staff / Gate Office'
  });

  const handleQuickFoodReady = () => {
    createOrder({
      parentName: "Meenakshi Sundaram",
      parentPhone: "+91 94441 55667",
      studentName: "Aravind Sundaram",
      schoolName: "DAV Higher Secondary School, Gopalapuram",
      classDept: "Class 9-B",
      lunchTime: "12:30 PM",
      pickupAddress: "Anna Nagar East, Chennai",
      distanceKm: 4.2,
      price: 50,
      paymentMode: selectedPlan === 'daily' ? 'emergency' : 'monthly'
    });
  };

  const handleEmergencySubmit = (e) => {
    e.preventDefault();
    createOrder({
      ...emergencyData,
      parentName: "Meenakshi Sundaram (Emergency)",
      parentPhone: "+91 94441 55667",
      distanceKm: 5.5,
      price: 65
    });
    setActiveTab('orders');
  };

  const headerRef = useRef(null);
  const handleHeaderMouse = (e) => {
    if (!headerRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width  - 0.5) * 12;
    const y = ((clientY - top)  / height - 0.5) * 12;
    headerRef.current.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.01)`;
  };
  const handleHeaderLeave = () => {
    if (headerRef.current)
      headerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 0 80px' }}>
      <div className="noise-overlay" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: 60, marginTop: 20 }}>
          {/* Left Text */}
          <div>
            <div className="section-badge reveal" style={{ marginBottom: 20 }}>
              Parent Portal
            </div>
            
            <h1 className="reveal reveal-delay-1" style={{ fontSize: '3.6rem', marginBottom: 16, lineHeight: 1.05 }}>
              Welcome back,<br />
              <span className="grad-saffron italic-serif">Meenakshi.</span>
            </h1>

            <p className="reveal reveal-delay-2" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 440, marginBottom: 28, lineHeight: 1.6 }}>
              Student: <strong style={{ color: 'var(--text-heading)' }}>Aravind S.</strong> (Class 9-B)<br />
              School: DAV Higher Secondary School<br />
              Target Lunch Time: <strong style={{ color: '#F97316' }}>12:30 PM</strong><br />
              Subscription: <strong style={{ color: '#10B981' }}>Monthly Active User</strong>
            </p>

            <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handleQuickFoodReady}>
                <Utensils size={18} /> Food Ready <ArrowRight size={17} />
              </button>
            </div>
            
            <div className="reveal reveal-delay-4" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ 
                background: 'rgba(13,148,136,0.1)', color: '#0D9488', 
                border: '1px solid rgba(13,148,136,0.2)', fontSize: '0.72rem', 
                padding: '4px 12px', borderRadius: 99, fontWeight: 700,
                letterSpacing: '0.06em'
              }}>✅ MOBILE VERIFIED</span>
            </div>
          </div>

          {/* Right Visual */}
          <div className="reveal-scale">
            <ParentHeroVisual />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="reveal reveal-delay-1" style={{ display: 'flex', gap: 12, marginBottom: 30, borderBottom: '1px solid var(--border-light)', paddingBottom: 14 }}>
          {[
            { id: 'orders', label: '📍 Live Tracking & Active Lunch' },
            { id: 'emergency', label: '⚡ Emergency Lunch Request' },
            { id: 'subscription', label: '📅 Subscription Plans' },
            { id: 'reports', label: '📊 Monthly Reports' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id 
                  ? (darkMode ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' : '#1A120B') 
                  : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
                border: activeTab === tab.id 
                  ? 'none' 
                  : (darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent'),
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                padding: '10px 22px', borderRadius: 99,
                fontSize: '0.9rem', fontFamily: 'var(--font-ui)', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.3s var(--ease-spring)',
                boxShadow: activeTab === tab.id 
                  ? (darkMode ? '0 6px 20px rgba(249, 115, 22, 0.35)' : '0 8px 24px rgba(26,18,11,0.2)') 
                  : 'none'
              }}
              onMouseOver={e => { if(activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-heading)' }}
              onMouseOut={e => { if(activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            
            {/* Premium header strip */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: darkMode
                ? 'linear-gradient(135deg, #060D1F 0%, #0D1B30 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
              borderRadius: 22, padding: '18px 24px',
              border: darkMode
                ? '1px solid rgba(46,196,182,0.25)'
                : '1.5px solid rgba(249,115,22,0.25)',
              boxShadow: darkMode
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 10px 30px rgba(249,115,22,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  boxShadow: '0 6px 18px rgba(249,115,22,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  color: 'white'
                }}>📍</div>
                <div>
                  <div style={{ color: darkMode ? '#FEFEFE' : '#1A120B', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>
                    Active Delivery Tracking
                  </div>
                  <div style={{ color: darkMode ? 'rgba(255,255,255,0.55)' : '#C2410C', fontSize: '0.84rem', marginTop: 3, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                    Order ID: <span style={{ color: '#F97316', fontWeight: 800 }}>{activeOrder ? activeOrder.id : '—'}</span> • Hot & Fresh En Route
                  </div>
                </div>
              </div>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    style={{
                      background: darkMode ? '#1A120B' : '#FFF',
                      border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-light)',
                      color: 'var(--text-body)',
                      padding: '7px 14px',
                      borderRadius: 14,
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-ui)',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="DPS Anna Nagar">DPS Anna Nagar</option>
                    <option value="KV Ashok Nagar">KV Ashok Nagar</option>
                    <option value="Velammal Surapet">Velammal Surapet</option>
                  </select>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: darkMode ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                    border: darkMode ? '1px solid rgba(16,185,129,0.4)' : '1.5px solid #A7F3D0',
                    padding: '7px 16px', borderRadius: 20,
                    boxShadow: '0 2px 8px rgba(16,185,129,0.15)'
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px rgba(16,185,129,0.9)', display: 'inline-block', animation: 'ping 1.4s infinite' }} />
                    <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em' }}>LIVE GPS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-col: tracker + sidebar */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 26, alignItems: 'start' }}>
              <div className="reveal-left">
                {activeOrder ? (
                  <LiveMapTracker order={activeOrder} school={selectedSchool} />
                ) : (
                  <div style={{
                    background: darkMode ? 'linear-gradient(135deg, #060D1F 0%, #0D1B30 100%)' : '#FFFFFF',
                    border: darkMode ? '1px dashed rgba(46,196,182,0.3)' : '2px dashed rgba(249,115,22,0.3)',
                    borderRadius: 24, padding: '56px 40px', textAlign: 'center',
                    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.35)' : '0 8px 28px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🍱</div>
                    <div style={{ color: darkMode ? 'white' : '#1A120B', fontWeight: 700, fontSize: '1.2rem', marginBottom: 10 }}>No Active Delivery</div>
                    <div style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : '#64748B', fontSize: '0.9rem' }}>
                      Click <strong style={{ color: '#F97316' }}>"Food Ready"</strong> above to request a driver pickup.
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* 1. Student & School Info Card */}
                <div style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(217,119,6,0.14) 0%, rgba(26,18,11,0.6) 100%)'
                    : 'linear-gradient(145deg, #FFFFFF 0%, #FFFDF8 100%)',
                  border: darkMode
                    ? '1.5px solid rgba(217,119,6,0.35)'
                    : '1.5px solid rgba(217,119,6,0.22)',
                  borderRadius: 24, padding: '24px',
                  boxShadow: darkMode
                    ? '0 12px 36px rgba(0,0,0,0.4)'
                    : '0 12px 32px rgba(217,119,6,0.12), 0 2px 6px rgba(0,0,0,0.04)',
                }} className="reveal-right reveal-delay-1">
                  
                  {/* Card Title */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 4px 12px rgba(217,119,6,0.3)'
                      }}>
                        <School size={19} />
                      </div>
                      <h4 style={{
                        color: darkMode ? '#FEFEFE' : '#1A120B',
                        fontSize: '1.08rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                        margin: 0
                      }}>
                        Student & School
                      </h4>
                    </div>
                    <span style={{
                      background: darkMode ? 'rgba(245,158,11,0.18)' : '#FEF3C7',
                      color: '#D97706',
                      border: darkMode ? '1px solid rgba(245,158,11,0.3)' : '1px solid #FDE68A',
                      fontSize: '0.7rem', fontWeight: 800, padding: '3px 9px', borderRadius: 20
                    }}>
                      CLASS 9-B
                    </span>
                  </div>

                  {/* Colorful Info Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      {
                        emoji: '👦',
                        label: 'Student Name',
                        value: 'Aravind Sundaram',
                        labelColor: darkMode ? '#93C5FD' : '#2563EB',
                        iconBg: darkMode ? 'rgba(59,130,246,0.15)' : '#EFF6FF',
                        borderClr: darkMode ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.2)',
                        valColor: darkMode ? '#F8FAFC' : '#0F172A',
                      },
                      {
                        emoji: '🏫',
                        label: 'School Destination',
                        value: 'DAV HSS, Gopalapuram',
                        labelColor: darkMode ? '#6EE7B7' : '#059669',
                        iconBg: darkMode ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                        borderClr: darkMode ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)',
                        valColor: darkMode ? '#F8FAFC' : '#0F172A',
                      },
                      {
                        emoji: '📚',
                        label: 'Class & Roll No',
                        value: 'Class 9-B • Roll No: 14',
                        labelColor: darkMode ? '#D8B4FE' : '#7C3AED',
                        iconBg: darkMode ? 'rgba(168,85,247,0.15)' : '#FAF5FF',
                        borderClr: darkMode ? 'rgba(168,85,247,0.25)' : 'rgba(168,85,247,0.2)',
                        valColor: darkMode ? '#F8FAFC' : '#0F172A',
                      },
                      {
                        emoji: '🕐',
                        label: 'Target Lunch Time',
                        value: '12:30 PM sharp',
                        labelColor: darkMode ? '#FDBA74' : '#EA580C',
                        iconBg: darkMode ? 'rgba(249,115,22,0.18)' : '#FFF7ED',
                        borderClr: darkMode ? 'rgba(249,115,22,0.35)' : 'rgba(249,115,22,0.3)',
                        valColor: '#EA580C',
                        badge: '🔥 Hot Serve'
                      },
                      {
                        emoji: '🚪',
                        label: 'Gate / Reception',
                        value: 'Gate 2 Staff / Security Office',
                        labelColor: darkMode ? '#F472B6' : '#E11D48',
                        iconBg: darkMode ? 'rgba(244,63,94,0.15)' : '#FFF1F2',
                        borderClr: darkMode ? 'rgba(244,63,94,0.25)' : 'rgba(244,63,94,0.2)',
                        valColor: darkMode ? '#F8FAFC' : '#0F172A',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: item.iconBg,
                          border: `1px solid ${item.borderClr}`,
                          borderRadius: 14, padding: '10px 14px',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
                          <div>
                            <div style={{
                              color: item.labelColor,
                              fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                              letterSpacing: '0.06em', marginBottom: 2
                            }}>
                              {item.label}
                            </div>
                            <div style={{ color: item.valColor, fontWeight: 700, fontSize: '0.88rem' }}>
                              {item.value}
                            </div>
                          </div>
                        </div>
                        {item.badge && (
                          <span style={{
                            background: darkMode ? 'rgba(234,88,12,0.25)' : '#FFEDD5',
                            color: '#EA580C',
                            border: '1px solid rgba(234,88,12,0.3)',
                            fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                            whiteSpace: 'nowrap'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Security Shield Card */}
                <div style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(26,18,11,0.6) 100%)'
                    : 'linear-gradient(145deg, #FFFFFF 0%, #F0FDF4 100%)',
                  border: darkMode
                    ? '1.5px solid rgba(16,185,129,0.35)'
                    : '1.5px solid rgba(16,185,129,0.25)',
                  borderRadius: 24, padding: '24px',
                  boxShadow: darkMode
                    ? '0 12px 36px rgba(0,0,0,0.4)'
                    : '0 12px 32px rgba(16,185,129,0.12), 0 2px 6px rgba(0,0,0,0.04)',
                }} className="reveal-right reveal-delay-2">
                  
                  {/* Card Title */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #10B981, #0D9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                      }}>
                        <ShieldCheck size={20} />
                      </div>
                      <h4 style={{
                        color: darkMode ? '#FEFEFE' : '#1A120B',
                        fontSize: '1.08rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                        margin: 0
                      }}>
                        Security Shield
                      </h4>
                    </div>
                    <span style={{
                      background: darkMode ? 'rgba(16,185,129,0.2)' : '#D1FAE5',
                      color: '#059669',
                      border: darkMode ? '1px solid rgba(16,185,129,0.35)' : '1px solid #A7F3D0',
                      fontSize: '0.7rem', fontWeight: 800, padding: '3px 9px', borderRadius: 20
                    }}>
                      PROTECTED
                    </span>
                  </div>

                  {/* Security Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      {
                        emoji: '🔑',
                        title: 'Double OTP Handshake',
                        desc: 'Pickup OTP at home + Gate delivery OTP',
                        badge: '2FA SECURED',
                        badgeBg: darkMode ? 'rgba(249,115,22,0.2)' : '#FFF7ED',
                        badgeColor: '#EA580C',
                        bg: darkMode ? 'rgba(249,115,22,0.08)' : '#FFFFFF',
                        border: darkMode ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.2)',
                      },
                      {
                        emoji: '📡',
                        title: 'Live GPS Satellite Ping',
                        desc: 'Real-time telemetry every 3 seconds',
                        badge: 'ACTIVE 🟢',
                        badgeBg: darkMode ? 'rgba(16,185,129,0.2)' : '#ECFDF5',
                        badgeColor: '#059669',
                        bg: darkMode ? 'rgba(16,185,129,0.08)' : '#FFFFFF',
                        border: darkMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.2)',
                      },
                      {
                        emoji: '🛡️',
                        title: '100% KYC Verified Partner',
                        desc: 'Aadhaar, background & police checked',
                        badge: 'VERIFIED ✓',
                        badgeBg: darkMode ? 'rgba(59,130,246,0.2)' : '#EFF6FF',
                        badgeColor: '#2563EB',
                        bg: darkMode ? 'rgba(59,130,246,0.08)' : '#FFFFFF',
                        border: darkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.2)',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        style={{
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                          background: item.bg,
                          border: `1px solid ${item.border}`,
                          borderRadius: 14, padding: '12px 14px',
                          gap: 10,
                          boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                          <span style={{ fontSize: '1.3rem', marginTop: 1 }}>{item.emoji}</span>
                          <div>
                            <div style={{ color: darkMode ? '#FFFFFF' : '#0F172A', fontWeight: 700, fontSize: '0.86rem', marginBottom: 2 }}>
                              {item.title}
                            </div>
                            <div style={{ color: darkMode ? 'rgba(255,255,255,0.55)' : '#64748B', fontSize: '0.76rem', lineHeight: 1.3 }}>
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          background: item.badgeBg,
                          color: item.badgeColor,
                          fontSize: '0.64rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                          whiteSpace: 'nowrap', alignSelf: 'flex-start'
                        }}>
                          {item.badge}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMERGENCY DELIVERY */}
        {activeTab === 'emergency' && (
          <div className="card reveal-scale" style={{ padding: 40, maxWidth: 680, margin: '0 auto', border: '1px solid rgba(249,115,22,0.3)', background: 'var(--bg-card-warm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', padding: 14, borderRadius: 18 }}>
                <Zap size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--text-heading)' }}>Instant Emergency Booking</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Priority 2-min dispatch for unexpected schedules.</p>
              </div>
            </div>

            <form onSubmit={handleEmergencySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Student Name</label>
                <input type="text" className="field-input" value={emergencyData.studentName} onChange={(e) => setEmergencyData({ ...emergencyData, studentName: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>School / College Name</label>
                <input type="text" className="field-input" value={emergencyData.schoolName} onChange={(e) => setEmergencyData({ ...emergencyData, schoolName: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Class / Dept</label>
                  <input type="text" className="field-input" value={emergencyData.classDept} onChange={(e) => setEmergencyData({ ...emergencyData, classDept: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Delivery Time</label>
                  <input type="text" className="field-input" value={emergencyData.lunchTime} onChange={(e) => setEmergencyData({ ...emergencyData, lunchTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Home Pickup Address</label>
                <input type="text" className="field-input" value={emergencyData.pickupAddress} onChange={(e) => setEmergencyData({ ...emergencyData, pickupAddress: e.target.value })} required />
              </div>

              <button type="submit" className="btn-saffron card-lift" style={{ marginTop: 14, justifyContent: 'center', padding: '16px' }}>
                ⚡ Pay ₹65 Securely (LunchMate Escrow)
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div>
            <div className="reveal-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--text-heading)' }}>Subscription Manager</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Manage daily lunch delivery plans.</p>
              </div>

              <button 
                className="card-lift"
                onClick={() => { 
                  if (!isSubPaused) {
                    const confirmPause = window.confirm("Are you sure you want to pause deliveries?\n\nBy pausing, tomorrow's lunch delivery will be canceled (e.g., for sick leave or holidays). The unused meals are automatically saved and added to the end of your billing cycle so you never lose money.\n\nDo you want to pause now?");
                    if (confirmPause) {
                      setIsSubPaused(true); 
                      showToast('Subscription Paused for Holidays', 'info');
                    }
                  } else {
                    setIsSubPaused(false);
                    showToast('Subscription Resumed!', 'success');
                  }
                }}
                style={{
                  background: isSubPaused ? 'rgba(249,115,22,0.1)' : 'var(--bg-card)',
                  border: isSubPaused ? '1px solid rgba(249,115,22,0.4)' : '1px solid var(--border-light)',
                  color: isSubPaused ? '#F97316' : 'var(--text-heading)',
                  padding: '12px 24px', borderRadius: 99,
                  fontSize: '0.88rem', fontFamily: 'var(--font-ui)', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                {isSubPaused ? <><Pause size={16} /> Paused (Holiday)</> : <><Play size={16} /> Active (Auto-Pause)</>}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {subscriptionPlans.map((plan, i) => (
                <div key={plan.id} className={`card reveal-scale reveal-delay-${i+1} card-lift`} style={{ 
                  padding: 32, 
                  border: selectedPlan === plan.id ? '2px solid #F97316' : '1px solid var(--border-light)',
                  boxShadow: selectedPlan === plan.id ? '0 16px 40px rgba(249,115,22,0.15)' : 'var(--shadow-sm)'
                }}>
                  <h4 style={{ color: 'var(--text-heading)', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>{plan.name}</h4>
                  <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#F97316', margin: '12px 0' }}>{plan.pricePerDay}</div>
                  <button 
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      showToast(`Switched to ${plan.name}`, "success");
                    }}
                    className={selectedPlan === plan.id ? "btn-saffron" : "btn-outline"} 
                    style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                  >
                    {selectedPlan === plan.id ? 'Active Plan' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'reports' && (
          <div className="card reveal" style={{ padding: 36 }}>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-heading)' }}>
              <FileText size={22} color="#0D9488" /> Monthly Report & History
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
              <div className="card reveal-scale reveal-delay-1 card-lift" style={{ padding: 20, background: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.1)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Deliveries</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#0D9488', marginTop: 8 }}>22 <span style={{ fontSize: '1rem', fontWeight: 500 }}>Meals</span></div>
              </div>
              <div className="card reveal-scale reveal-delay-2 card-lift" style={{ padding: 20, background: 'rgba(21,128,61,0.05)', border: '1px solid rgba(21,128,61,0.1)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Success Rate</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#15803D', marginTop: 8 }}>100%</div>
              </div>
              <div className="card reveal-scale reveal-delay-3 card-lift" style={{ padding: 20, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Amount Paid</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#F97316', marginTop: 8 }}>₹770</div>
              </div>
            </div>

            <table className="premium-table reveal-up reveal-delay-4">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Driver</th>
                  <th>Delivery Time</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "04 Aug 2026", id: "LUNCH-9901", driver: "Ramesh Kumar", time: "12:24 PM", status: "Delivered", amount: "₹50" },
                  { date: "03 Aug 2026", id: "LUNCH-9820", driver: "Karthik Raja", time: "12:22 PM", status: "Delivered", amount: "₹45" },
                  { date: "02 Aug 2026", id: "LUNCH-9744", driver: "Ramesh Kumar", time: "12:25 PM", status: "Delivered", amount: "₹50" }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td style={{ color: '#F97316', fontWeight: 600 }}>{row.id}</td>
                    <td>{row.driver}</td>
                    <td>{row.time}</td>
                    <td style={{ color: '#15803D', fontWeight: 600 }}>{row.status}</td>
                    <td>{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
