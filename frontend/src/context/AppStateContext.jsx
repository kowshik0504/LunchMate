import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialDrivers, initialOrders } from '../data/mockData';
import { getDistrictResidentialHub } from '../data/tnSchoolsData';

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  // Always open in the Landing Page format on startup or reload
  const [activeRole, setActiveRole] = useState('landing');
  
  const [showLogin, setShowLogin] = useState(false);
  const [intendedRole, setIntendedRole] = useState('parent');
  
  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem('lm-drivers');
    return saved ? JSON.parse(saved) : initialDrivers;
  });
  
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('lm-orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(o => ({
          ...o,
          distanceKm: (typeof o.distanceKm === 'number' && o.distanceKm > 3.5) ? 3.2 : (Number(o.distanceKm) || 3.2)
        }));
      }
      return initialOrders;
    } catch (e) {
      return initialOrders;
    }
  });
  
  const [activeDriverId, setActiveDriverId] = useState('DRV-101');
  const [toastNotification, setToastNotification] = useState(null);

  // Dynamic Parent Profile (parent name, student, school, lunch time, subscription, distance, wallet, GPS & address)
  const [parentProfile, setParentProfile] = useState(() => {
    const defaultAddressDetails = {
      doorStreet: '',
      areaVillage: '',
      city: 'Chengalpattu',
      pincode: '603202',
      coordinates: { lat: 12.8594, lng: 80.0617 },
      accuracy: 10,
      detectedLocality: 'Guduvancherry, Chengalpattu',
    };

    const defaultProfile = {
      parentName: 'Parent',
      studentName: '',
      studentDob: '',
      studentClass: '',
      schoolName: '',
      lunchTime: '12:30 PM',
      subscriptionPlan: null, // Fresh default: Unsubscribed until pass is chosen
      isSubscriptionPaid: false,
      subscriptionStatus: 'inactive',
      showOnboardingTour: true,
      deliveryAddress: '',
      addressDetails: defaultAddressDetails,
      homeCoordinates: { lat: 12.8594, lng: 80.0617 },
      distanceKm: 2.9,
      walletBalance: 0,
      passRemainingDays: 0,
      rollNo: 1,
      receptionGate: 'Gate 2 Staff / Security Office',
    };

    try {
      const saved = localStorage.getItem('lm-parent-profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        const schoolName = parsed.schoolName || defaultProfile.schoolName;
        const schoolDistrict = parsed.schoolDistrict || parsed.addressDetails?.schoolDistrict || 
          (schoolName.toLowerCase().includes('chengalpattu') ? 'Chengalpattu' : 'Chennai');
        
        let homeCoords = parsed.homeCoordinates || parsed.addressDetails?.coordinates || defaultAddressDetails.coordinates;
        let addressDetails = parsed.addressDetails || defaultAddressDetails;
        let deliveryAddress = parsed.deliveryAddress || defaultProfile.deliveryAddress;
        let distanceKm = Number(parsed.distanceKm) || 3.5;

        // Accurate road distance preservation
        if (parsed.parentName === 'Meenakshi Sundaram') {
          parsed.parentName = 'Parent';
        }

        return {
          ...defaultProfile,
          ...parsed,
          schoolDistrict,
          addressDetails,
          homeCoordinates: homeCoords,
          deliveryAddress,
          distanceKm
        };
      }
      return defaultProfile;
    } catch (e) {
      return defaultProfile;
    }
  });

  const [showWhyModal, setShowWhyModal] = useState(false);
  const openWhyModal = () => setShowWhyModal(true);
  const closeWhyModal = () => setShowWhyModal(false);

  const updateParentProfile = (newDetails) => {
    setParentProfile(prev => {
      const updated = { ...prev, ...newDetails };
      try {
        localStorage.setItem('lm-parent-profile', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Clean up any stale role persistence so fresh page visits always land on the home landing page
  useEffect(() => {
    try {
      localStorage.removeItem('lm-activeRole');
    } catch (e) {}
  }, []);

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
    const rawDist = Number(orderData.distanceKm) || 3.2;
    const finalDist = rawDist > 3.5 ? 3.2 : Math.max(1.0, rawDist);
    const newOrder = {
      id: "LUNCH-" + Math.floor(1000 + Math.random() * 9000),
      parentId: "PAR-123",
      driverId: null,
      status: "Notified to Driver",
      pickupOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      paymentStatus: orderData.paymentMode === 'emergency' ? 'Escrow Secured' : 'Monthly Pre-paid',
      ...orderData,
      distanceKm: finalDist
    };
    setOrders(prev => [...prev, newOrder]);
    showToast("Food is ready! Notified to driver.", "success");
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

  // Custom School Admin Verification & Registry Management
  const [pendingSchools, setPendingSchools] = useState(() => {
    try {
      const saved = localStorage.getItem('lm-pending-schools');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'sch-sub-1',
        name: 'Neelan Matriculation Higher Secondary School',
        district: 'Chengalpattu',
        board: 'Matriculation',
        area: 'Guduvanchery',
        lat: 12.8594,
        lng: 80.0617,
        mapsLink: 'https://www.google.com/maps/search/?api=1&query=Neelan+Matriculation+Higher+Secondary+School+Guduvanchery+Chengalpattu',
        submittedBy: 'Parent (Akash S.)',
        studentName: 'Akash S.',
        studentClass: 'Class 9-B',
        submittedAt: 'Today, 11:30 AM',
        status: 'pending'
      }
    ];
  });

  const [approvedSchools, setApprovedSchools] = useState(() => {
    try {
      const saved = localStorage.getItem('lm-approved-schools');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const submitCustomSchool = (schoolData) => {
    if (!schoolData || !schoolData.name) return null;
    const newSubmission = {
      id: 'sch-sub-' + Date.now(),
      name: schoolData.name.trim(),
      district: schoolData.district || 'Chengalpattu',
      board: schoolData.board || 'Matriculation',
      area: schoolData.area || schoolData.district || 'Local Area',
      lat: Number(schoolData.lat) || 12.8594,
      lng: Number(schoolData.lng) || 80.0617,
      mapsLink: schoolData.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(schoolData.name + ' ' + (schoolData.district || ''))}`,
      submittedBy: schoolData.parentName || parentProfile?.parentName || 'Parent',
      studentName: schoolData.studentName || parentProfile?.studentName || 'Student',
      studentClass: schoolData.studentClass || parentProfile?.studentClass || 'Class 6-A',
      submittedAt: 'Just now',
      status: 'pending'
    };

    setPendingSchools(prev => {
      const updated = [newSubmission, ...prev.filter(s => s.name.toLowerCase() !== newSubmission.name.toLowerCase())];
      try { localStorage.setItem('lm-pending-schools', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });

    showToast(`🏫 Custom school "${schoolData.name}" submitted for Admin verification!`, 'success');
    return newSubmission;
  };

  const approveCustomSchool = (schoolId) => {
    const school = pendingSchools.find(s => s.id === schoolId);
    if (!school) return;

    const approvedItem = {
      ...school,
      status: 'approved',
      approvedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    const newApproved = [approvedItem, ...approvedSchools.filter(s => s.id !== schoolId && s.name.toLowerCase() !== school.name.toLowerCase())];
    const newPending = pendingSchools.filter(s => s.id !== schoolId);

    setApprovedSchools(newApproved);
    setPendingSchools(newPending);

    try {
      localStorage.setItem('lm-approved-schools', JSON.stringify(newApproved));
      localStorage.setItem('lm-pending-schools', JSON.stringify(newPending));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    showToast(`✓ "${school.name}" approved & added to the ${school.district} (${school.board}) School Registry!`, 'success');
  };

  const rejectCustomSchool = (schoolId, reason = 'Could not verify school gate entrance') => {
    const school = pendingSchools.find(s => s.id === schoolId);
    const newPending = pendingSchools.filter(s => s.id !== schoolId);
    setPendingSchools(newPending);
    try {
      localStorage.setItem('lm-pending-schools', JSON.stringify(newPending));
    } catch (e) {}
    showToast(`School submission rejected: ${reason}`, 'error');
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
      pendingSchools,
      approvedSchools,
      submitCustomSchool,
      approveCustomSchool,
      rejectCustomSchool,
      toastNotification,
      showToast,
      parentProfile,
      updateParentProfile,
      darkMode,
      toggleDarkMode,
      showWhyModal,
      openWhyModal,
      closeWhyModal,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
