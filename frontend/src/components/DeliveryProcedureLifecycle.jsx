import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, CheckCircle2, Clock, MapPin, Navigation, Phone, 
  ShieldCheck, AlertTriangle, ArrowRight, UserCheck, Volume2, VolumeX, Sparkles
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { LiveMapTracker } from './LiveMapTracker';

// ── Web Audio API 30-Second Authentic Bell Chime ─────────────────────────────
const playBellChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return () => {};
    const ctx = new AudioCtx();

    const triggerDoubleChime = () => {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      // High chime (880 Hz - A5) followed by harmonious fifth (1046.5 Hz - C6)
      [880, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);
        gain.gain.setValueAtTime(0.22, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 1.2);
      });
    };

    triggerDoubleChime();
    // Rings every 2.4s for up to 30 seconds
    const interval = setInterval(triggerDoubleChime, 2400);
    const stopTimeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(stopTimeout);
      try { ctx.close(); } catch (e) {}
    };
  } catch (err) {
    console.warn('Web Audio Bell not supported:', err);
    return () => {};
  }
};

export const DeliveryProcedureLifecycle = ({ order, school, onComplete, darkMode }) => {
  const { 
    updateOrderStatus, 
    verifyPickupOtp, 
    verifyDeliveryOtp, 
    showToast, 
    parentProfile, 
    updateParentProfile 
  } = useAppState();

  // Normalize current operational stage
  const currentStatus = order?.status || 'Notified to Driver';
  
  // Local states for Procedure Steps
  const [bellActive, setBellActive] = useState(false);
  const bellStopRef = useRef(null);
  const [waitingSeconds, setWaitingSeconds] = useState(600); // 10 minutes (600s)
  const [graceSeconds, setGraceSeconds] = useState(120);     // 2 minutes (120s)
  const [isGraceActive, setIsGraceActive] = useState(false);
  const [penaltyApplied, setPenaltyApplied] = useState(false);

  // ── STEP 1: Notified to Driver -> Auto Driver Acceptance (3.5s) ──────────────
  useEffect(() => {
    if (currentStatus === 'Notified to Driver' || currentStatus === 'Food Ready') {
      const timer = setTimeout(() => {
        updateOrderStatus(order.id, 'Driver Assigned');
        showToast('Ramesh Kumar accepted the request and is heading to your home!', 'info');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, order.id, updateOrderStatus, showToast]);

  // ── STEP 2: Driver Assigned -> Driver Nearing Home (4.5s) ────────────────────
  useEffect(() => {
    if (currentStatus === 'Driver Assigned') {
      const timer = setTimeout(() => {
        updateOrderStatus(order.id, 'Driver Nearing');
        showToast('Driver is nearing your pickup location! (~300m away)', 'warning');
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, order.id, updateOrderStatus, showToast]);

  // ── STEP 3: Driver Nearing -> Arrived at Doorstep (3.5s) ──────────────────────
  useEffect(() => {
    if (currentStatus === 'Driver Nearing') {
      const timer = setTimeout(() => {
        updateOrderStatus(order.id, 'Arrived at Pickup');
        showToast('Driver arrived at your location! 30-sec arrival bell ringing.', 'success');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, order.id, updateOrderStatus, showToast]);

  // ── STEP 4: Arrived at Pickup -> 30s Bell Alarm + 10-Min Waiting Timer ────────
  useEffect(() => {
    if (currentStatus === 'Arrived at Pickup') {
      // Start 30s bell alarm
      setBellActive(true);
      const stopSound = playBellChime();
      bellStopRef.current = stopSound;

      const bellTimer = setTimeout(() => {
        setBellActive(false);
        if (bellStopRef.current) bellStopRef.current();
      }, 30000);

      return () => {
        clearTimeout(bellTimer);
        if (bellStopRef.current) bellStopRef.current();
      };
    } else {
      if (bellStopRef.current) {
        bellStopRef.current();
        bellStopRef.current = null;
      }
      setBellActive(false);
    }
  }, [currentStatus]);

  // Waiting Countdown Timer (10 Mins + 2 Mins Grace)
  useEffect(() => {
    if (currentStatus !== 'Arrived at Pickup') return;

    const timer = setInterval(() => {
      setWaitingSeconds((prev) => {
        if (prev > 1) return prev - 1;

        // 10 minutes exceeded! Transition to Grace Period
        setIsGraceActive(true);
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStatus]);

  // Grace Period Countdown & ₹10 Penalty Fee Application
  useEffect(() => {
    if (currentStatus !== 'Arrived at Pickup' || !isGraceActive || penaltyApplied) return;

    const graceTimer = setInterval(() => {
      setGraceSeconds((prev) => {
        if (prev > 1) return prev - 1;

        // Grace period expired! Apply ₹10 compulsory waiting fee
        setPenaltyApplied(true);
        const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const penaltyEntry = {
          date: `Today (${todayStr})`,
          amount: 10,
          reason: `Driver Waiting Fee (Exceeded 10 min pickup window on ${todayStr})`,
          compulsory: true
        };

        const existingPending = parentProfile?.pendingDues || [];
        updateParentProfile({
          pendingDues: [...existingPending, penaltyEntry]
        });

        showToast('10-minute waiting exceeded! ₹10 driver waiting fee added to next payment.', 'error');
        return 0;
      });
    }, 1000);

    return () => clearInterval(graceTimer);
  }, [currentStatus, isGraceActive, penaltyApplied, parentProfile, updateParentProfile, showToast]);

  const handleStopBell = () => {
    if (bellStopRef.current) bellStopRef.current();
    setBellActive(false);
  };

  // Format time mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle Parent / Driver OTP Verification
  const handleVerifyPickupHandover = (enteredOtp) => {
    const code = enteredOtp || order.pickupOtp;
    if (verifyPickupOtp(order.id, code)) {
      handleStopBell();
      updateOrderStatus(order.id, 'Picked Up');
      showToast('Pickup OTP verified! Lunchbox secured in thermal bag. Heading to school.', 'success');
    }
  };

  // Handle Gate Handshake (< 100m) Verification
  const handleVerifyGateDelivery = (enteredGateOtp) => {
    const code = enteredGateOtp || order.deliveryOtp;
    if (verifyDeliveryOtp(order.id, code)) {
      // Instant wallet settlement
      const dailyRate = parentProfile?.dailyRate || order.price || 50;
      const newWallet = Math.max(0, (parentProfile?.walletBalance || 0) - dailyRate);
      
      updateParentProfile({
        walletBalance: newWallet
      });

      updateOrderStatus(order.id, 'Delivered');
      showToast(`Gate OTP Verified! ₹${dailyRate} settled from wallet. Delivery complete.`, 'success');
      
      if (onComplete) {
        setTimeout(onComplete, 3500);
      }
    }
  };

  // ── PROCEDURE STEPPER DEFINITION ──────────────────────────────────────────
  const STEPS = [
    { id: 1, key: 'notified', label: '1. Notified to Driver' },
    { id: 2, key: 'assigned', label: '2. Driver Accepted' },
    { id: 3, key: 'nearing', label: '3. Nearing Home' },
    { id: 4, key: 'pickup', label: '4. Arrived & OTP' },
    { id: 5, key: 'transit', label: '5. En Route to School' },
    { id: 6, key: 'gate', label: '6. School Gate (<100m)' }
  ];

  const getStepIndex = () => {
    if (currentStatus === 'Notified to Driver' || currentStatus === 'Food Ready') return 0;
    if (currentStatus === 'Driver Assigned') return 1;
    if (currentStatus === 'Driver Nearing') return 2;
    if (currentStatus === 'Arrived at Pickup') return 3;
    if (['Picked Up', 'On The Way', 'En Route to School', 'Hot & Fresh En Route'].includes(currentStatus)) return 4;
    if (currentStatus === 'Arrived at School' || currentStatus === 'Arrived at School Gate' || currentStatus === 'Delivered') return 5;
    return 0;
  };

  const activeStepIdx = getStepIndex();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── PROCEDURE STEPPER BAR ────────────────────────────────────── */}
      <div style={{
        background: darkMode ? '#121826' : '#FFFFFF',
        borderRadius: 18, padding: '14px 18px',
        border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
        boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#EA580C', background: 'rgba(234,88,12,0.1)', padding: '3px 8px', borderRadius: 6 }}>
              OFFICIAL PROCEDURE
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              Order {order.id}
            </span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Step {activeStepIdx + 1} of 6
          </span>
        </div>

        {/* Stepper Progress Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {STEPS.map((step, idx) => {
            const isDone = idx < activeStepIdx;
            const isCurrent = idx === activeStepIdx;
            return (
              <div 
                key={step.id}
                style={{
                  padding: '7px 6px', borderRadius: 8, textAlign: 'center',
                  background: isCurrent 
                    ? '#EA580C' 
                    : isDone 
                      ? (darkMode ? 'rgba(16,185,129,0.18)' : '#ECFDF5') 
                      : (darkMode ? 'rgba(255,255,255,0.04)' : '#F1F5F9'),
                  color: isCurrent 
                    ? '#FFF' 
                    : isDone 
                      ? '#10B981' 
                      : 'var(--text-muted)',
                  fontSize: '0.68rem', fontWeight: 800,
                  border: isCurrent 
                    ? '1.5px solid #EA580C' 
                    : isDone 
                      ? '1px solid rgba(16,185,129,0.3)' 
                      : '1px solid transparent',
                  transition: 'all 0.25s ease'
                }}
              >
                {step.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: NOTIFIED TO DRIVER ─────────────────────────────────── */}
      {(currentStatus === 'Notified to Driver' || currentStatus === 'Food Ready') && (
        <div className="card-lift" style={{
          background: darkMode ? 'linear-gradient(135deg, #101625 0%, #172033 100%)' : '#FFFFFF',
          borderRadius: 22, padding: '38px 28px', textAlign: 'center',
          border: '1.5px solid #F97316',
          boxShadow: '0 12px 36px rgba(249,115,22,0.15)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
        }}>
          {/* Radar Animation Ring */}
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(249,115,22,0.25)', animation: 'ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
              position: 'relative', zIndex: 2, boxShadow: '0 6px 18px rgba(249,115,22,0.45)'
            }}>
              <Bell size={32} />
            </div>
          </div>

          <div>
            <div style={{ display: 'inline-block', background: 'rgba(249,115,22,0.12)', color: '#EA580C', fontSize: '0.78rem', fontWeight: 800, padding: '4px 12px', borderRadius: 99, marginBottom: 8 }}>
              STATUS: NOTIFIED TO DRIVER
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-heading)' }}>
              Dispatch Ping Sent to Nearby Driver
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 480, lineHeight: 1.55 }}>
              Notifying assigned partner <strong>Ramesh Kumar</strong> in Anna Nagar East zone. Awaiting acceptance to navigate to your pickup address.
            </p>
          </div>

          <div style={{
            background: darkMode ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
            border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
            borderRadius: 14, padding: '12px 18px', width: '100%', maxWidth: 420,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem'
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800 }}>PICKUP ADDRESS</div>
              <div style={{ fontWeight: 800, color: 'var(--text-heading)' }}>{order.pickupAddress || parentProfile?.deliveryAddress || 'Anna Nagar East'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800 }}>DESTINATION</div>
              <div style={{ fontWeight: 800, color: '#EA580C' }}>{order.schoolName || parentProfile?.schoolName || 'DAV HSS'}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              updateOrderStatus(order.id, 'Driver Assigned');
              showToast('Ramesh Kumar accepted the order!', 'success');
            }}
            className="btn-saffron card-lift"
            style={{ padding: '10px 22px', borderRadius: 12, fontWeight: 800, fontSize: '0.84rem' }}
          >
            Simulate Instant Driver Acceptance <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* ── STEP 2: DRIVER ASSIGNED & APPROACHING HOME ──────────────────── */}
      {currentStatus === 'Driver Assigned' && (
        <div className="card-lift" style={{
          background: darkMode ? 'linear-gradient(135deg, #101625 0%, #172033 100%)' : '#FFFFFF',
          borderRadius: 22, padding: '32px 28px',
          border: '1.5px solid #10B981',
          boxShadow: '0 12px 36px rgba(16,185,129,0.15)',
          display: 'flex', flexDirection: 'column', gap: 18
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 900, fontSize: '1.3rem', boxShadow: '0 4px 14px rgba(16,185,129,0.4)' }}>
                RK
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                    Ramesh Kumar
                  </h4>
                  <span style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ShieldCheck size={13} /> Verified Partner
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Bajaj Chetak EV • TN-02-CD-5642 • 4.9 ★ (1,420+ Deliveries)
                </div>
              </div>
            </div>

            <a
              href="tel:+919876543210"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                color: 'var(--text-heading)', border: 'none', borderRadius: 12,
                padding: '9px 16px', fontWeight: 800, fontSize: '0.82rem',
                display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none'
              }}
            >
              <Phone size={14} /> Call Driver
            </a>
          </div>

          <div style={{
            background: darkMode ? 'rgba(16,185,129,0.08)' : '#ECFDF5',
            border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
          }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 800, textTransform: 'uppercase' }}>
                LIVE DRIVER APPROACH
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-heading)', marginTop: 2 }}>
                Heading to your home • 3 mins away (1.1 km)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Currently on 3rd Main Road, Anna Nagar East. Moving at 22 km/h.
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateOrderStatus(order.id, 'Driver Nearing')}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.8rem', borderRadius: 10 }}
            >
              Simulate Driver Nearing (&lt; 300m)
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: DRIVER NEARING PROXIMITY ALERT (< 300m) ───────────── */}
      {currentStatus === 'Driver Nearing' && (
        <div className="card-lift" style={{
          background: darkMode ? 'linear-gradient(135deg, #241400 0%, #1A0D00 100%)' : '#FFF7ED',
          borderRadius: 22, padding: '34px 28px',
          border: '2px solid #EA580C',
          boxShadow: '0 12px 36px rgba(234,88,12,0.25)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: '#EA580C',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
            animation: 'pulse 1.5s infinite', boxShadow: '0 0 24px rgba(234,88,12,0.6)'
          }}>
            <Navigation size={32} />
          </div>

          <div>
            <div style={{ display: 'inline-block', background: 'rgba(234,88,12,0.15)', color: '#EA580C', fontSize: '0.78rem', fontWeight: 900, padding: '4px 14px', borderRadius: 99, marginBottom: 8 }}>
              PROXIMITY ALERT: WITHIN 300 METERS
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 900, color: '#EA580C' }}>
              Driver is Nearing Your Home!
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: darkMode ? '#E2E8F0' : '#475569', maxWidth: 480, lineHeight: 1.55 }}>
              Ramesh Kumar has turned into <strong>2nd Cross Street</strong> and is 1 minute away. Please have your hot lunchbox packed and ready for immediate doorstep handover.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateOrderStatus(order.id, 'Arrived at Pickup')}
            className="btn-saffron card-lift"
            style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 800, fontSize: '0.86rem' }}
          >
            Mark Driver Arrived at Location
          </button>
        </div>
      )}

      {/* ── STEP 4: DRIVER ARRIVED AT LOCATION (30s Bell + 10m Timer + OTP) */}
      {currentStatus === 'Arrived at Pickup' && (
        <div className="card-lift" style={{
          background: darkMode ? '#101625' : '#FFFFFF',
          borderRadius: 24, padding: '32px 26px',
          border: '2px solid #10B981',
          boxShadow: '0 16px 44px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', gap: 20
        }}>
          {/* Arrival Header & Bell Alarm Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: bellActive ? '#EF4444' : '#10B981',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
                animation: bellActive ? 'ping 1.5s infinite' : 'none',
                boxShadow: bellActive ? '0 0 24px rgba(239,68,68,0.5)' : '0 4px 14px rgba(16,185,129,0.35)'
              }}>
                <Bell size={28} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                    Driver Arrived at Your Location!
                  </h3>
                  {bellActive && (
                    <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Volume2 size={12} /> 30s Arrival Bell Active
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Ramesh Kumar is waiting outside your gate in Anna Nagar East.
                </div>
              </div>
            </div>

            {bellActive && (
              <button
                type="button"
                onClick={handleStopBell}
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                  border: '1px solid var(--border-light)', borderRadius: 10,
                  padding: '8px 14px', fontSize: '0.78rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  color: 'var(--text-heading)'
                }}
              >
                <VolumeX size={14} /> Stop Bell Sound
              </button>
            )}
          </div>

          {/* 10-Minute Waiting Timer Bar & Overtime Penalty Warning */}
          <div style={{
            background: isGraceActive 
              ? (darkMode ? 'rgba(239,68,68,0.12)' : '#FEF2F2') 
              : (darkMode ? 'rgba(16,185,129,0.08)' : '#F0FDF4'),
            border: isGraceActive ? '1.5px solid #EF4444' : '1px solid rgba(16,185,129,0.3)',
            borderRadius: 16, padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14
          }}>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: isGraceActive ? '#DC2626' : '#059669', textTransform: 'uppercase' }}>
                {isGraceActive ? '⚠️ 10 MINUTES EXCEEDED — 2 MIN GRACE PERIOD' : '⏱️ PICKUP WAITING WINDOW'}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: isGraceActive ? '#DC2626' : 'var(--text-heading)', marginTop: 2 }}>
                {isGraceActive ? formatTime(graceSeconds) : formatTime(waitingSeconds)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {isGraceActive 
                  ? 'If not handed over before grace timer ends, compulsory ₹10 driver waiting fee is charged.'
                  : 'Free 10-minute pickup window for hot lunchbox handover.'}
              </div>
            </div>

            {penaltyApplied && (
              <div style={{
                background: '#EF4444', color: '#FFF', padding: '8px 14px', borderRadius: 10,
                fontSize: '0.78rem', fontWeight: 800, textAlign: 'right'
              }}>
                <div>+₹10 Driver Waiting Fee Added</div>
                <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>Billed to next payment (compulsory)</div>
              </div>
            )}

            {!isGraceActive && (
              <button
                type="button"
                onClick={() => {
                  setWaitingSeconds(0);
                  setIsGraceActive(true);
                  showToast('Simulated 10 min timeout. 2 min grace period active.', 'warning');
                }}
                style={{
                  background: 'transparent', border: '1px solid var(--border-light)',
                  borderRadius: 10, padding: '6px 12px', fontSize: '0.74rem', fontWeight: 800,
                  color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                Simulate 10 Min Timeout
              </button>
            )}
          </div>

          {/* 4-Digit Pickup OTP Box (Shown to Parent & Driver) */}
          <div style={{
            background: darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
            border: darkMode ? '1.5px solid rgba(234,88,12,0.35)' : '1.5px solid #FED7AA',
            borderRadius: 20, padding: '22px 24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.76rem', color: '#EA580C', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              SHARE THIS PICKUP OTP WITH DRIVER RAMESH KUMAR
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '14px 0 10px' }}>
              {(order.pickupOtp || '4821').split('').map((digit, i) => (
                <div 
                  key={i}
                  style={{
                    width: 52, height: 60, borderRadius: 14,
                    background: darkMode ? '#1A2234' : '#FFFFFF',
                    border: '2px solid #EA580C',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', fontWeight: 900, color: '#EA580C',
                    boxShadow: '0 4px 14px rgba(234,88,12,0.2)'
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Driver will enter this OTP into his handheld device to confirm safe thermal collection.
            </p>
          </div>

          {/* Parent Live Handshake Status */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            background: darkMode ? 'rgba(234,88,12,0.08)' : '#FFF7ED',
            border: darkMode ? '1px solid rgba(234,88,12,0.25)' : '1px solid #FFEDD5',
            padding: '14px 18px', borderRadius: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: '#EA580C',
                boxShadow: '0 0 10px #EA580C', animation: 'pulse 1.8s infinite'
              }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                  Awaiting Driver OTP Verification
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Driver Ramesh Kumar enters this 4-digit code in his driver app to confirm safe collection.
                </div>
              </div>
            </div>

            {/* Discreet Simulation Action for single-screen testing */}
            <button
              type="button"
              onClick={() => handleVerifyPickupHandover(order.pickupOtp || '4821')}
              style={{
                background: darkMode ? '#1F2937' : '#FFFFFF',
                border: '1px solid #EA580C',
                color: '#EA580C',
                borderRadius: 10,
                padding: '7px 14px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Single-device demo shortcut: Simulates driver typing OTP in driver app"
            >
              <Sparkles size={13} /> Demo: Complete Driver Handshake
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: EN ROUTE TO SCHOOL (LIVE ROAD GPS MAP TRACKING) ───── */}
      {['Picked Up', 'On The Way', 'En Route to School', 'Hot & Fresh En Route'].includes(currentStatus) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Road Transit Alert Header */}
          <div style={{
            background: 'linear-gradient(135deg, #059669, #10B981)',
            color: '#FFF', borderRadius: 16, padding: '12px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>
                  Pickup Complete • Tiffin Secured in Insulated Bag
                </div>
                <div style={{ fontSize: '0.76rem', opacity: 0.9 }}>
                  Ramesh Kumar is navigating directly to {school?.name || order.schoolName || 'destination school'} ({order?.distanceKm || 3.5} km corridor).
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => updateOrderStatus(order.id, 'Arrived at School Gate')}
              style={{
                background: '#FFF', color: '#059669', border: 'none', borderRadius: 10,
                padding: '7px 14px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer'
              }}
            >
              Simulate Arrival at School Gate (&lt; 100m)
            </button>
          </div>

          {/* Real Road GPS Map Tracker */}
          <LiveMapTracker
            order={order}
            school={school}
            onComplete={() => updateOrderStatus(order.id, 'Arrived at School Gate')}
          />
        </div>
      )}

      {/* ── STEP 6: ARRIVED AT SCHOOL GATE (< 100m) & GATE OTP HANDSHAKE */}
      {(currentStatus === 'Arrived at School' || currentStatus === 'Arrived at School Gate') && (
        <div className="card-lift" style={{
          background: darkMode ? '#101625' : '#FFFFFF',
          borderRadius: 24, padding: '34px 28px',
          border: '2px solid #EA580C',
          boxShadow: '0 16px 44px rgba(234,88,12,0.18)',
          display: 'flex', flexDirection: 'column', gap: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 4px 16px rgba(234,88,12,0.4)' }}>
              <MapPin size={30} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                  Driver Arrived at School Gate!
                </h3>
                <span style={{ background: '#FFEDD5', color: '#EA580C', fontSize: '0.72rem', fontWeight: 900, padding: '3px 8px', borderRadius: 6 }}>
                  Within 100 Meter Radius
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Ramesh Kumar has halted at {school?.name || order.schoolName || 'DAV School'} Gate 2 Security Desk.
              </div>
            </div>
          </div>

          {/* School Gate OTP Handshake */}
          <div style={{
            background: darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
            border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
            borderRadius: 18, padding: '20px 22px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
              SCHOOL GATE HANDSHAKE OTP
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '12px 0 8px' }}>
              {(order.deliveryOtp || '9042').split('').map((digit, i) => (
                <div 
                  key={i}
                  style={{
                    width: 48, height: 54, borderRadius: 12,
                    background: darkMode ? '#1A2234' : '#FFFFFF',
                    border: '2px solid #10B981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.6rem', fontWeight: 900, color: '#10B981',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                  }}
                >
                  {digit}
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Provided by Gate Security / Staff upon collecting the tiffin for Akash S. (Class 9-B).
            </p>
          </div>

          {/* Parent Live Gate Handshake Status */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            background: darkMode ? 'rgba(16,185,129,0.08)' : '#ECFDF5',
            border: darkMode ? '1px solid rgba(16,185,129,0.25)' : '1px solid #A7F3D0',
            padding: '14px 18px', borderRadius: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: '#10B981',
                boxShadow: '0 0 10px #10B981', animation: 'pulse 1.8s infinite'
              }} />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                  Gate Security Handshake In Progress (&lt; 100m)
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Driver Ramesh Kumar verifies this Gate OTP on his app to confirm delivery and trigger instant wallet settlement.
                </div>
              </div>
            </div>

            {/* Discreet Simulation Action for single-screen testing */}
            <button
              type="button"
              onClick={() => handleVerifyGateDelivery(order.deliveryOtp || '9042')}
              style={{
                background: darkMode ? '#1F2937' : '#FFFFFF',
                border: '1px solid #10B981',
                color: '#10B981',
                borderRadius: 10,
                padding: '7px 14px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
              title="Single-device demo shortcut: Simulates driver verifying Gate OTP on his app"
            >
              <Sparkles size={13} /> Demo: Complete Gate Handshake
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 7: DELIVERED & INSTANT WALLET SETTLEMENT CONFIRMATION ─ */}
      {currentStatus === 'Delivered' && (
        <div className="card-lift" style={{
          background: darkMode ? 'linear-gradient(135deg, #052618 0%, #061A12 100%)' : '#ECFDF5',
          borderRadius: 24, padding: '38px 28px', textAlign: 'center',
          border: '2px solid #10B981',
          boxShadow: '0 16px 44px rgba(16,185,129,0.2)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%', background: '#10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF',
            boxShadow: '0 6px 20px rgba(16,185,129,0.45)'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <div>
            <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.2)', color: '#059669', fontSize: '0.78rem', fontWeight: 900, padding: '4px 14px', borderRadius: 99, marginBottom: 8 }}>
              DELIVERY COMPLETED & WALLET DEDUCTED
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-heading)' }}>
              Tiffin Safely Handed Over at School Gate!
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: darkMode ? '#E2E8F0' : '#475569', maxWidth: 480, lineHeight: 1.55 }}>
              Hot lunchbox safely received by <strong>DAV Gate 2 Reception Office</strong>. Meal fee (₹{parentProfile?.dailyRate || 50}) settled instantly from wallet escrow. Ready for 12:30 PM lunch bell!
            </p>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="btn-saffron card-lift"
            style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 800, fontSize: '0.86rem' }}
          >
            Return to Dashboard Standby
          </button>
        </div>
      )}
    </div>
  );
};
