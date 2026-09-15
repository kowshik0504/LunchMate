import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialDrivers, initialOrders } from '../data/mockData';

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('lm-activeRole') || 'landing';
  });
  
  const [showLogin, setShowLogin] = useState(false);
  const [intendedRole, setIntendedRole] = useState('parent');
  
  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem('lm-drivers');
    return saved ? JSON.parse(saved) : initialDrivers;
  });
  
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('lm-orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });
  
  const [activeDriverId, setActiveDriverId] = useState('DRV-101');
  const [toastNotification, setToastNotification] = useState(null);

  // Sync state across tabs and local storage
  useEffect(() => {
    localStorage.setItem('lm-activeRole', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('lm-drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('lm-orders', JSON.stringify(orders));
  }, [orders]);

  // Listen for cross-tab changes
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'lm-orders' && e.newValue) setOrders(JSON.parse(e.newValue));
      if (e.key === 'lm-drivers' && e.newValue) setDrivers(JSON.parse(e.newValue));
      if (e.key === 'lm-activeRole' && e.newValue) setActiveRole(e.newValue);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('lunchmate-theme-v2');
      return saved !== null ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lunchmate-theme-v2', JSON.stringify(darkMode));
    } catch (e) {}
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      if (document.body) document.body.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
      if (document.body) document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const openLogin = (role = 'parent') => {
    setIntendedRole(role);
    setShowLogin(true);
  };

  const closeLogin = () => {
    setShowLogin(false);
  };

  const logout = () => {
    setActiveRole('landing');
    window.location.hash = '';
    showToast('Logged out successfully', 'success');
  };

  const showToast = (message, type = 'info') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  const createOrder = (orderData) => {
    const newOrder = {
      id: "LUNCH-" + Math.floor(1000 + Math.random() * 9000),
      parentId: "PAR-123",
      driverId: null,
      status: "Food Ready",
      pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      paymentStatus: orderData.paymentMode === 'emergency' ? 'Advance Paid' : 'Fully Paid',
      ...orderData
    };
    setOrders(prev => [...prev, newOrder]);
    showToast("Food is ready! Notifying drivers nearby...", "success");
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord));
  };

  const updatePaymentStatus = (orderId, newPaymentStatus) => {
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, paymentStatus: newPaymentStatus } : ord));
  };

  const acceptOrder = (orderId, driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          driverId: driverId,
          driverName: driver ? driver.name : "Ramesh Kumar",
          status: "Driver Assigned"
        };
      }
      return ord;
    }));
    showToast("Order " + orderId + " accepted! Navigate to pickup.", "info");
  };

  const verifyPickupOtp = (orderId, otp) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      showToast("Order not found!", "error");
      return false;
    }
    if (order.pickupOtp !== otp) {
      showToast("Invalid Pickup OTP. Please check and try again.", "error");
      return false;
    }
    showToast("Pickup OTP Verified successfully!", "success");
    return true;
  };

  const verifyDeliveryOtp = (orderId, otp) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    if (order.deliveryOtp !== otp) {
      showToast("Invalid Delivery OTP. Please try again.", "error");
      return false;
    }
    return true;
  };

  const verifyDriverStatus = (driverId) => {
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) return { ...d, status: 'Verified' };
      return d;
    }));
    showToast("Driver ID " + driverId + " successfully verified!", "success");
  };

  const [escalatedChats, setEscalatedChats] = useState([]);
  const escalateChatToAdmin = (chatData) => {
    setEscalatedChats(prev => [...prev, chatData]);
  };
  const resolveEscalatedChat = (chatId) => {
    setEscalatedChats(prev => prev.filter(c => c.id !== chatId));
  };

  return (
    <AppStateContext.Provider value={{
      activeRole,
      setActiveRole,
      showLogin,
      intendedRole,
      openLogin,
      closeLogin,
      logout,
      drivers,
      orders,
      activeDriverId,
      setActiveDriverId,
      createOrder,
      updateOrderStatus,
      updatePaymentStatus,
      acceptOrder,
      verifyPickupOtp,
      verifyDeliveryOtp,
      verifyDriverStatus,
      escalatedChats,
      escalateChatToAdmin,
      resolveEscalatedChat,
      toastNotification,
      showToast,
      darkMode,
      toggleDarkMode,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
