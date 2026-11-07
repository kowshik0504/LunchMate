import React from 'react';
import parentHeroImg from '../assets/parent_hero_3d.jpg';
import { Utensils } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const ParentHeroVisual = () => {
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

      {/* Warm ambient glows behind card */}
      <div style={{
        position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)',
        width: '85%', height: 130,
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.25) 0%, rgba(217,119,6,0.1) 55%, transparent 75%)',
        filter: 'blur(24px)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Card */}
      <div ref={containerRef} style={{
        position: 'relative', zIndex: 1, borderRadius: 28, overflow: 'hidden',
        transition: 'transform 0.15s ease-out',
        cursor: 'default',
        boxShadow: '0 24px 72px rgba(249,115,22,0.15), 0 4px 20px rgba(249,115,22,0.1)',
        border: '1px solid rgba(249,115,22,0.15)',
      }}>
        {/* Image + overlays */}
        <div style={{ position: 'relative' }}>
          <img
            src={parentHeroImg}
            alt="Premium Lunchbox 3D"
            style={{
              width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover',
              animation: 'slow-zoom 15s ease-in-out infinite alternate',
            }}
          />
          {/* Gradient overlay bottom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(26,18,11,0) 50%, rgba(26,18,11,0.7) 100%)',
          }} />
          {/* Caption */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', fontWeight: 700,
              color: 'white', marginBottom: 5, fontStyle: 'italic' }}>
              Fresh from Mom's Kitchen
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="animate-pulse-dot" style={{
                width: 8, height: 8, borderRadius: '50%', background: '#4ADE80',
                flexShrink: 0, display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(74,222,128,0.25)',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                Hot · OTP Secured · Always on time
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
        boxShadow: darkMode ? '0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)' : '0 8px 28px rgba(26,18,11,0.12), 0 0 0 1px rgba(255,255,255,0.8)',
        border: darkMode ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.8)',
      }}>
        <div style={{ color: '#F97316', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target ETA</div>
        <div style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: '1.45rem',
          fontWeight: 800,
          color: darkMode ? '#FEFEFE' : '#0F172A',
          lineHeight: 1.1,
          marginTop: 2
        }}>
          12:30<span style={{ fontSize: '0.8rem', marginLeft: 3, color: '#F97316' }}>PM</span>
        </div>
      </div>

      <div className="animate-float-delayed" style={{
        position: 'absolute', bottom: 75, right: -15, zIndex: 10,
        background: darkMode ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: 99, padding: '8px 18px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: darkMode ? '0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)' : '0 4px 16px rgba(26,18,11,0.1), 0 0 0 1px rgba(255,255,255,0.8)',
        border: darkMode ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid rgba(255,255,255,0.8)',
      }}>
        <Utensils size={16} color={darkMode ? '#4ADE80' : '#15803D'} />
        <span style={{
          fontFamily: "var(--font-ui)",
          fontSize: '0.82rem',
          fontWeight: 800,
          color: darkMode ? '#FEFEFE' : '#0F172A'
        }}>
          Healthy Packed
        </span>
      </div>

    </div>
  );
};
