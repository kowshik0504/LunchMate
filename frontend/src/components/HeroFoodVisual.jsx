import React from 'react';
import heroFood from '../assets/hero_food.png';

export const HeroFoodVisual = () => {
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
    <div style={{ position: 'relative', width: '100%' }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>

      {/* Warm ambient glows behind card */}
      <div style={{
        position: 'absolute', bottom: -50, left: '50%', transform: 'translateX(-50%)',
        width: '85%', height: 130,
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.2) 0%, rgba(13,148,136,0.08) 55%, transparent 75%)',
        filter: 'blur(24px)', zIndex: 0, pointerEvents: 'none',
      }} />

      {/* Card */}
      <div ref={containerRef} style={{
        position: 'relative', zIndex: 1, borderRadius: 28, overflow: 'hidden',
        transition: 'transform 0.15s ease-out',
        cursor: 'default',
        boxShadow: '0 24px 72px rgba(26,18,11,0.14), 0 4px 20px rgba(26,18,11,0.08)',
        border: '1px solid rgba(26,18,11,0.08)',
      }}>

        {/* Image + overlays */}
        <div style={{ position: 'relative' }}>
          <img
            src={heroFood}
            alt="Fresh Indian home-cooked lunch"
            style={{
              width: '100%', display: 'block', aspectRatio: '4/3', objectFit: 'cover',
              filter: 'brightness(0.95) contrast(1.06) saturate(1.1)',
              animation: 'slow-zoom 12s ease-in-out infinite alternate',
            }}
          />
          {/* Gradient overlay bottom */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(26,18,11,0) 45%, rgba(26,18,11,0.68) 100%)',
          }} />
          {/* Caption */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px' }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.05rem', fontWeight: 700,
              color: 'white', marginBottom: 5, fontStyle: 'italic' }}>
              Fresh from Mom's Kitchen
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="animate-pulse-dot" style={{
                width: 8, height: 8, borderRadius: '50%', background: '#4ADE80',
                flexShrink: 0, display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(74,222,128,0.25)',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
                Hot · OTP Secured · Always on time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating stat badges ──────────────────────── */}
      {/* ETA badge */}
      <div className="animate-float" style={{
        position: 'absolute', top: 18, left: -22, zIndex: 10,
        background: 'white', borderRadius: 16, padding: '11px 16px',
        boxShadow: '0 8px 28px rgba(26,18,11,0.14)',
        border: '1px solid rgba(26,18,11,0.07)',
      }}>
        <div style={{ color: '#BDB0A5', fontSize: '0.66rem', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Delivery</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 700, color: '#0D9488' }}>18 min</div>
      </div>

      {/* Driver % badge */}
      <div className="animate-float-2" style={{
        position: 'absolute', bottom: 80, right: -22, zIndex: 10,
        background: 'white', borderRadius: 16, padding: '11px 16px',
        boxShadow: '0 8px 28px rgba(26,18,11,0.14)',
        border: '1px solid rgba(249,115,22,0.15)',
      }}>
        <div style={{ color: '#BDB0A5', fontSize: '0.66rem', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Driver Keeps</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 700, color: '#F97316' }}>85%</div>
      </div>

      {/* Live badge */}
      <div className="animate-float-delayed" style={{
        position: 'absolute', top: 18, right: 12, zIndex: 10,
        background: 'white', borderRadius: 99,
        padding: '6px 14px',
        display: 'flex', alignItems: 'center', gap: 7,
        boxShadow: '0 4px 16px rgba(26,18,11,0.1)',
        border: '1px solid rgba(21,128,61,0.2)',
      }}>
        <span className="animate-pulse-dot" style={{
          width: 7, height: 7, borderRadius: '50%', background: '#15803D',
          display: 'inline-block', boxShadow: '0 0 0 3px rgba(21,128,61,0.2)',
        }} />
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.74rem', fontWeight: 700, color: '#15803D' }}>
          Live Tracking
        </span>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-11px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-14px); }
        }
        .animate-float          { animation: float-gentle 4.5s ease-in-out infinite; }
        .animate-float-2        { animation: float-slow   6s ease-in-out infinite; }
        .animate-float-delayed  { animation: float-gentle 5.5s ease-in-out 1.5s infinite; }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 3px rgba(21,128,61,0.2); }
          50%      { box-shadow: 0 0 0 7px rgba(21,128,61,0.05); }
        }
        .animate-pulse-dot { animation: pulse-dot 1.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
