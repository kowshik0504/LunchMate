import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export const ParentReportsTab = ({ parentProfile, historyLogs = [] }) => {
  const completedCount = historyLogs.filter(row => row.status && (row.status.includes('Delivered') || row.status.includes('Verified'))).length;
  const successRate = completedCount > 0 ? '100%' : '—';

  return (
    <div className="card reveal" style={{ padding: 36 }}>
      <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-heading)' }}>
        <FileText size={22} color="#0D9488" /> Monthly Report & Delivery History
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
        <div className="card reveal-scale reveal-delay-1 card-lift" style={{ padding: 20, background: 'rgba(13,148,136,0.05)', border: '1px solid rgba(13,148,136,0.1)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Deliveries Completed</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#0D9488', marginTop: 8 }}>
            {completedCount} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Meals</span>
          </div>
        </div>
        <div className="card reveal-scale reveal-delay-2 card-lift" style={{ padding: 20, background: 'rgba(21,128,61,0.05)', border: '1px solid rgba(21,128,61,0.1)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Before-Bell Success Rate</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#15803D', marginTop: 8 }}>
            {successRate}
          </div>
        </div>
        <div className="card reveal-scale reveal-delay-3 card-lift" style={{ padding: 20, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.1)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Wallet Rollover Balance</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: '#F97316', marginTop: 8 }}>₹{parentProfile?.walletBalance || 0}</div>
        </div>
      </div>

      <table className="premium-table reveal-up reveal-delay-4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Order ID</th>
            <th>Assigned Rider & Contingency</th>
            <th>Drop Time</th>
            <th>Delivery Status</th>
            <th>Pass Impact & Payout</th>
          </tr>
        </thead>
        <tbody>
          {historyLogs.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No past deliveries recorded yet. When daily tiffins are delivered or paused, verified receipt logs will automatically appear here.
              </td>
            </tr>
          ) : (
            historyLogs.map((row, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{row.date}</td>
                <td style={{ color: '#F97316', fontWeight: 700 }}>{row.id}</td>
                <td>
                  <span style={{ 
                    color: row.driver.includes('Backup') || row.driver.includes('Route') ? '#EA580C' : 'inherit',
                    fontWeight: row.driver.includes('Backup') || row.driver.includes('Route') ? 800 : 500
                  }}>
                    {row.driver}
                  </span>
                </td>
                <td>{row.time}</td>
                <td>
                  <span style={{ 
                    color: row.status.includes('Wallet Credited') ? '#059669' : '#15803D', 
                    fontWeight: 700, 
                    background: row.status.includes('Wallet Credited') ? 'rgba(16,185,129,0.15)' : 'rgba(21,128,61,0.1)', 
                    padding: '3px 8px', 
                    borderRadius: 6 
                  }}>
                    ✓ {row.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{row.amount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
