import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { 
  Bot, MapPin, Home, User, LogOut, Sun, Moon, 
  CreditCard, Wallet, History, FileText, Bike, 
  ShieldCheck, BarChart3, Sparkles, Sliders, Menu, X 
} from 'lucide-react';
import logoIcon from '../assets/logo_icon.jpg';
import { WhyLunchMateModal } from './WhyLunchMateModal';

export const Navbar = ({ onOpenAIChat }) => {
  const { darkMode, toggleDarkMode, activeRole, setActiveRole, openLogin, logout, showWhyModal, openWhyModal, closeWhyModal } = useAppState();

  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);

      if (activeRole === 'landing') {
        const sections = ['home', 'workflow', 'features', 'pricing', 'start'];
        let current = 'home';
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 3) {
              current = section;
            }
          }
        }
        setActiveLink(current);
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeRole]);

  // Synchronize Navbar active link with hash in Parent/Driver/Admin roles
  useEffect(() => {
    const syncActiveHash = () => {
      if (activeRole === 'parent') {
        const rawHash = window.location.hash ? window.location.hash.replace('#', '') : '';
        const validParentTabs = ['orders', 'emergency', 'subscription', 'reports', 'parent-details'];
        const currentHash = validParentTabs.includes(rawHash) ? rawHash : 'orders';
        setActiveLink(currentHash);
      } else if (activeRole === 'driver') {
        const rawHash = window.location.hash ? window.location.hash.replace('#', '') : '';
        const validDriverTabs = ['home', 'earnings', 'history'];
        const currentHash = validDriverTabs.includes(rawHash) ? rawHash : 'home';
        setActiveLink(currentHash);
      } else if (activeRole === 'admin') {
        const rawHash = window.location.hash ? window.location.hash.replace('#', '') : '';
        const validAdminTabs = ['verification', 'orders', 'support', 'finances'];
        const currentHash = validAdminTabs.includes(rawHash) ? rawHash : 'verification';
        setActiveLink(currentHash);
      }
    };

    syncActiveHash();
    window.addEventListener('hashchange', syncActiveHash);
    return () => window.removeEventListener('hashchange', syncActiveHash);
  }, [activeRole]);

  let navLinks = [];
  if (activeRole === 'landing') {
    navLinks = [
      { id: 'home',       icon: <Home size={15} />,        label: 'Home',               shortLabel: 'Home' },
      { id: 'workflow',   icon: <Sliders size={15} />,     label: 'Simple Workflow',    shortLabel: 'Workflow' },
      { id: 'features',   icon: <ShieldCheck size={15} />, label: 'Platform Features',  shortLabel: 'Features' },
      { id: 'pricing',    icon: <CreditCard size={15} />,  label: 'Subscription Plans', shortLabel: 'Plans' },
      { id: 'start',      icon: <Sparkles size={15} />,    label: 'Start Today',        shortLabel: 'Start' },
    ];
  } else if (activeRole === 'parent') {
    navLinks = [
      { id: 'orders',         icon: <Home size={15} />,       label: 'Dashboard',          shortLabel: 'Home' },
      { id: 'emergency',      icon: <MapPin size={15} />,     label: 'Emergency Delivery', shortLabel: 'Emergency' },
      { id: 'subscription',   icon: <CreditCard size={15} />, label: 'Subscription',      shortLabel: 'Plans' },
      { id: 'reports',        icon: <FileText size={15} />,   label: 'History',           shortLabel: 'History' },
      { id: 'parent-details', icon: <User size={15} />,       label: 'Parent Details',     shortLabel: 'Profile' },
    ];
  } else if (activeRole === 'driver') {
    navLinks = [
      { id: 'home',        icon: <Home size={15} />,            label: 'Route Dashboard', shortLabel: 'Routes' },
      { id: 'earnings',    icon: <Wallet size={15} />,          label: 'Earnings',        shortLabel: 'Earnings' },
      { id: 'history',     icon: <History size={15} />,         label: 'History',         shortLabel: 'History' },
    ];
  } else if (activeRole === 'admin') {
    navLinks = [
      { id: 'verification', icon: <ShieldCheck size={15} />,     label: 'Verification',   shortLabel: 'Verify' },
      { id: 'orders',       icon: <Bike size={15} />,            label: 'Live Tracking',  shortLabel: 'Live' },
      { id: 'support',      icon: <Bot size={15} />,             label: 'Support Center', shortLabel: 'Support' },
      { id: 'finances',     icon: <BarChart3 size={15} />,       label: 'Finances',       shortLabel: 'Finances' },
    ];
  }

  const handleNav = (id) => {
    setActiveLink(id);
    setMobileMenuOpen(false);
    if (activeRole === 'landing') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = id;
      window.dispatchEvent(new Event('hashchange'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
    <header className="lm-header">
      <div 
        className={`lm-nav-pill ${scrolled ? 'scrolled' : ''}`}
        style={{
          background: darkMode
            ? 'rgba(12, 15, 26, 0.72)'
            : 'rgba(255, 255, 255, 0.82)',
          border: darkMode
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1.5px solid rgba(255, 255, 255, 0.88)',
          boxShadow: darkMode
            ? '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)'
            : scrolled 
              ? '0 16px 40px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.9)' 
              : '0 8px 24px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.8)',
        }}
      >

        {/* ── Brand / Logo ── */}
        <div
          className="lm-nav-brand"
          onClick={() => { window.location.hash = ''; setActiveRole('landing'); setActiveLink('home'); }}
        >
          <div className="lm-nav-logo-box">
            <img
              src={logoIcon}
              alt="LunchMate Icon"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }}
            />
          </div>
          <span 
            className="lm-nav-title"
            style={{ color: darkMode ? '#F0EBE3' : '#1A120B' }}
          >
            Lunch<span style={{ color: '#F97316' }}>Mate</span>
          </span>
        </div>

        {/* ── Nav Links (Fluid & Zoom Adaptive) ── */}
        <nav className="lm-nav-links">
          {navLinks.map(link => {
            const isActive = activeLink === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className="lm-nav-btn"
                style={{
                  background: isActive ? (darkMode ? 'rgba(249,115,22,0.18)' : 'rgba(249,115,22,0.12)') : 'transparent',
                  border: isActive ? `1px solid ${darkMode ? 'rgba(249,115,22,0.45)' : 'rgba(249,115,22,0.35)'}` : '1px solid transparent',
                  color: isActive ? '#F97316' : (darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(26,18,11,0.72)'),
                  boxShadow: isActive ? (darkMode ? '0 4px 12px rgba(249,115,22,0.2)' : '0 4px 12px rgba(249,115,22,0.12)') : 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.07)' : 'rgba(26,18,11,0.05)';
                    e.currentTarget.style.color = darkMode ? '#F0EBE3' : '#1A120B';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = darkMode ? 'rgba(176,168,160,0.8)' : 'rgba(74,63,53,0.7)';
                  }
                }}
              >
                {link.icon} 
                <span className="lm-nav-full-label">{link.label}</span>
                <span className="lm-nav-short-label">{link.shortLabel}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Right side Actions ── */}
        <div className="lm-nav-right">

          {/* Why LunchMate? Modal Trigger */}
          <div className="lm-why-btn-container">
            <button
              type="button"
              onClick={openWhyModal}
              className="lm-nav-action-btn"
              style={{
                background: darkMode ? 'rgba(249,115,22,0.14)' : 'rgba(249,115,22,0.08)',
                border: darkMode ? '1.5px solid rgba(249,115,22,0.35)' : '1.5px solid rgba(249,115,22,0.3)',
                color: '#F97316',
                fontWeight: 800,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.22)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = darkMode ? 'rgba(249,115,22,0.14)' : 'rgba(249,115,22,0.08)'; }}
              title="Learn Why Parents & Schools Trust LunchMate"
            >
              <Sparkles size={14} color="#F97316" />
              <span className="lm-why-full">Why LunchMate?</span>
              <span className="lm-why-short">Why?</span>
            </button>
          </div>

          {/* Portal Switcher / Sign In */}
          {activeRole === 'landing' ? (
            <button
              onClick={() => openLogin('parent')}
              className="lm-nav-action-btn"
              style={{
                background: darkMode ? 'rgba(249,115,22,0.18)' : 'rgba(249,115,22,0.12)',
                border: darkMode ? '1.5px solid rgba(249,115,22,0.38)' : '1.5px solid rgba(249,115,22,0.3)',
                boxShadow: darkMode ? '0 4px 12px rgba(249,115,22,0.18)' : '0 4px 12px rgba(249,115,22,0.1), inset 0 1px 1px rgba(255,255,255,0.7)',
                color: '#F97316',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F97316'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.12)'; e.currentTarget.style.color = '#F97316'; }}
            >
              <User size={14} /> Sign In
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                background: activeRole === 'parent' 
                  ? (darkMode ? 'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(234,88,12,0.10) 100%)' : 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)')
                  : activeRole === 'driver' 
                    ? (darkMode ? 'linear-gradient(135deg, rgba(13,148,136,0.18) 0%, rgba(15,118,110,0.10) 100%)' : 'linear-gradient(135deg, #F0FDFA 0%, #FFFFFF 100%)')
                    : (darkMode ? 'linear-gradient(135deg, rgba(217,119,6,0.18) 0%, rgba(180,83,9,0.10) 100%)' : 'linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)'),
                color: activeRole === 'parent' ? '#F97316' : activeRole === 'driver' ? '#0D9488' : '#D97706',
                border: activeRole === 'parent' 
                  ? '1.5px solid rgba(249,115,22,0.45)' 
                  : activeRole === 'driver' 
                    ? '1.5px solid rgba(13,148,136,0.45)' 
                    : '1.5px solid rgba(217,119,6,0.45)',
                padding: '5px clamp(6px, 0.8vw, 12px)',
                borderRadius: 14,
                fontSize: '0.78rem',
                fontWeight: 800,
                fontFamily: "'DM Sans', sans-serif",
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: darkMode 
                  ? '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15)' 
                  : '0 4px 14px rgba(0,0,0,0.06), inset 0 1px 1px #FFFFFF',
              }}>
                {activeRole === 'parent' && (
                  <>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', flexShrink: 0
                    }}>
                      <User size={11} strokeWidth={2.8} />
                    </div>
                    <span className="lm-role-badge-full">Parent Portal</span>
                    <span className="lm-role-badge-short">Parent</span>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  </>
                )}
                {activeRole === 'driver' && (
                  <>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', flexShrink: 0
                    }}>
                      <Bike size={11} strokeWidth={2.6} />
                    </div>
                    <span className="lm-role-badge-full">Driver Portal</span>
                    <span className="lm-role-badge-short">Driver</span>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  </>
                )}
                {activeRole === 'admin' && (
                  <>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', flexShrink: 0
                    }}>
                      <ShieldCheck size={11} strokeWidth={2.6} />
                    </div>
                    <span className="lm-role-badge-full">Admin Master</span>
                    <span className="lm-role-badge-short">Admin</span>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  </>
                )}
              </div>
              <button
                onClick={logout}
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#EF4444',
                  padding: '5px 10px', borderRadius: 10,
                  fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#EF4444'; }}
              >
                <LogOut size={12} /> Exit
              </button>
            </div>
          )}

          {/* ── Dark / Light Mode Toggle ── */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="lm-nav-icon-btn"
            style={{
              background: darkMode
                ? 'rgba(249,115,22,0.15)'
                : 'rgba(255, 255, 255, 0.65)',
              border: darkMode
                ? '1.5px solid rgba(249,115,22,0.3)'
                : '1.5px solid rgba(255, 255, 255, 0.9)',
              color: darkMode ? '#F97316' : '#0D9488',
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* AI Help button */}
          <button
            onClick={onOpenAIChat}
            className="lm-nav-action-btn"
            style={{
              background: 'linear-gradient(135deg, #0D9488, #115E59)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(13,148,136,0.35)',
            }}
          >
            <Bot size={15} /> AI Help
          </button>

          {/* Mobile hamburger toggle (shows only on narrow screens / high zoom) */}
          <button
            className="lm-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: darkMode ? '#FFFFFF' : '#1A120B' }}
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div 
            className="lm-mobile-drawer"
            style={{
              background: darkMode ? 'rgba(12, 15, 26, 0.96)' : 'rgba(255, 255, 255, 0.96)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            {navLinks.map(link => {
              const isActive = activeLink === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNav(link.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: 'none',
                    background: isActive ? 'rgba(249,115,22,0.15)' : 'transparent',
                    color: isActive ? '#F97316' : (darkMode ? '#F0EBE3' : '#1A120B'),
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {link.icon} {link.label}
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>

    <WhyLunchMateModal
      isOpen={showWhyModal}
      onClose={closeWhyModal}
      onExplorePlans={() => {
        if (activeRole === 'landing') {
          openLogin('parent');
        } else {
          window.location.hash = 'subscription';
        }
      }}
    />
    </>
  );
};
