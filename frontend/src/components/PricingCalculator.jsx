import React, { useState } from 'react';

import { Calculator, Clock, MapPin, ShieldCheck, Zap } from 'lucide-react';

export const PricingCalculator = () => {
  
  const [distance, setDistance] = useState(4.5);
  const [isEmergency, setIsEmergency] = useState(false);

  // Pricing Logic matching Prompt:
  // 0-5km -> ₹40-60
  // 5-10km -> ₹60-80
  // 10-15km -> ₹80-100
  const calculatePrice = (dist, emergency) => {
    let base = 40;
    if (dist <= 5) {
      base = 40 + (dist / 5) * 20;
    } else if (dist <= 10) {
      base = 60 + ((dist - 5) / 5) * 20;
    } else {
      base = 80 + ((dist - 10) / 5) * 20;
    }
    if (emergency) base += 15; // Emergency surcharge
    return Math.round(base);
  };

  const estimatedPrice = calculatePrice(distance, isEmergency);
  const driverShare = Math.round(estimatedPrice * 0.85);
  const platformShare = estimatedPrice - driverShare;
  const estimatedTime = Math.round(15 + distance * 3.5);

  return (
    <div className="glass-panel" style={{ borderRadius: '24px', padding: '32px', border: '1px solid rgba(255, 94, 54, 0.3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(255, 94, 54, 0.15)', padding: '12px', borderRadius: '16px', color: '#FF5E36' }}>
          <Calculator size={28} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.4rem', color: '#FFF' }}>{t('pricingCalculator')}</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Transparent distance-based fare estimator</p>
        </div>
      </div>

      {/* Distance Slider */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ color: '#CBD5E1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="#FF9F1C" /> {t('distanceKm')}:
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FF5E36' }}>
            {distance} KM
          </span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="15" 
          step="0.5" 
          value={distance} 
          onChange={(e) => setDistance(parseFloat(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: 'linear-gradient(90deg, #FF5E36, #FF9F1C, #2EC4B6)',
            cursor: 'pointer',
            accentColor: '#FF5E36'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.75rem', marginTop: '6px' }}>
          <span>1 KM (Local)</span>
          <span>7.5 KM (Mid City)</span>
          <span>15 KM (Max Range)</span>
        </div>
      </div>

      {/* Emergency Delivery Toggle */}
      <div 
        onClick={() => setIsEmergency(!isEmergency)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          background: isEmergency ? 'rgba(255, 94, 54, 0.15)' : 'rgba(255, 255, 255, 0.04)',
          border: isEmergency ? '1px solid #FF5E36' : '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 18px',
          marginBottom: '24px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={20} color={isEmergency ? "#FF5E36" : "#94A3B8"} />
          <div>
            <div style={{ color: '#FFF', fontWeight: 600, fontSize: '0.9rem' }}>Emergency Express Order</div>
            <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>Priority matching within 2 minutes (+₹15)</div>
          </div>
        </div>
        <input type="checkbox" checked={isEmergency} onChange={() => {}} style={{ accentColor: '#FF5E36', width: '18px', height: '18px' }} />
      </div>

      {/* Result Display Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color="#2EC4B6" /> {t('estTime')}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2EC4B6', marginTop: '4px' }}>
            {estimatedTime} mins
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255, 94, 54, 0.2)' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{t('estPrice')}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FF5E36', marginTop: '4px' }}>
            ₹{estimatedPrice}
          </div>
        </div>
      </div>

      {/* Revenue Split Transparency */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '14px', fontSize: '0.82rem', color: '#94A3B8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span>🛵 Driver Earnings (85%):</span>
          <strong style={{ color: '#4ADE80' }}>₹{driverShare}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>🛡️ Platform Service Fee (15%):</span>
          <strong style={{ color: '#CBD5E1' }}>₹{platformShare}</strong>
        </div>
      </div>
    </div>
  );
};
