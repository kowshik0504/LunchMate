import React, { useState, useEffect } from 'react';
import { useAppState } from './context/AppStateContext';
import { Navbar } from './components/Navbar';
import { SplashScreen } from './components/SplashScreen';
import { LandingPage } from './pages/LandingPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { AIChatDrawer } from './components/AIChatDrawer';
import { DriverActiveRide } from './components/DriverActiveRide';
import { CheckCircle2, AlertCircle } from 'lucide-react';

// Error Boundary to prevent any blank white screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("LunchMate ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
          background: '#0F172A', color: '#FFFFFF'
        }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', marginBottom: 16 }}>
            <AlertCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8, color: '#FFFFFF' }}>
            LunchMate Encountered a Display Issue
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', maxWidth: 480, marginBottom: 20 }}>
            {this.state.error?.message || 'A component encountered an issue. Tap below to refresh and resume cleanly.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#EA580C', color: '#FFF', border: 'none',
              borderRadius: 12, padding: '12px 26px', fontWeight: 800,
              fontSize: '0.92rem', cursor: 'pointer'
            }}
          >
            Refresh & Resume App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const StandaloneMapWrapper = ({ orderId }) => {
  const { orders } = useAppState();
  const order = orders.find(o => o.id === orderId);
  if (!order) return <div style={{ padding: 40, color: 'white', background: '#000', height: '100vh' }}>Order closed or not found. You can close this tab.</div>;
  return <DriverActiveRide order={order} onBack={() => window.close()} />;
};

export default function App() {
  const { activeRole, toastNotification, showLogin, closeLogin, intendedRole } = useAppState();
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [standaloneMap, setStandaloneMap] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#driver-map-')) {
      setStandaloneMap(hash.replace('#driver-map-', ''));
      setShowSplash(false); // skip splash for map deep link
    }
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const isDashboard = ['parent', 'driver', 'admin'].includes(activeRole);

  if (standaloneMap) {
    return <StandaloneMapWrapper orderId={standaloneMap} />;
  }

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

        {!showSplash && showLogin && (
          <LoginPage intendedRole={intendedRole} onLoginSuccess={closeLogin} onBack={closeLogin} />
        )}

        {!showSplash && !showLogin && (
          <>
            {toastNotification && (
              <div style={{
                position: 'fixed', bottom: 28, right: 28, zIndex: 99999,
                background: toastNotification.type === 'error' ? '#EF4444' : toastNotification.type === 'info' ? '#3B82F6' : '#15803D',
                color: '#FFF', padding: '16px 24px', borderRadius: 16,
                boxShadow: '0 16px 40px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 12,
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '0.95rem',
                animation: 'slideUp 0.4s var(--ease-spring)'
              }}>
                {toastNotification.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                {toastNotification.message}
              </div>
            )}

            <Navbar onOpenAIChat={() => setIsAIChatOpen(true)} />

            <div style={{ paddingTop: isDashboard ? 80 : 0 }}>
              {activeRole === 'landing' && <LandingPage />}
              {activeRole === 'parent' && <ParentDashboard />}
              {activeRole === 'driver' && <DriverDashboard />}
              {activeRole === 'admin' && <AdminDashboard />}
            </div>

            {isAIChatOpen && <AIChatDrawer isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
