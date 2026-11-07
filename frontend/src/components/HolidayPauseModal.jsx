import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, X } from 'lucide-react';

export const HolidayPauseModal = ({
  isOpen,
  onClose,
  darkMode,
  holidayPauseConfig,
  parentProfile,
  onConfirmHolidayPause,
  onConfirmCustomHoliday,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  calculateDateDiffDays,
  presets
}) => {
  // Prevent background scroll / swipe bleed when Holiday modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      const prevTouch = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouch;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dailyRate = parentProfile?.dailyRate || 50;

  return createPortal(
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999999,
        background: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain', padding: '36px 16px 60px 16px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="card-lift"
        style={{
          background: darkMode ? '#121826' : '#FFFFFF',
          border: darkMode ? '1.5px solid rgba(234,88,12,0.35)' : '1.5px solid #FED7AA',
          borderRadius: 24, padding: '28px 24px', maxWidth: 500, width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)', position: 'relative',
          margin: 'auto 0'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute', top: 18, right: 18,
            background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
            border: 'none', borderRadius: 10, width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-muted)'
          }}
          title="Close Window (Esc)"
        >
          <X size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(234,88,12,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
            <Calendar size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-heading)' }}>
              School Holiday Auto-Pause
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Pause lunchbox deliveries with 100% wallet credit rollover.
            </p>
          </div>
        </div>

        {/* 3 Options: Tomorrow Holiday, Saturday & Sunday Holiday, Custom Holiday */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '18px 0 20px' }}>
          {/* Option 1: Tomorrow Holiday */}
          {(() => {
            const preset = presets[0];
            const refund = preset.days * dailyRate;
            const isSelected = holidayPauseConfig.selectedPresetId === 'tomorrow';
            return (
              <div
                key="tomorrow"
                onClick={() => onConfirmHolidayPause(preset)}
                className="card-lift"
                style={{
                  padding: '14px 18px', borderRadius: 16, cursor: 'pointer',
                  border: isSelected ? '2px solid #EA580C' : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                  background: isSelected 
                    ? (darkMode ? 'rgba(234,88,12,0.12)' : '#FFF7ED') 
                    : (darkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC'),
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {preset.dates} • Resumes on {preset.resumes}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#10B981' }}>
                    +₹{refund}.00
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 800 }}>
                    1 Day Saved
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Option 2: Saturday & Sunday Holiday */}
          {(() => {
            const preset = presets[1];
            const refund = preset.days * dailyRate;
            const isSelected = holidayPauseConfig.selectedPresetId === 'weekend';
            return (
              <div
                key="weekend"
                onClick={() => onConfirmHolidayPause(preset)}
                className="card-lift"
                style={{
                  padding: '14px 18px', borderRadius: 16, cursor: 'pointer',
                  border: isSelected ? '2px solid #EA580C' : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                  background: isSelected 
                    ? (darkMode ? 'rgba(234,88,12,0.12)' : '#FFF7ED') 
                    : (darkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC'),
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {preset.dates} • Resumes on {preset.resumes}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#10B981' }}>
                    +₹{refund}.00
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 800 }}>
                    2 Days Saved
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Option 3: Custom Holiday (Calendar Date Picker) */}
          {(() => {
            const customDays = calculateDateDiffDays(customStartDate, customEndDate);
            const refund = customDays * dailyRate;
            const isSelected = holidayPauseConfig.selectedPresetId === 'custom';
            return (
              <div
                key="custom"
                style={{
                  padding: '16px 18px', borderRadius: 16,
                  border: isSelected ? '2px solid #EA580C' : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                  background: darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                  display: 'flex', flexDirection: 'column', gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                      Custom Holiday
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Choose start and end date from calendar
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#10B981' }}>
                      +₹{refund}.00
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 800 }}>
                      {customDays} Days Saved
                    </div>
                  </div>
                </div>

                {/* Dual Calendar Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="field-input"
                      value={customStartDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      className="field-input"
                      value={customEndDate}
                      min={customStartDate || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                {/* Confirm Custom Pause Button */}
                <button
                  type="button"
                  onClick={onConfirmCustomHoliday}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 10,
                    background: '#EA580C', border: 'none', color: '#FFF',
                    fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer',
                    transition: 'opacity 0.2s ease', marginTop: 4
                  }}
                >
                  Confirm Custom Pause ({customDays} Days • +₹{refund}.00)
                </button>
              </div>
            );
          })()}
        </div>

        <div style={{ background: darkMode ? 'rgba(234,88,12,0.08)' : '#FFF7ED', padding: '12px 16px', borderRadius: 12, fontSize: '0.78rem', color: '#EA580C', lineHeight: 1.4, marginBottom: 18 }}>
          <strong>Wallet Rollover Guarantee:</strong> While paused, no lunchbox is packed and no driver is dispatched. Your daily meal fee rolls over automatically to your wallet.
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', padding: '12px', borderRadius: 12,
            background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
            border: 'none', color: 'var(--text-heading)', fontWeight: 800, fontSize: '0.88rem',
            cursor: 'pointer'
          }}
        >
          Close Without Changing
        </button>
      </div>
    </div>,
    document.body
  );
};
