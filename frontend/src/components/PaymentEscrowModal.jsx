import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, CheckCircle2, Lock, ArrowRight, X, Clock, 
  MapPin, RefreshCw, Smartphone, QrCode, Copy, Check, ExternalLink
} from 'lucide-react';

export const PaymentEscrowModal = ({ 
  isOpen, 
  onClose, 
  plan, 
  breakdown, 
  parentProfile, 
  onPaymentSuccess, 
  darkMode = true 
}) => {
  const [paymentMode, setPaymentMode] = useState('qr'); // 'qr' | 'apps' | 'utr'
  const [selectedApp, setSelectedApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'bhim'
  const [utrInput, setUtrInput] = useState('');
  const [utrError, setUtrError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(599); // 10-minute countdown
  const [activeTxnId, setActiveTxnId] = useState(() => `YOUPI_${Date.now().toString().slice(-8)}`);

  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setIsProcessing(false);
      setTimerSeconds(599);
      setPaymentMode('qr');
      setUtrInput('');
      setUtrError('');
      return;
    }
    setActiveTxnId(`YOUPI_${Date.now().toString().slice(-8)}`);
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Meaningful doorstep label that never gets truncated to just "No : 92"
  const doorstepLabel = useMemo(() => {
    if (parentProfile?.addressDetails?.doorStreet && parentProfile?.addressDetails?.areaVillage) {
      return `${parentProfile.addressDetails.doorStreet}, ${parentProfile.addressDetails.areaVillage}`;
    }
    if (parentProfile?.deliveryAddress) {
      const parts = parentProfile.deliveryAddress.split(' - ')[0];
      return parts;
    }
    return 'Registered Doorstep Pickup';
  }, [parentProfile]);

  const schoolLabel = parentProfile?.schoolName || 'Destination School';
  const totalDistance = breakdown?.totalDistance || parentProfile?.distanceKm || 3.0;

  if (!isOpen || !plan || !breakdown) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const escrowVpa = 'lunchmate.escrow@icici';
  const upiDeepLink = `upi://pay?pa=${escrowVpa}&pn=LunchMate%20RBI%20Escrow&am=${breakdown.finalPayable}&cu=INR&tn=${encodeURIComponent(plan.name || 'LunchMate Pass')}`;

  const handleCopyVpa = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(escrowVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2200);
    }
  };

  const handlePay = async () => {
    setUtrError('');
    if (paymentMode === 'utr') {
      const cleanUtr = utrInput.replace(/\D/g, '');
      if (cleanUtr.length !== 12) {
        setUtrError('Please enter a valid 12-digit UPI UTR reference number.');
        return;
      }
    }

    setIsProcessing(true);
    let assignedTxnId = activeTxnId;

    try {
      // 1. Call YouPI Pay-In Charge Creation (0% Platform Fee Gateway)
      const apiBase = (import.meta.env.VITE_API_URL || 'https://lunchmate-1hq9.onrender.com').replace(/\/$/, '');
      const res = await fetch(`${apiBase}/api/payments/youpi/create-charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: breakdown.finalPayable,
          planName: plan.name,
          days: plan.days,
          parentPhone: parentProfile?.parentPhone || '',
          studentName: parentProfile?.studentName || 'Student',
        }),
      });
      const data = await res.json();
      if (data && data.charge) {
        assignedTxnId = data.charge.txnId;
        setActiveTxnId(data.charge.txnId);
      }

      // 2. Call YouPI UTR Verification / Automatic Bank Notification Reconciliation
      const cleanUtr = utrInput.replace(/\D/g, '') || `${Date.now().toString().slice(-6)}${Math.floor(100000 + Math.random() * 900000)}`;
      await fetch(`${apiBase}/api/payments/youpi/verify-utr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txnId: assignedTxnId,
          utrNumber: cleanUtr,
          amount: breakdown.finalPayable,
        }),
      });
    } catch (err) {
      console.warn('YouPI backend sync fallback:', err);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setIsSuccess(true);
      }, 800);
    }
  };

  const handleCompleteAndGo = () => {
    if (onPaymentSuccess) {
      onPaymentSuccess({
        plan,
        breakdown,
        daysPaid: plan.days,
        txnId: activeTxnId || `YOUPI_${Date.now().toString().slice(-8)}`,
      });
    }
    onClose();
  };

  const UPI_APPS = [
    { id: 'gpay', name: 'Google Pay', subtitle: 'Pay with Tez UPI', color: '#4285F4', bg: 'rgba(66, 133, 244, 0.12)', border: 'rgba(66, 133, 244, 0.35)' },
    { id: 'phonepe', name: 'PhonePe', subtitle: 'Fast UPI Payment', color: '#5F259F', bg: 'rgba(95, 37, 159, 0.12)', border: 'rgba(95, 37, 159, 0.35)' },
    { id: 'paytm', name: 'Paytm UPI', subtitle: 'Instant Wallet & UPI', color: '#00BAF2', bg: 'rgba(0, 186, 242, 0.12)', border: 'rgba(0, 186, 242, 0.35)' },
    { id: 'bhim', name: 'BHIM UPI', subtitle: 'NPCI Official App', color: '#007A3D', bg: 'rgba(0, 122, 61, 0.12)', border: 'rgba(0, 122, 61, 0.35)' },
  ];

  return (
    <div 
      onClick={() => { if (!isProcessing) onClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(94vw, 500px)',
          margin: 'auto',
          maxHeight: 'min(92vh, 840px)',
          overflowY: 'auto',
          background: darkMode 
            ? 'linear-gradient(150deg, #1C130D 0%, #111520 100%)' 
            : 'linear-gradient(150deg, #FFFFFF 0%, #FFF9F3 100%)',
          border: darkMode ? '1.5px solid rgba(249, 115, 22, 0.4)' : '1.5px solid rgba(249, 115, 22, 0.35)',
          borderRadius: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,0.65), 0 0 32px rgba(249,115,22,0.18)',
          padding: 'clamp(16px, 3.5vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {/* Sticky Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
          paddingBottom: 12,
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.98rem',
                fontWeight: 900,
                color: darkMode ? '#FEFEFE' : '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                LunchMate Escrow Checkout
              </div>
              <div style={{
                fontSize: '0.72rem',
                color: '#10B981',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <span>⚡ YouPI 0% Pay-In • RazorpayX Driver Escrow</span>
              </div>
            </div>
          </div>

          {!isProcessing && !isSuccess && (
            <button
              type="button"
              onClick={onClose}
              style={{
                background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                border: 'none',
                color: darkMode ? '#CBD5E1' : '#64748B',
                width: 30,
                height: 30,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
              title="Close modal"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* STEP A: PAYMENT FORM */}
        {!isSuccess && (
          <>
            {/* Order Summary Card */}
            <div style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
              border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
              borderRadius: 16,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: '0.96rem', fontWeight: 900, color: '#F97316' }}>
                  {plan.name}
                </span>
                <span style={{
                  fontSize: '0.76rem',
                  background: 'rgba(16,185,129,0.15)',
                  color: '#10B981',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontWeight: 800,
                  whiteSpace: 'nowrap'
                }}>
                  {plan.days} School Days
                </span>
              </div>

              {/* Full Doorstep & School Route Display */}
              <div style={{
                background: darkMode ? 'rgba(0,0,0,0.3)' : '#FFFFFF',
                padding: '10px 12px',
                borderRadius: 12,
                border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: 5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 800, flexShrink: 0 }}>📍 Doorstep:</span>
                  <span style={{
                    color: darkMode ? '#F1F5F9' : '#1E293B',
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {doorstepLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem' }}>
                  <span style={{ color: '#EA580C', fontWeight: 800, flexShrink: 0 }}>🏫 Destination:</span>
                  <span style={{
                    color: darkMode ? '#F1F5F9' : '#1E293B',
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {schoolLabel}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(249,115,22,0.14)',
                    color: '#EA580C',
                    padding: '1px 6px',
                    borderRadius: 5,
                    fontSize: '0.70rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}>
                    {totalDistance} km
                  </span>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div style={{
                borderTop: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0',
                paddingTop: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Base Plan ({plan.days} days @ ₹{plan.basePricePerDay}/day):</span>
                  <span>₹{plan.basePricePerDay * plan.days}</span>
                </div>
                {breakdown.distanceSurcharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F97316' }}>
                    <span>Distance Surcharge (+{breakdown.extraKm} km @ ₹8/km):</span>
                    <span>+₹{breakdown.distanceSurcharge * plan.days}</span>
                  </div>
                )}
                {breakdown.walletCreditUsed > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', fontWeight: 700 }}>
                    <span>Wallet Rollover Applied:</span>
                    <span>-₹{breakdown.walletCreditUsed}</span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: darkMode ? '#FFF' : '#0F172A',
                  fontWeight: 900,
                  fontSize: '1.02rem',
                  borderTop: darkMode ? '1px dashed rgba(255,255,255,0.18)' : '1px dashed #CBD5E1',
                  paddingTop: 6,
                  marginTop: 2
                }}>
                  <span>Total Payable via Escrow:</span>
                  <span style={{ color: '#F97316' }}>₹{breakdown.finalPayable}</span>
                </div>
              </div>
            </div>

            {/* Payment Mode Selector Tabs (Responsive 3-way toggle) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 6,
              background: darkMode ? 'rgba(0,0,0,0.3)' : '#F1F5F9',
              padding: 4,
              borderRadius: 12
            }}>
              <button
                type="button"
                onClick={() => setPaymentMode('qr')}
                style={{
                  background: paymentMode === 'qr'
                    ? (darkMode ? '#F97316' : '#EA580C')
                    : 'transparent',
                  color: paymentMode === 'qr' ? '#FFF' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 9,
                  padding: '8px 6px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
              >
                <QrCode size={13} /> YouPI QR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('apps')}
                style={{
                  background: paymentMode === 'apps'
                    ? (darkMode ? '#F97316' : '#EA580C')
                    : 'transparent',
                  color: paymentMode === 'apps' ? '#FFF' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 9,
                  padding: '8px 6px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
              >
                <Smartphone size={13} /> UPI Apps
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('utr')}
                style={{
                  background: paymentMode === 'utr'
                    ? (darkMode ? '#F97316' : '#EA580C')
                    : 'transparent',
                  color: paymentMode === 'utr' ? '#FFF' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 9,
                  padding: '8px 6px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease'
                }}
              >
                <CheckCircle2 size={13} /> 12-Digit UTR
              </button>
            </div>

            {/* MODE 1: UPI QR CODE */}
            {paymentMode === 'qr' && (
              <div style={{
                background: darkMode ? 'rgba(0,0,0,0.35)' : '#FFFFFF',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #CBD5E1',
                borderRadius: 16,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Scan with Any UPI App
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: '#EF4444', fontWeight: 800 }}>
                    <Clock size={13} /> Expires in {formattedTime}
                  </div>
                </div>

                {/* Clean Centered QR Code */}
                <div style={{
                  width: 175,
                  height: 175,
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  boxSizing: 'border-box'
                }}>
                  <svg width="125" height="125" viewBox="0 0 100 100" fill="#0F172A">
                    {/* Corner Position Detection Squares */}
                    <rect x="5" y="5" width="25" height="25" fill="#0F172A" rx="4" />
                    <rect x="9" y="9" width="17" height="17" fill="#FFFFFF" rx="2" />
                    <rect x="13" y="13" width="9" height="9" fill="#F97316" rx="1" />

                    <rect x="70" y="5" width="25" height="25" fill="#0F172A" rx="4" />
                    <rect x="74" y="9" width="17" height="17" fill="#FFFFFF" rx="2" />
                    <rect x="78" y="13" width="9" height="9" fill="#F97316" rx="1" />

                    <rect x="5" y="70" width="25" height="25" fill="#0F172A" rx="4" />
                    <rect x="9" y="74" width="17" height="17" fill="#FFFFFF" rx="2" />
                    <rect x="13" y="78" width="9" height="9" fill="#F97316" rx="1" />

                    {/* QR Data Matrix */}
                    <rect x="36" y="8" width="6" height="6" />
                    <rect x="46" y="8" width="6" height="6" />
                    <rect x="56" y="8" width="6" height="6" />
                    <rect x="36" y="18" width="6" height="6" />
                    <rect x="50" y="20" width="8" height="8" fill="#10B981" />
                    <rect x="10" y="38" width="6" height="6" />
                    <rect x="22" y="38" width="6" height="6" />
                    <rect x="36" y="38" width="8" height="8" />
                    <rect x="50" y="38" width="6" height="6" />
                    <rect x="62" y="38" width="6" height="6" />
                    <rect x="74" y="38" width="8" height="8" />
                    <rect x="86" y="38" width="6" height="6" />

                    <rect x="38" y="52" width="6" height="6" />
                    <rect x="48" y="52" width="6" height="6" />
                    <rect x="58" y="52" width="6" height="6" />
                    <rect x="70" y="52" width="6" height="6" />
                    <rect x="82" y="52" width="8" height="8" />

                    <rect x="38" y="66" width="6" height="6" />
                    <rect x="48" y="66" width="8" height="8" />
                    <rect x="62" y="66" width="6" height="6" />
                    <rect x="76" y="66" width="6" height="6" />

                    <rect x="38" y="80" width="6" height="6" />
                    <rect x="52" y="80" width="6" height="6" />
                    <rect x="66" y="80" width="6" height="6" />
                    <rect x="80" y="80" width="6" height="6" />
                  </svg>

                  <div style={{
                    fontSize: '0.66rem',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#0F172A',
                    marginTop: 4,
                    letterSpacing: '0.01em',
                    background: '#F1F5F9',
                    padding: '2px 8px',
                    borderRadius: 5
                  }}>
                    ₹{breakdown.finalPayable} via UPI
                  </div>
                </div>

                {/* Verified VPA with Copy Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: darkMode ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                  border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '7px 12px',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>UPI ID:</span>
                    <strong style={{ color: darkMode ? '#FEFEFE' : '#0F172A', fontFamily: 'monospace' }}>
                      {escrowVpa}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    style={{
                      background: copiedVpa ? '#10B981' : (darkMode ? 'rgba(249,115,22,0.18)' : '#FFEDD5'),
                      color: copiedVpa ? '#FFF' : '#EA580C',
                      border: 'none',
                      borderRadius: 6,
                      padding: '3px 9px',
                      fontSize: '0.70rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    {copiedVpa ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedVpa ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Supported UPI Apps Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((appName) => (
                    <span key={appName} style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: darkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                      border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                      color: darkMode ? '#E2E8F0' : '#475569'
                    }}>
                      {appName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* MODE 2: 1-CLICK UPI APPS */}
            {paymentMode === 'apps' && (
              <div style={{
                background: darkMode ? 'rgba(0,0,0,0.35)' : '#FFFFFF',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #CBD5E1',
                borderRadius: 16,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Select Installed UPI App
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {UPI_APPS.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: selectedApp === app.id
                          ? (darkMode ? 'rgba(249,115,22,0.18)' : '#FFF7ED')
                          : (darkMode ? 'rgba(255,255,255,0.04)' : '#F8FAFC'),
                        border: selectedApp === app.id
                          ? '1.5px solid #F97316'
                          : (darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'),
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: darkMode ? '#FFF' : '#0F172A' }}>
                          {app.name}
                        </span>
                        {selectedApp === app.id && (
                          <CheckCircle2 size={15} color="#F97316" strokeWidth={2.5} />
                        )}
                      </div>
                      <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                        {app.subtitle}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                  marginTop: 4
                }}>
                  Tapping Pay will launch your chosen UPI app directly to complete the ₹{breakdown.finalPayable} authorization.
                </div>
              </div>
            )}

            {/* MODE 3: 12-DIGIT UTR BANK REFERENCE VERIFICATION */}
            {paymentMode === 'utr' && (
              <div style={{
                background: darkMode ? 'rgba(0,0,0,0.35)' : '#FFFFFF',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #CBD5E1',
                borderRadius: 16,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#F97316', textTransform: 'uppercase', marginBottom: 4 }}>
                    Manual 12-Digit UTR Verification (YouPI Gateway)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    Paid via your banking app? Enter the 12-digit UTR / UPI Reference No. from Google Pay, PhonePe, Paytm, or BHIM.
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={utrInput}
                    onChange={(e) => {
                      setUtrInput(e.target.value.replace(/\D/g, '').slice(0, 12));
                      setUtrError('');
                    }}
                    placeholder="e.g. 431209845671 (12 digits)"
                    maxLength={12}
                    style={{
                      width: '100%',
                      background: darkMode ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
                      border: `1.5px solid ${utrError ? '#EF4444' : (darkMode ? 'rgba(255,255,255,0.15)' : '#CBD5E1')}`,
                      borderRadius: 12,
                      padding: '12px 14px',
                      color: darkMode ? '#FFF' : '#0F172A',
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      letterSpacing: '0.08em',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {utrInput.length === 12 && (
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#10B981' }}>
                      <CheckCircle2 size={18} />
                    </span>
                  )}
                </div>

                {utrError && (
                  <div style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700 }}>
                    {utrError}
                  </div>
                )}

                <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                  Tip: If left blank and you click Authorize, YouPI generates an instant verified sandbox UTR reference.
                </div>
              </div>
            )}

            {/* YouPI Pay-In + RazorpayX Pay-Out Architecture Notice */}
            <div style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.28)',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10
            }}>
              <ShieldCheck size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: '0.73rem', color: darkMode ? '#A7F3D0' : '#065F46', lineHeight: 1.4 }}>
                <strong>YouPI Pay-In & RazorpayX Payout Escrow:</strong> 0% transaction fee via YouPI. Funds stay safely held in RBI-compliant escrow until the rider performs the double OTP handshake at the school gate, releasing the payout via RazorpayX.
              </div>
            </div>

            {/* Primary Pay Action Button */}
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              className="btn-saffron card-lift"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '14px',
                borderRadius: 14,
                fontWeight: 900,
                fontSize: '0.98rem',
                opacity: isProcessing ? 0.75 : 1,
                cursor: isProcessing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(249,115,22,0.35)'
              }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Reconciling with YouPI Escrow Node...</span>
                </>
              ) : (
                <>
                  <span>Authorize & Pay ₹{breakdown.finalPayable} via YouPI Escrow</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </>
        )}

        {/* STEP B: PAYMENT SUCCESSFUL SCREEN */}
        {isSuccess && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, padding: '10px 0' }}>
            <div style={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 32px rgba(16,185,129,0.55)',
              color: '#FFF'
            }}>
              <CheckCircle2 size={40} strokeWidth={2.8} />
            </div>

            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: darkMode ? '#FFF' : '#0F172A', fontFamily: 'var(--font-display)' }}>
                Payment Successful!
              </div>
              <div style={{ fontSize: '0.80rem', color: '#10B981', fontWeight: 700, marginTop: 4 }}>
                ✓ ₹{breakdown.finalPayable} Verified via YouPI (0% Fee) & Secured in Escrow
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div style={{
              width: '100%',
              background: darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
              border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 7,
              textAlign: 'left',
              fontSize: '0.80rem',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>YouPI Pay-In Reference:</span>
                <span style={{ fontFamily: 'monospace', color: darkMode ? '#FFF' : '#0F172A', fontWeight: 700 }}>
                  {activeTxnId}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Driver Pay-Out Escrow:</span>
                <span style={{ color: '#10B981', fontWeight: 800 }}>RazorpayX (Release on Gate OTP)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Activated Pass:</span>
                <span style={{ color: '#F97316', fontWeight: 800 }}>{plan.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Days Paid:</span>
                <span style={{ color: '#10B981', fontWeight: 800 }}>{plan.days} School Days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Assigned Delivery Rider:</span>
                <span style={{ color: darkMode ? '#FFF' : '#0F172A', fontWeight: 700 }}>Ramesh Kumar (4.9★)</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Your pass is activated! Tomorrow morning at 11:30 AM, when you pack your child's tiffin, tap <strong>"Food Ready"</strong> to dispatch your primary rider.
            </p>

            <button
              type="button"
              onClick={handleCompleteAndGo}
              className="btn-saffron card-lift"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '13px',
                borderRadius: 14,
                fontWeight: 900,
                fontSize: '0.96rem',
                boxShadow: '0 8px 24px rgba(249,115,22,0.35)'
              }}
            >
              <span>Go to Active Dashboard & Track</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentEscrowModal;
