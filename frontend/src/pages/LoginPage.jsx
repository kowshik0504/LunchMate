import React, { useState, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import { 
  User, Truck, ShieldCheck, Eye, EyeOff, ArrowRight, ArrowLeft, 
  Sparkles, Lock, Phone, Sun, Moon, CheckCircle2, Star, Clock, UserCheck,
  Calendar, MapPin, RefreshCw, Home, Compass
} from 'lucide-react';
import { getSchoolCoordinates, calculateHaversineRoadDistance } from './ParentDashboard';
import { TNSchoolSelector } from '../components/TNSchoolSelector';
import logoIcon from '../assets/logo_icon.jpg';

// 🌟 Official Brand SVGs for 1-Click Social Sign In & Sign Up
const GoogleIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
  </svg>
);

const GitHubIcon = ({ size = 18, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color || "currentColor"} style={{ flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const LinkedInIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#0A66C2" style={{ flexShrink: 0 }}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

// 📸 100% Offline Real Photography from the "Landing page photos" folder
import photo1 from '../assets/Landing page photos/photo1_indian_feast.jpg';
import photo3 from '../assets/Landing page photos/photo3_dining_spread.jpg';
import photo4 from '../assets/Landing page photos/photo4_curry_spread.jpg';

const SLIDES = [
  {
    id: 'photo1',
    src: photo1,
    title: 'Authentic Indian Feast',
  },
  {
    id: 'photo3',
    src: photo3,
    title: 'Home Kitchen Spread',
  },
  {
    id: 'photo4',
    src: photo4,
    title: 'Delicious Curry Spread',
  },
];

const ROLES = [
  {
    id: 'parent',
    label: 'Parent',
    tagline: 'Track Lunch',
    portalTitle: 'Parent Portal',
    icon: User,
    color: '#F97316',
    glow: 'rgba(249,115,22,0.4)',
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.4)',
    gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    credentials: { phone: '', password: '' },
  },
  {
    id: 'driver',
    label: 'Driver',
    tagline: 'Deliver & Earn',
    portalTitle: 'Driver Portal',
    icon: Truck,
    color: '#0D9488',
    glow: 'rgba(13,148,136,0.4)',
    bg: 'rgba(13,148,136,0.12)',
    border: 'rgba(13,148,136,0.4)',
    gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
    credentials: { phone: '9123456780', password: 'driver123' },
  },
  {
    id: 'admin',
    label: 'Admin',
    tagline: 'Control Room',
    portalTitle: 'Admin Master Panel',
    icon: ShieldCheck,
    color: '#D97706',
    glow: 'rgba(217,119,6,0.4)',
    bg: 'rgba(217,119,6,0.12)',
    border: 'rgba(217,119,6,0.4)',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    credentials: { phone: '9000000001', password: 'admin123' },
  },
];

const GRADE_OPTIONS = [
  'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12'
];

const SECTION_OPTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2',
  'Other / Custom'
];

export const LoginPage = ({ intendedRole: propIntendedRole, onLoginSuccess, onBack }) => {
  const { setActiveRole, intendedRole: contextIntendedRole, closeLogin, showToast, updateParentProfile, submitCustomSchool } = useAppState();
  const darkMode = true; // Mandatory dark mode for login page
  const effectiveIntendedRole = propIntendedRole || contextIntendedRole || 'parent';
  
  const initialRole = ROLES.find(r => r.id === effectiveIntendedRole) || ROLES[0];
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentInitial, setStudentInitial] = useState('');
  const [studentDob, setStudentDob] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [customSection, setCustomSection] = useState('');
  const [schoolDistrict, setSchoolDistrict] = useState('Chennai');
  const [schoolName, setSchoolName] = useState('');
  const [schoolMapsLink, setSchoolMapsLink] = useState('');
  const [schoolCoords, setSchoolCoords] = useState(null);
  const [lunchTime, setLunchTime] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotHelp, setShowForgotHelp] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lm-registered-accounts') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'github' | 'linkedin' | null

  // 🛰️ Real-Time Device GPS & Structured Doorstep Pickup Address (First-Time Parent Setup)
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'locating' | 'success' | 'fallback'
  const [gpsAccuracy, setGpsAccuracy] = useState(12);
  const [homeCoords, setHomeCoords] = useState({ lat: 13.0827, lng: 80.2707 });
  const [detectedLocality, setDetectedLocality] = useState('');
  const [homeStreet, setHomeStreet] = useState('');
  const [homeVillage, setHomeVillage] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [homePincode, setHomePincode] = useState('');

  // Interactive Auto-masking DOB handler (DD-MM-YYYY format with dynamic typing & backspace)
  const handleDobChange = (e) => {
    const rawVal = e.target.value;
    const isDeleting = rawVal.length < studentDob.length;
    const digits = rawVal.replace(/\D/g, '').slice(0, 8);

    if (isDeleting) {
      let formatted = '';
      if (digits.length <= 2) {
        formatted = digits;
      } else if (digits.length <= 4) {
        formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
      } else {
        formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
      }
      setStudentDob(formatted);
      return;
    }

    let formatted = '';
    if (digits.length < 2) {
      formatted = digits;
    } else if (digits.length === 2) {
      formatted = `${digits}-`;
    } else if (digits.length < 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
    } else if (digits.length === 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-`;
    } else {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
    }
    setStudentDob(formatted);
  };

  const handleDobKeyDown = (e) => {
    if (e.key === 'Backspace' && studentDob.endsWith('-')) {
      e.preventDefault();
      const digits = studentDob.replace(/\D/g, '').slice(0, -1);
      if (digits.length <= 2) {
        setStudentDob(digits);
      } else if (digits.length <= 4) {
        setStudentDob(`${digits.slice(0, 2)}-${digits.slice(2)}`);
      } else {
        setStudentDob(`${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`);
      }
    }
  };

  const validateDob = (dobStr) => {
    if (!dobStr || dobStr.length !== 10) return false;
    const parts = dobStr.split('-');
    if (parts.length !== 3) return false;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    const currentYear = new Date().getFullYear();
    if (year < 1995 || year > currentYear - 3) return false;
    return true;
  };

  const fetchLiveParentGps = () => {
    setGpsStatus('locating');
    if (!navigator.geolocation) {
      setGpsStatus('fallback');
      setHomeCoords({ lat: 13.0827, lng: 80.2707 });
      setDetectedLocality('Central Chennai (Device Network Pin)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 12);
        setHomeCoords({ lat, lng });
        setGpsAccuracy(acc);
        setGpsStatus('success');

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const a = data.address;
              const street = [a.house_number, a.road].filter(Boolean).join(' ');
              const villageArea = a.neighbourhood || a.suburb || a.village || a.city_district || 'Anna Nagar East';
              const city = a.city || a.town || a.county || 'Chennai';
              const postcode = a.postcode || '600102';

              const place = [
                a.road || a.pedestrian || a.suburb,
                villageArea,
                city
              ].filter(Boolean).join(', ');

              const resolved = place || data.display_name?.split(',').slice(0, 3).join(', ') || `Live GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
              setDetectedLocality(resolved);
              if (villageArea) setHomeVillage(villageArea);
              if (city) setHomeCity(city);
              if (postcode) setHomePincode(postcode.replace(/\D/g, '').slice(0, 6));
              if (street && !homeStreet) setHomeStreet(street);
            } else {
              setDetectedLocality(`Live GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
            }
          })
          .catch(() => {
            setDetectedLocality(`Live GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`);
          });
      },
      (err) => {
        console.warn('Parent GPS detection error:', err);
        setGpsStatus('fallback');
        setHomeCoords({ lat: 13.0827, lng: 80.2707 });
        setDetectedLocality('Central Chennai / Anna Nagar (Fallback Pin)');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const setQuickPin = (lat, lng, locName, village, pincode = '600017') => {
    setHomeCoords({ lat, lng });
    setDetectedLocality(locName);
    setHomeVillage(village);
    setHomePincode(pincode);
    setGpsStatus('success');
  };

  // 🎬 Automatic background slideshow timer (5.5s per real photo)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Sync role when intendedRole changes
  useEffect(() => {
    const matched = ROLES.find(r => r.id === effectiveIntendedRole);
    if (matched) {
      setSelectedRole(matched);
      setError('');
    }
  }, [effectiveIntendedRole]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setPhone('');
    setPassword('');
    setName('');
  };

  const cleanIndianPhone = (raw) => {
    let digits = (raw || '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits.slice(0, 10);
  };

  const fillDemoCreds = () => {
    if (selectedRole.id === 'parent') return;
    setPhone(selectedRole.credentials.phone);
    setPassword(selectedRole.credentials.password);
    setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const cleanPhone = cleanIndianPhone(phone);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      let users = [];
      try {
        users = JSON.parse(localStorage.getItem('lm-registered-accounts') || '[]');
      } catch (err) {}

      if (selectedRole.id === 'parent') {
        const matchedAccount = users.find(u => cleanIndianPhone(u.phone) === cleanPhone);
        if (matchedAccount) {
          matchedAccount.password = password.trim();
          localStorage.setItem('lm-registered-accounts', JSON.stringify(users));
          if (matchedAccount.profile) {
            updateParentProfile(matchedAccount.profile);
          }
          setActiveRole('parent');
          showToast(`Welcome back, ${matchedAccount.name || 'Parent'}! Signed in successfully.`, "success");
          window.location.hash = (matchedAccount.profile?.subscriptionPlan && matchedAccount.profile?.passRemainingDays > 0) ? 'orders' : 'subscription';
        } else {
          const newProfile = {
            parentName: 'Parent',
            parentPhone: cleanPhone,
            studentName: '',
            studentDob: '',
            studentClass: '',
            schoolName: '',
            lunchTime: '12:30 PM',
            subscriptionPlan: null,
            showOnboardingTour: true,
            deliveryAddress: '',
            addressDetails: null,
            homeCoordinates: { lat: 12.8594, lng: 80.0617 },
            distanceKm: 2.9,
            walletBalance: 0,
            passRemainingDays: 0,
            rollNo: Math.floor(Math.random() * 35) + 1,
            receptionGate: 'Gate 2 Staff / Security Office',
          };
          const newAccount = {
            name: 'Parent',
            phone: cleanPhone,
            password: password.trim(),
            role: 'parent',
            profile: newProfile,
          };
          users.push(newAccount);
          localStorage.setItem('lm-registered-accounts', JSON.stringify(users));
          updateParentProfile(newProfile);
          setActiveRole('parent');
          showToast(`Welcome to LunchMate! Parent account activated for +91 ${cleanPhone}.`, "success");
          window.location.hash = 'subscription';
        }
        if (onLoginSuccess) onLoginSuccess();
        else closeLogin();
        setLoading(false);
        return;
      }

      const creds = selectedRole.credentials;
      const matchedAccount = users.find(u => cleanIndianPhone(u.phone) === cleanPhone && u.password === password.trim());
      if ((creds.phone && cleanPhone === creds.phone && password.trim() === creds.password) || matchedAccount || (cleanPhone.length === 10 && password.length >= 4)) {
        setActiveRole(selectedRole.id);
        showToast(`Welcome back to ${selectedRole.portalTitle}! Signed in as ${selectedRole.label}.`, "success");
        if (onLoginSuccess) onLoginSuccess();
        else closeLogin();
      } else {
        setError('Invalid phone or password. Use demo credentials or create an account via Sign Up!');
      }
      setLoading(false);
    }, 500);
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    const cleanPhone = cleanIndianPhone(phone);
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    let newProfile = null;
    if (selectedRole.id === 'parent') {
      const effectiveStudentName = studentName.trim() || 'Student';
      const effectiveInitial = studentInitial.trim() ? studentInitial.trim().toUpperCase() : '';
      const fullStudentName = effectiveInitial ? `${effectiveStudentName} ${effectiveInitial}` : effectiveStudentName;
      const finalGrade = selectedGrade || 'Class 6';
      const finalSection = selectedSection === 'Other / Custom' ? (customSection.trim().toUpperCase() || 'A') : (selectedSection || 'A');
      const fullClass = `${finalGrade}-${finalSection}`;
      const effectiveDob = studentDob.trim() || '14-08-2012';
      const effectiveSchool = schoolName.trim() || 'Neelan Matriculation Higher Secondary School';
      const effectiveLunchTime = lunchTime || '12:30 PM';
      const effectiveStreet = homeStreet.trim() || 'Doorstep Delivery Location';
      const effectiveVillage = homeVillage.trim() || detectedLocality || 'Guduvancherry';
      const effectiveCity = homeCity.trim() || 'Chengalpattu';
      const effectivePincode = homePincode.trim().length === 6 ? homePincode.trim() : '603202';
      const formattedAddress = `${effectiveStreet}, ${effectiveVillage}, ${effectiveCity} - ${effectivePincode}`;

      // Calculate driving distance between parent's exact home pin and the school destination
      const finalSchoolCoords = schoolCoords || getSchoolCoordinates(effectiveSchool, schoolDistrict) || { lat: 12.8594, lng: 80.0617 };
      const calculatedDistance = calculateHaversineRoadDistance(homeCoords.lat, homeCoords.lng, finalSchoolCoords.lat, finalSchoolCoords.lng) || 2.9;
      const finalSchoolMapsLink = schoolMapsLink || finalSchoolCoords.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(effectiveSchool + ', ' + schoolDistrict + ', Tamil Nadu')}`;

      newProfile = {
        parentName: name.trim(),
        parentPhone: cleanPhone,
        studentName: fullStudentName,
        studentDob: effectiveDob,
        studentClass: fullClass,
        schoolName: effectiveSchool,
        schoolCoordinates: finalSchoolCoords,
        schoolMapsLink: finalSchoolMapsLink,
        lunchTime: effectiveLunchTime,
        subscriptionPlan: null,
        showOnboardingTour: true,
        isFirstTimeParent: true,
        deliveryAddress: formattedAddress,
        addressDetails: {
          doorStreet: effectiveStreet,
          areaVillage: effectiveVillage,
          city: effectiveCity,
          pincode: effectivePincode,
          coordinates: homeCoords,
          accuracy: gpsAccuracy,
          detectedLocality: detectedLocality || effectiveVillage,
          schoolDistrict: schoolDistrict,
        },
        homeCoordinates: homeCoords,
        schoolDistrict: schoolDistrict,
        isPermanentGpsVerified: false,
        distanceKm: calculatedDistance,
        walletBalance: 0,
        passRemainingDays: 0,
        rollNo: Math.floor(Math.random() * 35) + 1,
        receptionGate: 'Gate 2 Staff / Security Office',
      };

      updateParentProfile(newProfile);

      if (effectiveSchool && typeof submitCustomSchool === 'function') {
        submitCustomSchool({
          name: effectiveSchool,
          district: schoolDistrict,
          mapsLink: finalSchoolMapsLink,
          lat: finalSchoolCoords?.lat,
          lng: finalSchoolCoords?.lng,
          parentName: name.trim(),
          studentName: effectiveStudentName,
          studentClass: fullClass,
        });
      }
    }

    try {
      const existing = JSON.parse(localStorage.getItem('lm-registered-accounts') || '[]');
      const updated = [
        ...existing.filter(u => cleanIndianPhone(u.phone) !== cleanPhone),
        {
          name: name.trim(),
          phone: cleanPhone,
          password: password.trim(),
          role: selectedRole.id,
          profile: newProfile,
        }
      ];
      localStorage.setItem('lm-registered-accounts', JSON.stringify(updated));
    } catch (err) {}

    setLoading(true);
    setTimeout(() => {
      if (selectedRole.id === 'parent') {
        window.location.hash = 'subscription';
      }
      setActiveRole(selectedRole.id);
      showToast(`Welcome, ${name.trim()}! Registered for ${studentName ? studentName.trim() : 'LunchMate'} at ${schoolName || 'our service'}.`, "success");
      if (onLoginSuccess) onLoginSuccess();
      else closeLogin();
      setLoading(false);
    }, 700);
  };

  // ⚡ 1-Click Social Sign In & Sign Up (Instantly onboard first-time users as well)
  const handleSocialAuth = (provider) => {
    setError('');
    setSocialLoading(provider);
    const providerMeta = {
      google: { name: 'Google', demoName: 'Priya Sharma (Google Verified)' },
      github: { name: 'GitHub', demoName: 'Rohan Verma (GitHub Dev)' },
      linkedin: { name: 'LinkedIn', demoName: 'Ananya Rao (LinkedIn Pro)' },
    };
    const meta = providerMeta[provider] || { name: provider, demoName: 'User' };
    
    setTimeout(() => {
      setActiveRole(selectedRole.id);
      const isNew = authMode === 'signup' || Math.random() > 0.3; // simulate first-time or returning
      showToast(
        isNew
          ? `🎉 Instant 1-Click Sign Up Verified! Welcome via ${meta.name} as ${selectedRole.label}.`
          : `✨ Signed in via ${meta.name} as ${selectedRole.label}.`,
        "success"
      );
      if (onLoginSuccess) onLoginSuccess();
      else closeLogin();
      setSocialLoading(null);
    }, 750);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else closeLogin();
  };

  const role = selectedRole;

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(12px, 3vw, 28px)',
      boxSizing: 'border-box',
      fontFamily: 'var(--font-body)',
      background: '#070A12',
    }}>

      {/* ─────────────────────────────────────────────────────────────
          1. FULLSCREEN ANIMATED BACKGROUND SLIDESHOW (OFFLINE REAL PHOTOS)
      ───────────────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
        {SLIDES.map((slide, index) => {
          const isActive = currentSlide === index;
          return (
            <div
              key={slide.id}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${slide.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: isActive ? 1 : 0,
                transform: isActive ? 'scale(1.04)' : 'scale(1)',
                transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 6s cubic-bezier(0.25, 1, 0.5, 1)',
                // 100% Sharp & clear - ZERO blur
              }}
            />
          );
        })}

        {/* Neutral Cinematic Vignette Overlay — lets white glass pop cleanly */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: darkMode
            ? 'radial-gradient(ellipse at center, rgba(18, 12, 6, 0.28) 0%, rgba(10, 6, 3, 0.62) 100%)'
            : 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.26) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Ambient Pulsing Glow Blob: Only subtle in dark mode; disabled in light mode to keep crystal glass pure */}
        {darkMode && (
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 550,
            height: 550,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${role.glow} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: 0.45,
            pointerEvents: 'none',
            transition: 'background 0.8s ease',
          }} />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN LUXURY GLASS LOGIN CARD (EXPANDS TO 820px IN SIGNUP MODE)
      ───────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        maxWidth: authMode === 'signup' ? 'min(94vw, 820px)' : 'min(94vw, 500px)',
        margin: authMode === 'signup' ? '16px auto' : '24px auto',
        background: darkMode
          ? 'linear-gradient(145deg, rgba(18, 12, 8, 0.84) 0%, rgba(10, 7, 5, 0.90) 100%)'
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.70) 100%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: darkMode
          ? '1.5px solid rgba(255, 220, 180, 0.22)'
          : '1.5px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 28,
        padding: authMode === 'signup' ? 'clamp(20px, 4vw, 36px)' : 'clamp(20px, 4vw, 34px)',
        boxShadow: darkMode
          ? '0 32px 90px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25), inset 0 -1px 1px rgba(0, 0, 0, 0.4)'
          : '0 24px 80px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.4)',
        transition: 'max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s ease, margin 0.35s ease',
      }}>

        {/* Top Action Row: Back Button + Role Tag + Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.85)',
              border: darkMode ? '1px solid rgba(255,255,255,0.16)' : '1.5px solid rgba(255,255,255,0.75)',
              borderRadius: 14,
              padding: '7px 14px',
              color: darkMode ? '#FEFEFE' : '#0F172A',
              fontSize: '0.8rem',
              fontWeight: 800,
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backdropFilter: 'blur(10px)',
              boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04), inset 0 1px 1px #FFFFFF',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = role.color;
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.85)';
              e.currentTarget.style.color = darkMode ? '#FEFEFE' : '#0F172A';
            }}
          >
            <ArrowLeft size={14} /> Back to Home
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: role.bg,
              border: `1px solid ${role.border}`,
              color: role.color,
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '5px 12px',
              borderRadius: 20,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: role.color, display: 'inline-block' }} />
              {role.portalTitle}
            </span>
          </div>
        </div>

        {/* Center Logo & Brand Identity — Crystal Frosted Glass Plate */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 20,
          background: darkMode
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.70) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: darkMode
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1.5px solid rgba(255, 255, 255, 0.90)',
          borderRadius: 24,
          padding: '18px 24px 16px',
          boxShadow: darkMode
            ? '0 8px 24px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.1)'
            : '0 8px 24px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.9)',
        }}>
          <div style={{
            position: 'relative',
            width: 68, height: 68,
            borderRadius: 20,
            background: '#FFFFFF',
            padding: 4,
            border: `2.5px solid ${role.color}`,
            boxShadow: `0 12px 32px ${role.glow}, 0 2px 8px rgba(0,0,0,0.15)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 10,
          }}>
            <img
              src={logoIcon}
              alt="LunchMate Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 14 }}
            />
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.85rem', fontWeight: 800,
            color: darkMode ? '#FEFEFE' : '#0F172A',
            letterSpacing: '-0.02em',
            display: 'flex', alignItems: 'center', gap: 2,
            lineHeight: 1,
          }}>
            Lunch<span style={{ color: role.color, transition: 'color 0.3s ease' }}>Mate</span>
          </div>
          <p style={{
            color: darkMode ? 'rgba(255,255,255,0.75)' : '#0F172A',
            fontSize: '0.86rem', marginTop: 6, fontWeight: 700,
            textAlign: 'center',
          }}>
            {authMode === 'signin' ? (
              <>Sign in to access your <strong style={{ color: role.color }}>{role.label}</strong> dashboard</>
            ) : (
              <>Create your <strong style={{ color: role.color }}>{role.label}</strong> account in seconds</>
            )}
          </p>
        </div>

        {/* Role Selector Tabs (Parent / Driver / Admin) */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = selectedRole.id === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  style={{
                    background: isActive
                      ? (darkMode ? r.bg : 'rgba(255, 255, 255, 0.85)')
                      : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.55)'),
                    border: isActive
                      ? `2px solid ${r.color}`
                      : (darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.85)'),
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderRadius: 18,
                    padding: '12px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isActive
                      ? `0 8px 24px ${r.glow}, inset 0 1px 1px #FFFFFF`
                      : (darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.6)'),
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: isActive ? r.gradient : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isActive ? '#FFFFFF' : (darkMode ? 'rgba(255,255,255,0.6)' : '#334155'),
                    boxShadow: isActive ? `0 4px 12px ${r.glow}` : 'none',
                    transition: 'all 0.25s ease',
                  }}>
                    <Icon size={17} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      color: isActive ? (darkMode ? '#FEFEFE' : '#0F172A') : (darkMode ? 'rgba(255,255,255,0.7)' : '#0F172A'),
                      fontSize: '0.82rem', fontWeight: 800,
                    }}>
                      {r.label}
                    </div>
                    <div style={{
                      color: isActive ? r.color : (darkMode ? 'rgba(255,255,255,0.45)' : '#475569'),
                      fontSize: '0.64rem', fontWeight: 700, marginTop: 1,
                    }}>
                      {r.tagline}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sign In vs Sign Up Tab Switcher ── */}
        <div style={{
          display: 'flex',
          background: darkMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.75)',
          padding: 4,
          borderRadius: 16,
          marginBottom: 18,
          border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(255,255,255,0.90)',
        }}>
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setError(''); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 12,
              border: 'none',
              background: authMode === 'signin'
                ? (darkMode ? role.bg : '#FFFFFF')
                : 'transparent',
              color: authMode === 'signin'
                ? (darkMode ? '#FEFEFE' : '#0F172A')
                : (darkMode ? 'rgba(255,255,255,0.6)' : '#475569'),
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: authMode === 'signin'
                ? (darkMode ? `0 2px 8px ${role.glow}` : '0 2px 8px rgba(0,0,0,0.08)')
                : 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setError(''); setPhone(''); setPassword(''); }}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 12,
              border: 'none',
              background: authMode === 'signup'
                ? (darkMode ? role.bg : '#FFFFFF')
                : 'transparent',
              color: authMode === 'signup'
                ? (darkMode ? '#FEFEFE' : '#0F172A')
                : (darkMode ? 'rgba(255,255,255,0.6)' : '#475569'),
              fontWeight: 800,
              fontSize: '0.84rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: authMode === 'signup'
                ? (darkMode ? `0 2px 8px ${role.glow}` : '0 2px 8px rgba(0,0,0,0.08)')
                : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={13} color={role.color} /> Sign Up (New User)
          </button>
        </div>

        {/* Login / Sign Up Form */}
        <form onSubmit={authMode === 'signin' ? handleLogin : handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* Full Name & Mobile Number Row (Side-by-side in expanded 820px sign-up mode) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: authMode === 'signup' ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
            gap: 14,
          }}>
            {/* Full Name (Sign Up only) */}
            {authMode === 'signup' && (
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: darkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.75)',
                  borderRadius: 8, padding: '3px 10px', marginBottom: 7,
                  boxShadow: darkMode ? 'none' : '0 2px 6px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF',
                }}>
                  <span style={{
                    color: darkMode ? '#F0EBE3' : '#0F172A',
                    fontSize: '0.72rem', fontWeight: 800,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    fontFamily: 'var(--font-ui)',
                  }}>
                    {selectedRole.id === 'parent' ? 'Parent Full Name' : 'Full Name'}
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                    color: darkMode ? 'rgba(255,255,255,0.5)' : '#475569',
                    zIndex: 1,
                  }}>
                    <UserCheck size={16} />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole.id === 'parent' ? "e.g. Priya Sharma (Parent / Guardian)" : "e.g. Priya Sharma"}
                    required
                    style={{
                      width: '100%',
                      background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.75)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: `1.5px solid ${darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(255, 255, 255, 0.85)'}`,
                      borderRadius: 14,
                      padding: '14px 16px 14px 46px',
                      color: darkMode ? '#FFFFFF' : '#0F172A',
                      fontSize: '1rem', fontWeight: 700,
                      fontFamily: 'var(--font-ui)',
                      outline: 'none',
                      boxShadow: darkMode ? 'inset 0 1px 3px rgba(0,0,0,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.03), 0 2px 10px rgba(0,0,0,0.02), inset 0 1px 1px #FFFFFF',
                      transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = role.color;
                      e.target.style.boxShadow = `0 0 0 3px ${role.bg}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(255, 255, 255, 0.85)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Mobile Number */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: darkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.75)',
                borderRadius: 8, padding: '3px 10px', marginBottom: 7,
                boxShadow: darkMode ? 'none' : '0 2px 6px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF',
              }}>
                <span style={{
                  color: darkMode ? '#F0EBE3' : '#0F172A',
                  fontSize: '0.72rem', fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontFamily: 'var(--font-ui)',
                }}>
                  {authMode === 'signin' ? 'Registered Mobile Number' : 'Mobile Number'}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#EA580C',
                  fontSize: '0.86rem', fontWeight: 900,
                  background: darkMode ? 'rgba(249,115,22,0.22)' : 'rgba(255, 255, 255, 0.95)',
                  border: darkMode ? '1px solid rgba(249,115,22,0.4)' : '1.5px solid rgba(234, 88, 12, 0.5)',
                  padding: '3px 8px', borderRadius: 6,
                  boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                  zIndex: 1,
                }}>
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(cleanIndianPhone(e.target.value))}
                  placeholder={selectedRole.id === 'parent' ? "Enter 10-digit mobile number" : (role.credentials.phone || "Enter mobile number")}
                  required
                  style={{
                    width: '100%',
                    background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: `1.5px solid ${error ? '#EF4444' : (darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(255, 255, 255, 0.85)')}`,
                    borderRadius: 14,
                    padding: '14px 16px 14px 64px',
                    color: darkMode ? '#FFFFFF' : '#0F172A',
                    fontSize: '1rem', fontWeight: 800,
                    fontFamily: 'var(--font-ui)',
                    outline: 'none',
                    letterSpacing: '0.04em',
                    boxShadow: darkMode ? 'inset 0 1px 3px rgba(0,0,0,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.03), 0 2px 10px rgba(0,0,0,0.02), inset 0 1px 1px #FFFFFF',
                    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = role.color;
                    e.target.style.boxShadow = `0 0 0 3px ${role.bg}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(255, 255, 255, 0.85)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: darkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.75)',
              borderRadius: 8, padding: '3px 10px', marginBottom: 7,
              boxShadow: darkMode ? 'none' : '0 2px 6px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF',
            }}>
              <span style={{
                color: darkMode ? '#F0EBE3' : '#0F172A',
                fontSize: '0.72rem', fontWeight: 800,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                fontFamily: 'var(--font-ui)',
              }}>
                {authMode === 'signup' ? 'Create Password' : 'Password'}
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                color: darkMode ? 'rgba(255,255,255,0.5)' : '#475569',
                zIndex: 1,
              }}>
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authMode === 'signup' ? 'Min 4 characters' : '••••••••••••'}
                required
                style={{
                  width: '100%',
                  background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `1.5px solid ${error ? '#EF4444' : (darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(255, 255, 255, 0.85)')}`,
                  borderRadius: 14,
                  padding: '14px 48px 14px 46px',
                  color: darkMode ? '#FFFFFF' : '#0F172A',
                  fontSize: '1rem', fontWeight: 700,
                  fontFamily: 'var(--font-ui)',
                  outline: 'none',
                  boxShadow: darkMode ? 'inset 0 1px 3px rgba(0,0,0,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.03), 0 2px 10px rgba(0,0,0,0.02), inset 0 1px 1px #FFFFFF',
                  transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = role.color;
                  e.target.style.boxShadow = `0 0 0 3px ${role.bg}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.18)' : 'rgba(255, 255, 255, 0.85)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: darkMode ? 'rgba(255,255,255,0.5)' : '#475569',
                  padding: 4,
                  zIndex: 1,
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Forgot Password / Credential Helper (Driver & Admin Demo Assistance) */}
            {authMode === 'signin' && selectedRole.id !== 'parent' && (
              <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotHelp(!showForgotHelp)}
                  style={{
                    background: 'none', border: 'none', color: '#F97316',
                    cursor: 'pointer', fontWeight: 800, textDecoration: 'underline', padding: 0
                  }}
                >
                  Forgot Password? Reveal Login
                </button>
                <button
                  type="button"
                  onClick={fillDemoCreds}
                  style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', fontWeight: 700, padding: 0
                  }}
                >
                  ⚡ Auto-Fill
                </button>
              </div>
            )}

            {showForgotHelp && authMode === 'signin' && selectedRole.id !== 'parent' && (
              <div style={{
                marginTop: 10,
                background: 'rgba(249,115,22,0.12)',
                border: '1px solid rgba(249,115,22,0.35)',
                borderRadius: 12,
                padding: '12px 14px',
                fontSize: '0.78rem',
                color: '#FFF',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                <div style={{ fontWeight: 800, color: '#F97316', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🔑</span> System Login Credentials:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Phone:</span>
                  <strong style={{ color: '#FFF', fontFamily: 'monospace' }}>{role.credentials.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>Password:</span>
                  <strong style={{ color: '#10B981', fontFamily: 'monospace' }}>{role.credentials.password}</strong>
                </div>

                {savedAccounts.length > 0 && (
                  <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
                    <div style={{ color: '#CBD5E1', fontSize: '0.70rem', marginBottom: 4 }}>Accounts created on this browser:</div>
                    {savedAccounts.map((acc, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                        <span style={{ fontSize: '0.72rem' }}>{acc.phone}: <strong style={{ color: '#F59E0B' }}>{acc.password}</strong> ({acc.name})</span>
                        <button
                          type="button"
                          onClick={() => { setPhone(acc.phone); setPassword(acc.password); setShowForgotHelp(false); }}
                          style={{
                            background: '#F97316', color: '#FFF', border: 'none', borderRadius: 4,
                            padding: '2px 7px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer'
                          }}
                        >
                          Fill
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { fillDemoCreds(); setShowForgotHelp(false); }}
                  style={{
                    marginTop: 6,
                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ One-Click Fill ({role.credentials.phone} / {role.credentials.password})
                </button>
              </div>
            )}
          </div>

          {/* 🎒 MANDATORY CHILD & SCHOOL DETAILS (Parent First-Time Sign Up Only) */}
          {selectedRole.id === 'parent' && authMode === 'signup' && (
            <div style={{
              background: 'rgba(249, 115, 22, 0.08)',
              border: '1.5px solid rgba(249, 115, 22, 0.28)',
              borderRadius: 16,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: '1px solid rgba(249,115,22,0.2)',
                paddingBottom: 8,
              }}>
                <span style={{ fontSize: '1.1rem' }}>🎒</span>
                <div>
                  <div style={{ color: '#F97316', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Mandatory Child & School Details
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
                    Needed once so our driver delivers safely to the right school desk
                  </div>
                </div>
              </div>

              {/* Student First Name & Initial */}
              <div style={{ display: 'grid', gridTemplateColumns: '2.4fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    Student First Name *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Akash"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(255,255,255,0.18)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      color: '#FFF',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    Initial *
                  </label>
                  <input
                    type="text"
                    value={studentInitial}
                    onChange={(e) => setStudentInitial(e.target.value.toUpperCase().slice(0, 4))}
                    placeholder="e.g. S."
                    maxLength={4}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(255,255,255,0.18)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      color: '#FFF',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Date of Birth (DOB) - Interactive Direct-Typing with Auto-Masking DD-MM-YYYY */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Date of Birth (DOB) *
                  </label>
                  <span style={{ color: '#F97316', fontSize: '0.68rem', fontWeight: 700, fontFamily: 'monospace' }}>
                    FORMAT: DD-MM-YYYY
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    color: '#F97316', zIndex: 1, display: 'flex', alignItems: 'center'
                  }}>
                    <Calendar size={16} />
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={studentDob}
                    onChange={handleDobChange}
                    onKeyDown={handleDobKeyDown}
                    placeholder="DD-MM-YYYY (e.g. 14-08-2011)"
                    maxLength={10}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(255,255,255,0.18)',
                      borderRadius: 12,
                      padding: '12px 14px 12px 42px',
                      color: '#FFF',
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      letterSpacing: '0.08em',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#F97316';
                      e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.18)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>ℹ️</span> Type day and month numbers — hyphens (-) are inserted automatically
                </div>
              </div>

              {/* Class / Grade & Section Dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    Grade / Standard *
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1A120B',
                      border: '1.5px solid rgba(255,255,255,0.18)',
                      borderRadius: 12,
                      padding: '11px 12px',
                      color: selectedGrade ? '#FFF' : 'rgba(255,255,255,0.45)',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled style={{ color: 'rgba(255,255,255,0.45)', background: '#1A120B' }}>
                      Select Grade / Standard (e.g. Class 9)
                    </option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g} style={{ color: '#FFF', background: '#1A120B' }}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    Section (e.g. B, A1) *
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#1A120B',
                      border: '1.5px solid rgba(255,255,255,0.18)',
                      borderRadius: 12,
                      padding: '11px 12px',
                      color: selectedSection ? '#F97316' : 'rgba(255,255,255,0.45)',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="" disabled style={{ color: 'rgba(255,255,255,0.45)', background: '#1A120B' }}>
                      Select Section (e.g. Sec B, A1)
                    </option>
                    {SECTION_OPTIONS.map((sec) => (
                      <option key={sec} value={sec} style={{ color: '#FFF', background: '#1A120B' }}>
                        {sec === 'Other / Custom' ? '✏️ Other / Custom' : `Sec ${sec}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Custom Section Input */}
              {selectedSection === 'Other / Custom' && (
                <div>
                  <label style={{ display: 'block', color: '#F97316', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    Type Your Custom Section Name *
                  </label>
                  <input
                    type="text"
                    value={customSection}
                    onChange={(e) => setCustomSection(e.target.value.toUpperCase())}
                    placeholder="e.g. C3, Rose, Diamond"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(249,115,22,0.1)',
                      border: '1.5px solid rgba(249,115,22,0.4)',
                      borderRadius: 12,
                      padding: '11px 14px',
                      color: '#FFF',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* School Destination (Tamil Nadu 2026 District First + School Dropdown) */}
              <TNSchoolSelector
                selectedDistrict={schoolDistrict}
                onDistrictChange={setSchoolDistrict}
                selectedSchool={schoolName}
                selectedSchoolMapsLink={schoolMapsLink}
                onSchoolChange={(name, coords, mapsLink) => {
                  setSchoolName(name);
                  if (coords) setSchoolCoords(coords);
                  if (mapsLink) setSchoolMapsLink(mapsLink);
                }}
                darkMode={true}
                showNote={true}
              />

              {/* Target Lunch Bell Time */}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                  Lunch Bell Time *
                </label>
                <select
                  value={lunchTime}
                  onChange={(e) => setLunchTime(e.target.value)}
                  style={{
                    width: '100%',
                    height: 42,
                    boxSizing: 'border-box',
                    background: '#1A120B',
                    border: '1.5px solid rgba(255,255,255,0.18)',
                    borderRadius: 12,
                    padding: '0 12px',
                    color: lunchTime ? '#F97316' : 'rgba(255,255,255,0.45)',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" disabled style={{ color: 'rgba(255,255,255,0.45)', background: '#1A120B' }}>
                    Select Lunch Bell Time (e.g. 12:30 PM)
                  </option>
                  <option value="12:00 PM" style={{ color: '#FFF', background: '#1A120B' }}>12:00 PM</option>
                  <option value="12:15 PM" style={{ color: '#FFF', background: '#1A120B' }}>12:15 PM</option>
                  <option value="12:30 PM" style={{ color: '#FFF', background: '#1A120B' }}>12:30 PM</option>
                  <option value="12:45 PM" style={{ color: '#FFF', background: '#1A120B' }}>12:45 PM</option>
                  <option value="1:00 PM" style={{ color: '#FFF', background: '#1A120B' }}>1:00 PM</option>
                  <option value="1:15 PM" style={{ color: '#FFF', background: '#1A120B' }}>1:15 PM</option>
                </select>
              </div>

              {/* 🏡 PARENT HOME LOCATION GPS & STRUCTURED ADDRESS (First-Time Registration) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1.5px solid rgba(249, 115, 22, 0.35)',
                borderRadius: 14,
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      width: 9, height: 9, borderRadius: '50%',
                      background: gpsStatus === 'locating' ? '#F59E0B' : (gpsStatus === 'success' ? '#10B981' : '#94A3B8'),
                      boxShadow: gpsStatus === 'locating' ? '0 0 8px #F59E0B' : (gpsStatus === 'success' ? '0 0 8px #10B981' : 'none'),
                      display: 'inline-block',
                      animation: gpsStatus === 'locating' ? 'pulse 1s infinite' : 'none'
                    }} />
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: '#FFF', letterSpacing: '0.04em' }}>
                      {gpsStatus === 'locating' ? '🛰️ Acquiring Real-Time Satellite GPS...' : (gpsStatus === 'success' ? '🟢 Live Device GPS Position Acquired' : '📍 Live Device GPS Position')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: gpsStatus === 'success' ? '#10B981' : '#F97316', background: gpsStatus === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)', padding: '2px 7px', borderRadius: 6 }}>
                    {gpsStatus === 'success' ? `Accuracy ±${gpsAccuracy}m` : 'GPS Ready'}
                  </span>
                </div>

                {/* Detected Coordinates Box */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', fontWeight: 800, textTransform: 'uppercase' }}>
                      Detected Coordinates:
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#F97316', fontWeight: 800, fontFamily: 'monospace' }}>
                      {homeCoords.lat.toFixed(4)}° N, {homeCoords.lng.toFixed(4)}° E
                    </span>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFF' }}>
                    📍 {detectedLocality || 'Click "Fetch My GPS" or type doorstep address below'}
                  </div>
                </div>

                {/* Refresh GPS Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8 }}>
                  <button
                    type="button"
                    onClick={fetchLiveParentGps}
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      color: '#FFF', border: 'none',
                      padding: '7px 13px', borderRadius: 8,
                      fontSize: '0.74rem', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: '0 3px 10px rgba(249,115,22,0.3)'
                    }}
                  >
                    <RefreshCw size={12} className={gpsStatus === 'locating' ? 'spin' : ''} />
                    <span>Fetch / Refresh My GPS</span>
                  </button>
                </div>

                {/* Structured Address Box */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  <div>
                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.85)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      Door No, Building Floor or Landmark (For Rider Pickup) *
                    </label>
                    <input
                      type="text"
                      value={homeStreet}
                      onChange={(e) => setHomeStreet(e.target.value)}
                      placeholder="e.g. No. 14, 2nd Cross Street, Orchid Villa"
                      required
                      style={{
                        width: '100%',
                        height: 42,
                        boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1.5px solid rgba(255,255,255,0.18)',
                        borderRadius: 10,
                        padding: '0 12px',
                        color: '#FFF',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.68rem', fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        marginBottom: 6, height: 20, whiteSpace: 'nowrap'
                      }} title="Area / Locality / Village">
                        Area / Locality *
                      </label>
                      <input
                        type="text"
                        value={homeVillage}
                        onChange={(e) => setHomeVillage(e.target.value)}
                        placeholder="e.g. Anna Nagar East, Velachery, Tambaram"
                        required
                        style={{
                          width: '100%',
                          height: 42,
                          boxSizing: 'border-box',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1.5px solid rgba(255,255,255,0.18)',
                          borderRadius: 10,
                          padding: '0 10px',
                          color: '#FFF',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.68rem', fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        marginBottom: 6, height: 20, whiteSpace: 'nowrap'
                      }}>
                        City *
                      </label>
                      <input
                        type="text"
                        value={homeCity}
                        onChange={(e) => setHomeCity(e.target.value)}
                        placeholder="e.g. Chennai, Coimbatore, Chengalpattu"
                        required
                        style={{
                          width: '100%',
                          height: 42,
                          boxSizing: 'border-box',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1.5px solid rgba(255,255,255,0.18)',
                          borderRadius: 10,
                          padding: '0 10px',
                          color: '#FFF',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.68rem', fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        marginBottom: 6, height: 20, whiteSpace: 'nowrap'
                      }}>
                        Pincode *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={homePincode}
                        onChange={(e) => setHomePincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g. 600102"
                        maxLength={6}
                        required
                        style={{
                          width: '100%',
                          height: 42,
                          boxSizing: 'border-box',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1.5px solid rgba(255,255,255,0.18)',
                          borderRadius: 10,
                          padding: '0 10px',
                          color: '#F97316',
                          fontSize: '0.86rem',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ⚠️ Strict Security Disclaimer Banner */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.14)',
                border: '1.5px solid rgba(239, 68, 68, 0.38)',
                borderRadius: 12,
                padding: '11px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: '1.15rem', marginTop: 1, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ color: '#EF4444', fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Important Disclaimer: Fixed Identity Record
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.72rem', lineHeight: 1.45, marginTop: 3 }}>
                    Student Name, Initial, and Date of Birth (DOB) are permanent identity records used for gate security and child verification. <strong>Please double-check spelling and date — these CANNOT be changed again after registration.</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: darkMode ? 'rgba(239,68,68,0.2)' : '#FEE2E2',
              border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 12, padding: '10px 14px',
              color: '#EF4444', fontSize: '0.82rem',
              fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* One-Click Auto-Fill Demo Credentials (Sign In Only) */}
          {authMode === 'signin' && role.id !== 'parent' && (
            <div
              onClick={fillDemoCreds}
              style={{
                background: darkMode ? role.bg : 'rgba(255, 255, 255, 0.32)',
                border: `1.5px dashed ${darkMode ? role.border : role.color}`,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 14, padding: '11px 16px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF',
              }}
              title="Click to auto-fill valid login credentials"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: role.color, fontWeight: 900, fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    Demo Creds:
                  </span>
                  <span style={{ color: darkMode ? '#FEFEFE' : '#0F172A', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 800 }}>
                    {role.credentials.phone} • {role.credentials.password}
                  </span>
                </div>
              </div>
              <span style={{
                background: role.gradient,
                color: '#FFFFFF',
                fontSize: '0.72rem', fontWeight: 800,
                padding: '5px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 5,
                boxShadow: `0 4px 12px ${role.glow}`,
              }}>
                <Sparkles size={11} /> Auto Fill
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || socialLoading !== null}
            style={{
              width: '100%',
              background: loading ? 'rgba(255,255,255,0.2)' : role.gradient,
              border: 'none',
              borderRadius: 16,
              padding: '16px',
              color: '#FFFFFF',
              fontSize: '1.02rem',
              fontWeight: 800,
              fontFamily: 'var(--font-ui)',
              cursor: (loading || socialLoading !== null) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: loading ? 'none' : `0 12px 36px ${role.glow}, inset 0 1px 1px rgba(255,255,255,0.3)`,
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              marginTop: 4,
            }}
            onMouseEnter={(e) => {
              if (!loading && socialLoading === null) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 16px 42px ${role.glow}`;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = loading ? 'none' : `0 12px 36px ${role.glow}`;
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: 'inline-block', width: 18, height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#FFFFFF', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                {authMode === 'signin' ? `Signing into ${role.label} Portal...` : `Creating ${role.label} Account...`}
              </>
            ) : (
              <>
                {authMode === 'signin' ? `Sign In to ${role.portalTitle}` : `Create ${role.label} Account`} <ArrowRight size={17} />
              </>
            )}
          </button>

          {/* ── Divider: Or Login / Sign Up with Social ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: '8px 0 2px',
          }}>
            <div style={{ flex: 1, height: 1, background: darkMode ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)' }} />
            <span style={{
              color: darkMode ? 'rgba(255,255,255,0.7)' : '#334155',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Or {authMode === 'signin' ? 'Login' : 'Sign Up'} with
            </span>
            <div style={{ flex: 1, height: 1, background: darkMode ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)' }} />
          </div>

          {/* ── 1-Click Social Apps Grid: Google, GitHub, LinkedIn ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialAuth('google')}
              disabled={socialLoading !== null || loading}
              title={`${authMode === 'signin' ? 'Sign In' : 'Sign Up'} instantly with Google`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '11px 10px',
                background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.16)' : '1.5px solid rgba(255, 255, 255, 0.85)',
                borderRadius: 14,
                cursor: (socialLoading || loading) ? 'wait' : 'pointer',
                color: darkMode ? '#FEFEFE' : '#0F172A',
                fontSize: '0.82rem',
                fontWeight: 800,
                fontFamily: 'var(--font-ui)',
                boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!socialLoading && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(66, 133, 244, 0.25)';
                  e.currentTarget.style.borderColor = '#4285F4';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF';
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)';
              }}
            >
              {socialLoading === 'google' ? (
                <span style={{ width: 16, height: 16, border: '2px solid #4285F4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <>
                  <GoogleIcon size={17} />
                  <span>Google</span>
                </>
              )}
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleSocialAuth('github')}
              disabled={socialLoading !== null || loading}
              title={`${authMode === 'signin' ? 'Sign In' : 'Sign Up'} instantly with GitHub`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '11px 10px',
                background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.16)' : '1.5px solid rgba(255, 255, 255, 0.85)',
                borderRadius: 14,
                cursor: (socialLoading || loading) ? 'wait' : 'pointer',
                color: darkMode ? '#FEFEFE' : '#0F172A',
                fontSize: '0.82rem',
                fontWeight: 800,
                fontFamily: 'var(--font-ui)',
                boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!socialLoading && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = darkMode ? '#FFFFFF' : '#181717';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF';
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)';
              }}
            >
              {socialLoading === 'github' ? (
                <span style={{ width: 16, height: 16, border: '2px solid #24292E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <>
                  <GitHubIcon size={17} color={darkMode ? '#FFFFFF' : '#181717'} />
                  <span>GitHub</span>
                </>
              )}
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleSocialAuth('linkedin')}
              disabled={socialLoading !== null || loading}
              title={`${authMode === 'signin' ? 'Sign In' : 'Sign Up'} instantly with LinkedIn`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '11px 10px',
                background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.16)' : '1.5px solid rgba(255, 255, 255, 0.85)',
                borderRadius: 14,
                cursor: (socialLoading || loading) ? 'wait' : 'pointer',
                color: darkMode ? '#FEFEFE' : '#0F172A',
                fontSize: '0.82rem',
                fontWeight: 800,
                fontFamily: 'var(--font-ui)',
                boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!socialLoading && !loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(10, 102, 194, 0.25)';
                  e.currentTarget.style.borderColor = '#0A66C2';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF';
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)';
              }}
            >
              {socialLoading === 'linkedin' ? (
                <span style={{ width: 16, height: 16, border: '2px solid #0A66C2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <>
                  <LinkedInIcon size={17} />
                  <span>LinkedIn</span>
                </>
              )}
            </button>
          </div>

          {/* First-Time User Instant Verification Note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.85)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
            borderRadius: 10,
            padding: '6px 12px',
          }}>
            <span style={{ fontSize: '0.74rem' }}>⚡</span>
            <span style={{
              color: darkMode ? 'rgba(255,255,255,0.75)' : '#334155',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}>
              First-time user? 1-Click instant sign up & auto-verification supported!
            </span>
          </div>

          {/* Prominent Action Card: Dedicated Sign Up / Sign In Button at Bottom */}
          <div style={{
            marginTop: 4,
            padding: '12px 16px',
            background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.45)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid rgba(255, 255, 255, 0.85)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            backdropFilter: 'blur(10px)',
            boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03), inset 0 1px 1px #FFFFFF',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                color: darkMode ? '#FEFEFE' : '#0F172A',
                fontSize: '0.84rem',
                fontWeight: 800,
              }}>
                {authMode === 'signin' ? 'New user on LunchMate?' : 'Already have an account?'}
              </div>
              <div style={{
                color: darkMode ? 'rgba(255,255,255,0.65)' : '#475569',
                fontSize: '0.74rem',
                fontWeight: 600,
                marginTop: 2,
              }}>
                {authMode === 'signin' ? 'Create a free account in 30 seconds' : 'Sign in with your phone & password'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              style={{
                background: authMode === 'signin' ? role.gradient : (darkMode ? 'rgba(255,255,255,0.12)' : '#FFFFFF'),
                color: authMode === 'signin' ? '#FFFFFF' : (darkMode ? '#FEFEFE' : '#0F172A'),
                border: authMode === 'signin' ? 'none' : `1.5px solid ${darkMode ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.15)'}`,
                borderRadius: 12,
                padding: '10px 18px',
                fontSize: '0.84rem',
                fontWeight: 800,
                fontFamily: 'var(--font-ui)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: authMode === 'signin' ? `0 6px 18px ${role.glow}` : '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              {authMode === 'signin' ? (
                <>
                  <Sparkles size={14} /> Sign Up Now
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* ─────────────────────────────────────────────────────────────
            4. TRUST & SECURITY STRIP: 100% REAL FOOD • ENCRYPTED • VERIFIED
        ───────────────────────────────────────────────────────────── */}
        <div style={{
          marginTop: 20,
          paddingTop: 16,
          borderTop: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(255,255,255,0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          {/* Main 100% Real Food Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: darkMode ? 'rgba(249,115,22,0.18)' : 'rgba(255, 255, 255, 0.90)',
            border: darkMode ? '1.5px solid rgba(249,115,22,0.45)' : '1.5px solid #EA580C',
            borderRadius: 22,
            padding: '6px 18px',
            boxShadow: darkMode ? '0 4px 14px rgba(249,115,22,0.15)' : '0 4px 16px rgba(234, 88, 12, 0.16), inset 0 1px 1px #FFFFFF',
          }}>
            <span style={{ fontSize: '0.9rem' }}>🍱</span>
            <span style={{
              color: '#EA580C',
              fontSize: '0.78rem',
              fontWeight: 900,
              letterSpacing: '0.07em',
              textTransform: 'uppercase'
            }}>
              100% Real Home Food
            </span>
          </div>

          {/* Security & Verification Credentials Frosted Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: darkMode ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.70)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1.5px solid rgba(255,255,255,0.85)',
            borderRadius: 14,
            padding: '9px 16px',
            boxShadow: darkMode ? 'none' : '0 2px 10px rgba(0,0,0,0.04), inset 0 1px 1px #FFFFFF',
            color: darkMode ? '#F1F5F9' : '#0F172A',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-ui)',
            fontWeight: 800,
            width: '100%',
            flexWrap: 'wrap',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <Lock size={13} color="#059669" strokeWidth={2.6} /> 256-Bit Encrypted
            </span>
            <span style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <ShieldCheck size={14} color="#059669" strokeWidth={2.6} /> Verified Delivery Partners
            </span>
            <span style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <Clock size={13} color="#EA580C" strokeWidth={2.6} /> Double OTP
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
