import React, { useState, useEffect, useRef } from 'react';

import { useAppState } from '../context/AppStateContext';
import { ShieldCheck, AlertTriangle, Send, Check, FileText, BarChart3, Bike, Bot, CheckCircle2, GraduationCap, MapPin, ExternalLink, X, Building2 } from 'lucide-react';
import { AdminHeroVisual } from '../components/AdminHeroVisual';

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

export const AdminDashboard = () => {
  
  const { 
    darkMode, 
    drivers, 
    verifyDriverStatus, 
    orders, 
    escalatedChats, 
    resolveEscalatedChat, 
    showToast,
    pendingSchools = [],
    approvedSchools = [],
    approveCustomSchool,
    rejectCustomSchool
  } = useAppState();

  const [activeTab, setActiveTab] = useState('verification');
  const [selectedChat, setSelectedChat] = useState(escalatedChats[0] || null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [reviewingDriver, setReviewingDriver] = useState(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['verification', 'orders', 'support', 'finances'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useScrollReveal(activeTab);

  const pendingDrivers = drivers.filter(d => d.status === 'Pending Verification');
  const verifiedDrivers = drivers.filter(d => d.status === 'Verified');

  const handleResolveChat = (e) => {
    e.preventDefault();
    if (!selectedChat || !adminReplyText.trim()) return;
    resolveEscalatedChat(selectedChat.id, adminReplyText.trim());
    setAdminReplyText('');
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
            <div className="section-badge reveal" style={{ marginBottom: 20, background: 'rgba(217,119,6,0.1)', color: '#D97706', borderColor: 'rgba(217,119,6,0.2)' }}>
              Master Control Panel
            </div>
            
            <h1 className="reveal reveal-delay-1" style={{ fontSize: '3.6rem', marginBottom: 16, lineHeight: 1.05 }}>
              Platform Operations <br />
              <span className="grad-saffron italic-serif">At a Glance.</span>
            </h1>

            <p className="reveal reveal-delay-2" style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 440, marginBottom: 28, lineHeight: 1.6 }}>
              Oversee the entire LunchMate network. From driver approvals to live AI support escalations.
            </p>

            <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ 
                background: 'var(--bg-card-warm)', border: '1px solid var(--border-light)', 
                padding: '12px 24px', borderRadius: 99, fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 8px 24px rgba(26,18,11,0.06)'
              }}>
                <span className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#15803D', display: 'inline-block' }} />
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>System Health:</span> <strong style={{ color: '#15803D' }}>100% Operational</strong>
              </div>
            </div>
            
            <div className="reveal reveal-delay-4" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ 
                background: 'rgba(217,119,6,0.1)', color: '#D97706', 
                border: '1px solid rgba(217,119,6,0.2)', fontSize: '0.72rem', 
                padding: '4px 12px', borderRadius: 99, fontWeight: 700,
                letterSpacing: '0.06em'
              }}>🔒 ENCRYPTED SESSION</span>
            </div>
          </div>

          {/* Right Visual */}
          <div className="reveal-scale">
            <AdminHeroVisual />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="reveal reveal-delay-1" style={{ display: 'flex', gap: 12, marginBottom: 30, borderBottom: '1px solid var(--border-light)', paddingBottom: 14 }}>
          {[
            { id: 'verification', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={16} /> Driver Approvals ({pendingDrivers.length})</span> },
            { id: 'schoolApprovals', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><GraduationCap size={16} /> Unlisted Schools ({pendingSchools.length})</span> },
            { id: 'analytics', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BarChart3 size={16} /> Analytics & Revenue Split</span> },
            { id: 'activeOrders', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bike size={16} /> Live Fleet Monitor ({orders.length})</span> },
            { id: 'supportEscalation', label: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bot size={16} /> AI Inbox ({escalatedChats.filter(c => c.status === 'Open').length})</span> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id
                  ? (darkMode ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' : '#1A120B')
                  : 'transparent',
                border: activeTab === tab.id && darkMode ? '1px solid rgba(251, 191, 36, 0.4)' : 'none',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-muted)',
                padding: '10px 20px', borderRadius: 99,
                fontSize: '0.9rem', fontFamily: 'var(--font-ui)',
                fontWeight: activeTab === tab.id ? 700 : 600,
                cursor: 'pointer', transition: 'all 0.3s var(--ease-spring)',
                boxShadow: activeTab === tab.id
                  ? (darkMode ? '0 6px 20px rgba(217, 119, 6, 0.35)' : '0 8px 24px rgba(26,18,11,0.2)')
                  : 'none'
              }}
              onMouseOver={e => { if(activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-heading)' }}
              onMouseOut={e => { if(activeTab !== tab.id) e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        
        {/* TAB 1: KYC */}
        {activeTab === 'verification' && (
          <div>
            {reviewingDriver ? (
              <div className="reveal">
                <button onClick={() => setReviewingDriver(null)} className="btn-outline" style={{ marginBottom: 24, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ← Back to Approvals
                </button>
                <div className="card" style={{ padding: 40, border: '1px solid rgba(249,115,22,0.3)', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 32, right: 32, background: 'rgba(249,115,22,0.1)', color: '#F97316', padding: '6px 16px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600 }}>
                    In Review
                  </span>
                  <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', marginBottom: 8, color: 'var(--text-heading)' }}>{reviewingDriver.name}</h3>
                  <p style={{ color: '#F97316', marginBottom: 32, fontWeight: 600 }}>{reviewingDriver.area} • {reviewingDriver.phone}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
                    <div style={{ background: 'var(--bg-card-warm)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)' }}>
                      <h4 style={{ marginBottom: 20, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Bike size={18} /> Vehicle Information
                      </h4>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        Model & Registration:<br/>
                        <strong style={{ color: 'var(--text-heading)', fontSize: '1.1rem', display: 'inline-block', marginTop: 6 }}>{reviewingDriver.vehicle}</strong>
                      </div>
                    </div>
                    
                    <div style={{ background: 'var(--bg-card-warm)', padding: 24, borderRadius: 16, border: '1px solid var(--border-light)' }}>
                      <h4 style={{ marginBottom: 20, color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} /> Identity Documents
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ padding: '12px 16px', background: 'var(--bg-base)', border: '1px solid var(--border-medium)', borderRadius: 12, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Aadhaar</span>
                          <strong style={{ color: '#EA580C' }}>{reviewingDriver.documents.aadhaar}</strong>
                        </div>
                        <div style={{ padding: '12px 16px', background: 'var(--bg-base)', border: '1px solid var(--border-medium)', borderRadius: 12, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)' }}>License</span>
                          <strong style={{ color: 'var(--text-heading)' }}>{reviewingDriver.documents.license}</strong>
                        </div>
                        <div style={{ padding: '12px 16px', background: 'var(--bg-base)', border: '1px solid var(--border-medium)', borderRadius: 12, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)' }}>PAN</span>
                          <strong style={{ color: 'var(--text-heading)' }}>{reviewingDriver.documents.pan}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16 }}>
                    <button 
                      onClick={() => { 
                        verifyDriverStatus(reviewingDriver.id, 'Verified'); 
                        showToast(reviewingDriver.name + ' has been verified and activated!', 'success');
                        setReviewingDriver(null);
                      }} 
                      className="btn-primary" 
                      style={{ flex: 1, justifyContent: 'center', background: '#15803D', padding: '16px', fontSize: '1.05rem' }}
                    >
                      <Check size={20} style={{ marginRight: 8 }} /> Approve & Activate
                    </button>
                    <button 
                      onClick={() => {
                        verifyDriverStatus(reviewingDriver.id, 'Rejected');
                        setReviewingDriver(null);
                      }} 
                      className="btn-outline" 
                      style={{ padding: '16px 32px', borderColor: 'rgba(239,68,68,0.4)', color: '#EF4444', fontSize: '1.05rem' }}
                    >
                      Reject Application
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <h3 className="reveal-left" style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: 20, color: 'var(--text-heading)' }}>Pending Driver Approvals</h3>
                
                {pendingDrivers.length === 0 ? (
                  <div className="card reveal-scale" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} color="#15803D" /> All submitted driver KYC applications have been reviewed!
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                    {pendingDrivers.map((drv, i) => (
                      <div key={drv.id} className={'card reveal-scale reveal-delay-' + ((i%3)+1) + ' card-lift'} style={{ padding: 26, border: '1px solid rgba(249,115,22,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div>
                            <h4 style={{ color: 'var(--text-heading)', fontSize: '1.15rem', fontFamily: 'var(--font-display)' }}>{drv.name}</h4>
                            <span style={{ color: '#F97316', fontSize: '0.8rem' }}>{drv.area} • {drv.phone}</span>
                          </div>
                          <span style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', padding: '4px 12px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, height: 'fit-content' }}>
                            Action Required
                          </span>
                        </div>

                        <div style={{ background: 'var(--bg-card-warm)', padding: 18, borderRadius: 16, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid var(--border-light)' }}>
                          <div> Vehicle: <strong style={{ color: 'var(--text-heading)' }}>{drv.vehicle}</strong></div>
                          <div> Aadhaar: <strong style={{ color: '#F97316' }}>{drv.documents.aadhaar}</strong></div>
                          <div> Driving License: <strong style={{ color: 'var(--text-heading)' }}>{drv.documents.license}</strong></div>
                          <div> PAN: <strong style={{ color: 'var(--text-heading)' }}>{drv.documents.pan}</strong></div>
                        </div>

                        <button onClick={() => setReviewingDriver(drv)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                           Review Application →
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="reveal-left" style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', margin: '48px 0 20px', color: 'var(--text-heading)' }}>Active Verified Drivers ({verifiedDrivers.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {verifiedDrivers.map((drv, i) => (
                    <div key={drv.id} className={'card reveal-up reveal-delay-' + ((i%5)+1) + ' card-lift'} style={{ padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{drv.name}</span>
                        <span style={{ color: '#15803D', fontSize: '0.8rem', fontWeight: 600 }}>⭐ {drv.rating}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{drv.area} • Trips Today: {drv.tripsToday}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: UNLISTED SCHOOL VERIFICATIONS & REGISTRY APPROVALS */}
        {activeTab === 'schoolApprovals' && (
          <div>
            {/* Top Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
              <div className="card reveal-scale card-lift" style={{ padding: 22, background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.25)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>Pending School Verifications</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#F97316', margin: '6px 0 2px' }}>
                  {pendingSchools.length}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#EA580C', fontWeight: 600 }}>Requires gate location verification</span>
              </div>

              <div className="card reveal-scale reveal-delay-1 card-lift" style={{ padding: 22, background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>Approved & Added to Registry</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#10B981', margin: '6px 0 2px' }}>
                  {approvedSchools.length}
                </div>
                <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>Active in district dropdowns</span>
              </div>

              <div className="card reveal-scale reveal-delay-2 card-lift" style={{ padding: 22, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.25)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>All TN Districts</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#3B82F6', margin: '6px 0 2px' }}>
                  38
                </div>
                <span style={{ fontSize: '0.74rem', color: '#2563EB', fontWeight: 600 }}>Tamil Nadu district registry</span>
              </div>
            </div>

            {/* Pending Approvals Section */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 className="reveal-left" style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--text-heading)', margin: 0 }}>
                    Unlisted School Verification Queue
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                    Inspect the submitted school entrance on Google Maps, verify GPS coordinates, and approve into the official registry.
                  </p>
                </div>
                <span style={{
                  background: pendingSchools.length > 0 ? 'rgba(249,115,22,0.15)' : 'rgba(16,185,129,0.15)',
                  color: pendingSchools.length > 0 ? '#EA580C' : '#10B981',
                  padding: '6px 16px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700
                }}>
                  {pendingSchools.length} Pending Approval
                </span>
              </div>

              {pendingSchools.length === 0 ? (
                <div className="card reveal-scale" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', borderRadius: 16 }}>
                  <CheckCircle2 size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: '#10B981' }} />
                  All unlisted school submissions have been verified and approved into the registry!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
                  {pendingSchools.map((sch) => (
                    <div
                      key={sch.id}
                      className="card card-lift reveal-scale"
                      style={{
                        padding: 24,
                        border: '1.5px solid rgba(249,115,22,0.35)',
                        borderRadius: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        {/* Header Badges */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                          <div>
                            <span style={{
                              background: 'rgba(249,115,22,0.12)',
                              color: '#EA580C',
                              padding: '3px 10px',
                              borderRadius: 8,
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}>
                              {sch.district} • {sch.board}
                            </span>
                            <h4 style={{ color: 'var(--text-heading)', fontSize: '1.18rem', fontFamily: 'var(--font-display)', margin: '8px 0 2px' }}>
                              {sch.name}
                            </h4>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={13} style={{ color: '#EA580C' }} /> {sch.area || sch.district}
                            </span>
                          </div>
                          <span style={{
                            background: 'rgba(234, 88, 12, 0.12)',
                            color: '#EA580C',
                            padding: '4px 10px',
                            borderRadius: 10,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            Pending Review
                          </span>
                        </div>

                        {/* Submitter & GPS Details */}
                        <div style={{
                          background: 'var(--bg-card-warm)',
                          padding: 14,
                          borderRadius: 12,
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
                          margin: '14px 0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                          border: '1px solid var(--border-light)'
                        }}>
                          <div>
                            Submitted By: <strong style={{ color: 'var(--text-heading)' }}>{sch.submittedBy}</strong> ({sch.studentName} — {sch.studentClass})
                          </div>
                          <div>
                            GPS Coordinates: <strong style={{ color: '#10B981', fontFamily: 'monospace' }}>{sch.lat.toFixed(4)}°N, {sch.lng.toFixed(4)}°E</strong>
                          </div>
                          <div>
                            Submitted: <span style={{ color: 'var(--text-light)' }}>{sch.submittedAt}</span>
                          </div>
                        </div>

                        {/* Google Maps External Verification Button */}
                        <div style={{ marginBottom: 18 }}>
                          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#EA580C', marginBottom: 5 }}>
                            Google Maps Link (Parent Submitted Gate)
                          </label>
                          <a
                            href={sch.mapsLink}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              borderRadius: 10,
                              background: darkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                              border: '1px solid var(--border-medium)',
                              color: '#3B82F6',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              maxWidth: '100%',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title="Click to open gate in Google Maps"
                          >
                            <ExternalLink size={14} /> Open in Google Maps (Verify Gate) ↗
                          </a>
                        </div>
                      </div>

                      {/* Approval Actions */}
                      <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
                        <button
                          type="button"
                          onClick={() => approveCustomSchool(sch.id)}
                          className="btn-primary"
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            background: '#15803D',
                            padding: '12px 16px',
                            fontSize: '0.88rem',
                            borderRadius: 12
                          }}
                        >
                          <Check size={16} style={{ marginRight: 6 }} /> Approve & Add to School Registry
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectCustomSchool(sch.id)}
                          className="btn-outline"
                          style={{
                            padding: '12px 16px',
                            borderColor: 'rgba(239,68,68,0.4)',
                            color: '#EF4444',
                            fontSize: '0.88rem',
                            borderRadius: 12
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Registry Directory */}
            {approvedSchools.length > 0 && (
              <div>
                <h3 className="reveal-left" style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', color: 'var(--text-heading)', marginBottom: 16 }}>
                  Active Approved Schools in Registry ({approvedSchools.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
                  {approvedSchools.map((sch) => (
                    <div
                      key={sch.id}
                      className="card card-lift"
                      style={{
                        padding: 18,
                        borderRadius: 14,
                        border: '1px solid rgba(16,185,129,0.3)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-heading)', fontWeight: 700, fontSize: '0.98rem' }}>
                            {sch.name}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {sch.district} • {sch.board} • {sch.area || 'Verified Area'}
                        </div>
                      </div>
                      <span style={{
                        background: 'rgba(16,185,129,0.12)',
                        color: '#10B981',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <CheckCircle2 size={13} /> In Registry
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 36 }}>
            <div className="card reveal-scale reveal-delay-1 card-lift" style={{ padding: 26, background: 'rgba(249,115,22,0.03)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Daily Orders</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: '#F97316', margin: '8px 0 4px' }}>248</div>
              <span style={{ fontSize: '0.75rem', color: '#15803D' }}>+18% from last week</span>
            </div>
            <div className="card reveal-scale reveal-delay-2 card-lift" style={{ padding: 26, background: 'rgba(217,119,6,0.03)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Platform Gross Revenue</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: '#D97706', margin: '8px 0 4px' }}>₹14,880</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Average ₹60 / order</span>
            </div>
            <div className="card reveal-scale reveal-delay-3 card-lift" style={{ padding: 26, background: 'rgba(21,128,61,0.03)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Driver Payouts (85%)</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: '#15803D', margin: '8px 0 4px' }}>₹12,648</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Directly distributed</span>
            </div>
            <div className="card reveal-scale reveal-delay-4 card-lift" style={{ padding: 26, background: 'rgba(13,148,136,0.03)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Net Commission (15%)</span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: '#0D9488', margin: '8px 0 4px' }}>₹2,232</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Operation margin</span>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE FLEET */}
        {activeTab === 'activeOrders' && (
          <div className="card reveal" style={{ padding: 36 }}>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: 24, color: 'var(--text-heading)' }}>Live Deliveries Fleet Overview</h3>
            <table className="premium-table reveal-up reveal-delay-1">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Parent</th>
                  <th>Student & Destination</th>
                  <th>Driver</th>
                  <th>Pickup OTP</th>
                  <th>Delivery OTP</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ color: '#F97316', fontWeight: 700 }}>{ord.id}</td>
                    <td>{ord.parentName}</td>
                    <td>{ord.studentName} ({ord.schoolName})</td>
                    <td style={{ color: '#0D9488', fontWeight: 600 }}>{ord.driverName}</td>
                    <td style={{ letterSpacing: '2px', color: '#D97706', fontWeight: 700 }}>{ord.pickupOtp}</td>
                    <td style={{ letterSpacing: '2px', color: '#0D9488', fontWeight: 700 }}>{ord.deliveryOtp}</td>
                    <td>
                      <span style={{ 
                        background: ord.status === 'Delivered' ? 'rgba(21,128,61,0.1)' : 'rgba(249,115,22,0.1)', 
                        color: ord.status === 'Delivered' ? '#15803D' : '#F97316', 
                        padding: '4px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 700 
                      }}>
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: AI SUPPORT */}
        {activeTab === 'supportEscalation' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 28 }}>
            
            {/* Left Queue */}
            <div className="card reveal-left" style={{ padding: 26, background: 'var(--bg-card-warm)' }}>
              <h4 style={{ color: '#D97706', fontSize: '1.1rem', fontFamily: 'var(--font-display)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} /> Escalated Chats ({escalatedChats.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {escalatedChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className="card-lift"
                    style={{
                      background: selectedChat?.id === chat.id ? 'rgba(217,119,6,0.1)' : 'var(--bg-card)',
                      border: selectedChat?.id === chat.id ? '1px solid rgba(217,119,6,0.4)' : '1px solid var(--border-light)',
                      borderRadius: 18, padding: 18, cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: selectedChat?.id === chat.id ? '0 8px 24px rgba(217,119,6,0.15)' : 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ color: 'var(--text-heading)', fontSize: '0.95rem' }}>{chat.userName} ({chat.userRole})</strong>
                      <span style={{ fontSize: '0.75rem', color: chat.status === 'Open' ? '#F97316' : '#15803D', fontWeight: 700 }}>{chat.status}</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Reason: {chat.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Chat Takeover */}
            {selectedChat ? (
              <div className="card reveal-right reveal-delay-1" style={{ padding: 32, display: 'flex', flexDirection: 'column', height: 560 }}>
                <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 16, marginBottom: 20 }}>
                  <h4 style={{ color: 'var(--text-heading)', fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Live Chat Takeover — {selectedChat.userName}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>Full AI transcript available before responding.</p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, paddingRight: 10 }}>
                  {selectedChat.messages.map((m, idx) => (
                    <div key={idx} className="reveal-up" style={{
                      animationDelay: `${idx * 0.1}s`,
                      alignSelf: m.sender === 'user' ? 'flex-start' : m.sender === 'admin' ? 'flex-end' : 'flex-start',
                      background: m.sender === 'user' ? 'var(--bg-card-warm)' : m.sender === 'admin' ? '#0D9488' : 'rgba(217,119,6,0.1)',
                      padding: '12px 18px', borderRadius: 18, fontSize: '0.9rem', maxWidth: '80%',
                      color: m.sender === 'admin' ? 'white' : 'var(--text-heading)',
                      border: m.sender === 'user' ? '1px solid var(--border-light)' : 'none'
                    }}>
                      <div style={{ fontSize: '0.7rem', color: m.sender === 'admin' ? 'rgba(255,255,255,0.7)' : 'var(--text-light)', fontWeight: 600, marginBottom: 4 }}>{m.sender.toUpperCase()}</div>
                      {m.text}
                    </div>
                  ))}
                </div>

                {selectedChat.status === 'Open' ? (
                  <form onSubmit={handleResolveChat} style={{ display: 'flex', gap: 12 }}>
                    <input type="text" placeholder="Type Official Reply..." value={adminReplyText} onChange={(e) => setAdminReplyText(e.target.value)} className="field-input" style={{ flex: 1, padding: '14px 20px' }} required />
                    <button type="submit" className="btn-saffron card-lift" style={{ borderRadius: 16 }}><Send size={16} /> Resolve</button>
                  </form>
                ) : (
                  <div className="reveal-scale" style={{ background: 'rgba(21,128,61,0.1)', color: '#15803D', padding: 14, borderRadius: 16, textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                    <CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Issue resolved by Admin
                  </div>
                )}
              </div>
            ) : (
              <div className="card reveal-scale" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Select a chat from the queue to view conversation history and reply.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
