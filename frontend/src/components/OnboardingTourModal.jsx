import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowRight, ArrowLeft, X, CheckCircle2, 
  Sparkles, ExternalLink, Navigation, Eye,
  ShieldCheck, HelpCircle, ChevronRight
} from 'lucide-react';

export const OnboardingTourModal = ({ 
  isOpen, 
  onClose, 
  onFinish, 
  darkMode = true,
  onSelectTab,
  onFoodReady,
  onOpenHolidayPause,
  onOpenSchoolEdit,
  holidayPauseConfig,
  parentProfile
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      targetId: 'hero-food-ready-row',
      tab: 'orders',
      stepNum: 1,
      badge: 'STEP 1 OF 6 • DAILY RIDER SUMMON',
      title: 'Food Ready Button',
      whyGiven: 'You cook according to your home morning schedule. Once your child\'s hot lunch is packed in the insulated tiffin, clicking this summons your dedicated verified rider directly to your doorstep.',
      howToUse: 'Click "Food Ready" every morning. Your rider receives an immediate dispatch ping with GPS routing and your 4-digit Doorstep Pickup OTP.',
      actionLabel: 'Try "Food Ready" Now',
      actionHandler: () => {
        if (onFoodReady) onFoodReady();
      }
    },
    {
      targetId: 'hero-holiday-pause-toggle',
      tab: 'orders',
      stepNum: 2,
      badge: 'STEP 2 OF 6 • ZERO-MONEY-LOST TOGGLE',
      title: 'Holiday Auto-Pause Toggle',
      whyGiven: 'Placed directly next to Food Ready for 1-click access. Protects parents from losing money when schools declare holidays or children fall sick. 100% of your daily meal fee rolls over automatically to your wallet credit.',
      howToUse: 'Click the toggle switch to choose Tomorrow Holiday (1 day), Weekend Holiday (2 days), or Custom Holiday with calendar start & end dates.',
      actionLabel: 'Open Holiday Pause Modal',
      actionHandler: () => {
        if (onOpenHolidayPause) onOpenHolidayPause();
      }
    },
    {
      targetId: 'student-school-record-card',
      tab: 'orders',
      stepNum: 3,
      badge: 'STEP 3 OF 6 • STUDENT CAMPUS & CLASS',
      title: 'Student Profile & School Record',
      whyGiven: 'Displays your child\'s verified school identity, delivery bell window (12:30 PM), and active subscription pass status. If moving grades or changing campuses, you can update details with zero hassle.',
      howToUse: 'Click "EDIT" on the card to update class section or school destination. GPS road distance and wallet rates update automatically.',
      actionLabel: 'Open School Transfer Details',
      actionHandler: () => {
        if (onOpenSchoolEdit) onOpenSchoolEdit();
      }
    },
    {
      targetId: 'subscription-plans-section',
      tab: 'subscription',
      stepNum: 4,
      badge: 'STEP 4 OF 6 • TRANSPARENT PRICING',
      title: 'Subscription Passes & Fair Pricing',
      whyGiven: 'LunchMate includes 0–3 km for free in all base pass rates, and charges only a fair ₹8/km for extra distance beyond 3 km. No hidden charges or surge pricing.',
      howToUse: 'Choose a 5-Day Trial Pass (₹50/day) or 20-Day Standard Pass (₹42/day). Unused holiday pause days roll over automatically to discount future renewals.',
      actionLabel: 'Explore Subscription Plans',
      actionHandler: () => {
        if (onSelectTab) onSelectTab('subscription');
      }
    },
    {
      targetId: 'live-orders-tracking-section',
      tab: 'orders',
      stepNum: 5,
      badge: 'STEP 5 OF 6 • LIVE SAFETY HANDSHAKE',
      title: 'Live GPS Tracking & Handshake Protection',
      whyGiven: 'Complete peace of mind for parents. Shows your verified rider moving along road corridors in real time with Double OTP Handshake and Zero-Hunger Canteen delay protection.',
      howToUse: 'Track your tiffin in real time and share the school gate delivery OTP with campus security before the 12:30 PM lunch bell.',
      actionLabel: 'View Live Tracker Section',
      actionHandler: () => {
        if (onSelectTab) onSelectTab('orders');
      }
    },
    {
      targetId: 'reports-wallet-tab',
      tab: 'reports',
      stepNum: 6,
      badge: 'STEP 6 OF 6 • ESCROW PAYMENT SAFETY',
      title: '100% Escrow Protection & Digital UTR',
      whyGiven: 'Your payment stays safely in escrow until the school gate OTP handshake is confirmed. Driver payout is disbursed only upon successful delivery at the school gate.',
      howToUse: 'Review transparent billing receipts, rollover wallet balances from paused days, and verified 12-digit UPI UTR audit trails in the Reports tab.',
      actionLabel: 'Check Wallet & Audit Reports',
      actionHandler: () => {
        if (onSelectTab) onSelectTab('reports');
      }
    }
  ];

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep, steps.length]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleClose = useCallback(() => {
    document.querySelectorAll('.tour-target-highlight').forEach(el => {
      el.classList.remove('tour-target-highlight');
    });
    if (onFinish) onFinish();
    else if (onClose) onClose();
  }, [onFinish, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, handleClose]);

  // Sync tab and scroll to target element with spotlight highlight
  useEffect(() => {
    if (!isOpen) {
      document.querySelectorAll('.tour-target-highlight').forEach(el => {
        el.classList.remove('tour-target-highlight');
      });
      return;
    }

    const currentTarget = steps[currentStep];
    if (onSelectTab && currentTarget?.tab) {
      onSelectTab(currentTarget.tab);
    }

    const timer = setTimeout(() => {
      document.querySelectorAll('.tour-target-highlight').forEach(el => {
        el.classList.remove('tour-target-highlight');
      });

      if (currentTarget?.targetId) {
        const el = document.getElementById(currentTarget.targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('tour-target-highlight');
        }
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      document.querySelectorAll('.tour-target-highlight').forEach(el => {
        el.classList.remove('tour-target-highlight');
      });
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div style={{
      position: 'fixed',
      bottom: 'clamp(16px, 3vh, 28px)',
      right: 'clamp(16px, 3vw, 28px)',
      maxWidth: 'clamp(320px, 92vw, 490px)',
      width: '100%',
      zIndex: 9999999,
      animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div 
        className="card-lift"
        style={{
          background: darkMode ? '#121826' : '#FFFFFF',
          border: '1.5px solid #EA580C',
          borderRadius: 22,
          padding: '20px 22px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 28px rgba(234,88,12,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 13,
          position: 'relative',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      >
        {/* Top Header Row with Steps & Progress Bar */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                background: 'rgba(234,88,12,0.15)',
                color: '#EA580C',
                fontSize: '0.68rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                padding: '3px 9px',
                borderRadius: 6
              }}>
                {step.badge}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {progressPercent}% Done
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              style={{
                background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                border: 'none',
                color: 'var(--text-muted)',
                width: 28,
                height: 28,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
              title="Close Tour (Esc)"
            >
              <X size={15} />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: 4,
            background: darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
            borderRadius: 99,
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #EA580C, #F97316)',
              borderRadius: 99,
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Interactive Step Jump Dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }}>
            {steps.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 99,
                  border: 'none',
                  background: idx === currentStep 
                    ? '#EA580C' 
                    : idx < currentStep 
                      ? 'rgba(234,88,12,0.45)' 
                      : (darkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.2s ease'
                }}
                title={`Jump to Step ${idx + 1}: ${s.title}`}
              />
            ))}
          </div>
        </div>

        {/* Step Title */}
        <div>
          <h4 style={{
            margin: '0 0 2px 0',
            fontSize: '1.12rem',
            fontWeight: 900,
            color: 'var(--text-heading)',
            letterSpacing: '-0.01em'
          }}>
            {step.title}
          </h4>
        </div>

        {/* Why this is given Box */}
        <div style={{
          background: darkMode ? 'rgba(234,88,12,0.08)' : '#FFF7ED',
          border: '1px solid rgba(234,88,12,0.25)',
          borderRadius: 12,
          padding: '11px 13px',
          fontSize: '0.80rem',
          color: darkMode ? '#FDBA74' : '#9A3412',
          lineHeight: 1.45
        }}>
          <strong>Purpose:</strong> {step.whyGiven}
        </div>

        {/* How to use */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          <strong>Action:</strong> {step.howToUse}
        </div>

        {/* Interactive Try / Use Action Button */}
        {step.actionLabel && (
          <button
            type="button"
            onClick={() => {
              if (step.actionHandler) step.actionHandler();
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 12,
              background: '#EA580C',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234,88,12,0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{step.actionLabel}</span>
            <ExternalLink size={14} />
          </button>
        )}

        {/* Navigation Controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingTop: 8, 
          borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0' 
        }}>
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            End Tour
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                  border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #CBD5E1',
                  color: 'var(--text-heading)',
                  borderRadius: 10,
                  padding: '7px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              style={{
                background: '#EA580C',
                color: '#FFF',
                border: 'none',
                borderRadius: 10,
                padding: '7px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              {currentStep === steps.length - 1 ? (
                <span>Finish</span>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
