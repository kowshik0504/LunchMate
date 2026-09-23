const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

const newKYC = `
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
                        showToast(`${reviewingDriver.name} has been verified and activated!`, 'success');
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
                      <div key={drv.id} className={\`card reveal-scale reveal-delay-\${(i%3)+1} card-lift\`} style={{ padding: 26, border: '1px solid rgba(249,115,22,0.3)', cursor: 'pointer' }} onClick={() => setReviewingDriver(drv)}>
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

                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                           Review Application →
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="reveal-left" style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', margin: '48px 0 20px', color: 'var(--text-heading)' }}>Active Verified Drivers ({verifiedDrivers.length})</h3>
`;

const oldStartStr = "{/* TAB 1: KYC */}";
const oldEndStr = "Active Verified Drivers ({verifiedDrivers.length})</h3>";

const startIndex = code.indexOf(oldStartStr);
const endIndex = code.indexOf(oldEndStr);

if (startIndex !== -1 && endIndex !== -1) {
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex + oldEndStr.length);
  const result = before + newKYC + after;
  fs.writeFileSync('src/pages/AdminDashboard.jsx', result, 'utf8');
  console.log("Success");
} else {
  console.log("Could not find boundaries");
}
