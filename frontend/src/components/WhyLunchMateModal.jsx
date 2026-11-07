import React from 'react';
import { useAppState } from '../context/AppStateContext';
import { 
  ShieldCheck, Radio, Key, Award, Heart, 
  Bike, School, Clock, X, Sparkles, ArrowRight, CheckCircle2
} from 'lucide-react';

export const WhyLunchMateModal = ({ isOpen, onClose, onExplorePlans }) => {
  const { darkMode } = useAppState();

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out',
        overflowY: 'auto',
      }}
    >
      {/* 🌟 Animated Flowing Gradient Border (Zero Simple Borders, Ambient Saffron Aura) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="modal-glow-card"
        style={{
          maxWidth: 860,
          position: 'relative',
        }}
      >
        <div 
          className="modal-inner-content no-scrollbar"
          style={{
            background: darkMode 
              ? 'linear-gradient(145deg, rgba(22, 16, 12, 0.98) 0%, rgba(12, 15, 26, 0.99) 100%)' 
              : 'linear-gradient(145deg, rgba(255, 255, 255, 0.99) 0%, rgba(254, 243, 235, 0.99) 100%)',
            borderRadius: 26,
            padding: '32px 36px',
            position: 'relative',
          }}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
            color: darkMode ? '#FFF' : '#1A120B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.background = '#EA580C'; e.currentTarget.style.color = '#FFF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'; e.currentTarget.style.color = darkMode ? '#FFF' : '#1A120B'; }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ marginBottom: 26 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: 99,
            background: 'rgba(249, 115, 22, 0.14)',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            color: '#F97316',
            fontSize: '0.76rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            <Sparkles size={14} /> Mission & Architecture
          </div>
          <h2 style={{
            margin: '0 0 8px 0',
            fontFamily: 'var(--font-display, "Outfit", sans-serif)',
            fontSize: '1.95rem',
            fontWeight: 800,
            color: darkMode ? '#FFF' : '#1A120B',
            lineHeight: 1.25,
          }}>
            Why LunchMate?
          </h2>
          <p style={{
            margin: 0,
            color: darkMode ? 'rgba(255,255,255,0.72)' : 'rgba(26,18,11,0.72)',
            fontSize: '0.96rem',
            lineHeight: 1.5,
          }}>
            Bridging the emotional distance between a mother’s hot kitchen and the school desk with military-grade safety, guaranteed warm food, and zero morning stress.
          </p>
        </div>

        {/* ─── THE 3 CORE PILLARS (A, B, C) ─── */}
        <div style={{ marginBottom: 30 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
            borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            paddingBottom: 8,
          }}>
            <ShieldCheck size={20} color="#F97316" />
            <h3 style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: '1.18rem',
              fontWeight: 800,
              color: darkMode ? '#F0EBE3' : '#1A120B',
            }}>
              The 3 Architectural Pillars
            </h3>
            <span style={{
              marginLeft: 'auto',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#F97316',
              background: 'rgba(249,115,22,0.1)',
              padding: '2px 8px',
              borderRadius: 6,
            }}>
              15% PLATFORM ESCROW AT WORK
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* PILLAR A */}
            <div style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.85)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(249, 115, 22, 0.15)',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                }}>
                  <Radio size={20} />
                </div>
                <div>
                  <span style={{ color: '#F97316', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em' }}>PILLAR A</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: darkMode ? '#FFF' : '#1A120B' }}>
                    3-Sec GPS Telemetry
                  </h4>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(26,18,11,0.7)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                <li><strong>No frozen map dots:</strong> Satellite coordinates ping every 3 seconds via WebSockets.</li>
                <li><strong>Millimeter accuracy:</strong> Track scooter turns and junction stops live.</li>
                <li><strong>Bell Countdown:</strong> Real-time ETA mapped precisely to your child's lunch bell.</li>
              </ul>
            </div>

            {/* PILLAR B */}
            <div style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.85)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(249, 115, 22, 0.15)',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                }}>
                  <Key size={20} />
                </div>
                <div>
                  <span style={{ color: '#10B981', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em' }}>PILLAR B</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: darkMode ? '#FFF' : '#1A120B' }}>
                    Dual-OTP Handshake
                  </h4>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(26,18,11,0.7)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                <li><strong>Pickup OTP (11:30 AM):</strong> Verified at home doorstep to confirm warm tiffin pickup.</li>
                <li><strong>Delivery OTP (12:15 PM):</strong> School gate security / reception signs off before bell.</li>
                <li><strong>Chain of Custody:</strong> Zero tampering; 100% verified food safety log.</li>
              </ul>
            </div>

            {/* PILLAR C */}
            <div style={{
              background: darkMode ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.85)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(249, 115, 22, 0.15)',
              borderRadius: 20,
              padding: 20,
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <span style={{ color: '#3B82F6', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.06em' }}>PILLAR C</span>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: darkMode ? '#FFF' : '#1A120B' }}>
                    Zero-Hunger & Insurance
                  </h4>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(26,18,11,0.7)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                <li><strong>Zero-Hunger Canteen Protection:</strong> Instant ₹100 school canteen meal voucher if delayed. Child never stays hungry.</li>
                <li><strong>₹5,000 Box Replacement:</strong> Covers Milton, Vaya, Tupperware against transit damage.</li>
                <li><strong>Escrow Vault:</strong> Daily driver release only after OTP verification.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ─── WHO BENEFITS FROM LUNCHMATE? ─── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16,
            borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
            paddingBottom: 8,
          }}>
            <Heart size={20} color="#F97316" />
            <h3 style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: '1.18rem',
              fontWeight: 800,
              color: darkMode ? '#F0EBE3' : '#1A120B',
            }}>
              Who Benefits from the Ecosystem?
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Beneficiary 1: Parents & Kids */}
            <div style={{
              background: darkMode ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 247, 237, 0.9)',
              border: darkMode ? '1.5px solid rgba(249, 115, 22, 0.25)' : '1.5px solid rgba(249, 115, 22, 0.3)',
              borderRadius: 20,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>👩‍👧</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#EA580C' }}>
                    For Parents & Children
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(26,18,11,0.6)' }}>Health & Peace of Mind</span>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: darkMode ? 'rgba(255,255,255,0.78)' : 'rgba(26,18,11,0.78)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                <li>Hot, nutritious food cooked at 11:00 AM instead of cold, soggy food packed at 6:00 AM.</li>
                <li>Zero morning rush for working mothers and fathers.</li>
                <li>100% verified, police-cleared dedicated delivery partners.</li>
              </ul>
            </div>

            {/* Beneficiary 2: Drivers */}
            <div style={{
              background: darkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(240, 253, 244, 0.9)',
              border: darkMode ? '1.5px solid rgba(16, 185, 129, 0.25)' : '1.5px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 20,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>🛵</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#059669' }}>
                    For Delivery Partners
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(26,18,11,0.6)' }}>Predictable Dignity Income</span>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: darkMode ? 'rgba(255,255,255,0.78)' : 'rgba(26,18,11,0.78)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                <li>Fair 85% revenue payout per drop (₹35–₹50 per tiffin).</li>
                <li>Guaranteed ₹7,000+/month morning income during idle off-peak hours (11:00 AM–12:30 PM).</li>
                <li>Route volume bonuses and milestone rewards.</li>
              </ul>
            </div>

            {/* Beneficiary 3: Schools */}
            <div style={{
              background: darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(239, 246, 255, 0.9)',
              border: darkMode ? '1.5px solid rgba(59, 130, 246, 0.25)' : '1.5px solid rgba(59, 130, 246, 0.3)',
              borderRadius: 20,
              padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>🏫</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#2563EB' }}>
                    For Partner Schools
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(26,18,11,0.6)' }}>Campus Safety & Protocol</span>
                </div>
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: darkMode ? 'rgba(255,255,255,0.78)' : 'rgba(26,18,11,0.78)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                <li>Zero gate chaos—no unknown food delivery riders crowding school boundaries.</li>
                <li>Authorized uniform drivers with photo ID badges and digital entry codes.</li>
                <li>Orderly pre-sorted delivery directly to classroom lunch bins before the bell.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          paddingTop: 18,
          borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
        }}>
          <div style={{ color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(26,18,11,0.6)', fontSize: '0.82rem' }}>
            🔒 100% Escrow Protected • Zero Waste Rollover Guarantee
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.15)',
                color: darkMode ? '#FFF' : '#1A120B',
                padding: '10px 20px',
                borderRadius: 14,
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onExplorePlans) onExplorePlans();
              }}
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                border: 'none',
                color: '#FFF',
                padding: '10px 24px',
                borderRadius: 14,
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
              }}
            >
              Explore Distance Passes <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
