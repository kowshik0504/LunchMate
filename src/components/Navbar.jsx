import React, { useState, useEffect } from 'react';

import { useAppState } from '../context/AppStateContext';
import { Globe, Bot, MapPin, UtensilsCrossed, Star, HelpCircle, Home, User, LogOut, Sun, Moon, Calendar, CreditCard, Wallet, History, Users, Settings, FileText, Bike, ShieldCheck, BarChart3 } from 'lucide-react';
import logoIcon from '../assets/logo_icon.jpg';

export const Navbar = ({ onOpenAIChat }) => {
  
  const { darkMode, toggleDarkMode, activeRole, setActiveRole, openLogin, logout } = useAppState();

  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  let navLinks = [];
  if (activeRole === 'landing') {
    navLinks = [
      { id: 'home',        icon: <Home size={15} />,            label: 'Home' },
      { id: 'track',       icon: <MapPin size={15} />,          label: 'Track My Order' },
      { id: 'menu',        icon: <UtensilsCrossed size={15} />, label: 'Menu Today' },
      { id: 'testimonials',icon: <Star size={15} />,            label: 'Testimonials' },
      { id: 'faq',         icon: <HelpCircle size={15} />,      label: 'FAQs' },
    ];
  } else if (activeRole === 'parent') {
    navLinks = [
      { id: 'orders',       icon: <Home size={15} />,            label: 'Dashboard' },
      { id: 'emergency',    icon: <MapPin size={15} />,          label: 'Emergency Delivery' },
      { id: 'subscription', icon: <CreditCard size={15} />,      label: 'Subscription' },
      { id: 'reports',      icon: <FileText size={15} />,        label: 'History' },
    ];
  } else if (activeRole === 'driver') {
    navLinks = [
      { id: 'home',        icon: <Home size={15} />,            label: 'Route Dashboard' },
      { id: 'earnings',    icon: <Wallet size={15} />,          label: 'Earnings' },
      { id: 'history',     icon: <History size={15} />,         label: 'History' },
    ];
  } else if (activeRole === 'admin') {
    navLinks = [
      { id: 'verification', icon: <ShieldCheck size={15} />,     label: 'Verification' },
      { id: 'orders',       icon: <Bike size={15} />,            label: 'Live Tracking' },
      { id: 'support',      icon: <Bot size={15} />,             label: 'Support Center' },
      { id: 'finances',     icon: <BarChart3 size={15} />,       label: 'Finances' },
    ];
  }

  const handleNav = (id) => {
    setActiveLink(id);
    if (activeRole === 'landing') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = id;
    }
  };

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9000, padding: 0 }}>
      <div style={{
        margin: scrolled ? '8px 16px' : '14px 24px',
        background: darkMode
          ? 'rgba(12, 15, 26, 0.65)'
          : 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: darkMode
          ? '1px solid rgba(255, 255, 255, 0.12)'
          : '1.5px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 24,
        padding: '0 24px',
        height: scrolled ? 62 : 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: darkMode
          ? '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)'
          : scrolled ? '0 16px 40px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.9)' : '0 8px 24px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.8)',
        transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* ── Brand / Logo ── */}
        <div
          onClick={() => { setActiveRole('landing'); setActiveLink('home'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }}
        >
          {/* Crisp icon emblem */}
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            overflow: 'hidden',
            background: '#ffffff',
            padding: 3,
            boxShadow: '0 6px 20px rgba(249,115,22,0.28), 0 2px 6px rgba(0,0,0,0.08)',
            border: '2px solid rgba(249,115,22,0.35)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s ease',
          }}>
            <img
              src={logoIcon}
              alt="LunchMate Icon"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }}
            />
          </div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.4rem', fontWeight: 800,
            color: darkMode ? '#F0EBE3' : '#1A120B', letterSpacing: '-0.02em',
            lineHeight: 1,
          }}>
            Lunch<span style={{ color: '#F97316' }}>Mate</span>
          </span>
        </div>

        {/* ── Nav Links ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {navLinks.map(link => {
            const isActive = activeLink === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                style={{
                  background: isActive ? (darkMode ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.12)') : 'transparent',
                  border: isActive ? `1px solid ${darkMode ? 'rgba(249,115,22,0.4)' : 'rgba(249,115,22,0.35)'}` : '1px solid transparent',
                  color: isActive ? '#F97316' : (darkMode ? 'rgba(255,255,255,0.75)' : 'rgba(26,18,11,0.7)'),
                  boxShadow: isActive ? (darkMode ? '0 4px 12px rgba(249,115,22,0.2)' : '0 4px 12px rgba(249,115,22,0.12)') : 'none',
                  padding: '9px 16px',
                  borderRadius: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '0.88rem', fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
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
                {link.icon} {link.label}
              </button>
            );
          })}
        </nav>

        {/* ── Right side: Language + AI Help ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>



          {/* Portal Switcher / Sign In */}
          {activeRole === 'landing' ? (
            <button
              onClick={() => openLogin('parent')}
              style={{
                background: darkMode ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.12)',
                border: darkMode ? '1.5px solid rgba(249,115,22,0.35)' : '1.5px solid rgba(249,115,22,0.3)',
                boxShadow: darkMode ? '0 4px 12px rgba(249,115,22,0.15)' : '0 4px 12px rgba(249,115,22,0.1), inset 0 1px 1px rgba(255,255,255,0.7)',
                color: '#F97316',
                padding: '9px 18px', borderRadius: 14,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.88rem', fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F97316'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.color = '#F97316'; }}
            >
              <User size={15} /> Sign In
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: activeRole === 'parent' ? 'rgba(249,115,22,0.12)' : activeRole === 'driver' ? 'rgba(13,148,136,0.12)' : 'rgba(217,119,6,0.12)',
                color: activeRole === 'parent' ? '#F97316' : activeRole === 'driver' ? '#0D9488' : '#D97706',
                border: `1px solid ${activeRole === 'parent' ? 'rgba(249,115,22,0.3)' : activeRole === 'driver' ? 'rgba(13,148,136,0.3)' : 'rgba(217,119,6,0.3)'}`,
                padding: '7px 14px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6
              }}>
                {activeRole === 'parent' && '👤 Parent Portal'}
                {activeRole === 'driver' && '🛵 Driver Portal'}
                {activeRole === 'admin' && '🛡️ Admin Panel'}
              </span>
              <button
                onClick={logout}
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#EF4444',
                  padding: '7px 14px', borderRadius: 12,
                  fontSize: '0.82rem', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#EF4444'; }}
              >
                <LogOut size={13} /> Exit
              </button>
            </div>
          )}

          {/* ── Dark / Light Mode Toggle ── */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 42, height: 42,
              borderRadius: 14,
              background: darkMode
                ? 'rgba(249,115,22,0.15)'
                : 'rgba(255, 255, 255, 0.65)',
              border: darkMode
                ? '1.5px solid rgba(249,115,22,0.3)'
                : '1.5px solid rgba(255, 255, 255, 0.9)',
              boxShadow: darkMode ? '0 4px 12px rgba(249,115,22,0.15)' : '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,0.9)',
              color: darkMode ? '#F97316' : '#0D9488',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.12) rotate(15deg)';
              e.currentTarget.style.background = darkMode ? 'rgba(249,115,22,0.22)' : 'rgba(13,148,136,0.16)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.background = darkMode ? 'rgba(249,115,22,0.12)' : 'rgba(13,148,136,0.08)';
            }}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* AI Help button */}
          <button
            onClick={onOpenAIChat}
            style={{
              background: 'linear-gradient(135deg, #0D9488, #115E59)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '9px 20px', borderRadius: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.88rem', fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: '0 4px 14px rgba(13,148,136,0.35), inset 0 1px 1px rgba(255,255,255,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,148,136,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(13,148,136,0.35)'; }}
          >
            <Bot size={16} /> AI Help
          </button>
        </div>
      </div>
    </header>
  );
};
