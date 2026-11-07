import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, X, CheckCircle2, 
  Sparkles, ExternalLink, Navigation, Eye
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
      badge: 'STEP 1 OF 5 • DAILY RIDER SUMMON',
      title: 'Food Ready Button',
      whyGiven: 'Why this is given: You cook at your own home schedule. Once your child\'s tiffin is packed and warm, clicking this summons your assigned verified rider directly to your doorstep.',
      howToUse: 'How to use: Click "Food Ready" every morning. Your rider receives an immediate dispatch ping along with your 4-digit Doorstep Pickup OTP.',
      actionLabel: 'Try "Food Ready" Now',
      actionHandler: () => {
        if (onFoodReady) onFoodReady();
      }
    },
    {
      targetId: 'hero-holiday-pause-toggle',
      tab: 'orders',
      stepNum: 2,
      badge: 'STEP 2 OF 5 • ZERO-MONEY-LOST TOGGLE',
      title: 'Holiday Auto-Pause Toggle',
      whyGiven: 'Why this is given: Placed directly next to Food Ready for 1-click access. Protects parents from losing money when schools declare holidays or children are sick. 100% of your daily meal fee rolls over to your wallet.',
      howToUse: 'How to use: Click the toggle switch to choose Tomorrow Holiday (1 day), Saturday & Sunday Holiday (2 days), or Custom Holiday with calendar start & end dates.',
      actionLabel: 'Open Holiday Pause Modal',
      actionHandler: () => {
        if (onOpenHolidayPause) onOpenHolidayPause();
      }
    },
    {
      targetId: 'student-school-record-card',
      tab: 'orders',
      stepNum: 3,
      badge: 'STEP 3 OF 5 • STUDENT CAMPUS & CLASS',
      title: 'Student Profile & School Record',
      whyGiven: 'Why this is given: Displays your child\'s registered identity, delivery bell window (12:30 PM), and active pass status. If moving grades or transferring schools, you can update details instantly.',
      howToUse: 'How to use: Click "EDIT" on the card to update class section or school destination. GPS road distance and wallet credits update automatically.',
      actionLabel: 'Open School Transfer Details',
      actionHandler: () => {
        if (onOpenSchoolEdit) onOpenSchoolEdit();
      }
    },
    {
      targetId: 'subscription-plans-section',
      tab: 'subscription',
      stepNum: 4,
      badge: 'STEP 4 OF 5 • TRANSPARENT PRICING',
      title: 'Subscription Plans & Distance Surcharges',
      whyGiven: 'Why this is given: LunchMate includes 0–3 km for free in all base pass rates, and charges only a fair ₹8/km for extra distance beyond 3 km. No inflated flat fees.',
      howToUse: 'How to use: Select a 5-Day Trial Pass (₹50/day) or 20-Day Standard Pass (₹42/day). Unused pause days roll over automatically to discount future renewals.',
      actionLabel: 'Explore Subscription Plans',
      actionHandler: () => {
        if (onSelectTab) onSelectTab('subscription');
      }
    },
    {
      targetId: 'live-orders-tracking-section',
      tab: 'orders',
      stepNum: 5,
      badge: 'STEP 5 OF 5 • LIVE SAFETY HANDSHAKE',
      title: 'Live GPS Tracking & Handshake Protection',
      whyGiven: 'Why this is given: Complete peace of mind for parents. Shows your verified rider moving along Chennai road corridors in real time with Double OTP Handshake and Zero-Hunger Canteen delay protection.',
      howToUse: 'How to use: Track your tiffin in real time and share the school gate delivery OTP with campus security before the 12:30 PM bell.',
      actionLabel: 'View Live Tracker Section',
      actionHandler: () => {
        if (onSelectTab) onSelectTab('orders');
      }
    }
  ];

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
    }, 200);

    return () => {
      clearTimeout(timer);
      document.querySelectorAll('.tour-target-highlight').forEach(el => {
        el.classList.remove('tour-target-highlight');
      });
    };
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    document.querySelectorAll('.tour-target-highlight').forEach(el => {
      el.classList.remove('tour-target-highlight');
    });
    if (onFinish) onFinish();
    else if (onClose) onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      maxWidth: 480,
      width: 'calc(100% - 48px)',
      zIndex: 9999999,
      animation: 'fadeIn 0.25s ease'
    }}>
      <div 
        className="card-lift"
        style={{
          background: darkMode ? '#121826' : '#FFFFFF',
          border: '1.5px solid #EA580C',
          borderRadius: 22,
          padding: '22px 24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.45), 0 0 24px rgba(234,88,12,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          position: 'relative'
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', paddingBottom: 10 }}>
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
              justifyContent: 'center'
            }}
            title="Close Tour"
          >
            <X size={15} />
          </button>
        </div>

        {/* Step Title */}
        <div>
          <h4 style={{
            margin: '0 0 4px 0',
            fontSize: '1.15rem',
            fontWeight: 900,
            color: 'var(--text-heading)'
          }}>
            {step.title}
          </h4>
        </div>

        {/* Why this is given Box */}
        <div style={{
          background: darkMode ? 'rgba(234,88,12,0.08)' : '#FFF7ED',
          border: '1px solid rgba(234,88,12,0.25)',
          borderRadius: 12,
          padding: '12px 14px',
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0' }}>
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
                  <span>Next Feature</span>
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
