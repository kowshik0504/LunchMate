import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { HeroFoodVisual } from '../components/HeroFoodVisual';
import { subscriptionPlans } from '../data/mockData';
import { ArrowRight, CheckCircle, MapPin, Clock, Calculator, ChevronRight, Star, Zap, ChefHat, Smartphone, Key, School, Globe2, Bot, BarChart3, PackageOpen, Bike, ShieldCheck } from 'lucide-react';
import logoIcon from '../assets/logo_icon.jpg';

/* ── Scroll Reveal with Parallax ────────────────────── */
const useScrollReveal = () => {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
    const els = document.querySelectorAll(selectors);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

/* ── Spring Bounce Number Counter ───────────────────── */
const CountUp = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const num = parseFloat(target.replace(/[^0-9.]/g, ''));
        const duration = 1600;
        const startTime = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 4);
          setCount(Math.round(eased * num));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ── Live Pricing Calculator ────────────────────────── */
const PricingCalc = () => {
  const [dist, setDist] = useState(4.5);
  const [emergency, setEmergency] = useState(false);

  const calc = (d, em) => {
    // School Corridor Dabbawala Pass: ₹42 base (first 3.0 km), +₹8/km beyond 3.0 km
    // Emergency Solo Express: ₹65 base (first 3.0 km), +₹10/km beyond 3.0 km
    const extraKm = Math.max(0, d - 3.0);
    if (em) {
      return Math.round(65 + extraKm * 10);
    }
    return Math.round(42 + extraKm * 8);
  };
  const price = calc(dist, emergency);
  const eta   = emergency ? Math.round(8 + dist * 2.5) : Math.round(15 + dist * 3.0);
  const drvr  = Math.round(price * 0.85);
  const plat  = price - drvr;
  const trackW = `${Math.round((dist / 15) * 100)}%`;

  return (
    <div className="card" style={{ padding: 32, borderRadius: 28, boxShadow: '0 24px 72px rgba(26,18,11,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316', padding: 10, borderRadius: 14, display: 'flex' }}>
          <Calculator size={22} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontFamily: "'Playfair Display', serif", marginBottom: 2 }}>Delivery Cost Estimator</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Real-time distance-based pricing</p>
        </div>
      </div>

      {/* Distance Slider */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} color="#F97316" /> Distance
          </span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 700, color: '#F97316' }}>{dist} km</span>
        </div>
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <div style={{ height: 5, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: trackW, background: 'linear-gradient(90deg, #F97316, #D97706)', borderRadius: 3, transition: 'width 0.1s' }} />
          </div>
          <input type="range" min="1" max="15" step="0.5" value={dist}
            onChange={e => setDist(parseFloat(e.target.value))}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%',
              background: 'linear-gradient(90deg, #F97316, #D97706)' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)', fontSize: '0.7rem' }}>
          <span>1 km</span><span>15 km max</span>
        </div>
      </div>

      {/* Emergency Toggle */}
      <div onClick={() => setEmergency(!emergency)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: emergency ? 'rgba(249,115,22,0.06)' : 'var(--bg-card-warm)',
        border: `1.5px solid ${emergency ? 'rgba(249,115,22,0.4)' : 'var(--border-light)'}`,
        borderRadius: 14, padding: '12px 16px', marginBottom: 24, cursor: 'pointer', transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={18} color={emergency ? '#F97316' : '#BDB0A5'} />
          <div>
            <div style={{ color: emergency ? 'var(--text-heading)' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem' }}>Emergency Express</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.73rem' }}>
              {emergency ? 'Priority solo rider match (₹65 base + ₹10/km)' : 'Corridor pass rate (₹42 base + ₹8/km)'}
            </div>
          </div>
        </div>
        <div style={{
          width: 40, height: 22, borderRadius: 11,
          background: emergency ? '#F97316' : 'var(--border-medium)', position: 'relative', transition: 'background 0.3s',
        }}>
          <div style={{
            position: 'absolute', top: 3, left: emergency ? 21 : 3,
            width: 16, height: 16, borderRadius: '50%', background: 'white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)', transition: 'left 0.3s',
          }} />
        </div>
      </div>

      {/* Result Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'rgba(13,148,136,0.06)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(13,148,136,0.15)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} color="#0D9488" /> ETA
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.6rem', fontWeight: 700, color: '#0D9488' }}>
            {eta}<span style={{ fontSize: '0.85rem', fontWeight: 500 }}> min</span>
          </div>
        </div>
        <div style={{ background: 'rgba(249,115,22,0.06)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(249,115,22,0.2)' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: 4 }}>Total Fare</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.6rem', fontWeight: 700, color: '#F97316' }}>₹{price}</div>
        </div>
      </div>

      {/* Split */}
      <div style={{ background: 'var(--bg-card-warm)', borderRadius: 14, padding: '14px 16px', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bike size={14} /> Driver earns (85%)</span>
          <strong style={{ color: '#15803D' }}>₹{drvr}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShieldCheck size={14} /> Platform fee (15%)</span>
          <strong style={{ color: 'var(--text-body)' }}>₹{plat}</strong>
        </div>
        <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: 'var(--border-light)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '85%', background: 'linear-gradient(90deg, #15803D, #0D9488)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
};

/* ── MAIN LANDING PAGE ────────────────────────────────── */
export const LandingPage = () => {
  const { setActiveRole, openLogin } = useAppState();
  useScrollReveal();

  // Parallax on mouse for hero
  const heroImgRef = useRef(null);
  const handleHeroMouse = (e) => {
    if (!heroImgRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width  - 0.5) * 18;
    const y = ((clientY - top)  / height - 0.5) * 14;
    heroImgRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const handleHeroLeave = () => {
    if (heroImgRef.current)
      heroImgRef.current.style.transform = 'translate(0,0)';
  };

  const stats = [
    { val: '4,200', suffix: '+', label: 'Daily Meals Delivered' },
    { val: '1,100', suffix: '+', label: 'Verified Drivers' },
    { val: '98',    suffix: '%', label: 'On-Time Success Rate' },
    { val: '2',     suffix: ' min', label: 'Avg Driver Match Speed' },
  ];

  const tickerItems = [
    'Fresh Home-Cooked Only', 'Dual OTP Security', 'Live GPS Tracking',
    'Emergency Delivery', 'Monthly Subscriptions', '85% Driver Payout',
    'English · Tamil · Hindi', 'AI Customer Support',
  ];

  const steps = [
    { num: '01', icon: <ChefHat size={28} color="#F97316" strokeWidth={1.5} />, title: 'Parent Cooks & Packs', desc: 'Fresh home-cooked meal packed each morning. No restaurant, zero preservatives.', color: '#F97316' },
    { num: '02', icon: <Smartphone size={28} color="#D97706" strokeWidth={1.5} />, title: 'Tap "Food Ready"', desc: 'One tap notifies the nearest verified driver instantly. Pickup OTP auto-generated.', color: '#D97706' },
    { num: '03', icon: <Key size={28} color="#0D9488" strokeWidth={1.5} />, title: 'OTP Pickup Handshake', desc: 'Driver enters a parent-given 4-digit OTP before touching the tiffin box. Zero trust.', color: '#0D9488' },
    { num: '04', icon: <School size={28} color="#15803D" strokeWidth={1.5} />, title: 'Delivered to School Gate', desc: 'Gate staff or student confirms receipt with delivery OTP. Hot meal, right on time.', color: '#15803D' },
  ];

  const features = [
    { icon: <Key size={24} color="#F97316" />, bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.18)', title: 'Double OTP Security', desc: 'Pickup OTP from Parent + Delivery OTP at school gate — two-factor handoff for total safety.' },
    { icon: <MapPin size={24} color="#0D9488" />, bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.18)', title: 'Live GPS Tracking', desc: 'Real-time driver location, ETA countdown and every delivery milestone notification.' },
    { icon: <Zap size={24} color="#D97706" />, bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.18)', title: 'Emergency Same-Day', desc: 'Parents stuck in meetings? One tap dispatches the nearest driver in under 2 minutes.' },
    { icon: <Globe2 size={24} color="#7C3AED" />, bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.16)', title: 'Multi-Language', desc: 'Platform in English, Tamil and Hindi. More regional languages coming with expansion.' },
    { icon: <Bot size={24} color="#0D9488" />, bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.18)', title: 'AI Customer Support', desc: '24/7 instant answers that automatically escalate to a human admin when needed.' },
    { icon: <BarChart3 size={24} color="#F97316" />, bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.18)', title: 'Monthly Reports', desc: 'Full delivery history, success rates, and downloadable invoices every month.' },
  ];

  return (
    <div className="landing-page" style={{ position: 'relative', overflowX: 'hidden' }}>

      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section id="home" style={{ position: 'relative', zIndex: 1, paddingTop: 130, paddingBottom: 100, overflow: 'hidden' }}
        onMouseMove={handleHeroMouse} onMouseLeave={handleHeroLeave}>

        {/* Decorative warm glow blobs */}
        <div style={{ position: 'absolute', top: -80, right: -100, width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 68%)',
          filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -100, width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 68%)',
          filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Left — Text */}
            <div>
              <div className="section-badge reveal" style={{ marginBottom: 28 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F97316',
                  boxShadow: '0 0 8px rgba(249,115,22,0.6)', flexShrink: 0 }} />
                Home-to-School Lunch Platform
              </div>

              <h1 className="reveal reveal-delay-1" style={{ fontSize: '4.4rem', marginBottom: 22, lineHeight: 1.05 }}>
                Delivering<br />
                <span className="grad-saffron italic-serif">Home,</span><br />
                Not Just Food.
              </h1>

              <p className="reveal reveal-delay-2" style={{ fontSize: '1.1rem', color: 'var(--text-muted)',
                maxWidth: 460, marginBottom: 38, lineHeight: 1.7 }}>
                Fresh homemade lunch prepared by parents — delivered safely to your child's school gate before 12:30 PM, every single weekday.
              </p>

              <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 14, marginBottom: 44, flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => openLogin('parent')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PackageOpen size={18} /> Order Lunch for My Child <ArrowRight size={17} />
                </button>
                <button className="btn-outline" onClick={() => openLogin('driver')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bike size={18} /> Become a Partner
                </button>
              </div>

              {/* Trust row */}
              <div className="reveal reveal-delay-4" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['✓ 100% Home Cooked', '✓ Secure OTP', '✓ Live GPS', '✓ No Restaurant Markup'].map((b, i) => (
                  <span key={i} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                    color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 500,
                    padding: '5px 12px', borderRadius: 99, boxShadow: 'var(--shadow-sm)',
                  }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Right — Food Visual with parallax layer */}
            <div className="reveal-scale" style={{ position: 'relative' }}>
              <div ref={heroImgRef} style={{ transition: 'transform 0.15s ease-out' }}>
                <HeroFoodVisual />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────── */}
      <div className="stats-bar dark-section">
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 40px', whiteSpace: 'nowrap' }}>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', fontFamily: 'var(--font-ui)' }}>{item}</span>
              <span style={{ color: 'rgba(249,115,22,0.5)', fontSize: '1rem' }}>✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ANIMATED STATS GRID ───────────────────────────── */}
      <section style={{ padding: '90px 0', background: 'var(--bg-section)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
            {stats.map((s, i) => (
              <div key={i} className="reveal" style={{
                textAlign: 'center', padding: '36px 20px',
                borderRight: i < stats.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 700,
                  color: i % 2 === 0 ? '#F97316' : '#0D9488', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <CountUp target={s.val} suffix={s.suffix} />
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS / SIMPLE WORKFLOW ── */}
      <section id="workflow" style={{ padding: '110px 0', background: 'var(--bg-base)' }}>
        <span id="track" style={{ display: 'none' }} />
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 72px' }}>
            <div className="section-badge reveal" style={{ marginBottom: 18 }}>Simple Workflow</div>
            <h2 className="reveal reveal-delay-1" style={{ fontSize: '3.2rem', marginBottom: 16 }}>
              Four steps.<br />
              <span className="italic-serif grad-teal">Zero complexity.</span>
            </h2>
            <p className="reveal reveal-delay-2" style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
              The most trusted home-cooked lunch workflow, secured end-to-end with OTP handshakes.
            </p>
          </div>

          {/* Step cards with connector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 48, left: '12.5%', right: '12.5%',
              height: 1, background: 'linear-gradient(90deg, #F97316, #D97706, #0D9488, #15803D)',
              opacity: 0.2, zIndex: 0,
            }} />
            {steps.map((step, i) => (
              <div key={i} className={`reveal reveal-delay-${i + 1} card-lift`} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 24, padding: '28px 24px', textAlign: 'center',
                position: 'relative', zIndex: 1, boxShadow: 'var(--shadow-sm)',
              }}>
                {/* Circle icon */}
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'var(--bg-card)', border: `1.5px solid ${step.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: `0 8px 24px ${step.color}15`,
                }}>{step.icon}</div>
                {/* Number */}
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', fontWeight: 900,
                  color: 'var(--text-heading)', letterSpacing: '-0.04em', marginBottom: 6 }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: 10, color: 'var(--text-heading)' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section id="features" style={{ padding: '80px 0 110px', background: 'var(--bg-section)' }}>
        <span id="menu" style={{ display: 'none' }} />
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 70, alignItems: 'center', marginBottom: 72 }}>
            <div>
              <div className="section-badge reveal-left" style={{ marginBottom: 18 }}>Platform Features</div>
              <h2 className="reveal-left reveal-delay-1" style={{ fontSize: '3rem', marginBottom: 0 }}>
                Built for trust.<br />
                <span className="italic-serif grad-saffron">Designed for parents.</span>
              </h2>
            </div>
            <p className="reveal-right" style={{ color: 'var(--text-muted)', fontSize: '1.02rem', lineHeight: 1.8 }}>
              Every feature exists for one purpose — ensuring your child receives a hot, safe, home-cooked meal at exactly the right moment, every weekday, without anxiety.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className={`reveal reveal-delay-${(i % 3) + 1} card-lift`} style={{
                background: 'var(--bg-card)', borderRadius: 22, padding: 26,
                border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 16,
                  background: f.bg, border: `1px solid ${f.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.6rem', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: 10, color: 'var(--text-heading)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CALCULATOR ───────────────────────────── */}
      <section style={{ padding: '90px 0 110px', background: 'var(--bg-base)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70, alignItems: 'center' }}>
            <div>
              <div className="section-badge reveal-left" style={{ marginBottom: 18 }}>Transparent Pricing</div>
              <h2 className="reveal-left reveal-delay-1" style={{ fontSize: '3rem', marginBottom: 20 }}>
                Fair fares.<br />
                <span className="italic-serif grad-teal">No hidden fees.</span>
              </h2>
              <p className="reveal-left reveal-delay-2" style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 28, fontSize: '0.97rem' }}>
                Unlike restaurant delivery apps, LunchMate only charges for distance. Drivers retain 85% of every rupee — guaranteeing high motivation and care for your child's food.
              </p>
              <div className="reveal-left reveal-delay-3" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  ['85% Driver Payout', 'Fair earnings attract verified local delivery partners.', <Bike size={16} color="#0D9488" />],
                  ['Emergency Express', 'Solo rider rapid dispatch starting at ₹65 with live GPS.', <Zap size={16} color="#0D9488" />],
                  ['Passes from ₹35/day', 'Save up to 50% vs on-demand with our Dabbawala pass.', <BarChart3 size={16} color="#0D9488" />],
                ].map(([title, desc, icon], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ marginTop: 2 }}>{icon}</div>
                    <div>
                      <span style={{ color: 'var(--text-heading)', fontWeight: 600, fontSize: '0.9rem' }}>{title}: </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal-scale">
              <PricingCalc />
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBSCRIPTION PLANS ── */}
      <section id="pricing" style={{ padding: '90px 0 110px', background: 'var(--bg-dark)' }} className="dark-section">
        <span id="testimonials" style={{ display: 'none' }} />
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-badge reveal" style={{ marginBottom: 18,
              background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.3)', color: '#FCA87A' }}>
              Subscription Plans
            </div>
            <h2 className="reveal reveal-delay-1" style={{ fontSize: '3rem' }}>
              Choose your <span className="italic-serif grad-saffron">cadence.</span>
            </h2>
            <p className="reveal reveal-delay-2" style={{ color: 'rgba(255,255,255,0.45)', marginTop: 14, maxWidth: 440, margin: '14px auto 0', fontSize: '0.94rem', lineHeight: 1.7 }}>
              Every plan includes live tracking, OTP security, and auto-pause on school holidays.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {subscriptionPlans.map((plan, i) => (
              <div key={plan.id} className={`reveal reveal-delay-${i + 1} card-lift`} style={{
                background: plan.popular ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.04)',
                border: plan.popular ? '1.5px solid rgba(249,115,22,0.45)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 28, padding: '32px 26px', position: 'relative',
                boxShadow: plan.popular ? '0 20px 60px rgba(249,115,22,0.12)' : 'none',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div>
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                      background: plan.popular ? '#F97316' : (plan.badge.includes('VIP') || plan.badge.includes('PRIORITY') ? '#EA580C' : 'rgba(45,212,191,0.2)'),
                      color: plan.popular || plan.badge.includes('VIP') || plan.badge.includes('PRIORITY') ? 'white' : '#2DD4BF',
                      border: plan.popular ? 'none' : '1px solid rgba(45,212,191,0.4)',
                      fontSize: '0.66rem', fontWeight: 800, padding: '4px 16px', borderRadius: 99,
                      letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                      boxShadow: plan.popular ? '0 4px 14px rgba(249,115,22,0.45)' : 'none', fontFamily: 'var(--font-ui)',
                    }}>{plan.badge}</div>
                  )}
                  <h3 style={{
                    fontFamily: "var(--font-display), 'Playfair Display', Georgia, serif",
                    fontSize: '1.24rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.25,
                    marginBottom: 10,
                    color: 'white'
                  }}>
                    {plan.name}
                  </h3>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', fontWeight: 700,
                    color: plan.popular ? '#F97316' : '#2DD4BF', marginBottom: 4 }}>
                    {plan.pricePerDay}
                  </div>
                  <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.12)', color: '#FCA87A',
                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                    border: '1px solid rgba(249,115,22,0.2)', marginBottom: 24 }}>
                    {plan.discount}
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                    {plan.features.map((feat, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.84rem',
                        color: 'rgba(255,255,255,0.7)', lineHeight: 1.35 }}>
                        <CheckCircle size={15} color={plan.popular ? '#F97316' : '#2DD4BF'} style={{ flexShrink: 0 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => openLogin('parent')}
                  className={plan.popular ? 'btn-saffron' : 'btn-outline'}
                  style={{ width: '100%', justifyContent: 'center',
                    ...(plan.popular ? {} : { color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }) }}>
                  Choose Plan <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA / START TODAY ── */}
      <section id="start" style={{ padding: '110px 0 130px', background: 'var(--bg-section)' }}>
        <span id="faq" style={{ display: 'none' }} />
        <div className="container">
          <div className="reveal" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: 36, padding: '80px 60px', textAlign: 'center',
            boxShadow: '0 40px 120px rgba(26,18,11,0.1)', position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative blobs */}
            <div style={{ position: 'absolute', top: -80, right: -60, width: 320, height: 320,
              background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
              filter: 'blur(30px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280,
              background: 'radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 70%)',
              filter: 'blur(30px)', pointerEvents: 'none' }} />

            <div className="section-badge" style={{ marginBottom: 22, display: 'inline-flex' }}>Start Today</div>
            <h2 style={{ fontSize: '3.4rem', marginBottom: 18, position: 'relative', zIndex: 1 }}>
              Your child deserves<br />
              <span className="italic-serif grad-saffron">a hot home meal. Every day.</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>
              Join thousands of parents who never miss sending love in a lunchbox — with LunchMate's verified, OTP-secured delivery network.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36, position: 'relative', zIndex: 1 }}>
              <button className="btn-primary" onClick={() => openLogin('parent')} style={{ padding: '16px 38px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <PackageOpen size={18} /> Get Started as Parent <ArrowRight size={18} />
              </button>
              <button className="btn-outline" onClick={() => openLogin('driver')} style={{ padding: '16px 38px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bike size={18} /> Join as Driver Partner
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F97316" color="#F97316" />)}
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>4.9 / 5 across 3,200+ parent reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer style={{ background: 'var(--bg-dark)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '44px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
              border: '1px solid rgba(249,115,22,0.3)',
              flexShrink: 0
            }}>
              <img src={logoIcon} alt="LunchMate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>
                Lunch<span style={{ color: '#F97316' }}>Mate</span>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>Delivering Home, Not Just Food.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[['Parent Portal', 'parent'], ['Driver Portal', 'driver'], ['Admin Panel', 'admin']].map(([label, role]) => (
              <button key={role} onClick={() => openLogin(role)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
                fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'var(--font-ui)',
                transition: 'color 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.color = '#F97316'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >{label}</button>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem' }}>
            © 2026 LunchMate Platforms. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
