import React, { useState, useEffect } from 'react';
import { useAppState } from './context/AppStateContext';
import { Navbar } from './components/Navbar';
import { AIChatDrawer } from './components/AIChatDrawer';
import { SplashScreen } from './components/SplashScreen';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { DriverActiveRide } from './components/DriverActiveRide';

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

          <Navbar onAIClick={() => setIsAIChatOpen(true)} />

          <div style={{ paddingTop: isDashboard ? 80 : 0 }}>
            {activeRole === 'landing' && <LandingPage />}
            {activeRole === 'parent' && <ParentDashboard />}
            {activeRole === 'driver' && <DriverDashboard />}
            {activeRole === 'admin' && <AdminDashboard />}
          </div>

          <AIChatDrawer isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
        </>
      )}
    </div>
  );
}
