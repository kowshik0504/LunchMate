import React from 'react';
import adminHeroImg from '../assets/admin_hero_3d.jpg';
import { ShieldCheck } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const AdminHeroVisual = () => {
  const { darkMode } = useAppState();
  const containerRef = React.useRef(null);

  const handleMouseMove = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    const dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    el.style.transform = `perspective(900px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg) scale(1.01)`;
  };
  const handleMouseLeave = () => {
    if (containerRef.current)
      containerRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto' }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

      {/* Cyber ambient glows behind card */}
      <div style={{
        position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)',
        width: '85%', height: 130,
        background: 'radial-gradient(ellipse, rgba(217,119,6,0.3) 0%, rgba(13,148,136,0.15) 55%, transparent 75%)',
        filter: 'blur(24px)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Card */}
      <div ref={containerRef} style={{
        position: 'relative', zIndex: 1, borderRadius: 28, overflow: 'hidden',
        transition: 'transform 0.15s ease-out',
        cursor: 'default',
        boxShadow: '0 24px 72px rgba(217,119,6,0.2), 0 4px 20px rgba(13,148,136,0.1)',
        border: '1px solid rgba(217,119,6,0.25)',
      }}>
        {/* Image + overlays */}
        <div style={{ position: 'relative' }}>
          <img
            src={adminHeroImg}
            alt="Admin Control Center 3D"
            style={{
              width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover',
              animation: 'slow-zoom 15s ease-in-out infinite alternate',
            }}
          />
          {/* Gradient overlay bottom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(26,18,11,0) 50%, rgba(26,18,11,0.9) 100%)',
          }} />
          {/* Caption */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', fontWeight: 700,
              color: 'white', marginBottom: 5, fontStyle: 'italic' }}>
              Global Command Center
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="animate-pulse-dot" style={{
                width: 8, height: 8, borderRadius: '50%', background: '#F97316',
                flexShrink: 0, display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(249,115,22,0.3)',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                AI Escaltions · Real-time Metrics
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badges */}
      <div className="animate-float" style={{
        position: 'absolute', top: 24, left: -20, zIndex: 10,
        background: darkMode ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 18, padding: '12px 18px',
        boxShadow: darkMode ? '0 12px 32px rgba(0,0,0,0.5)' : '0 8px 28px rgba(26,18,11,0.12)',
        border: darkMode ? '1px solid rgba(217,119,6,0.3)' : '1px solid rgba(255,255,255,0.8)',
      }}>
        <div style={{ color: '#D97706', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>System Health</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.45rem', fontWeight: 800, color: '#10B981', lineHeight: 1.1, marginTop: 2 }}>
          100%<span style={{ fontSize: '0.8rem', marginLeft: 3, color: darkMode ? '#FEFEFE' : '#0F172A' }}>OK</span>
        </div>
      </div>

      <div className="animate-float-delayed" style={{
        position: 'absolute', bottom: 75, right: -15, zIndex: 10,
        background: darkMode ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 99, padding: '8px 18px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: darkMode ? '0 8px 28px rgba(0,0,0,0.4)' : '0 4px 16px rgba(26,18,11,0.1)',
        border: darkMode ? '1px solid rgba(13,148,136,0.3)' : '1px solid rgba(255,255,255,0.8)',
      }}>
        <ShieldCheck size={16} color="#0D9488" />
        <span style={{ fontFamily: "var(--font-ui)", fontSize: '0.82rem', fontWeight: 800, color: darkMode ? '#FEFEFE' : '#0F172A' }}>
          Encrypted
        </span>
      </div>

    </div>
  );
};
