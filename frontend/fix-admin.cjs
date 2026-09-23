const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const heroSection = `
  const headerRef = useRef(null);
  const handleHeaderMouse = (e) => {
    if (!headerRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width  - 0.5) * 12;
    const y = ((clientY - top)  / height - 0.5) * 12;
    headerRef.current.style.transform = \`perspective(1000px) rotateX(\${-y}deg) rotateY(\${x}deg) scale(1.01)\`;
  };
  const handleHeaderLeave = () => {
    if (headerRef.current)
      headerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  const renderDocLink = (label, value) => (
`;

code = code.replace('  const renderDocLink = (label, value) => (', heroSection);

const headerUI = `
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
              <div style={{ 
                background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.15)', 
                padding: '12px 24px', borderRadius: 99, fontSize: '0.9rem',
                color: '#D97706', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                🔒 ENCRYPTED SESSION
              </div>
            </div>
          </div>

          {/* Right Floating Card */}
          <div className="reveal-left" style={{ position: 'relative', height: 420, perspective: 1000 }}>
            <div className="blob" style={{ background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%)', width: 600, height: 600, top: -100, left: -100 }} />
            
            <div 
              ref={headerRef}
              onMouseMove={handleHeaderMouse}
              onMouseLeave={handleHeaderLeave}
              className="glass-panel card-lift"
              style={{ 
                width: '100%', height: '100%', borderRadius: 32, padding: 32,
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                border: '1px solid var(--border-light)',
                transition: 'transform 0.1s ease-out',
                position: 'relative', zIndex: 2
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', marginBottom: 24, color: 'var(--text-heading)' }}>
                Active Verified Drivers ({verifiedDrivers.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', flex: 1, paddingRight: 10 }}>
                {verifiedDrivers.map((drv, i) => (
                  <div key={drv.id} style={{ 
                    background: 'var(--bg-base)', padding: 16, borderRadius: 16, border: '1px solid var(--border-medium)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    animation: \`fadeUpIn 0.5s ease forwards \${0.2 + (i*0.1)}s\`, opacity: 0
                  }}>
                    <div>
                      <div style={{ color: 'var(--text-heading)', fontWeight: 700, marginBottom: 4 }}>{drv.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{drv.area} • Trips Today: {drv.tripsToday}</div>
                    </div>
                    <div style={{ color: '#15803D', fontWeight: 700, fontSize: '0.85rem' }}>
                      ⭐ {drv.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
`;

code = code.replace('<div style={{ paddingTop: 120, paddingBottom: 60, minHeight: \'100vh\', background: \'var(--bg-base)\' }}>\r\n      <div className="container">', headerUI);
code = code.replace('<div style={{ paddingTop: 120, paddingBottom: 60, minHeight: \'100vh\', background: \'var(--bg-base)\' }}>\n      <div className="container">', headerUI);

fs.writeFileSync('src/pages/AdminDashboard.jsx', code, 'utf8');
