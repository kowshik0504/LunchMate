import React, { useEffect, useState } from 'react';
import scooterImg from '../assets/scooter_rider.jpg';

/*
  Animation timeline (ms):
  0      → Scooter image rides in from left, bouncing up/down, speed lines trailing
  880    → Scooter brakes to stop at center
  980    → "LunchMate" letters cascade in one by one
  1580   → Punchline slides up from below
  2600   → Scooter leans forward and zooms off to the right
  3100   → Whole screen fades out → login page opens
*/

const AnimLetter = ({ char, delay, color }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <span style={{
      display: 'inline-block',
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.7)',
      transition: 'opacity 0.45s cubic-bezier(0.34,1.56,0.64,1), transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
      color: color || 'inherit',
    }}>
      {char}
    </span>
  );
};

export const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter');   // enter | rest | exit
  const [showText, setShowText] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const isEnter  = phase === 'enter';
  const isExit   = phase === 'exit';
  const isRiding = isEnter || isExit;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('rest'),     880);
    const t2 = setTimeout(() => setShowText(true),    980);
    const t3 = setTimeout(() => setShowTagline(true), 1580);
    const t4 = setTimeout(() => setPhase('exit'),     2600);
    const t5 = setTimeout(() => setFadingOut(true),   3100);
    const t6 = setTimeout(() => onFinish(),            3600);
    return () => [t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: '#FAF7F2',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      opacity: fadingOut ? 0 : 1,
      transition: fadingOut ? 'opacity 0.5s ease' : 'none',
    }}>

      {/* Subtle warm glow in centre */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(249,115,22,0.08), transparent)',
      }} />

      {/* Ground line */}
      <div style={{
        position: 'absolute',
        top: '58%',
        left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent 5%, rgba(26,18,11,0.07) 30%, rgba(26,18,11,0.07) 70%, transparent 95%)',
      }} />

      {/* ── Scooter Row ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        marginBottom: 36, position: 'relative',

        // Horizontal slide across screen
        transform: isEnter
          ? 'translateX(-115vw)'
          : isExit
            ? 'translateX(115vw)'
            : 'translateX(0px)',
        transition: isEnter
          ? 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
          : isExit
            ? 'transform 0.52s cubic-bezier(0.6, 0, 1, 0.4)'
            : 'none',
      }}>

        {/* Speed lines — trail to the left of the scooter */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 7,
          marginRight: 12, paddingBottom: 40,
          opacity: isRiding ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}>
          {[90, 55, 75, 45, 80, 50].map((w, i) => (
            <div key={i} style={{
              height: 3, width: w, borderRadius: 3,
              background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? '#F97316' : '#0D9488'}99)`,
              animation: isRiding ? `speed-pulse 0.12s ease-in-out ${i * 20}ms infinite alternate` : 'none',
            }} />
          ))}
        </div>

        {/* Scooter image — vertical bounce while riding */}
        <div style={{
          animation: isRiding ? 'ride-bounce 0.18s ease-in-out infinite alternate' : 'scooter-idle 2s ease-in-out infinite',
          position: 'relative',
        }}>
          {/* Glow halo */}
          <div style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)',
            filter: 'blur(14px)',
            opacity: isRiding ? 0.9 : 0.4,
            transition: 'opacity 0.5s ease',
            pointerEvents: 'none',
          }} />

          {/* The actual scooter image — cream background matches site exactly */}
          <img
            src={scooterImg}
            alt="LunchMate scooter rider"
            style={{
              width: 240, height: 240,
              objectFit: 'contain',
              objectPosition: 'center',
              position: 'relative',
              // Lean forward while riding, upright at rest
              transform: isEnter
                ? 'rotate(-5deg) scaleX(1.05)'
                : isExit
                  ? 'rotate(-8deg) scaleX(1.08)'
                  : 'rotate(0deg) scaleX(1)',
              transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
              filter: isRiding
                ? 'drop-shadow(8px 4px 12px rgba(249,115,22,0.35))'
                : 'drop-shadow(0 8px 20px rgba(26,18,11,0.12))',
            }}
          />

          {/* Wheel dust puffs below the scooter */}
          {isRiding && (
            <div style={{
              position: 'absolute', bottom: 4,
              left: 0, right: 0,
              display: 'flex', justifyContent: 'space-between',
              paddingInline: 18,
            }}>
              {[0, 1].map(i => (
                <div key={i} style={{
                  width: 16, height: 8, borderRadius: '50%',
                  background: 'rgba(249,115,22,0.2)',
                  animation: `dust-puff 0.3s ease-out ${i * 130}ms infinite`,
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Brand Name ── */}
      <div style={{
        display: 'flex', alignItems: 'baseline',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.8rem, 7vw, 4.2rem)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        marginBottom: 18,
        userSelect: 'none',
      }}>
        {'Lunch'.split('').map((ch, i) => (
          <AnimLetter key={i} char={ch}
            delay={showText ? i * 65 : 99999}
            color="#1A120B"
          />
        ))}
        {'Mate'.split('').map((ch, i) => (
          <AnimLetter key={`m${i}`} char={ch}
            delay={showText ? (5 + i) * 65 + 10 : 99999}
            color="#F97316"
          />
        ))}
      </div>

      {/* ── Punchline ── */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.9rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#8C7B6E',
        opacity: showTagline ? 1 : 0,
        transform: showTagline ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}>
        Hot Lunch. Right on Time.
      </p>

      {/* ── Bottom progress bar ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: 'rgba(249,115,22,0.08)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #F97316, #D97706, #0D9488)',
          animation: 'loading-progress 3.2s cubic-bezier(0.4,0,0.6,1) forwards',
        }} />
      </div>

      <style>{`
        @keyframes ride-bounce {
          from { transform: translateY(0px); }
          to   { transform: translateY(-9px); }
        }
        @keyframes scooter-idle {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes speed-pulse {
          from { opacity: 0.4; transform: scaleX(0.8); }
          to   { opacity: 1.0; transform: scaleX(1.2); }
        }
        @keyframes dust-puff {
          0%   { transform: scale(1) translate(0,0);        opacity: 0.6; }
          100% { transform: scale(2.8) translate(-12px, -4px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
