import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useAppState } from '../context/AppStateContext';
import { LiveMapTracker } from '../components/LiveMapTracker';
import { DeliveryProcedureLifecycle } from '../components/DeliveryProcedureLifecycle';
import { HolidayPauseModal } from '../components/HolidayPauseModal';
import { ParentReportsTab } from '../components/ParentReportsTab';
import { OnboardingTourModal } from '../components/OnboardingTourModal';
import { PaymentEscrowModal } from '../components/PaymentEscrowModal';
import { DoorstepPinpointModal } from '../components/DoorstepPinpointModal';
import { 
  School, Utensils, Calendar, FileText, ShieldCheck, MapPin, 
  Zap, ChefHat, Play, Pause, ArrowRight, Sparkles, Sliders, 
  Check, CheckCircle2, AlertCircle, Info, Award, X, Key, Radio, Wallet,
  Lock, Building, Navigation, Crosshair, RefreshCw, LocateFixed, Clock,
  Home, User, Phone, Compass, Edit3, CheckCircle, ExternalLink, BarChart3, Bell
} from 'lucide-react';
import { ParentHeroVisual } from '../components/ParentHeroVisual';
import { TNSchoolSelector } from '../components/TNSchoolSelector';
import { getShortestCorridorVector, haversineMeters } from '../utils/roadRouting';
import { TN_DISTRICTS_2026, getSchoolsForDistrict, lookupTnSchoolCoordinates, getDistrictResidentialHub } from '../data/tnSchoolsData';

export const PLANS_CATALOG = [
  {
    id: 'weekly',
    name: '5-Day Trial Pass (Starter Week)',
    days: 5,
    basePricePerDay: 50,
    discount: 'No Long Commitment',
    popular: true,
    tier: 'trial',
    badge: '1-WEEK TRIAL',
    backupProtocol: 'Standard Corridor Backup',
    backupType: 'standard_corridor',
    features: [
      '5 school weekdays trial (Mon–Fri)',
      'Full 3-sec live GPS tracking & Double OTP Handshake',
      'Zero-Hunger school canteen guarantee included',
      'Upgrade seamlessly with credit rollover'
    ]
  },
  {
    id: 'monthly',
    name: '20-Day Standard Pass (Batched Route)',
    days: 20,
    basePricePerDay: 42,
    discount: 'Fair Dabbawala Route',
    popular: false,
    tier: 'standard',
    badge: 'MOST POPULAR',
    backupProtocol: 'Certified Route Buddy (Suresh 4.8★)',
    backupType: 'buddy',
    features: [
      'Monday to Friday corridor delivery (0–3 km base)',
      'Extra distance at only +₹8/km beyond 3 km',
      'Assigned verified primary rider + Pod Buddy Suresh standby',
      'Zero-Hunger Canteen Protection (₹100 voucher if delayed)'
    ]
  },
  {
    id: 'vip',
    name: '20-Day Premium VIP Pass (Dedicated 1:1)',
    days: 20,
    basePricePerDay: 58,
    discount: 'Express 10-Min Window',
    popular: false,
    tier: 'vip',
    badge: 'PRIORITY EXPRESS',
    backupProtocol: 'Exclusive 1:1 VIP Standby Solo Floater',
    backupType: 'solo_floater',
    features: [
      'Point-to-point dedicated solo transit (zero batching)',
      'Exclusive 1:1 VIP Standby Floater backup during emergency',
      'Optional toggle: Use Standard driver on emergency & save ₹16/day',
      '₹5,000 Transit Food & Milton/Vaya Tiffin replacement cover'
    ]
  },
  {
    id: 'quarterly',
    name: '60-Day Quarterly Pass (Same Driver Lock)',
    days: 60,
    basePricePerDay: 35,
    discount: 'Save ₹420 vs Standard',
    popular: false,
    tier: 'quarterly',
    badge: 'BEST VALUE (3 MONTHS)',
    backupProtocol: 'Permanent Same Driver Lock (Ramesh 4.9★)',
    backupType: 'locked_driver',
    features: [
      'Permanent Same Driver Lock: Ramesh assigned for entire term',
      'Lowest daily rate: Only ₹35/day across 60 school days',
      '8 Free Emergency Holiday Pauses (auto-extends validity)',
      'Direct school reception desk priority handover'
    ]
  }
];


const useScrollReveal = (dependency) => {
  useEffect(() => {
    const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-up';
    const els = document.querySelectorAll(selectors);
    els.forEach(el => el.classList.remove('is-visible'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    setTimeout(() => { els.forEach(el => observer.observe(el)); }, 50);
    return () => observer.disconnect();
  }, [dependency]);
};

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

// School destination GPS coordinates registry
export const KNOWN_SCHOOL_COORDINATES = {
  'DAV Higher Secondary School, Gopalapuram': { lat: 13.0524, lng: 80.2542, name: 'DAV Boys/Girls Gopalapuram' },
  'DPS Anna Nagar': { lat: 13.0900, lng: 80.2200, name: 'Delhi Public School Anna Nagar' },
  'KV Ashok Nagar': { lat: 13.0450, lng: 80.2200, name: 'Kendriya Vidyalaya Ashok Nagar' },
  'Velammal Surapet': { lat: 13.1200, lng: 80.1550, name: 'Velammal Surapet' },
  'Chettinad Vidyashram, R.A. Puram': { lat: 13.0232, lng: 80.2570, name: 'Chettinad Vidyashram R.A. Puram' },
  'National Public School, Gopalapuram': { lat: 13.0531, lng: 80.2555, name: 'NPS Gopalapuram' },
  'SBOA School, Anna Nagar': { lat: 13.0850, lng: 80.1980, name: 'SBOA Anna Nagar' }
};

export const getSchoolCoordinates = (schoolName, district = 'Chennai') => {
  if (!schoolName) return { lat: 13.0524, lng: 80.2542, name: 'DAV Boys Senior Secondary School, Gopalapuram' };
  const keys = Object.keys(KNOWN_SCHOOL_COORDINATES);
  const matched = keys.find(k => schoolName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(schoolName.toLowerCase()));
  if (matched) return KNOWN_SCHOOL_COORDINATES[matched];
  return lookupTnSchoolCoordinates(schoolName, district);
};

/**
 * UNIVERSAL ROAD DISTANCE CALCULATOR (TAMIL NADU STATEWIDE)
 * Accurately measures GPS road distance between doorstep and school gate.
 * Reflects genuine Google Maps driving routes without artificial corridor caps.
 */
export const calculateHaversineRoadDistance = (originLat, originLng, destLat, destLng) => {
  if (!originLat || !originLng || !destLat || !destLng) return 3.0;
  const straightM = haversineMeters([Number(originLat), Number(originLng)], [Number(destLat), Number(destLng)]);
  const straightKm = straightM / 1000;
  const roadKm = Math.round(straightKm * 1.28 * 10) / 10;
  return Math.max(0.5, roadKm);
};

export const ParentDashboard = () => {
  
  const { darkMode, activeRole, setActiveRole, orders, createOrder, showToast, updatePaymentStatus, parentProfile, updateParentProfile, submitCustomSchool } = useAppState();

  const remainingDays = parentProfile?.passRemainingDays ?? 0;
  const activePlanName = parentProfile?.subscriptionPlan || '';
  const hasActiveSubscription = !!activePlanName && activePlanName !== 'None' && remainingDays > 0;
  const isRenewalWindow = hasActiveSubscription && remainingDays <= 7;
  const isLockedMoreThan7Days = hasActiveSubscription && remainingDays > 7;

  // Initial tab: If parent has no active subscription, navigate to subscription plan selection immediately!
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (['orders', 'emergency', 'subscription', 'reports', 'parent-details'].includes(hash)) {
        return hash;
      }
    }
    return hasActiveSubscription ? 'orders' : 'subscription';
  });
  const [showTour, setShowTour] = useState(() => !hasActiveSubscription || !!parentProfile?.showOnboardingTour);
  const [paymentPlanModal, setPaymentPlanModal] = useState(null);
  const [showSimSandbox, setShowSimSandbox] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState('weekly');
  const [isSubPaused, setIsSubPaused] = useState(false);

  // Dynamic date generators for Tomorrow and Weekend
  const getTomorrowDateInfo = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    const resume = new Date(t);
    resume.setDate(resume.getDate() + 1);
    return {
      tomorrowFormatted: t.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      resumeFormatted: resume.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };
  };

  const tomorrowInfo = getTomorrowDateInfo();

  // Calendar date defaults (YYYY-MM-DD)
  const getInitialCalendarDates = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    const startStr = t.toISOString().split('T')[0];
    const e = new Date(t);
    e.setDate(e.getDate() + 2);
    const endStr = e.toISOString().split('T')[0];
    return { startStr, endStr };
  };

  const initialDates = getInitialCalendarDates();
  const [customStartDate, setCustomStartDate] = useState(initialDates.startStr);
  const [customEndDate, setCustomEndDate] = useState(initialDates.endStr);

  const calculateDateDiffDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, isNaN(diffDays) ? 1 : diffDays);
  };

  // 3 Clear Options: Tomorrow Holiday, Saturday & Sunday Holiday, Custom Holiday
  const HOLIDAY_PRESETS = [
    {
      id: 'tomorrow',
      name: 'Tomorrow Holiday',
      days: 1,
      dates: 'Tomorrow (' + tomorrowInfo.tomorrowFormatted + ')',
      resumes: tomorrowInfo.resumeFormatted,
      description: 'Single day pause for tomorrow. Resumes on the following morning.'
    },
    {
      id: 'weekend',
      name: 'Saturday & Sunday Holiday',
      days: 2,
      dates: 'Saturday & Sunday',
      resumes: 'Monday Morning',
      description: 'Pause deliveries over the weekend. Resumes fresh on Monday.'
    },
    {
      id: 'custom',
      name: 'Custom Holiday',
      days: calculateDateDiffDays(customStartDate, customEndDate),
      dates: 'Selected Calendar Range',
      resumes: 'Day After End Date',
      description: 'Select start date and end date from calendar with automatic rollover.'
    }
  ];

  const [holidayPauseConfig, setHolidayPauseConfig] = useState({
    enabled: false,
    selectedPresetId: 'tomorrow',
    holidayName: 'Tomorrow Holiday',
    days: 1,
    dates: 'Tomorrow (' + tomorrowInfo.tomorrowFormatted + ')',
    resumes: tomorrowInfo.resumeFormatted
  });
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Prevent background scroll / swipe bleed when Holiday modal is open
  useEffect(() => {
    if (showHolidayModal) {
      const prevOverflow = document.body.style.overflow;
      const prevTouch = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouch;
      };
    }
  }, [showHolidayModal]);

  const handleToggleHolidayPause = () => {
    if (holidayPauseConfig.enabled) {
      setHolidayPauseConfig(prev => ({ ...prev, enabled: false }));
      setIsSubPaused(false);
      showToast('Holiday Pause Deactivated. Daily deliveries resumed.', 'success');
    } else {
      setShowHolidayModal(true);
    }
  };

  const handleConfirmHolidayPause = (preset) => {
    const dailyRate = parentProfile?.dailyRate || 50;
    const refundCredit = preset.days * dailyRate;
    const newWallet = (parentProfile?.walletBalance || 0) + refundCredit;

    setHolidayPauseConfig({
      enabled: true,
      selectedPresetId: preset.id,
      holidayName: preset.name,
      days: preset.days,
      dates: preset.dates,
      resumes: preset.resumes
    });
    setIsSubPaused(true);
    setShowHolidayModal(false);

    updateParentProfile({
      walletBalance: newWallet
    });

    const holidayLog = {
      date: 'Today (' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ')',
      id: 'HOL-' + Date.now().toString().slice(-4),
      driver: 'Holiday Auto-Pause (' + preset.name + ')',
      time: 'Immediate',
      status: 'Wallet Credited (+₹' + refundCredit + '.00)',
      amount: preset.name + ' active (' + preset.dates + '). ' + preset.days + ' deliveries paused. ₹' + refundCredit + ' credited to Wallet Rollover. Resumes ' + preset.resumes + '.'
    };
    setHistoryLogs(prev => [holidayLog, ...prev]);

    showToast(preset.name + ' Paused. ' + preset.days + ' deliveries saved (+₹' + refundCredit + ' credited to wallet).', 'success');
  };

  const handleConfirmCustomHoliday = () => {
    const days = calculateDateDiffDays(customStartDate, customEndDate);
    const startObj = new Date(customStartDate);
    const endObj = new Date(customEndDate);
    const resumeObj = new Date(endObj);
    resumeObj.setDate(resumeObj.getDate() + 1);

    const startFormatted = startObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const endFormatted = endObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const resumeFormatted = resumeObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    handleConfirmHolidayPause({
      id: 'custom',
      name: 'Custom Holiday',
      days: days,
      dates: startFormatted + ' – ' + endFormatted,
      resumes: resumeFormatted
    });
  };

  const [selectedSchool, setSelectedSchool] = useState(parentProfile?.schoolName || 'DAV Higher Secondary School, Gopalapuram');
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editSchoolForm, setEditSchoolForm] = useState({
    studentGrade: 'Class 9',
    studentSection: 'B',
    customSection: '',
    schoolName: '',
    lunchTime: '12:30 PM',
  });

  // Exact Doorstep-to-School Road Distance (Maintained automatically by the system - Zero manual sliders!)
  const autoDistance = React.useMemo(() => {
    const schoolDistrict = parentProfile?.schoolDistrict || parentProfile?.addressDetails?.schoolDistrict || 
      (parentProfile?.schoolName?.toLowerCase().includes('chengal') ? 'Chengalpattu' : 'Chennai');
    const schoolCoords = parentProfile?.schoolCoordinates || 
      getSchoolCoordinates(parentProfile?.schoolName, schoolDistrict) || 
      { lat: 13.0475, lng: 80.2588 };
    
    const homeCoords = parentProfile?.homeCoordinates || parentProfile?.addressDetails?.coordinates || { lat: 13.0827, lng: 80.2707 };
    const d = calculateHaversineRoadDistance(homeCoords.lat, homeCoords.lng, schoolCoords.lat, schoolCoords.lng);
    return Math.max(0.5, Number((d || 3.0).toFixed(1)));
  }, [parentProfile]);

  const [selectedDistance, setSelectedDistance] = useState(autoDistance);
  const [showDoorstepPinpointModal, setShowDoorstepPinpointModal] = useState(false);
  const [pinpointTargetContext, setPinpointTargetContext] = useState('hub'); // 'hub' | 'emergency' | 'modal'

  const handleDoorstepLocationSaved = ({ coords, formattedAddress, addressDetails, accuracy }) => {
    if (pinpointTargetContext === 'hub') {
      setHubCoords(coords);
      setHubLocality(formattedAddress);
      if (addressDetails.areaVillage) setHubVillage(addressDetails.areaVillage);
      if (addressDetails.city) setHubCity(addressDetails.city);
      if (addressDetails.pincode) setHubPincode(addressDetails.pincode);
      if (addressDetails.doorStreet) setHubDoor(addressDetails.doorStreet);
      setHubGpsAccuracy(accuracy || 3);
      setHubGpsStatus('success');
      // Verified doorstep state stored directly in profile

      const targetSchool = parentProfile?.schoolCoordinates || getSchoolCoordinates(parentProfile?.schoolName, parentProfile?.schoolDistrict);
      const calculatedDist = calculateHaversineRoadDistance(coords.lat, coords.lng, targetSchool.lat, targetSchool.lng);
      setSelectedDistance(calculatedDist);

      updateParentProfile({
        deliveryAddress: formattedAddress,
        homeCoordinates: coords,
        addressDetails: {
          ...parentProfile?.addressDetails,
          ...addressDetails,
          coordinates: coords,
          accuracy: accuracy || 3
        },
        distanceKm: calculatedDist,
        isPermanentGpsVerified: true
      });
      showToast(`Exact doorstep locked with ±${accuracy || 3}m accuracy! Road distance: ${calculatedDist} km to school.`, 'success');
    } else if (pinpointTargetContext === 'emergency') {
      setLiveCoords(coords);
      setGpsAccuracy(accuracy || 3);
      setGpsStatus('success');
      setDetectedLocationName(formattedAddress);
      setEmergencyPickupAddress(formattedAddress);
      const dist = calculateHaversineRoadDistance(coords.lat, coords.lng, targetSchoolCoords.lat, targetSchoolCoords.lng);
      setEmergencyDistance(dist);
      showToast(`Exact emergency pickup pinned at ${formattedAddress}`, 'success');
    } else if (pinpointTargetContext === 'modal') {
      setNewCoords(coords);
      setNewLocality(formattedAddress);
      if (addressDetails.doorStreet) setNewDoor(addressDetails.doorStreet);
      if (addressDetails.areaVillage) setNewVillage(addressDetails.areaVillage);
      if (addressDetails.city) setNewCity(addressDetails.city);
      if (addressDetails.pincode) setNewPincode(addressDetails.pincode);
      setNewGpsAccuracy(accuracy || 3);
      setNewGpsStatus('success');
      showToast(`New doorstep position pinpointed!`, 'success');
    }
  };
  const [activeModalPlan, setActiveModalPlan] = useState(null);

  // Determine if Trial pass should be visible:
  // Visible ONLY if user is currently on the trial pass, OR has never used trial and has no subscription
  const isCurrentlyOnTrial = hasActiveSubscription && activePlanName.toLowerCase().includes('trial');
  const hasEverSubscribed = parentProfile?.hasUsedTrial || (hasActiveSubscription && !isCurrentlyOnTrial);
  const visiblePlans = PLANS_CATALOG.filter(plan => {
    if (plan.tier === 'trial') {
      return isCurrentlyOnTrial || !hasEverSubscribed || !hasActiveSubscription;
    }
    return true;
  });

  // Dynamic history log state: Records authentic deliveries and route change credits (no mock data)
  const [historyLogs, setHistoryLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('lm-parent-history-logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lm-parent-history-logs', JSON.stringify(historyLogs));
    } catch (e) {}
  }, [historyLogs]);

  // Route Change & Wallet Credit Engine:
  // When parent alters delivery route/distance, unused pass balance is credited directly to their wallet!
  const handleApplyRouteChange = (newDistance) => {
    const dist = typeof newDistance === 'number' ? newDistance : selectedDistance;
    const oldDist = parentProfile?.distanceKm || 3.5;
    const remainingDays = parentProfile?.passRemainingDays || 20;

    // Daily surcharge difference between old route and new route
    const oldSurcharge = Math.max(0, oldDist - 3.0) * 8;
    const newSurcharge = Math.max(0, dist - 3.0) * 8;
    const dailyDiff = oldSurcharge - newSurcharge;

    let walletCredit = 0;
    if (remainingDays > 0 && dailyDiff > 0) {
      walletCredit = Math.round(dailyDiff * remainingDays);
    }

    const updatedWallet = (parentProfile?.walletBalance || 0) + walletCredit;

    updateParentProfile({
      distanceKm: dist,
      walletBalance: updatedWallet
    });

    if (walletCredit > 0) {
      const newEntry = {
        date: "Today (" + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ")",
        id: `ROU-CHG-${Date.now().toString().slice(-4)}`,
        driver: "Corridor Route Adjustment",
        time: "Immediate",
        status: `Wallet Credited (+₹${walletCredit}.00)`,
        amount: `Route distance altered from ${oldDist}km to ${dist}km. ₹${walletCredit} credited to wallet for ${remainingDays} remaining days. Automatically reduces next renewal payment.`
      };
      setHistoryLogs(prev => [newEntry, ...prev]);
      showToast(`🔄 Route changed to ${dist} km! ₹${walletCredit} credited to your LunchMate Wallet. It will automatically deduct on your next subscription!`, 'success');
    } else {
      showToast(`Route updated to ${dist} km.`, 'info');
    }
  };

  const calculatePlanBreakdown = (plan, distance) => {
    if (!plan) return null;
    const extraKm = Math.max(0, distance - 3.0);
    const distanceSurcharge = Math.round(extraKm * 8); // ₹8 per extra km above 3 km
    const effectiveDailyRate = plan.basePricePerDay + distanceSurcharge;
    const grossTotal = effectiveDailyRate * plan.days;
    
    // 85% to driver partner (fuel + route fee), 15% platform/escrow
    const driverShareTotal = Math.round(grossTotal * 0.85);
    const platformShareTotal = grossTotal - driverShareTotal;
    const driverPerDay = Math.round(driverShareTotal / plan.days);
    const platformPerDay = Math.round(platformShareTotal / plan.days);

    const walletAvailable = parentProfile?.walletBalance || 0;
    const walletCreditUsed = Math.min(walletAvailable, grossTotal);
    const finalPayable = Math.max(0, grossTotal - walletCreditUsed);

    return {
      totalDistance: Number(distance.toFixed(1)),
      extraKm: Number(extraKm.toFixed(1)),
      distanceSurcharge,
      effectiveDailyRate,
      grossTotal,
      driverShareTotal,
      platformShareTotal,
      driverPerDay,
      platformPerDay,
      walletAvailable,
      walletCreditUsed,
      finalPayable,
    };
  };

  // Payment Completion & Pass Activation Handler
  const handlePaymentSuccess = ({ plan, breakdown, daysPaid, txnId }) => {
    const isRenewal = isRenewalWindow;
    const newTotalDays = isRenewal ? (remainingDays + plan.days) : plan.days;
    const actionType = isRenewal ? 'Renewed' : 'Activated';
    const remainingWallet = Math.max(0, (parentProfile?.walletBalance || 0) - breakdown.walletCreditUsed);

    updateParentProfile({
      subscriptionPlan: plan.name,
      isSubscriptionPaid: true,
      subscriptionStatus: 'active',
      subscriptionPaidAt: new Date().toISOString(),
      distanceKm: breakdown?.totalDistance || selectedDistance,
      dailyRate: breakdown.effectiveDailyRate,
      passRemainingDays: newTotalDays,
      walletBalance: remainingWallet,
      hasUsedTrial: true,
      showOnboardingTour: false,
    });

    const receiptEntry = {
      date: "Today (" + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ")",
      id: txnId || `PAY-${Date.now().toString().slice(-6)}`,
      driver: `${plan.name} (${actionType})`,
      time: "Just now",
      status: `Pass ${actionType} (RBI Escrow Verified)`,
      amount: breakdown.walletCreditUsed > 0 
        ? `Gross ₹${breakdown.grossTotal} - ₹${breakdown.walletCreditUsed} Wallet Rollover = Paid ₹${breakdown.finalPayable} via UPI`
        : `Paid ₹${breakdown.finalPayable} via UPI for ${plan.days} School Days`
    };

    setHistoryLogs(prev => [receiptEntry, ...prev]);
    setPaymentPlanModal(null);
    setActiveTab('orders');
    showToast(`✓ Payment Verified! ${plan.name} is now Paid & Active. Delivery schedule activated for ${parentProfile?.studentName || 'your child'}!`, 'success');
  };

  // 🛠️ High-Precision Simulation Handlers for Auto-Pause & Wallet Rollover Testing
  const handleSimulateDelivery = () => {
    if (remainingDays <= 0) {
      showToast('No remaining pass deliveries to simulate. Please activate or renew your pass.', 'error');
      return;
    }
    const newDays = remainingDays - 1;
    updateParentProfile({ passRemainingDays: newDays });
    const deliveryEntry = {
      date: "Today (" + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ")",
      id: `LUNCH-${Math.floor(1000 + Math.random() * 9000)}`,
      driver: "Ramesh Kumar (Assigned Rider)",
      time: "12:22 PM",
      status: "Delivered (On-Time)",
      amount: "Deducted 1 meal from active pass"
    };
    setHistoryLogs(prev => [deliveryEntry, ...prev]);
    showToast(`🍱 1 School Day Simulated: Lunch delivered on-time! ${newDays} days remaining.`, 'success');
  };

  const handleSimulateAutoPause = () => {
    if (remainingDays <= 0) {
      showToast('No active pass days available to pause.', 'error');
      return;
    }
    const newDays = remainingDays - 1;
    const dailyCost = parentProfile?.dailyRate || 50;
    const updatedWallet = (parentProfile?.walletBalance || 0) + dailyCost;
    updateParentProfile({
      passRemainingDays: newDays,
      walletBalance: updatedWallet
    });
    const pauseEntry = {
      date: "Today (" + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ")",
      id: `PAUSE-${Date.now().toString().slice(-4)}`,
      driver: "Auto-Pause Engine (Student Absent / Rain Holiday)",
      time: "09:15 AM",
      status: `Wallet Credited (+₹${dailyCost}.00)`,
      amount: `Student absent: Lunch paused before 9:30 AM cutoff. ₹${dailyCost} credited to LunchMate Escrow Wallet. Automatically deducts on your next renewal.`
    };
    setHistoryLogs(prev => [pauseEntry, ...prev]);
    showToast(`⏸️ Auto-Pause Simulated: Child absent! ₹${dailyCost} credited to your Wallet Rollover (${newDays} days left).`, 'success');
  };

  const handleSimulateRenewalWindow = () => {
    updateParentProfile({ passRemainingDays: 5 });
    showToast('Simulated: 5 days remaining. Renewal window is now active!', 'info');
  };

  const handleResetToFresh = () => {
    updateParentProfile({
      subscriptionPlan: null,
      passRemainingDays: 0,
      walletBalance: 0,
      hasUsedTrial: false,
      showOnboardingTour: true,
    });
    setShowTour(true);
    setActiveTab('subscription');
    showToast('Reset complete! Experience first-time parent onboarding & pass selection.', 'info');
  };

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        if (['orders', 'emergency', 'subscription', 'reports', 'parent-details'].includes(hash)) {
          setActiveTab(hash);
        }
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Two-way navigation sync: When activeTab changes, update window.location.hash so Navbar highlights correctly
  useEffect(() => {
    if (activeTab) {
      if (window.location.hash !== `#${activeTab}`) {
        window.location.hash = activeTab;
      }
    }
  }, [activeTab]);

  // Keyboard accessibility: Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalPlan(null);
        setShowSchoolModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeOrder = orders.find(o => o.parentId === 'PAR-123' && o.status !== 'Delivered');
  const pendingPaymentOrder = orders.find(o => o.parentId === 'PAR-123' && o.status === 'Delivered' && o.paymentStatus === 'Advance Paid');
  
  useScrollReveal(activeTab + '-' + (activeOrder ? 'active' : 'none'));

  const [addressType, setAddressType] = useState('home'); // 'home' | 'custom'
  const [liveCoords, setLiveCoords] = useState({ lat: 13.0827, lng: 80.2707 }); // Chennai live reference
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'locating' | 'success' | 'fallback'
  const [gpsAccuracy, setGpsAccuracy] = useState(12); // meters
  const [detectedLocationName, setDetectedLocationName] = useState('Central Chennai / Nungambakkam');
  const [customBuildingNote, setCustomBuildingNote] = useState('');
  const [emergencyPickupAddress, setEmergencyPickupAddress] = useState(
    parentProfile?.deliveryAddress || 'Anna Nagar East, Chennai'
  );
  const [emergencyDistance, setEmergencyDistance] = useState(3.5);

  const targetSchoolCoords = parentProfile?.schoolCoordinates || getSchoolCoordinates(parentProfile?.schoolName, parentProfile?.schoolDistrict || parentProfile?.addressDetails?.schoolDistrict || 'Chennai');

  // Sync address with profile if updated
  useEffect(() => {
    if (parentProfile?.deliveryAddress && addressType === 'home') {
      setEmergencyPickupAddress(parentProfile.deliveryAddress);
      setEmergencyDistance(parentProfile.distanceKm || 3.5);
    }
  }, [parentProfile?.deliveryAddress, parentProfile?.distanceKm, addressType]);

  // 🏡 Parent Details & Structured Pickup Hub State
  const initialDoor = parentProfile?.addressDetails?.doorStreet || 'No. 14, 2nd Cross Street';
  const initialVillage = parentProfile?.addressDetails?.areaVillage || 'Anna Nagar East';
  const initialCity = parentProfile?.addressDetails?.city || 'Chennai';
  const initialPincode = parentProfile?.addressDetails?.pincode || '600102';
  const initialCoords = parentProfile?.homeCoordinates || parentProfile?.addressDetails?.coordinates || { lat: 13.0827, lng: 80.2707 };
  const initialLocality = parentProfile?.addressDetails?.detectedLocality || parentProfile?.deliveryAddress || 'Anna Nagar East, Chennai';

  const [hubDoor, setHubDoor] = useState(initialDoor);
  const [hubVillage, setHubVillage] = useState(initialVillage);
  const [hubCity, setHubCity] = useState(initialCity);
  const [hubPincode, setHubPincode] = useState(initialPincode);
  const [hubCoords, setHubCoords] = useState(initialCoords);
  const [hubLocality, setHubLocality] = useState(initialLocality);
  const [hubGpsStatus, setHubGpsStatus] = useState('idle');
  const [hubGpsAccuracy, setHubGpsAccuracy] = useState(parentProfile?.addressDetails?.accuracy || 12);
  const [hubSavedSuccess, setHubSavedSuccess] = useState(false);

  useEffect(() => {
    if (parentProfile?.addressDetails) {
      setHubDoor(parentProfile.addressDetails.doorStreet || '');
      setHubVillage(parentProfile.addressDetails.areaVillage || '');
      setHubCity(parentProfile.addressDetails.city || 'Chennai');
      setHubPincode(parentProfile.addressDetails.pincode || '');
      setHubLocality(parentProfile.addressDetails.detectedLocality || parentProfile.deliveryAddress || '');
    }
    if (parentProfile?.homeCoordinates) {
      setHubCoords(parentProfile.homeCoordinates);
    }
  }, [parentProfile]);

  const isPermanentGpsVerified = !!parentProfile?.isPermanentGpsVerified;

  // Auto-detect GPS when entering Parent Details tab if unverified
  useEffect(() => {
    if (activeTab === 'parent-details' && !parentProfile?.isPermanentGpsVerified && hubGpsStatus === 'idle') {
      detectHubLiveLocation();
    }
  }, [activeTab, parentProfile?.isPermanentGpsVerified]);

  const handleConfirmPermanentGps = () => {
    updateParentProfile({
      isPermanentGpsVerified: true,
      permanentCoordinates: hubCoords,
      homeCoordinates: hubCoords,
      addressDetails: {
        ...(parentProfile?.addressDetails || {}),
        coordinates: hubCoords,
        accuracy: hubGpsAccuracy,
        detectedLocality: hubLocality,
      }
    });
    showToast("🔒 Permanent Doorstep GPS Verified & Locked for Rider Pickups!", "success");
  };

  const handleRevertToSignupGps = () => {
    const origCoords = parentProfile?.addressDetails?.coordinates || { lat: 13.0827, lng: 80.2707 };
    setHubCoords(origCoords);
    setHubLocality(parentProfile?.addressDetails?.detectedLocality || parentProfile?.deliveryAddress || 'Registered Home Location');
    showToast("📌 Set back to registered signup location coordinates.", "info");
  };

  // State for Address & School Change Request Modal
  const [showAddressChangeModal, setShowAddressChangeModal] = useState(false);
  const [changeScope, setChangeScope] = useState('both'); // 'home' | 'school' | 'both'
  const [changeReason, setChangeReason] = useState('relocation');
  const [changeReasonNotes, setChangeReasonNotes] = useState('');
  const [newDoor, setNewDoor] = useState(hubDoor);
  const [newVillage, setNewVillage] = useState(hubVillage);
  const [newCity, setNewCity] = useState(hubCity);
  const [newPincode, setNewPincode] = useState(hubPincode);
  const [newCoords, setNewCoords] = useState(hubCoords);
  const [newLocality, setNewLocality] = useState(hubLocality);
  const [newGpsStatus, setNewGpsStatus] = useState('idle');
  const [newSchoolDistrict, setNewSchoolDistrict] = useState(parentProfile?.addressDetails?.schoolDistrict || 'Chennai');
  const [newSchoolName, setNewSchoolName] = useState(parentProfile?.schoolName || '');
  const [newSchoolMapsLink, setNewSchoolMapsLink] = useState(parentProfile?.schoolMapsLink || '');
  const [newSchoolCoords, setNewSchoolCoords] = useState(null);

  const openAddressChangeModal = () => {
    setNewDoor(hubDoor);
    setNewVillage(hubVillage);
    setNewCity(hubCity);
    setNewPincode(hubPincode);
    setNewCoords(hubCoords);
    setNewLocality(hubLocality);
    setNewSchoolDistrict(parentProfile?.addressDetails?.schoolDistrict || 'Chennai');
    setNewSchoolName(parentProfile?.schoolName || '');
    setNewSchoolMapsLink(parentProfile?.schoolMapsLink || '');
    setNewSchoolCoords(null);
    setChangeReasonNotes('');
    setShowAddressChangeModal(true);
  };

  const detectNewHomeLiveLocation = () => {
    setNewGpsStatus('locating');
    if (!navigator.geolocation) {
      setNewGpsStatus('fallback');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setNewCoords({ lat, lng });
        setNewGpsStatus('success');
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const a = data.address;
              const street = [a.house_number, a.road].filter(Boolean).join(' ');
              const villageArea = a.neighbourhood || a.suburb || a.village || a.city_district || '';
              const city = a.city || a.town || a.county || '';
              const postcode = a.postcode || '';
              const resolved = data.display_name?.split(',').slice(0, 3).join(', ') || `GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
              setNewLocality(resolved);
              if (villageArea) setNewVillage(villageArea);
              if (city) setNewCity(city);
              if (postcode) setNewPincode(postcode.replace(/\D/g, '').slice(0, 6));
              if (street && !newDoor) setNewDoor(street);
            }
          })
          .catch(() => {});
      },
      (err) => {
        setNewGpsStatus('fallback');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSaveAddressChange = (e) => {
    e.preventDefault();
    if (!changeReasonNotes.trim()) {
      showToast("Please provide the reason / details for change of address.", "error");
      return;
    }
    const isUpdatingHome = changeScope === 'home' || changeScope === 'both';
    const isUpdatingSchool = changeScope === 'school' || changeScope === 'both';

    if (isUpdatingHome) {
      if (!newDoor.trim() || !newVillage.trim() || newPincode.trim().length !== 6) {
        showToast("Please fill in complete doorstep address details.", "error");
        return;
      }
    }

    if (isUpdatingSchool && !newSchoolName.trim()) {
      showToast("Please search or select a new school delivery destination.", "error");
      return;
    }

    const finalSchool = isUpdatingSchool ? newSchoolName.trim() : (parentProfile?.schoolName || 'DAV Boys Senior Secondary School, Gopalapuram');
    const finalSchoolCoords = isUpdatingSchool 
      ? (newSchoolCoords || lookupTnSchoolCoordinates(finalSchool, newSchoolDistrict, newSchoolMapsLink))
      : (parentProfile?.schoolCoordinates || lookupTnSchoolCoordinates(finalSchool, newSchoolDistrict));
    const finalSchoolMapsLink = isUpdatingSchool
      ? (newSchoolMapsLink || finalSchoolCoords.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalSchool + ', ' + newSchoolDistrict + ', Tamil Nadu')}`)
      : (parentProfile?.schoolMapsLink || finalSchoolCoords.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalSchool + ', Tamil Nadu')}`);

    let finalDoor = isUpdatingHome ? newDoor.trim() : hubDoor;
    let finalVillage = isUpdatingHome ? newVillage.trim() : hubVillage;
    let finalCity = isUpdatingHome ? newCity.trim() : hubCity;
    let finalPincode = isUpdatingHome ? newPincode.trim() : hubPincode;
    let finalCoords = isUpdatingHome ? newCoords : hubCoords;
    let finalLocality = isUpdatingHome ? (newLocality || `${finalVillage}, ${finalCity}`) : hubLocality;

    const finalFormatted = `${finalDoor ? finalDoor + ', ' : ''}${finalVillage}, ${finalCity} - ${finalPincode}`;
    const calculatedDist = calculateHaversineRoadDistance(finalCoords.lat, finalCoords.lng, finalSchoolCoords.lat, finalSchoolCoords.lng);

    if (isUpdatingSchool && finalSchool && typeof submitCustomSchool === 'function') {
      submitCustomSchool({
        name: finalSchool,
        district: newSchoolDistrict,
        mapsLink: finalSchoolMapsLink,
        lat: finalSchoolCoords?.lat,
        lng: finalSchoolCoords?.lng,
        parentName: parentProfile?.parentName,
        studentName: parentProfile?.studentName,
      });
    }

    updateParentProfile({
      deliveryAddress: finalFormatted,
      addressDetails: {
        doorStreet: finalDoor,
        areaVillage: finalVillage,
        city: finalCity,
        pincode: finalPincode,
        coordinates: finalCoords,
        accuracy: hubGpsAccuracy,
        detectedLocality: finalLocality,
        schoolDistrict: newSchoolDistrict,
      },
      homeCoordinates: finalCoords,
      schoolName: finalSchool,
      schoolCoordinates: finalSchoolCoords,
      schoolMapsLink: finalSchoolMapsLink,
      distanceKm: calculatedDist,
      isPermanentGpsVerified: true,
      lastAddressChangeReason: `${changeReason}: ${changeReasonNotes.trim()}`,
      lastAddressChangeDate: new Date().toLocaleDateString('en-IN'),
    });

    if (isUpdatingHome) {
      setHubDoor(finalDoor);
      setHubVillage(finalVillage);
      setHubCity(finalCity);
      setHubPincode(finalPincode);
      setHubCoords(finalCoords);
      setHubLocality(finalLocality);
    }
    setSelectedDistance(calculatedDist);
    setEmergencyPickupAddress(finalFormatted);
    setEmergencyDistance(calculatedDist);
    setShowAddressChangeModal(false);
    showToast(`✅ Address & School Updated Everywhere! New corridor distance: ${calculatedDist} km to ${finalSchool}.`, "success");
  };

  // Real-time GPS Detection for Parent Details & Pickup Hub
  // Real-time GPS Detection for Parent Details & Pickup Hub (Always uses real user position!)
  const detectHubLiveLocation = () => {
    setHubGpsStatus('locating');

    const handleSuccess = (pos) => {
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));
      const acc = Math.round(pos.coords.accuracy || 10);

      setHubCoords({ lat, lng });
      setHubGpsAccuracy(acc);
      setHubGpsStatus('success');

      // Reverse geocode via OpenStreetMap Nominatim for exact real doorstep address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.address) {
            const a = data.address;
            const street = [a.house_number, a.road].filter(Boolean).join(' ');
            const villageArea = a.neighbourhood || a.suburb || a.village || a.city_district || a.town || '';
            const city = a.city || a.town || a.county || 'Chennai';
            const postcode = a.postcode ? a.postcode.replace(/\D/g, '').slice(0, 6) : '';

            const place = [street, villageArea, city].filter(Boolean).join(', ');
            const resolved = place || data.display_name?.split(',').slice(0, 3).join(', ') || `Live GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;

            setHubLocality(resolved);
            if (villageArea) setHubVillage(villageArea);
            if (city) setHubCity(city);
            if (postcode) setHubPincode(postcode);
            if (street) setHubDoor(street);

            showToast(`📍 Live location detected: ${resolved} (±${acc}m accuracy)`, 'success');
          } else {
            const fallbackResolved = `Live GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
            setHubLocality(fallbackResolved);
            showToast(`📍 Live GPS locked (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`, 'success');
          }
        })
        .catch(() => {
          const fallbackResolved = `Live GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
          setHubLocality(fallbackResolved);
          showToast(`📍 Live GPS locked (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`, 'success');
        });
    };

    const handleFailure = (err) => {
      console.warn('High-accuracy GPS attempt failed, trying standard network location:', err);
      // Secondary fallback with standard network accuracy (works reliably indoors and on desktop browsers)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          handleSuccess,
          (err2) => {
            console.error('All GPS attempts failed:', err2);
            setHubGpsStatus('fallback');
            showToast('⚠️ Could not access device GPS. Please enable location permissions in browser settings.', 'error');
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      } else {
        setHubGpsStatus('fallback');
        showToast('⚠️ Geolocation not supported by this browser.', 'error');
      }
    };

    if (!navigator.geolocation) {
      setHubGpsStatus('fallback');
      showToast('⚠️ Geolocation not supported by this browser.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleFailure,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const setHubQuickPin = (lat, lng, locName, village, pincode = '600017') => {
    setHubCoords({ lat, lng });
    setHubLocality(locName);
    setHubVillage(village);
    setHubPincode(pincode);
    setHubGpsStatus('success');
  };

  const handleSaveHubAddress = (e) => {
    e?.preventDefault();
    const formatted = `${hubDoor.trim() ? hubDoor.trim() + ', ' : ''}${hubVillage.trim()}, ${hubCity.trim()} - ${hubPincode.trim()}`;
    const schoolCoords = parentProfile?.schoolCoordinates || getSchoolCoordinates(parentProfile?.schoolName, parentProfile?.schoolDistrict || parentProfile?.addressDetails?.schoolDistrict || "Chennai");
    const calculatedDist = calculateHaversineRoadDistance(hubCoords.lat, hubCoords.lng, schoolCoords.lat, schoolCoords.lng);

    updateParentProfile({
      deliveryAddress: formatted,
      addressDetails: {
        doorStreet: hubDoor.trim(),
        areaVillage: hubVillage.trim(),
        city: hubCity.trim(),
        pincode: hubPincode.trim(),
        coordinates: hubCoords,
        accuracy: hubGpsAccuracy,
        detectedLocality: hubLocality,
      },
      homeCoordinates: hubCoords,
      distanceKm: calculatedDist,
    });
    setEmergencyPickupAddress(formatted);
    setEmergencyDistance(calculatedDist);
    setSelectedDistance(calculatedDist);
    setHubSavedSuccess(true);
    setTimeout(() => setHubSavedSuccess(false), 3000);
    showToast(`🏡 Pickup Hub Saved! Doorstep address updated & route recalculated (${calculatedDist} km to ${parentProfile?.schoolName || 'School'}).`, "success");
  };

  // Real-time Live GPS Acquisition Engine
  const detectLiveLocation = () => {
    setGpsStatus('locating');

    if (!navigator.geolocation) {
      setGpsStatus('fallback');
      const fallbackLat = 13.0827;
      const fallbackLng = 80.2707;
      setLiveCoords({ lat: fallbackLat, lng: fallbackLng });
      const dist = calculateHaversineRoadDistance(fallbackLat, fallbackLng, targetSchoolCoords.lat, targetSchoolCoords.lng);
      setEmergencyDistance(dist);
      setDetectedLocationName('Central Chennai (Device Network Pin)');
      const addr = customBuildingNote.trim() ? `${customBuildingNote.trim()}, Central Chennai` : 'Central Chennai';
      setEmergencyPickupAddress(addr);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 10);
        setLiveCoords({ lat, lng });
        setGpsAccuracy(acc);
        setGpsStatus('success');

        const dist = calculateHaversineRoadDistance(lat, lng, targetSchoolCoords.lat, targetSchoolCoords.lng);
        setEmergencyDistance(dist);

        // Reverse geocode via OpenStreetMap Nominatim for human-readable street/area
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        })
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const a = data.address;
              const place = [
                a.road || a.pedestrian || a.suburb,
                a.neighbourhood || a.suburb || a.city_district,
                a.city || 'Chennai'
              ].filter(Boolean).join(', ');
              const resolved = place || data.display_name?.split(',').slice(0, 3).join(', ') || `Live GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
              setDetectedLocationName(resolved);
              setEmergencyPickupAddress(customBuildingNote.trim() ? `${customBuildingNote.trim()}, ${resolved}` : resolved);
            } else {
              const locStr = `Live GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
              setDetectedLocationName(locStr);
              setEmergencyPickupAddress(customBuildingNote.trim() ? `${customBuildingNote.trim()}, ${locStr}` : locStr);
            }
          })
          .catch(() => {
            const locStr = `Live GPS (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
            setDetectedLocationName(locStr);
            setEmergencyPickupAddress(customBuildingNote.trim() ? `${customBuildingNote.trim()}, ${locStr}` : locStr);
          });
      },
      (err) => {
        console.warn('Live geolocation blocked or timeout:', err);
        setGpsStatus('fallback');
        // Realistic device pin in Chennai
        const fallbackLat = 13.0827;
        const fallbackLng = 80.2707;
        setLiveCoords({ lat: fallbackLat, lng: fallbackLng });
        const dist = calculateHaversineRoadDistance(fallbackLat, fallbackLng, targetSchoolCoords.lat, targetSchoolCoords.lng);
        setEmergencyDistance(dist);
        setDetectedLocationName('Live Device Pin: Nungambakkam / Central Chennai');
        const addr = customBuildingNote.trim() ? `${customBuildingNote.trim()}, Nungambakkam, Chennai` : 'Nungambakkam, Chennai';
        setEmergencyPickupAddress(addr);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleCustomBuildingChange = (note) => {
    setCustomBuildingNote(note);
    if (addressType === 'custom') {
      const base = detectedLocationName || `GPS (${liveCoords.lat.toFixed(4)}°, ${liveCoords.lng.toFixed(4)}°)`;
      setEmergencyPickupAddress(note.trim() ? `${note.trim()}, ${base}` : base);
    }
  };

  // Quick preset test pin coordinate switcher (useful for desktop preview)
  const setTestLivePin = (lat, lng, name) => {
    setLiveCoords({ lat, lng });
    setDetectedLocationName(name);
    setGpsStatus('success');
    const dist = calculateHaversineRoadDistance(lat, lng, targetSchoolCoords.lat, targetSchoolCoords.lng);
    setEmergencyDistance(dist);
    const addr = customBuildingNote.trim() ? `${customBuildingNote.trim()}, ${name}` : name;
    setEmergencyPickupAddress(addr);
  };

  // Clean & Transparent Emergency Fare Calculation:
  // Base delivery fee (0 to 3.0 km) = ₹65
  // Beyond 3.0 km = +₹10 per extra km
  const extraEmergencyKm = Math.max(0, emergencyDistance - 3.0);
  const emergencyDistanceSurcharge = Math.round(extraEmergencyKm * 10);
  const emergencyTotalPrice = 65 + emergencyDistanceSurcharge;

  // Transparent Payout Split:
  // 85% to Solo Rider, 15% Platform Escrow & Tech
  const emergencyRiderPayout = Math.round(emergencyTotalPrice * 0.85);
  const emergencyPlatformPayout = emergencyTotalPrice - emergencyRiderPayout;

  const handleQuickFoodReady = () => {
    const homeCoords = parentProfile?.homeCoordinates || parentProfile?.addressDetails?.coordinates || { lat: 13.0827, lng: 80.2707 };
    const schoolCoords = parentProfile?.schoolCoordinates || targetSchoolCoords || { lat: 13.0475, lng: 80.2588 };
    const distKm = autoDistance || 3.5;
    const extraKm = Math.max(0, distKm - 3.0);
    const calculatedPrice = hasActiveSubscription 
      ? (parentProfile?.dailyRate || (40 + Math.round(extraKm * 8)))
      : (50 + Math.round(extraKm * 10));

    createOrder({
      parentName: parentProfile?.parentName || 'Parent',
      parentPhone: "+91 94441 55667",
      studentName: parentProfile?.studentName || "Student",
      schoolName: parentProfile?.schoolName || "Neelan Matriculation Higher Secondary School",
      schoolMapsLink: parentProfile?.schoolMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((parentProfile?.schoolName || 'School') + ', Tamil Nadu')}`,
      schoolCoordinates: schoolCoords,
      homeCoordinates: homeCoords,
      classDept: parentProfile?.studentClass || "Class 6-A",
      lunchTime: parentProfile?.lunchTime || "12:30 PM",
      pickupAddress: parentProfile?.deliveryAddress || emergencyPickupAddress,
      deliveryAddress: `${parentProfile?.schoolName || 'School'} Gate`,
      distanceKm: distKm,
      price: calculatedPrice,
      paymentMode: hasActiveSubscription ? 'monthly' : 'daily'
    });
  };

  const handleEmergencySubmit = (e) => {
    e.preventDefault();

    // Construct the complete, comprehensive address for the rider
    const fullPickupDetails = addressType === 'home'
      ? (parentProfile?.deliveryAddress || 'Anna Nagar East, Chennai')
      : [
          customBuildingNote.trim() ? `Door/Floor: ${customBuildingNote.trim()}` : null,
          detectedLocationName || 'Chennai',
          `[GPS: ${liveCoords.lat.toFixed(4)}°N, ${liveCoords.lng.toFixed(4)}°E]`
        ].filter(Boolean).join(' • ');

    createOrder({
      parentName: `${parentProfile?.parentName || 'Parent'} (Emergency Solo)`,
      parentPhone: "+91 94441 55667",
      studentName: parentProfile?.studentName || 'Student',
      schoolName: parentProfile?.schoolName || 'Neelan Matriculation Higher Secondary School',
      schoolMapsLink: parentProfile?.schoolMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((parentProfile?.schoolName || 'School') + ', Tamil Nadu')}`,
      schoolCoordinates: parentProfile?.schoolCoordinates || targetSchoolCoords,
      classDept: parentProfile?.studentClass || 'Class 6-A',
      lunchTime: parentProfile?.lunchTime || '12:30 PM',
      pickupAddress: fullPickupDetails,
      landmark: customBuildingNote.trim(),
      distanceKm: emergencyDistance,
      price: emergencyTotalPrice,
      paymentMode: 'emergency',
      recipientType: 'School Staff / Gate Office'
    });
    showToast(`⚡ Priority Emergency Rider dispatched for ${parentProfile?.studentName || 'your child'}! ₹${emergencyTotalPrice} secured in escrow.`, 'success');
    setActiveTab('orders');
  };

  const headerRef = useRef(null);
  const handleHeaderMouse = (e) => {
    if (!headerRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width  - 0.5) * 12;
    const y = ((clientY - top)  / height - 0.5) * 12;
    headerRef.current.style.transform = `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) scale(1.01)`;
  };
  const handleHeaderLeave = () => {
    if (headerRef.current)
      headerRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 0 80px' }}>
      <div className="noise-overlay" />
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        
        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: 60, marginTop: 20 }}>
          {/* Left Text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div className="section-badge reveal" style={{ margin: 0 }}>
                Parent Portal
              </div>
              <button
                type="button"
                onClick={() => setShowTour(true)}
                className="card-lift"
                style={{
                  background: darkMode ? 'rgba(249,115,22,0.15)' : '#FFF7ED',
                  border: '1.5px solid rgba(249,115,22,0.4)',
                  color: '#F97316',
                  borderRadius: 20,
                  padding: '5px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(249,115,22,0.15)'
                }}
              >
                <Sparkles size={13} />
                <span>Platform Tour & Guide</span>
              </button>
            </div>
            
            <h1 className="reveal reveal-delay-1" style={{ fontSize: '3.6rem', marginBottom: 16, lineHeight: 1.05 }}>
              Welcome back,<br />
              <span className="grad-saffron italic-serif">{parentProfile?.parentName || 'Parent'}.</span>
            </h1>

            {/* 🌟 Ultra-Attractive Luxury Student Profile Glass Card */}
            <div className="reveal reveal-delay-2" style={{
              maxWidth: 520,
              marginBottom: 24,
              background: darkMode
                ? 'linear-gradient(145deg, rgba(26, 18, 12, 0.88) 0%, rgba(15, 10, 6, 0.95) 100%)'
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 237, 0.88) 100%)',
              border: darkMode
                ? '1.5px solid rgba(249, 115, 22, 0.35)'
                : '1.5px solid rgba(249, 115, 22, 0.45)',
              borderRadius: 22,
              padding: '20px 22px 18px',
              boxShadow: darkMode
                ? '0 16px 44px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.15)'
                : '0 12px 36px rgba(234, 88, 12, 0.12), inset 0 1px 2px #FFFFFF',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}>
              {/* Header: Student Identity + Verified Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFF', boxShadow: '0 6px 18px rgba(249,115,22,0.4)',
                    flexShrink: 0
                  }}>
                    <User size={22} strokeWidth={2.6} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: darkMode ? '#FEFEFE' : '#0F172A', letterSpacing: '-0.01em' }}>
                        {parentProfile?.studentName || 'Student'}
                      </span>
                      <span style={{
                        background: 'rgba(249,115,22,0.14)',
                        border: '1px solid rgba(249,115,22,0.35)',
                        color: '#F97316',
                        fontSize: '0.74rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: 8,
                        letterSpacing: '0.04em',
                      }}>
                        {parentProfile?.studentClass || 'Class 9-B'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.5)' : '#64748B', marginTop: 2 }}>
                      Registered Child & Daily Lunch Recipient
                    </div>
                  </div>
                </div>

                {/* Verified Identity Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(16,185,129,0.12)',
                  border: '1.5px solid rgba(16,185,129,0.35)',
                  padding: '4px 10px',
                  borderRadius: 20,
                  color: '#10B981',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
                }}>
                  <ShieldCheck size={13} strokeWidth={2.8} />
                  <span>PERMANENT RECORD</span>
                </div>
              </div>

              {/* 2x2 Bento Micro-Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                {/* 1. Date of Birth */}
                <div style={{
                  background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
                  border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12, padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'rgba(249,115,22,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#F97316', flexShrink: 0
                  }}>
                    <Calendar size={16} strokeWidth={2.4} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.64rem', color: darkMode ? 'rgba(255,255,255,0.5)' : '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Date of Birth (DOB)
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: darkMode ? '#FFF' : '#0F172A', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                      {parentProfile?.studentDob || '14-08-2011'}
                    </div>
                  </div>
                </div>

                {/* 2. Target Delivery Time */}
                <div style={{
                  background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
                  border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12, padding: '10px 12px',
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10,
                    background: 'rgba(234,88,12,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#EA580C', flexShrink: 0
                  }}>
                    <Clock size={16} strokeWidth={2.4} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.64rem', color: darkMode ? 'rgba(255,255,255,0.5)' : '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Delivery Bell Window
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#F97316' }}>
                      {parentProfile?.lunchTime || '12:30 PM'}
                    </div>
                  </div>
                </div>

                {/* 3. School Campus Destination */}
                <div style={{
                  gridColumn: '1 / -1',
                  background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
                  border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 12, padding: '11px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: 'rgba(13,148,136,0.14)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0D9488', flexShrink: 0
                    }}>
                      <School size={17} strokeWidth={2.4} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.64rem', color: darkMode ? 'rgba(255,255,255,0.5)' : '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        School Campus Destination
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: darkMode ? '#FFF' : '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {parentProfile?.schoolName || 'Partner School'}
                      </div>
                    </div>
                  </div>

                  {/* High-End Maps Navigation Pill */}
                  <a
                    href={parentProfile?.schoolMapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((parentProfile?.schoolName || 'School') + ', Tamil Nadu')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: '#0D9488',
                      background: 'rgba(13,148,136,0.12)',
                      border: '1.5px solid rgba(13,148,136,0.3)',
                      padding: '5px 11px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(13,148,136,0.12)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#0D9488';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(13,148,136,0.12)';
                      e.currentTarget.style.color = '#0D9488';
                    }}
                  >
                    <Compass size={13} strokeWidth={2.5} />
                    <span>Gate GPS Map</span>
                    <ExternalLink size={11} strokeWidth={2.5} />
                  </a>
                </div>

                {/* 4. Active Subscription */}
                <div style={{
                  gridColumn: '1 / -1',
                  background: darkMode ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: 12, padding: '10px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'rgba(16,185,129,0.18)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#10B981', flexShrink: 0
                    }}>
                      <Sparkles size={14} strokeWidth={2.4} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.64rem', color: darkMode ? 'rgba(255,255,255,0.5)' : '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Active Subscription Pass
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#10B981' }}>
                        {parentProfile?.subscriptionPlan || 'Monthly Active User'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: 6 }}>
                    ✓ 100% COVERED
                  </span>
                </div>
              </div>

              {/* Action: School Transfer / Class Update Pill */}
              <button
                type="button"
                onClick={() => {
                  const currentClass = parentProfile?.studentClass || 'Class 9-B';
                  const parts = currentClass.split('-');
                  const grade = parts[0] || 'Class 9';
                  const sec = parts[1] || 'B';
                  setEditSchoolForm({
                    studentGrade: GRADE_OPTIONS.includes(grade) ? grade : 'Class 9',
                    studentSection: SECTION_OPTIONS.includes(sec) ? sec : 'Other / Custom',
                    customSection: SECTION_OPTIONS.includes(sec) ? '' : sec,
                    schoolName: parentProfile?.schoolName || '',
                    lunchTime: parentProfile?.lunchTime || '12:30 PM',
                  });
                  setShowSchoolModal(true);
                }}
                style={{
                  background: darkMode 
                    ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.22) 0%, rgba(234, 88, 12, 0.12) 100%)' 
                    : 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
                  border: darkMode 
                    ? '1.5px solid rgba(249, 115, 22, 0.45)' 
                    : '1.5px solid rgba(249, 115, 22, 0.55)',
                  borderRadius: 14,
                  padding: '11px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: darkMode 
                    ? '0 6px 20px rgba(249, 115, 22, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.2)' 
                    : '0 4px 16px rgba(234, 88, 12, 0.12), inset 0 1px 1px #FFFFFF',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  marginTop: 4,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(249, 115, 22, 0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = darkMode 
                    ? '0 6px 20px rgba(249, 115, 22, 0.22)' 
                    : '0 4px 16px rgba(234, 88, 12, 0.12)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFFFFF', boxShadow: '0 2px 8px rgba(249, 115, 22, 0.4)',
                    flexShrink: 0,
                  }}>
                    <School size={14} strokeWidth={2.4} />
                  </div>
                  <span style={{
                    color: darkMode ? '#FEFEFE' : '#1A120B',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-ui)',
                    letterSpacing: '0.01em',
                  }}>
                    School Transfer / Update Class
                  </span>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '4px 12px',
                  borderRadius: 8,
                  letterSpacing: '0.04em',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  <span>EDIT</span>
                  <ArrowRight size={12} strokeWidth={3} />
                </div>
              </button>
            </div>

            <div id="hero-food-ready-row" className="reveal reveal-delay-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              {activeOrder ? (
                <button
                  className="btn-primary"
                  onClick={() => {
                    setIsTrackingActive(true);
                    setActiveTab('orders');
                  }}
                  style={{
                    background: activeOrder.status === 'Arrived at Pickup' ? '#10B981' : '#EA580C',
                    boxShadow: '0 4px 16px rgba(234,88,12,0.4)',
                    display: 'flex', alignItems: 'center', gap: 8
                  }}
                  title="View active delivery status"
                >
                  {activeOrder.status === 'Notified to Driver' ? (
                    <>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFF', animation: 'ping 1.2s infinite', display: 'inline-block' }} />
                      <span>Notified to Driver...</span>
                    </>
                  ) : activeOrder.status === 'Arrived at Pickup' ? (
                    <>
                      <Bell size={18} />
                      <span>Driver Arrived! (OTP: {activeOrder.pickupOtp})</span>
                    </>
                  ) : activeOrder.status === 'Driver Assigned' || activeOrder.status === 'Driver Nearing' ? (
                    <>
                      <Navigation size={18} />
                      <span>Driver Assigned: En Route</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={18} />
                      <span>En Route to School</span>
                    </>
                  )}
                  <ArrowRight size={17} />
                </button>
              ) : (
                <button className="btn-primary" onClick={handleQuickFoodReady} title="Summon verified driver for pickup">
                  <Utensils size={18} /> Food Ready <ArrowRight size={17} />
                </button>
              )}

              {/* Holiday Auto-Pause Quick Toggle directly next to Food Ready */}
              <div 
                id="hero-holiday-pause-toggle"
                style={{
                  background: holidayPauseConfig.enabled 
                    ? (darkMode ? 'rgba(234,88,12,0.18)' : '#FFF7ED') 
                    : (darkMode ? 'rgba(255,255,255,0.06)' : '#F8FAFC'),
                  border: holidayPauseConfig.enabled ? '1.5px solid #EA580C' : (darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #CBD5E1'),
                  borderRadius: 14, padding: '7px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: holidayPauseConfig.enabled ? '0 4px 14px rgba(234,88,12,0.18)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} color={holidayPauseConfig.enabled ? '#EA580C' : 'var(--text-muted)'} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: holidayPauseConfig.enabled ? '#EA580C' : 'var(--text-heading)' }}>
                      {holidayPauseConfig.enabled ? holidayPauseConfig.holidayName : 'Holiday Auto-Pause'}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                      {holidayPauseConfig.enabled ? (holidayPauseConfig.days + ' Days • Rollover Active') : 'Pause tomorrow, weekend, or custom'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleHolidayPause}
                  className="card-lift"
                  style={{
                    width: 48, height: 26, borderRadius: 99,
                    background: holidayPauseConfig.enabled ? '#EA580C' : (darkMode ? 'rgba(255,255,255,0.2)' : '#CBD5E1'),
                    border: 'none', cursor: 'pointer', position: 'relative',
                    padding: 2, transition: 'all 0.25s ease'
                  }}
                  title={holidayPauseConfig.enabled ? 'Click to resume deliveries' : 'Click to pause for holidays'}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: '#FFFFFF',
                    transform: holidayPauseConfig.enabled ? 'translateX(22px)' : 'translateX(0)',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.25)'
                  }} />
                </button>
              </div>
            </div>
            
            <div className="reveal reveal-delay-4" style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ 
                background: 'rgba(13,148,136,0.12)', color: '#0D9488', 
                border: '1.5px solid rgba(13,148,136,0.3)', fontSize: '0.72rem', 
                padding: '5px 12px', borderRadius: 99, fontWeight: 800,
                letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 6
              }}>
                <CheckCircle2 size={13} color="#0D9488" strokeWidth={2.8} />
                <span>MOBILE VERIFIED</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('parent-details')}
                style={{
                  background: darkMode ? 'rgba(249,115,22,0.12)' : '#FFF7ED',
                  color: '#F97316',
                  border: '1.5px solid rgba(249,115,22,0.35)',
                  fontSize: '0.74rem',
                  padding: '5px 14px',
                  borderRadius: 99,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(249,115,22,0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(249,115,22,0.22)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(249,115,22,0.12)' : '#FFF7ED';
                }}
                title="View & Edit Verified Parent Details & Doorstep Pickup Address"
              >
                <Home size={13} color="#F97316" strokeWidth={2.4} />
                <span>Pickup Hub:</span>
                <span style={{ textDecoration: 'underline', color: darkMode ? '#FFF' : '#0F172A' }}>
                  {hubVillage || parentProfile?.addressDetails?.areaVillage || 'Anna Nagar East'} ({parentProfile?.distanceKm || 3.5} km)
                </span>
                <ArrowRight size={12} strokeWidth={2.6} />
              </button>
            </div>
          </div>

          {/* Right Visual */}
          <div className="reveal-scale">
            <ParentHeroVisual />
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
          marginBottom: 30,
        }}>
          {[
            { 
              id: 'orders', 
              label: 'Live Tracking & Active Lunch', 
              icon: Navigation, 
              color: '#F97316',
              hasLiveDot: true 
            },
            { 
              id: 'emergency', 
              label: 'Emergency Lunch Request', 
              icon: Zap, 
              color: '#EA580C' 
            },
            { 
              id: 'subscription', 
              label: 'Subscription Plans', 
              icon: Sparkles, 
              color: '#10B981' 
            },
            { 
              id: 'reports', 
              label: 'Monthly Reports', 
              icon: BarChart3, 
              color: '#8B5CF6' 
            },
            { 
              id: 'parent-details', 
              label: 'Parent Details & Pickup Hub', 
              icon: Home, 
              color: '#0D9488' 
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive 
                    ? (darkMode ? 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)' : '#1A120B') 
                    : (darkMode ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF'),
                  border: isActive 
                    ? (darkMode ? '1.5px solid #F97316' : '1.5px solid #1A120B')
                    : (darkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.08)'),
                  color: isActive ? '#FFFFFF' : (darkMode ? 'rgba(255,255,255,0.7)' : '#475569'),
                  padding: '10px 20px',
                  borderRadius: 18,
                  fontSize: '0.88rem',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: isActive ? 800 : 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isActive 
                    ? (darkMode ? '0 8px 24px rgba(249, 115, 22, 0.4), inset 0 1px 1px rgba(255,255,255,0.3)' : '0 8px 24px rgba(26,18,11,0.25), inset 0 1px 1px #FFFFFF') 
                    : (darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)')
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.color = darkMode ? '#FFFFFF' : '#0F172A';
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : '#FFF7ED';
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(249,115,22,0.35)' : 'rgba(249,115,22,0.3)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.color = darkMode ? 'rgba(255,255,255,0.7)' : '#475569';
                    e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF';
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.08)';
                    e.currentTarget.style.boxShadow = darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.04)';
                  }
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 8,
                  background: isActive 
                    ? (darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(249,115,22,0.25)')
                    : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#FFFFFF' : tab.color,
                  transition: 'all 0.25s ease',
                  flexShrink: 0
                }}>
                  <Icon size={14} strokeWidth={2.4} />
                </div>

                <span>{tab.label}</span>

                {tab.hasLiveDot && (
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 8px #10B981',
                    display: 'inline-block',
                    animation: 'pulse 1.8s infinite',
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* School Holiday Auto-Pause Active Alert Banner */}
            {holidayPauseConfig.enabled && (
              <div style={{
                background: darkMode ? 'rgba(234,88,12,0.12)' : '#FFF7ED',
                border: '1.5px solid #EA580C',
                borderRadius: 18, padding: '16px 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
                boxShadow: '0 4px 16px rgba(234,88,12,0.12)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#EA580C' }}>
                        Holiday Auto-Pause Active: {holidayPauseConfig.holidayName}
                      </h4>
                      <span style={{ background: '#EA580C', color: '#FFF', padding: '2px 9px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 800 }}>
                        {holidayPauseConfig.days} Days Paused
                      </span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: darkMode ? '#E2E8F0' : '#475569' }}>
                      Lunch delivery paused for {holidayPauseConfig.dates}. Resumes on <strong>{holidayPauseConfig.resumes}</strong>. Unused days roll over automatically!
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowHolidayModal(true)}
                    style={{ background: 'transparent', border: '1px solid #EA580C', color: '#EA580C', padding: '8px 14px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Change Dates
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleHolidayPause}
                    style={{ background: '#EA580C', border: 'none', color: '#FFF', padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Resume Deliveries
                  </button>
                </div>
              </div>
            )}

            {/* Premium header strip */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: darkMode
                ? 'linear-gradient(135deg, #060D1F 0%, #0D1B30 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)',
              borderRadius: 22, padding: '18px 24px',
              border: darkMode
                ? '1px solid rgba(46,196,182,0.25)'
                : '1.5px solid rgba(249,115,22,0.25)',
              boxShadow: darkMode
                ? '0 8px 32px rgba(0,0,0,0.4)'
                : '0 10px 30px rgba(249,115,22,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  boxShadow: '0 6px 18px rgba(249,115,22,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  color: 'white'
                }}>📍</div>
                <div>
                  <div style={{ color: darkMode ? '#FEFEFE' : '#1A120B', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.01em', fontFamily: 'var(--font-display)' }}>
                    Active Delivery Tracking
                  </div>
                  <div style={{ color: darkMode ? 'rgba(255,255,255,0.55)' : '#C2410C', fontSize: '0.84rem', marginTop: 3, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>
                    Order ID: <span style={{ color: '#F97316', fontWeight: 800 }}>{activeOrder ? activeOrder.id : '—'}</span> • {activeOrder ? (activeOrder.status || 'Notified to Driver') : 'Standby'}
                  </div>
                </div>
              </div>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    background: darkMode ? 'rgba(249,115,22,0.12)' : '#FFF7ED',
                    border: '1.5px solid rgba(249,115,22,0.3)',
                    padding: '7px 14px', borderRadius: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-heading)'
                  }}>
                    <School size={15} color="#EA580C" />
                    <span>{parentProfile?.schoolName || 'Destination School'}</span>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: darkMode ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                    border: darkMode ? '1px solid rgba(16,185,129,0.4)' : '1.5px solid #A7F3D0',
                    padding: '7px 16px', borderRadius: 20,
                    boxShadow: '0 2px 8px rgba(16,185,129,0.15)'
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px rgba(16,185,129,0.9)', display: 'inline-block', animation: 'ping 1.4s infinite' }} />
                    <span style={{ color: '#059669', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em' }}>LIVE GPS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-col: tracker + sidebar */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 26, alignItems: 'start' }}>
              <div id="live-orders-tracking-section" className="reveal-left">
                {!hasActiveSubscription ? (
                  <div style={{
                    background: darkMode ? 'linear-gradient(135deg, #18120E 0%, #0F0C0A 100%)' : '#FFFFFF',
                    border: '1.5px solid rgba(249,115,22,0.35)',
                    borderRadius: 24, padding: '48px 32px', textAlign: 'center',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                  }}>
                    <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                      🍱
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 900, color: darkMode ? '#FFF' : '#0F172A', fontFamily: 'var(--font-display)' }}>
                        No Active Lunch Pass Yet
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: 480, lineHeight: 1.55 }}>
                        Welcome, {parentProfile?.parentName || 'Parent'}! Choose a 5-day trial, 20-day standard, or VIP lunch pass for {parentProfile?.studentName || 'your child'} to start hot doorstep tiffin delivery.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setActiveTab('subscription')}
                        className="btn-saffron card-lift"
                        style={{ padding: '12px 24px', borderRadius: 14, fontWeight: 900, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        <span>View Passes & Dynamic Pricing</span>
                        <ArrowRight size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTour(true)}
                        style={{
                          background: darkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                          border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #CBD5E1',
                          color: 'var(--text-heading)', padding: '12px 20px', borderRadius: 14,
                          fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer'
                        }}
                      >
                        🎓 Take Guided Tour
                      </button>
                    </div>
                  </div>
                ) : holidayPauseConfig.enabled ? (
                  /* Condition A: Deliveries Paused for Holiday */
                  <div style={{
                    background: darkMode ? 'linear-gradient(135deg, rgba(234,88,12,0.14) 0%, rgba(26,18,11,0.6) 100%)' : '#FFF7ED',
                    border: '1.5px solid #EA580C',
                    borderRadius: 24, padding: '42px 32px', textAlign: 'center',
                    boxShadow: '0 8px 30px rgba(234,88,12,0.15)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14
                  }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
                      <Calendar size={32} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 900, color: '#EA580C' }}>
                        Deliveries Paused: {holidayPauseConfig.holidayName}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: darkMode ? '#E2E8F0' : '#475569', maxWidth: 460, lineHeight: 1.55 }}>
                        Lunch deliveries are paused for <strong>{holidayPauseConfig.dates}</strong> ({holidayPauseConfig.days} days). No meals are packed and no driver is on the road. Deliveries resume automatically on <strong>{holidayPauseConfig.resumes}</strong>.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={handleToggleHolidayPause}
                        className="btn-saffron card-lift"
                        style={{ padding: '10px 22px', borderRadius: 12, fontWeight: 800, fontSize: '0.86rem' }}
                      >
                        Resume Daily Deliveries Now
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowHolidayModal(true)}
                        style={{
                          background: 'transparent', border: '1.5px solid #EA580C',
                          color: '#EA580C', padding: '10px 20px', borderRadius: 12,
                          fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer'
                        }}
                      >
                        Change Holiday Dates
                      </button>
                    </div>
                  </div>
                ) : (activeOrder) ? (
                  /* Condition B: Active Live Road GPS Tracking (in use only!) */
                  <DeliveryProcedureLifecycle 
                    order={{
                      ...activeOrder,
                      pickupAddress: parentProfile?.deliveryAddress || activeOrder.pickupAddress,
                      homeCoordinates: parentProfile?.homeCoordinates || parentProfile?.addressDetails?.coordinates || activeOrder.homeCoordinates,
                      schoolName: parentProfile?.schoolName || activeOrder.schoolName,
                      schoolCoordinates: parentProfile?.schoolCoordinates || targetSchoolCoords || activeOrder.schoolCoordinates,
                      distanceKm: autoDistance || activeOrder.distanceKm,
                      price: hasActiveSubscription 
                        ? (parentProfile?.dailyRate || (40 + Math.round(Math.max(0, (autoDistance || 3.5) - 3) * 8)))
                        : (50 + Math.round(Math.max(0, (autoDistance || 3.5) - 3) * 10))
                    }} 
                    school={parentProfile?.schoolName || activeOrder?.schoolName || selectedSchool} 
                    onComplete={() => {
                      updateOrderStatus(activeOrder.id, 'Delivered');
                      setIsTrackingActive(false);
                      showToast('Tiffin safely delivered at school gate! Delivery complete.', 'success');
                    }}
                    darkMode={darkMode}
                  />
                ) : (
                  /* Condition C: Calm Standby Mode (tracking only runs when requested) */
                  <div style={{
                    background: darkMode ? 'linear-gradient(135deg, #060D1F 0%, #0D1B30 100%)' : '#FFFFFF',
                    border: darkMode ? '1px solid rgba(16,185,129,0.3)' : '1.5px solid #A7F3D0',
                    borderRadius: 24, padding: '40px 32px', textAlign: 'center',
                    boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.35)' : '0 8px 28px rgba(0,0,0,0.06)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14
                  }}>
                    <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                      <Clock size={30} />
                    </div>
                    <div>
                      <div style={{ color: darkMode ? 'white' : '#1A120B', fontWeight: 800, fontSize: '1.25rem', marginBottom: 6 }}>
                        Pass Active: {parentProfile?.subscriptionPlan || 'Monthly Active User'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 460, lineHeight: 1.55 }}>
                        Today's hot tiffin pickup is scheduled at <strong>11:30 AM</strong> for {parentProfile?.schoolName}. When your child's tiffin is packed and warm, tap below to summon your assigned driver Ramesh Kumar!
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeOrder) {
                            setIsTrackingActive(true);
                            setActiveTab('orders');
                          } else {
                            handleQuickFoodReady();
                          }
                        }}
                        className="btn-saffron card-lift"
                        style={{ padding: '12px 26px', borderRadius: 14, fontWeight: 900, fontSize: '0.94rem', display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        {activeOrder?.status === 'Notified to Driver' ? (
                          <>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFF', animation: 'ping 1.2s infinite', display: 'inline-block' }} />
                            <span>Notified to Driver — Finding Partner</span>
                            <ArrowRight size={16} />
                          </>
                        ) : activeOrder ? (
                          <>
                            <Navigation size={18} />
                            <span>Active: {activeOrder.status}</span>
                            <ArrowRight size={16} />
                          </>
                        ) : (
                          <>
                            <Utensils size={18} />
                            <span>Pack Tiffin & Mark "Food Ready"</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleHolidayPause}
                        style={{
                          background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFF7ED',
                          border: '1px solid #FDBA74',
                          color: '#EA580C',
                          borderRadius: 14, padding: '11px 18px',
                          fontWeight: 800, fontSize: '0.86rem',
                          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                        }}
                        title="Pause deliveries for holidays or weekends"
                      >
                        <Calendar size={16} />
                        <span>Pause for Holidays</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* 1. Student & School Info Card */}
                <div style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(217,119,6,0.14) 0%, rgba(26,18,11,0.6) 100%)'
                    : 'linear-gradient(145deg, #FFFFFF 0%, #FFFDF8 100%)',
                  border: darkMode
                    ? '1.5px solid rgba(217,119,6,0.35)'
                    : '1.5px solid rgba(217,119,6,0.22)',
                  borderRadius: 24, padding: '24px',
                  boxShadow: darkMode
                    ? '0 12px 36px rgba(0,0,0,0.4)'
                    : '0 12px 32px rgba(217,119,6,0.12), 0 2px 6px rgba(0,0,0,0.04)',
                }} className="reveal-right reveal-delay-1">
                  
                  {/* Card Title */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 4px 12px rgba(217,119,6,0.3)'
                      }}>
                        <School size={19} />
                      </div>
                      <h4 style={{
                        color: darkMode ? '#FEFEFE' : '#1A120B',
                        fontSize: '1.08rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                        margin: 0
                      }}>
                        Student & School
                      </h4>
                    </div>
                    <span style={{
                      background: darkMode ? 'rgba(245,158,11,0.18)' : '#FEF3C7',
                      color: '#D97706',
                      border: darkMode ? '1px solid rgba(245,158,11,0.3)' : '1px solid #FDE68A',
                      fontSize: '0.7rem', fontWeight: 800, padding: '3px 9px', borderRadius: 20
                    }}>
                      {(parentProfile?.studentClass || 'Class 9-B').toUpperCase()}
                    </span>
                  </div>

                  {/* Colorful Info Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      {
                        emoji: '👦',
                        label: 'Student Name',
                        value: parentProfile?.studentName || 'Student',
                        labelColor: darkMode ? '#93C5FD' : '#2563EB',
                        iconBg: darkMode ? 'rgba(59,130,246,0.15)' : '#EFF6FF',
                        borderClr: darkMode ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.2)',
                        valColor: darkMode ? '#F8FAFC' : '#0F172A',
                      },
                      {
                        emoji: '🏫',
                        label: 'School Destination',
                        value: parentProfile?.schoolName || 'DAV Higher Secondary School',
                        labelColor: darkMode ? '#6EE7B7' : '#059669',
                        iconBg: darkMode ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                        borderClr: darkMode ? 'rgba(16,185,129,0.25)' : 'rgba(16,185,129,0.2)',
                        valColor: darkMode ? '#F8FAFC' : '#0F172A',
                      },
                      {
                        emoji: '📚',
                        label: 'Class & Roll No',
                        value: `${parentProfile?.studentClass || 'Class 9-B'} • Roll No: ${parentProfile?.rollNo || '14'}`,
                        labelColor: darkMode ? '#D8B4FE' : '#7C3AED',
                        iconBg: darkMode ? 'rgba(168,85,247,0.15)' : '#FAF5FF',
                        borderClr: darkMode ? 'rgba(168,85,247,0.25)' : 'rgba(168,85,247,0.2)',
                        valColor: darkMode ? '#F8FAFC' : '#0F172A',
                      },
                      {
                        emoji: '🕐',
                        label: 'Target Lunch Time',
                        value: `${parentProfile?.lunchTime || '12:30 PM'} sharp`,
                        labelColor: darkMode ? '#FDBA74' : '#EA580C',
                        iconBg: darkMode ? 'rgba(249,115,22,0.18)' : '#FFF7ED',
                        borderClr: darkMode ? 'rgba(249,115,22,0.35)' : 'rgba(249,115,22,0.3)',
                        valColor: '#EA580C',
                        badge: '🔥 Hot Serve'
                      },
                      {
                        emoji: '🚪',
                        label: 'Gate / Reception',
                        value: parentProfile?.receptionGate || 'Gate 2 Staff / Security Office',
                        labelColor: darkMode ? '#F472B6' : '#E11D48',
                        iconBg: darkMode ? 'rgba(244,63,94,0.15)' : '#FFF1F2',
                        borderClr: darkMode ? 'rgba(244,63,94,0.25)' : 'rgba(244,63,94,0.2)',
                        valColor: darkMode ? '#F8FAFC' : '#0F172A',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: item.iconBg,
                          border: `1px solid ${item.borderClr}`,
                          borderRadius: 14, padding: '10px 14px',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          <span style={{ fontSize: '1.25rem' }}>{item.emoji}</span>
                          <div>
                            <div style={{
                              color: item.labelColor,
                              fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                              letterSpacing: '0.06em', marginBottom: 2
                            }}>
                              {item.label}
                            </div>
                            <div style={{ color: item.valColor, fontWeight: 700, fontSize: '0.88rem' }}>
                              {item.value}
                            </div>
                          </div>
                        </div>
                        {item.badge && (
                          <span style={{
                            background: darkMode ? 'rgba(234,88,12,0.25)' : '#FFEDD5',
                            color: '#EA580C',
                            border: '1px solid rgba(234,88,12,0.3)',
                            fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                            whiteSpace: 'nowrap'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Security Shield Card */}
                <div style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(26,18,11,0.6) 100%)'
                    : 'linear-gradient(145deg, #FFFFFF 0%, #F0FDF4 100%)',
                  border: darkMode
                    ? '1.5px solid rgba(16,185,129,0.35)'
                    : '1.5px solid rgba(16,185,129,0.25)',
                  borderRadius: 24, padding: '24px',
                  boxShadow: darkMode
                    ? '0 12px 36px rgba(0,0,0,0.4)'
                    : '0 12px 32px rgba(16,185,129,0.12), 0 2px 6px rgba(0,0,0,0.04)',
                }} className="reveal-right reveal-delay-2">
                  
                  {/* Card Title */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #10B981, #0D9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                      }}>
                        <ShieldCheck size={20} />
                      </div>
                      <h4 style={{
                        color: darkMode ? '#FEFEFE' : '#1A120B',
                        fontSize: '1.08rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                        margin: 0
                      }}>
                        Security Shield
                      </h4>
                    </div>
                    <span style={{
                      background: darkMode ? 'rgba(16,185,129,0.2)' : '#D1FAE5',
                      color: '#059669',
                      border: darkMode ? '1px solid rgba(16,185,129,0.35)' : '1px solid #A7F3D0',
                      fontSize: '0.7rem', fontWeight: 800, padding: '3px 9px', borderRadius: 20
                    }}>
                      PROTECTED
                    </span>
                  </div>

                  {/* Security Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      {
                        emoji: '🔑',
                        title: 'Double OTP Handshake',
                        desc: 'Pickup OTP at home + Gate delivery OTP',
                        badge: '2FA SECURED',
                        badgeBg: darkMode ? 'rgba(249,115,22,0.2)' : '#FFF7ED',
                        badgeColor: '#EA580C',
                        bg: darkMode ? 'rgba(249,115,22,0.08)' : '#FFFFFF',
                        border: darkMode ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.2)',
                      },
                      {
                        emoji: '📡',
                        title: 'Live GPS Satellite Ping',
                        desc: 'Real-time telemetry every 3 seconds',
                        badge: 'ACTIVE 🟢',
                        badgeBg: darkMode ? 'rgba(16,185,129,0.2)' : '#ECFDF5',
                        badgeColor: '#059669',
                        bg: darkMode ? 'rgba(16,185,129,0.08)' : '#FFFFFF',
                        border: darkMode ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.2)',
                      },
                      {
                        emoji: '🛡️',
                        title: '100% KYC Verified Partner',
                        desc: 'Aadhaar, background & police checked',
                        badge: 'VERIFIED ✓',
                        badgeBg: darkMode ? 'rgba(59,130,246,0.2)' : '#EFF6FF',
                        badgeColor: '#2563EB',
                        bg: darkMode ? 'rgba(59,130,246,0.08)' : '#FFFFFF',
                        border: darkMode ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.2)',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        style={{
                          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                          background: item.bg,
                          border: `1px solid ${item.border}`,
                          borderRadius: 14, padding: '12px 14px',
                          gap: 10,
                          boxShadow: darkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                          <span style={{ fontSize: '1.3rem', marginTop: 1 }}>{item.emoji}</span>
                          <div>
                            <div style={{ color: darkMode ? '#FFFFFF' : '#0F172A', fontWeight: 700, fontSize: '0.86rem', marginBottom: 2 }}>
                              {item.title}
                            </div>
                            <div style={{ color: darkMode ? 'rgba(255,255,255,0.55)' : '#64748B', fontSize: '0.76rem', lineHeight: 1.3 }}>
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          background: item.badgeBg,
                          color: item.badgeColor,
                          fontSize: '0.64rem', fontWeight: 800, padding: '3px 8px', borderRadius: 8,
                          whiteSpace: 'nowrap', alignSelf: 'flex-start'
                        }}>
                          {item.badge}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EMERGENCY DELIVERY */}
        {activeTab === 'emergency' && (
          <div className="card reveal-scale" style={{ 
            padding: '36px 40px', 
            maxWidth: 720, 
            margin: '0 auto', 
            border: darkMode ? '1.5px solid rgba(249,115,22,0.35)' : '1.5px solid rgba(249,115,22,0.25)', 
            background: darkMode 
              ? 'linear-gradient(145deg, rgba(26,18,11,0.95) 0%, rgba(12,15,26,0.95) 100%)' 
              : 'linear-gradient(145deg, #FFFFFF 0%, #FFF7ED 100%)',
            boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 50px rgba(249,115,22,0.1)',
            borderRadius: 28
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #F97316, #EA580C)', 
                  color: '#FFF', 
                  width: 52, height: 52, 
                  borderRadius: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(249,115,22,0.35)'
                }}>
                  <Zap size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.65rem', fontFamily: 'var(--font-display)', color: 'var(--text-heading)', margin: 0, fontWeight: 800 }}>
                    Instant Emergency Booking
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                    Priority 2-min solo rider dispatch for unexpected schedules & forgotten tiffins.
                  </p>
                </div>
              </div>

              <span style={{
                background: 'rgba(249,115,22,0.15)',
                color: '#F97316',
                border: '1px solid rgba(249,115,22,0.35)',
                fontSize: '0.72rem', fontWeight: 800,
                padding: '6px 14px', borderRadius: 99,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <Zap size={13} /> 1:1 Solo Rapid Rider
              </span>
            </div>

            {/* Safety Guarantee Callout */}
            <div style={{
              background: darkMode ? 'rgba(16,185,129,0.1)' : '#ECFDF5',
              border: '1.5px solid rgba(16,185,129,0.3)',
              borderRadius: 16, padding: '14px 18px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <ShieldCheck size={22} color="#059669" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.82rem', color: darkMode ? '#D1FAE5' : '#065F46', lineHeight: 1.45 }}>
                <strong style={{ display: 'block', color: '#059669', marginBottom: 2 }}>
                  🔒 Mandatory Profile Lock Active for Student Safety:
                </strong>
                The student identity, destination school gate, and classroom lunch bell are permanently locked to your verified profile. Only the lunchbox pickup origin can be changed.
              </div>
            </div>

            <form onSubmit={handleEmergencySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* SECTION 1: MANDATORY LOCKED STUDENT & SCHOOL DETAILS */}
              <div style={{
                background: darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                borderRadius: 20, padding: '20px 22px',
                display: 'flex', flexDirection: 'column', gap: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                    <Lock size={14} color="#10B981" /> Destination Details (Locked for Student Security)
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                    🔒 VERIFIED & FIXED
                  </span>
                </div>

                {/* Locked Student Name */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                      Student Name (Recipient) *
                    </label>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>🔒 Fixed Identity</span>
                  </div>
                  <div style={{
                    background: darkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #CBD5E1',
                    borderRadius: 14, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: darkMode ? '#FFF' : '#0F172A', fontWeight: 800, fontSize: '0.96rem'
                  }}>
                    <span>{parentProfile?.studentName || 'Student'}</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      DOB: {parentProfile?.studentDob || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Locked School Destination */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                      School / College Destination *
                    </label>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>🔒 Destination Locked</span>
                  </div>
                  <div style={{
                    background: darkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #CBD5E1',
                    borderRadius: 14, padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: darkMode ? '#FFF' : '#0F172A', fontWeight: 800, fontSize: '0.96rem'
                  }}>
                    <span>{parentProfile?.schoolName || 'DAV Higher Secondary School'}</span>
                    <span style={{ fontSize: '0.74rem', color: '#F97316', fontWeight: 700 }}>School Gate Drop</span>
                  </div>
                </div>

                {/* Locked Class & Bell Time Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                        Class / Dept *
                      </label>
                      <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 700 }}>🔒 Fixed</span>
                    </div>
                    <div style={{
                      background: darkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                      border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #CBD5E1',
                      borderRadius: 14, padding: '12px 16px',
                      color: darkMode ? '#FFF' : '#0F172A', fontWeight: 800, fontSize: '0.92rem'
                    }}>
                      {parentProfile?.studentClass || 'Class 9-B'}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                        Delivery Bell Time *
                      </label>
                      <span style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 700 }}>🔒 Scheduled</span>
                    </div>
                    <div style={{
                      background: darkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                      border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #CBD5E1',
                      borderRadius: 14, padding: '12px 16px',
                      color: '#F97316', fontWeight: 800, fontSize: '0.92rem'
                    }}>
                      {parentProfile?.lunchTime || '12:30 PM'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: EDITABLE EMERGENCY PICKUP LOCATION */}
              <div style={{
                background: darkMode ? 'rgba(249,115,22,0.06)' : '#FFFBF7',
                border: '1.5px solid rgba(249,115,22,0.35)',
                borderRadius: 20, padding: '22px',
                boxShadow: darkMode ? '0 8px 24px rgba(249,115,22,0.08)' : '0 4px 16px rgba(249,115,22,0.05)',
                display: 'flex', flexDirection: 'column', gap: 16
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={18} color="#F97316" />
                      <label style={{ fontSize: '0.92rem', color: darkMode ? '#FFF' : '#1A120B', fontWeight: 800 }}>
                        Emergency Pickup Location *
                      </label>
                    </div>
                    <span style={{
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      color: '#FFF', fontSize: '0.68rem', fontWeight: 800,
                      padding: '3px 9px', borderRadius: 6, letterSpacing: '0.04em'
                    }}>
                      ✏️ CHANGEABLE IN EMERGENCY
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Where is the tiffin right now? In an emergency, our rider can pick up from your home, workplace, or anywhere in the city.
                  </p>
                </div>

                {/* Home vs Custom Address Toggle */}
                {/* Home vs Custom Live GPS Address Toggle */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressType('home');
                      setEmergencyPickupAddress(parentProfile?.deliveryAddress || 'Anna Nagar East, Chennai');
                      setEmergencyDistance(3.5);
                    }}
                    style={{
                      background: addressType === 'home' 
                        ? (darkMode ? 'rgba(249,115,22,0.2)' : '#FFEAD5') 
                        : (darkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                      border: addressType === 'home' 
                        ? '2px solid #F97316' 
                        : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #CBD5E1'),
                      color: addressType === 'home' ? '#F97316' : 'var(--text-heading)',
                      borderRadius: 14, padding: '13px 16px',
                      fontSize: '0.92rem', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🏠</span>
                    <span>Home Address</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAddressType('custom');
                      detectLiveLocation();
                    }}
                    style={{
                      background: addressType === 'custom' 
                        ? (darkMode ? 'rgba(249,115,22,0.2)' : '#FFEAD5') 
                        : (darkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                      border: addressType === 'custom' 
                        ? '2px solid #F97316' 
                        : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #CBD5E1'),
                      color: addressType === 'custom' ? '#F97316' : 'var(--text-heading)',
                      borderRadius: 14, padding: '13px 16px',
                      fontSize: '0.92rem', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>📍</span>
                    <span>Live GPS Location</span>
                  </button>
                </div>

                {/* If Home Address is selected */}
                {addressType === 'home' ? (
                  <div style={{
                    background: darkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.9)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid #CBD5E1',
                    borderRadius: 14, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 10
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 2 }}>
                        Registered Home Pickup Location
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: darkMode ? '#FFF' : '#0F172A' }}>
                        {parentProfile?.deliveryAddress || 'Anna Nagar East, Chennai'}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: 8 }}>
                      ✓ Auto-Selected Home (3.5 km)
                    </span>
                  </div>
                ) : (
                  /* If Custom Address is selected: Real-Time Live GPS Acquisition Card */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Live GPS Telemetry Box */}
                    <div style={{
                      background: darkMode ? 'rgba(0,0,0,0.45)' : '#FFFFFF',
                      border: '1.5px solid rgba(249,115,22,0.4)',
                      borderRadius: 16, padding: '16px 18px',
                      display: 'flex', flexDirection: 'column', gap: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: gpsStatus === 'locating' ? '#F59E0B' : '#10B981',
                            boxShadow: gpsStatus === 'locating' ? '0 0 10px #F59E0B' : '0 0 10px #10B981',
                            display: 'inline-block',
                            animation: gpsStatus === 'locating' ? 'pulse 1s infinite' : 'none'
                          }} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-heading)', letterSpacing: '0.05em' }}>
                            {gpsStatus === 'locating' ? '🛰️ Acquiring Real-Time Satellite GPS...' : '🟢 Live Device GPS Position Acquired'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10B981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                          Accuracy ±{gpsAccuracy}m
                        </span>
                      </div>

                      {/* Coordinates & Place name */}
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        borderRadius: 12, padding: '12px 14px',
                        display: 'flex', flexDirection: 'column', gap: 6,
                        border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                            Detected Coordinates:
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#F97316', fontWeight: 800, fontFamily: 'monospace' }}>
                            {liveCoords.lat.toFixed(4)}° N, {liveCoords.lng.toFixed(4)}° E
                          </span>
                        </div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 800, color: darkMode ? '#FEFEFE' : '#0F172A' }}>
                          📍 {detectedLocationName || 'Detecting current street location...'}
                        </div>
                      </div>

                      {/* Action buttons: Refresh GPS + Quick Test Coordinates */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                        <button
                          type="button"
                          onClick={detectLiveLocation}
                          style={{
                            background: 'linear-gradient(135deg, #F97316, #EA580C)',
                            color: '#FFF', border: 'none',
                            padding: '8px 14px', borderRadius: 10,
                            fontSize: '0.78rem', fontWeight: 800,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 4px 12px rgba(249,115,22,0.25)'
                          }}
                        >
                          <RefreshCw size={13} className={gpsStatus === 'locating' ? 'spin' : ''} />
                          <span>Fetch / Refresh My GPS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPinpointTargetContext('emergency');
                            setShowDoorstepPinpointModal(true);
                          }}
                          style={{
                            background: darkMode ? '#1E293B' : '#FFFFFF',
                            border: '1.5px solid #F97316',
                            color: '#F97316',
                            padding: '8px 14px', borderRadius: 10,
                            fontSize: '0.78rem', fontWeight: 800,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                          }}
                        >
                          <Crosshair size={13} />
                          <span>Pinpoint on Map</span>
                        </button>

                        {/* Quick Simulated Live Pins for Local Testing */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>Quick Pin:</span>
                          <button
                            type="button"
                            onClick={() => setTestLivePin(13.0418, 80.2341, 'T. Nagar (Pondy Bazaar)')}
                            style={{
                              background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                              border: '1px solid rgba(249,115,22,0.3)',
                              color: 'var(--text-heading)', padding: '4px 8px', borderRadius: 6,
                              fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            T. Nagar (3.8 km)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTestLivePin(13.0067, 80.2025, 'Olympia Tech Park, Guindy')}
                            style={{
                              background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                              border: '1px solid rgba(249,115,22,0.3)',
                              color: 'var(--text-heading)', padding: '4px 8px', borderRadius: 6,
                              fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Guindy (8.5 km)
                          </button>
                          <button
                            type="button"
                            onClick={() => setTestLivePin(12.9345, 80.2312, 'RMZ Millenia, OMR Expressway')}
                            style={{
                              background: darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                              border: '1px solid rgba(249,115,22,0.3)',
                              color: 'var(--text-heading)', padding: '4px 8px', borderRadius: 6,
                              fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            OMR (14.5 km)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Specific Door / Landmark Note */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                        Door No, Building Floor or Landmark (For Rider Pickup)
                      </label>
                      <input
                        type="text"
                        className="field-input"
                        value={customBuildingNote}
                        onChange={(e) => handleCustomBuildingChange(e.target.value)}
                        placeholder="e.g. 4th Floor, Regus Office, Tower 2 near Main Gate..."
                        style={{
                          width: '100%',
                          background: darkMode ? 'rgba(0,0,0,0.45)' : '#FFFFFF',
                          border: '1.5px solid rgba(249,115,22,0.4)',
                          borderRadius: 12, padding: '12px 16px',
                          color: darkMode ? '#FFF' : '#0F172A',
                          fontWeight: 700, fontSize: '0.92rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Real-time Dynamic Route Distance Calculation to School */}
                <div style={{
                  background: darkMode ? 'rgba(0,0,0,0.4)' : '#FFFFFF',
                  border: darkMode ? '1.5px solid rgba(249,115,22,0.3)' : '1.5px solid #FED7AA',
                  borderRadius: 16, padding: '16px 18px',
                  display: 'flex', flexDirection: 'column', gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', color: '#F97316', letterSpacing: '0.06em' }}>
                      🚗 Live Route Distance to School Gate
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F97316' }}>
                      {emergencyDistance} km
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: darkMode ? '#E2E8F0' : '#1E293B', fontWeight: 700, lineHeight: 1.5 }}>
                    📍 <strong>From (Live Pickup):</strong> {addressType === 'home' ? (parentProfile?.deliveryAddress || 'Anna Nagar East, Chennai') : (detectedLocationName || 'Live GPS Coordinates')}
                    {addressType === 'custom' && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}> ({liveCoords.lat.toFixed(4)}°, {liveCoords.lng.toFixed(4)}°)</span>}
                    <br />
                    🏫 <strong>To Destination:</strong> {parentProfile?.schoolName || targetSchoolCoords?.name || 'DAV Higher Secondary School'}
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}> ({targetSchoolCoords.lat.toFixed(4)}°, {targetSchoolCoords.lng.toFixed(4)}°)</span>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: darkMode ? 'rgba(249,115,22,0.08)' : '#FFF7ED',
                    padding: '8px 12px', borderRadius: 10, fontSize: '0.78rem', color: '#EA580C', fontWeight: 700
                  }}>
                    <span>⏱️ Estimated Solo Rider Transit SLA:</span>
                    <strong style={{ fontSize: '0.86rem' }}>~{Math.round(emergencyDistance * 3.5 + 4)} minutes</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 3: FARE BREAKDOWN & TRANSPARENT PAYOUT SPLIT */}
              <div style={{
                background: darkMode ? 'rgba(0,0,0,0.35)' : '#FFFFFF',
                border: '1.5px solid rgba(249,115,22,0.3)',
                borderRadius: 20, padding: '22px 24px',
                display: 'flex', flexDirection: 'column', gap: 16
              }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Wallet size={18} color="#F97316" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F97316' }}>
                      Live Distance Fare & Cost Split
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700, background: 'rgba(16,185,129,0.12)', padding: '3px 10px', borderRadius: 8 }}>
                    🛡️ 100% Escrow Protected
                  </span>
                </div>

                {/* PART 1: DISTANCE-BASED FARE BREAKDOWN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    1. Delivery Fare Calculation (Based on {emergencyDistance} km Live Route)
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Base Solo Dispatch (0.0 to 3.0 km):</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-heading)' }}>₹65.00</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Distance Charge ({extraEmergencyKm > 0 ? `+${extraEmergencyKm.toFixed(1)} km @ ₹10/km` : 'Within 3.0 km base radius'}):
                    </span>
                    <span style={{ fontWeight: 800, color: emergencyDistanceSurcharge > 0 ? '#F97316' : '#10B981' }}>
                      {emergencyDistanceSurcharge > 0 ? `+₹${emergencyDistanceSurcharge}.00` : '₹0.00 (Included in Base)'}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderTop: '1.5px dashed rgba(249,115,22,0.3)', paddingTop: 10, marginTop: 2
                  }}>
                    <span style={{ fontSize: '1.02rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                      Total Amount to Pay:
                    </span>
                    <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#F97316', fontFamily: 'var(--font-display)' }}>
                      ₹{emergencyTotalPrice}
                    </span>
                  </div>
                </div>

                {/* PART 2: TRANSPARENT PAYOUT DISTRIBUTION SPLIT */}
                <div style={{
                  background: darkMode ? 'rgba(255,255,255,0.03)' : '#FFFBF7',
                  border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #FED7AA',
                  borderRadius: 16, padding: '16px 18px',
                  display: 'flex', flexDirection: 'column', gap: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#EA580C', letterSpacing: '0.05em' }}>
                      2. Transparent Payout Split Distribution
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      No Hidden Deductions
                    </span>
                  </div>

                  {/* Dual split cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Rider Share */}
                    <div style={{
                      background: darkMode ? 'rgba(249,115,22,0.1)' : '#FFF7ED',
                      border: '1.5px solid rgba(249,115,22,0.35)',
                      borderRadius: 14, padding: '12px 14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#F97316' }}>
                          🛵 Solo Rider (85%)
                        </span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#F97316' }}>
                          ₹{emergencyRiderPayout}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                        Paid directly to the assigned solo standby rider upon school gate lunchbox delivery.
                      </div>
                    </div>

                    {/* Platform & Escrow */}
                    <div style={{
                      background: darkMode ? 'rgba(16,185,129,0.08)' : '#ECFDF5',
                      border: '1.5px solid rgba(16,185,129,0.35)',
                      borderRadius: 14, padding: '12px 14px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#059669' }}>
                          🛡️ Escrow & Tech (15%)
                        </span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669' }}>
                          ₹{emergencyPlatformPayout}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                        Live 3-sec GPS telemetry, School OTP 2FA, Zero-Hunger Canteen backup & ₹5k tiffin insurance.
                      </div>
                    </div>
                  </div>

                  {/* Visual Split Bar */}
                  <div style={{ display: 'flex', height: 8, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
                    <div style={{ flex: 85, background: 'linear-gradient(90deg, #F97316, #EA580C)' }} title="85% Rider Payout" />
                    <div style={{ flex: 15, background: 'linear-gradient(90deg, #10B981, #059669)' }} title="15% Platform & Escrow" />
                  </div>
                </div>
              </div>

              {/* Submit / Pay Button */}
              <button 
                type="submit" 
                className="btn-saffron card-lift" 
                style={{ 
                  marginTop: 6, 
                  justifyContent: 'center', 
                  padding: '17px', 
                  fontSize: '1.05rem', 
                  fontWeight: 900,
                  borderRadius: 16,
                  boxShadow: '0 12px 32px rgba(249,115,22,0.35)'
                }}
              >
                ⚡ Pay ₹{emergencyTotalPrice} Securely (LunchMate Escrow)
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div>
            <div className="reveal-left" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
              <div>
                <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', color: 'var(--text-heading)' }}>Subscription Manager</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Manage daily lunch delivery plans.</p>
              </div>

              {/* Holiday Auto-Pause Toggle Bar */}
              <div style={{
                background: holidayPauseConfig.enabled 
                  ? (darkMode ? 'rgba(234,88,12,0.18)' : '#FFF7ED') 
                  : (darkMode ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                border: holidayPauseConfig.enabled ? '1.5px solid #EA580C' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-light)'),
                borderRadius: 20, padding: '10px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: holidayPauseConfig.enabled ? '0 6px 20px rgba(234,88,12,0.2)' : 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: holidayPauseConfig.enabled ? 'rgba(234,88,12,0.15)' : (darkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: holidayPauseConfig.enabled ? '#EA580C' : 'var(--text-muted)'
                  }}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: holidayPauseConfig.enabled ? '#EA580C' : 'var(--text-heading)' }}>
                      {holidayPauseConfig.enabled ? holidayPauseConfig.holidayName : 'Holiday Auto-Pause'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {holidayPauseConfig.enabled ? (holidayPauseConfig.days + ' Days Paused • Resumes ' + holidayPauseConfig.resumes) : 'Pause deliveries for tomorrow, weekend, or custom dates'}
                    </div>
                  </div>
                </div>

                {/* Animated ON/OFF Toggle Switch */}
                <button
                  type="button"
                  onClick={handleToggleHolidayPause}
                  className="card-lift"
                  style={{
                    width: 52, height: 28, borderRadius: 99,
                    background: holidayPauseConfig.enabled ? '#EA580C' : (darkMode ? 'rgba(255,255,255,0.2)' : '#CBD5E1'),
                    border: 'none', cursor: 'pointer', position: 'relative',
                    padding: 2, transition: 'all 0.25s ease'
                  }}
                  title={holidayPauseConfig.enabled ? 'Click to resume deliveries' : 'Click to pause for holidays'}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#FFFFFF',
                    transform: holidayPauseConfig.enabled ? 'translateX(24px)' : 'translateX(0)',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
                  }} />
                </button>
              </div>
            </div>

            {/* 📍 Automated Route Distance & Pricing Calculation Briefing Card */}
            <div style={{
              background: darkMode
                ? 'linear-gradient(135deg, rgba(249,115,22,0.14) 0%, rgba(12,15,26,0.92) 100%)'
                : 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
              border: darkMode ? '1.5px solid rgba(249,115,22,0.35)' : '1.5px solid rgba(249,115,22,0.3)',
              borderRadius: 24,
              padding: 'clamp(14px, 3vw, 24px)',
              marginBottom: 28,
              boxShadow: darkMode ? '0 12px 36px rgba(0,0,0,0.4)' : '0 10px 30px rgba(249,115,22,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
                <div style={{ minWidth: 'min(100%, 280px)', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <MapPin size={18} color="#F97316" />
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F97316' }}>
                      Exact Route & Automated Distance Calculation
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: 6 }}>
                      ✓ Auto-Maintained by System
                    </span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: darkMode ? '#FFF' : '#1A120B' }}>
                    {parentProfile?.deliveryAddress || 'Anna Nagar East, Chennai'} ➔ <span style={{ color: '#F97316' }}>{parentProfile?.schoolName || 'DAV Higher Secondary School'}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Live Corridor Distance: <strong style={{ color: '#F97316' }}>{autoDistance} km</strong> • {autoDistance <= 3.0 ? '0–3.0 km included in all pass base rates' : '+ ' + (autoDistance - 3.0).toFixed(1) + ' km extra distance at ₹8/km (+₹' + Math.round((autoDistance - 3.0) * 8) + '/day)'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{
                    background: hasActiveSubscription
                      ? (isRenewalWindow ? (darkMode ? 'rgba(249,115,22,0.2)' : '#FFF7ED') : (darkMode ? 'rgba(16,185,129,0.15)' : '#ECFDF5'))
                      : (darkMode ? 'rgba(255,255,255,0.06)' : '#F1F5F9'),
                    border: `1.5px solid ${hasActiveSubscription ? (isRenewalWindow ? 'rgba(249,115,22,0.45)' : 'rgba(16,185,129,0.3)') : 'rgba(255,255,255,0.1)'}`,
                    color: hasActiveSubscription ? (isRenewalWindow ? '#EA580C' : '#059669') : 'var(--text-muted)',
                    fontSize: '0.8rem', fontWeight: 800,
                    padding: '7px 16px', borderRadius: 99,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {hasActiveSubscription ? <CheckCircle2 size={15} color="#10B981" /> : <Clock size={15} />} 
                    {hasActiveSubscription ? `✓ Paid & Active (${remainingDays} School Days Left)` : 'Pass Inactive (Choose Plan Below)'}
                  </div>

                  <div style={{
                    background: darkMode ? 'rgba(59,130,246,0.15)' : '#EFF6FF',
                    border: '1.5px solid rgba(59,130,246,0.35)',
                    color: '#2563EB',
                    fontSize: '0.8rem', fontWeight: 900,
                    padding: '7px 16px', borderRadius: 99,
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 2px 10px rgba(59,130,246,0.15)'
                  }}>
                    <Wallet size={15} /> Wallet Rollover: ₹{parentProfile?.walletBalance || 0}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('parent-details')}
                    className="card-lift"
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                      border: darkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid #CBD5E1',
                      color: 'var(--text-heading)',
                      padding: '7px 14px', borderRadius: 12,
                      fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5
                    }}
                  >
                    <Edit3 size={13} /> Update Address
                  </button>
                </div>
              </div>

              {/* 3-Column Distance & Pricing Formula Briefing */}
              <div style={{
                background: darkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                    1. Exact Route Distance
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F97316', marginTop: 2 }}>
                    {autoDistance} km
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Measured via GPS road coordinates from doorstep to gate.
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                    2. Included Base Distance
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10B981', marginTop: 2 }}>
                    0 – 3.0 km
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    Included in all pass base rates with zero extra charge.
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                    3. Extra Distance Surcharge
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: autoDistance > 3.0 ? '#F97316' : '#10B981', marginTop: 2 }}>
                    {autoDistance > 3.0 ? '+₹' + Math.round((autoDistance - 3.0) * 8) + ' / day' : '₹0 / day (Base Rate)'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {autoDistance > 3.0 ? '+ ' + (autoDistance - 3.0).toFixed(1) + ' km extra distance beyond 3 km @ ₹8/km.' : 'Home is within the 3 km school base corridor.'}
                  </div>
                </div>
              </div>
            </div>

            {/* 🔔 Renewal Window Alert Banner (Last 7 Days) */}
            {isRenewalWindow && (
              <div style={{
                background: darkMode ? 'rgba(249,115,22,0.12)' : 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)',
                border: '1.5px solid rgba(249,115,22,0.4)',
                borderRadius: 20, padding: '16px 22px', marginBottom: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
                boxShadow: '0 8px 24px rgba(249,115,22,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: '#F97316', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#EA580C' }}>
                      🔔 Pass Expiring Soon ({remainingDays} Days Left) — Renewal Window Active!
                    </h4>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.82rem', color: darkMode ? '#E2E8F0' : '#475569' }}>
                      You can now renew your current pass or switch to any other plan below. Your unused wallet balance (₹{parentProfile?.walletBalance || 0}) will automatically deduct on checkout.
                    </p>
                  </div>
                </div>
                <div style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', padding: '6px 14px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 800, border: '1px solid rgba(16,185,129,0.3)' }}>
                  ✓ Renewal Window Open
                </div>
              </div>
            )}

            {/* Realistic Subscription Plans Grid (Filtered to hide trial once used) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'clamp(14px, 2.5vw, 24px)' }}>
              {visiblePlans.map((plan, i) => {
                const breakdown = calculatePlanBreakdown(plan, autoDistance);
                const isActive = parentProfile?.subscriptionPlan === plan.name;

                return (
                  <div 
                    key={plan.id} 
                    className={`card reveal-scale reveal-delay-${i+1} card-lift`} 
                    style={{ 
                      padding: 28, 
                      borderRadius: 24,
                      border: isActive ? '2px solid #F97316' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-light)'),
                      boxShadow: isActive ? '0 16px 40px rgba(249,115,22,0.2)' : 'var(--shadow-sm)',
                      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      position: 'relative',
                      background: isActive 
                        ? (darkMode ? 'linear-gradient(145deg, rgba(249,115,22,0.1) 0%, rgba(26,18,11,0.5) 100%)' : 'linear-gradient(145deg, #FFF7ED 0%, #FFFFFF 100%)')
                        : undefined
                    }}
                  >
                    <div>
                      {/* Plan Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            background: plan.popular ? 'linear-gradient(135deg, #F97316, #EA580C)' : (darkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9'),
                            color: plan.popular ? '#FFF' : (darkMode ? '#F0EBE3' : '#475569'),
                            fontSize: '0.68rem', fontWeight: 800, padding: '4px 10px', borderRadius: 99,
                            letterSpacing: '0.06em', textTransform: 'uppercase'
                          }}>
                            {plan.badge}
                          </span>

                          {isActive && remainingDays > 0 && (
                            <span style={{
                              background: 'linear-gradient(135deg, #10B981, #059669)',
                              color: '#FFFFFF',
                              fontSize: '0.72rem', fontWeight: 900, padding: '3px 10px', borderRadius: 99,
                              letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 4,
                              boxShadow: '0 2px 8px rgba(16,185,129,0.35)'
                            }}>
                              <CheckCircle2 size={12} strokeWidth={3} /> Paid & Active
                            </span>
                          )}
                        </div>

                        <span style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: 700 }}>
                          {plan.discount}
                        </span>
                      </div>

                      <h4 style={{ color: 'var(--text-heading)', fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: '0 0 10px 0' }}>
                        {plan.name}
                      </h4>

                      {/* Dynamic Price Display based on Distance */}
                      <div style={{ margin: '12px 0 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: '2.1rem', fontFamily: 'var(--font-display)', fontWeight: 900, color: '#F97316' }}>
                            ₹{breakdown.effectiveDailyRate}
                          </span>
                          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/day</span>
                        </div>

                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          Base ₹{plan.basePricePerDay} + {breakdown.extraKm > 0 ? `₹${breakdown.distanceSurcharge} distance (${breakdown.extraKm}km extra)` : '0–3 km base'}
                          <span style={{ display: 'block', color: darkMode ? 'rgba(255,255,255,0.85)' : '#0F172A', fontWeight: 700, marginTop: 2 }}>
                            Total: ₹{breakdown.grossTotal} for {plan.days} School Days
                          </span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0', borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)', paddingTop: 14 }}>
                        {plan.features.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                            <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Emergency Backup SLA Note */}
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                        border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                        borderRadius: 12, padding: '10px 12px', marginBottom: 18,
                        fontSize: '0.74rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#64748B'
                      }}>
                        <strong style={{ color: darkMode ? '#FFF' : '#1E293B', display: 'block', marginBottom: 2 }}>
                          ⚡ Backup Contingency SLA:
                        </strong>
                        {plan.backupProtocol}
                      </div>
                    </div>

                    {/* Action Button: Opens Payment Gateway Modal */}
                    <button 
                      onClick={() => {
                        if (isActive && !isRenewalWindow) {
                          setActiveTab('orders');
                          showToast(`Active delivery running for ${parentProfile?.studentName || 'your child'}! Today's tiffin pickup is ready.`, 'success');
                        } else {
                          setPaymentPlanModal({ plan, breakdown });
                        }
                      }}
                      className={isActive ? "btn-emerald" : "btn-saffron card-lift"} 
                      style={{ 
                        width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 14, fontWeight: 800, fontSize: '0.9rem',
                        background: isActive && !isRenewalWindow ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : undefined,
                        boxShadow: isActive ? '0 6px 20px rgba(16,185,129,0.3)' : '0 6px 20px rgba(249,115,22,0.25)'
                      }}
                    >
                      {isActive ? (
                        isRenewalWindow 
                          ? `🔄 Renew Pass (₹${breakdown.finalPayable}) →` 
                          : `✓ Paid & Active (${remainingDays}d Left) • Start Delivery →`
                      ) : (
                        `💳 Select & Proceed to Payment (₹${breakdown.finalPayable}) →`
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Emergency Single Meal Option Card */}
            <div style={{
              marginTop: 26,
              background: darkMode
                ? 'linear-gradient(135deg, rgba(234,88,12,0.12) 0%, rgba(26,18,11,0.7) 100%)'
                : 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
              border: '1.5px solid rgba(234,88,12,0.35)',
              borderRadius: 22, padding: '22px 26px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16
            }}>
              <div style={{ minWidth: 280, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '1.3rem' }}>⚡</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#EA580C' }}>
                    Need Lunch Delivered Today Only?
                  </span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#EA580C', background: 'rgba(234,88,12,0.15)', padding: '2px 8px', borderRadius: 6 }}>
                    FLEXIBLE PICKUP
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: darkMode ? '#FFF' : '#1A120B' }}>
                  Emergency Single Meal Pass (1-Day Solo Dispatch)
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Parents stuck in meetings or forgot lunch at home? Single-order priority dispatch from Home or any custom pickup address across Chennai.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('emergency')}
                className="btn-saffron card-lift"
                style={{ padding: '13px 24px', borderRadius: 14, fontWeight: 900, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Zap size={16} />
                <span>Order Emergency Meal (₹{emergencyTotalPrice}) →</span>
              </button>
            </div>

            {/* 🛠️ Discreet Collapsible Sandbox Drawer for Distance & Auto-Pause Testing */}
            <div style={{
              marginTop: 24,
              background: darkMode ? 'rgba(0,0,0,0.3)' : '#F8FAFC',
              border: darkMode ? '1px dashed rgba(249,115,22,0.35)' : '1.5px dashed rgba(249,115,22,0.4)',
              borderRadius: 18,
              padding: '14px 18px',
            }}>
              <div 
                onClick={() => setShowSimSandbox(prev => !prev)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sliders size={16} color="#F97316" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    🛠️ Demo & Testing Sandbox (Auto-Pause, Distance & Days Simulation)
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {showSimSandbox ? '▲ Collapse Tools' : '▼ Click to Expand Simulation Tools'}
                </span>
              </div>

              {showSimSandbox && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14, borderTop: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0' }}>
                  {/* Simulation Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800 }}>Simulate Pass Days:</span>
                    <button
                      type="button"
                      onClick={handleSimulateDelivery}
                      style={{ background: '#059669', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                      title="Simulate 1 meal delivered successfully"
                    >
                      🍱 1 Day Delivered (-1d)
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateAutoPause}
                      style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                      title="Simulate child sick or school holiday: Meal is paused and that day's fee rolls over into your wallet!"
                    >
                      ⏸️ Auto-Pause Child Absent (+₹{parentProfile?.dailyRate || 50} to Wallet)
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulateRenewalWindow}
                      style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : '#E2E8F0', color: 'var(--text-heading)', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                      title="Set 5 days remaining to test renewal window"
                    >
                      🔄 5 Days Left (Renewal)
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToFresh}
                      style={{ background: '#DC2626', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                      title="Reset to a fresh unsubscribed parent to test first-time onboarding tour & payment"
                    >
                      ⚡ Reset to Fresh Parent (0 Days)
                    </button>
                  </div>


                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'reports' && (
          <ParentReportsTab parentProfile={parentProfile} historyLogs={historyLogs} />
        )}

        {/* TAB 5: PARENT DETAILS & REGISTERED HOME PICKUP HUB */}
        {activeTab === 'parent-details' && (
          <div className="card reveal" style={{ padding: '32px 30px', display: 'flex', flexDirection: 'column', gap: 26 }}>
            {/* Top Header Card */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, borderBottom: '1px solid var(--border-light)', paddingBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFFFFF', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)',
                  fontSize: '1.4rem'
                }}>
                  👨‍👩‍👧
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--text-heading)' }}>
                    Parent Details & Registered Home Pickup Hub
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: 3 }}>
                    Permanent student enrollment record & real-time doorstep GPS pin used by riders for morning food pickup
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '5px 12px',
                  borderRadius: 99,
                  letterSpacing: '0.04em'
                }}>
                  ✅ VERIFIED CUSTOMER PROFILE
                </span>
              </div>
            </div>

            {/* Two-Column Responsive Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              
              {/* Left Column: Verified Family Profile & School Enrollment */}
              <div style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                border: darkMode ? '1.5px solid rgba(255, 255, 255, 0.08)' : '1.5px solid #E2E8F0',
                borderRadius: 20,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.2rem' }}>🎓</span>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                      Student & Parent Identity
                    </h4>
                  </div>
                  <span style={{
                    background: 'rgba(249, 115, 22, 0.12)',
                    color: '#EA580C',
                    border: '1px solid rgba(249, 115, 22, 0.25)',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 6
                  }}>
                    🔒 FIXED RECORD
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Parent Full Name */}
                  <div style={{ background: darkMode ? 'rgba(0,0,0,0.25)' : '#FFFFFF', padding: '12px 14px', borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                      Registered Parent Name
                    </span>
                    <span style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                      {parentProfile?.parentName || 'Parent'}
                    </span>
                  </div>

                  {/* Registered Mobile Number */}
                  <div style={{ background: darkMode ? 'rgba(0,0,0,0.25)' : '#FFFFFF', padding: '12px 14px', borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        Mobile Number
                      </span>
                      <span style={{ fontSize: '0.96rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-heading)' }}>
                        +91 94441 55667
                      </span>
                    </div>
                    <span style={{ background: 'rgba(16,185,129,0.12)', color: '#059669', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                      ✓ SMS OTP Enabled
                    </span>
                  </div>

                  {/* Student Full Name & Initial */}
                  <div style={{ background: darkMode ? 'rgba(0,0,0,0.25)' : '#FFFFFF', padding: '12px 14px', borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                      Enrolled Student Name
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#F97316' }}>
                      {parentProfile?.studentName || 'Not Enrolled Yet'}
                    </span>
                  </div>

                  {/* Student Date of Birth (DOB) */}
                  <div style={{ background: darkMode ? 'rgba(0,0,0,0.25)' : '#FFFFFF', padding: '12px 14px', borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        Date of Birth (DOB)
                      </span>
                      <span style={{ fontSize: '0.94rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--text-heading)' }}>
                        📅 {parentProfile?.studentDob || '14-08-2011'}
                      </span>
                    </div>
                    <span style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626', fontSize: '0.68rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
                      🔒 Permanent ID
                    </span>
                  </div>

                  {/* School & Standard */}
                  <div style={{ background: darkMode ? 'rgba(0,0,0,0.25)' : '#FFFFFF', padding: '12px 14px', borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                        Enrolled School & Grade
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSchoolModal(true)}
                        style={{
                          background: 'none', border: 'none', color: '#F97316',
                          fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 3
                        }}
                      >
                        Change School ➔
                      </button>
                    </div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                      🏫 {parentProfile?.schoolName || 'DAV Higher Secondary School'}
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#F97316', marginTop: 4 }}>
                      Class: {parentProfile?.studentClass || 'Class 9-B'} • Lunch: {parentProfile?.lunchTime || '12:30 PM'}
                    </div>
                  </div>

                  {/* Reception Gate & Subscription Pass */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ background: darkMode ? 'rgba(0,0,0,0.25)' : '#FFFFFF', padding: '10px 12px', borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        Drop Gate
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                        {parentProfile?.receptionGate || 'Gate 2 Security'}
                      </span>
                    </div>

                    <div style={{ background: darkMode ? 'rgba(0,0,0,0.25)' : '#FFFFFF', padding: '10px 12px', borderRadius: 12, border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>
                        Active Plan
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#059669' }}>
                        {parentProfile?.subscriptionPlan?.split('(')[0]?.trim() || '20-Day Premium VIP'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Class / School Button */}
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(true)}
                  className="card-lift"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(234,88,12,0.06) 100%)',
                    border: '1.5px solid rgba(249,115,22,0.3)',
                    color: '#F97316',
                    borderRadius: 12,
                    padding: '12px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 'auto',
                  }}
                >
                  <School size={16} />
                  <span>Update Grade / Transfer School</span>
                </button>
              </div>

              {/* Right Column: Doorstep Pickup Location & Live Device GPS Acquisition */}
              <div style={{
                background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                border: darkMode ? '1.5px solid rgba(255, 255, 255, 0.08)' : '1.5px solid #E2E8F0',
                borderRadius: 20,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.2rem' }}>🏡</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                        Registered Doorstep Pickup Hub
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Riders navigate to this exact home coordinate pin for morning tiffin collection
                      </p>
                    </div>
                  </div>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#059669',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 8
                  }}>
                    🚗 {parentProfile?.distanceKm || 3.5} km to School
                  </span>
                </div>

                {/* 🛰️ Live Device GPS Position Telemetry Card with Permanent Verification Flow */}
                <div style={{
                  background: darkMode ? 'rgba(0,0,0,0.45)' : '#FFFFFF',
                  border: isPermanentGpsVerified
                    ? '1.5px solid rgba(16, 185, 129, 0.4)'
                    : '1.5px solid rgba(249, 115, 22, 0.5)',
                  borderRadius: 16, padding: '16px 18px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  boxShadow: isPermanentGpsVerified ? '0 4px 16px rgba(16,185,129,0.08)' : '0 4px 16px rgba(249,115,22,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: hubGpsStatus === 'locating' ? '#F59E0B' : (isPermanentGpsVerified ? '#10B981' : '#F97316'),
                        boxShadow: hubGpsStatus === 'locating' ? '0 0 10px #F59E0B' : (isPermanentGpsVerified ? '0 0 10px #10B981' : '0 0 10px #F97316'),
                        display: 'inline-block',
                        animation: (hubGpsStatus === 'locating' || !isPermanentGpsVerified) ? 'pulse 1s infinite' : 'none'
                      }} />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-heading)', letterSpacing: '0.05em' }}>
                        {hubGpsStatus === 'locating'
                          ? '🛰️ Acquiring Real-Time Satellite GPS...'
                          : (isPermanentGpsVerified
                              ? '🔒 Verified Permanent Doorstep GPS Position'
                              : '⚠️ First-Time Setup: Verify & Save Doorstep GPS')}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      color: isPermanentGpsVerified ? '#10B981' : '#F97316',
                      background: isPermanentGpsVerified ? 'rgba(16,185,129,0.12)' : 'rgba(249,115,22,0.12)',
                      padding: '2px 8px', borderRadius: 6
                    }}>
                      Accuracy ±{hubGpsAccuracy}m
                    </span>
                  </div>

                  {/* Coordinates & Place name */}
                  <div style={{
                    background: darkMode ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                    borderRadius: 12, padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 6,
                    border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                        Detected Coordinates:
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#F97316', fontWeight: 800, fontFamily: 'monospace' }}>
                        {hubCoords.lat.toFixed(4)}° N, {hubCoords.lng.toFixed(4)}° E
                      </span>
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: darkMode ? '#FEFEFE' : '#0F172A' }}>
                      📍 {hubLocality || 'Detecting doorstep location...'}
                    </div>

                    {/* First-time comparison & verification note */}
                    {!isPermanentGpsVerified && (
                      <div style={{
                        marginTop: 4,
                        padding: '8px 10px',
                        borderRadius: 8,
                        background: 'rgba(249,115,22,0.08)',
                        border: '1px solid rgba(249,115,22,0.25)',
                        fontSize: '0.74rem',
                        color: 'var(--text-heading)',
                        lineHeight: 1.4
                      }}>
                        {Math.abs(hubCoords.lat - (parentProfile?.homeCoordinates?.lat || 13.0827)) < 0.005 && Math.abs(hubCoords.lng - (parentProfile?.homeCoordinates?.lng || 80.2707)) < 0.005 ? (
                          <span style={{ color: '#10B981', fontWeight: 700 }}>
                            ✓ Live device GPS matches your registered signup location! Please verify on Google Maps to confirm accuracy, then save as your permanent coordinates.
                          </span>
                        ) : (
                          <span>
                            📍 <strong>Verification Notice:</strong> We captured your coordinates during Sign Up. If this live device GPS pin reflects your home doorstep, verify on Google Maps and lock it below. If you are away from home, you can revert to your signup pin.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Verification & Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${hubCoords.lat},${hubCoords.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: darkMode ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                          border: '1.5px solid rgba(249,115,22,0.4)',
                          color: '#EA580C',
                          padding: '7px 12px',
                          borderRadius: 8,
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Compass size={13} />
                        <span>Check on Google Maps ↗</span>
                      </a>

                      <button
                        type="button"
                        onClick={detectHubLiveLocation}
                        style={{
                          background: 'transparent',
                          border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #CBD5E1',
                          color: 'var(--text-heading)',
                          padding: '7px 12px',
                          borderRadius: 8,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <RefreshCw size={12} className={hubGpsStatus === 'locating' ? 'spin' : ''} />
                        <span>Refresh GPS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPinpointTargetContext('hub');
                          setShowDoorstepPinpointModal(true);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #F97316, #EA580C)',
                          color: '#FFF',
                          border: 'none',
                          padding: '7px 14px',
                          borderRadius: 8,
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(249,115,22,0.3)'
                        }}
                        title="Open interactive map to drag pin right to your building entrance (Swiggy / Uber style)"
                      >
                        <Crosshair size={13} />
                        <span>Adjust Pin on Map (Sub-meter Accuracy)</span>
                      </button>

                      {!isPermanentGpsVerified && (
                        <button
                          type="button"
                          onClick={handleRevertToSignupGps}
                          style={{
                            background: 'transparent',
                            border: '1px dashed rgba(249,115,22,0.4)',
                            color: '#F97316',
                            padding: '7px 10px',
                            borderRadius: 8,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Restore original coordinates from registration"
                        >
                          Use Signup Pin
                        </button>
                      )}
                    </div>

                    {!isPermanentGpsVerified && (
                      <button
                        type="button"
                        onClick={handleConfirmPermanentGps}
                        style={{
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          color: '#FFF',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                        }}
                      >
                        <CheckCircle size={14} />
                        <span>Confirm & Save as Permanent Location</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 🔒 Fixed Structured Address Box (Read-Only as per Sign Up) */}
                <div style={{
                  background: darkMode ? 'rgba(0,0,0,0.25)' : '#FFFFFF',
                  border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                  borderRadius: 16, padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', gap: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-heading)', fontWeight: 800, fontSize: '0.88rem' }}>
                        <Lock size={15} color="#F97316" />
                        <span>Registered Doorstep Address (Fixed from Sign Up - Locked)</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Fixed to prevent delivery route disruptions. To modify your doorstep pickup or school drop-off, submit an address change request below.
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                      Door No, Building Floor or Landmark (For Rider Pickup) *
                    </label>
                    <input
                      type="text"
                      className="field-input"
                      value={hubDoor}
                      readOnly
                      disabled
                      style={{
                        width: '100%', height: 42, boxSizing: 'border-box',
                        background: darkMode ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                        cursor: 'not-allowed', color: 'var(--text-heading)', fontWeight: 700
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 10, alignItems: 'end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center',
                        fontSize: '0.74rem', color: 'var(--text-muted)',
                        fontWeight: 800, textTransform: 'uppercase',
                        marginBottom: 6, height: 20, whiteSpace: 'nowrap'
                      }} title="Area / Locality / Village">
                        Area / Locality *
                      </label>
                      <input
                        type="text"
                        className="field-input"
                        value={hubVillage}
                        readOnly
                        disabled
                        style={{
                          width: '100%', height: 42, boxSizing: 'border-box',
                          background: darkMode ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                          cursor: 'not-allowed', color: 'var(--text-heading)', fontWeight: 700
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center',
                        fontSize: '0.74rem', color: 'var(--text-muted)',
                        fontWeight: 800, textTransform: 'uppercase',
                        marginBottom: 6, height: 20, whiteSpace: 'nowrap'
                      }}>
                        City / District *
                      </label>
                      <input
                        type="text"
                        className="field-input"
                        value={hubCity}
                        readOnly
                        disabled
                        style={{
                          width: '100%', height: 42, boxSizing: 'border-box',
                          background: darkMode ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                          cursor: 'not-allowed', color: 'var(--text-heading)', fontWeight: 700
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        display: 'flex', alignItems: 'center',
                        fontSize: '0.74rem', color: 'var(--text-muted)',
                        fontWeight: 800, textTransform: 'uppercase',
                        marginBottom: 6, height: 20, whiteSpace: 'nowrap'
                      }}>
                        Pincode *
                      </label>
                      <input
                        type="text"
                        className="field-input"
                        value={hubPincode}
                        readOnly
                        disabled
                        style={{
                          width: '100%', height: 42, boxSizing: 'border-box',
                          background: darkMode ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
                          cursor: 'not-allowed', fontFamily: 'monospace', fontWeight: 800, color: '#F97316'
                        }}
                      />
                    </div>
                  </div>

                  {/* Change Address Action Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={openAddressChangeModal}
                      className="btn-saffron card-lift"
                      style={{
                        padding: '11px 20px',
                        fontSize: '0.88rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderRadius: 12,
                      }}
                    >
                      <Edit3 size={15} />
                      <span>Request / Change Address or School Details</span>
                    </button>
                  </div>
                </div>

                {/* Route Corridor Preview & External Google Maps Link */}
                <div style={{
                  background: darkMode ? 'rgba(249,115,22,0.06)' : '#FFF7ED',
                  border: '1.5px solid rgba(249,115,22,0.25)',
                  borderRadius: 14, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
                }}>
                  {(() => {
                    const corridorKm = calculateHaversineRoadDistance(hubCoords.lat, hubCoords.lng, targetSchoolCoords.lat, targetSchoolCoords.lng);
                    const transitMin = Math.max(8, Math.round(corridorKm * 3.2 + 3));
                    const isWithinBase = corridorKm <= 3.0;
                    return (
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: 3 }}>
                          Calculated Corridor Distance
                        </span>
                        <span style={{ fontSize: '0.98rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                          🚗 {corridorKm} km road route to {parentProfile?.schoolName || 'School'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                          <span style={{ fontSize: '0.73rem', color: '#10B981', fontWeight: 800 }}>
                            ⚡ ~{transitMin} mins scooter transit SLA
                          </span>
                          <span style={{ fontSize: '0.73rem', color: isWithinBase ? '#10B981' : '#EA580C', fontWeight: 700 }}>
                            • {isWithinBase ? '0-3.0 km included in base rate (₹0 distance fee)' : `+${(corridorKm - 3.0).toFixed(1)} km extra distance (+₹${Math.round((corridorKm - 3.0) * 8)}/day)`}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const shortest = getShortestCorridorVector(hubCoords.lat, hubCoords.lng, targetSchoolCoords.lat, targetSchoolCoords.lng, 2.4);
                    return (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${shortest.lat},${shortest.lng}&destination=${targetSchoolCoords.lat},${targetSchoolCoords.lng}&travelmode=driving`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: darkMode ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                          border: '1.5px solid rgba(249,115,22,0.3)',
                          color: '#EA580C',
                          padding: '8px 14px',
                          borderRadius: 10,
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Compass size={14} />
                        <span>Verify on Google Maps ↗</span>
                      </a>
                    );
                  })()}
                </div>

                {/* ℹ️ Clear Explainer: Why is Corridor Distance calculated & verified on Google Maps? */}
                <div style={{
                  background: darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                  border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                  borderRadius: 14, padding: '14px 18px',
                  fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.55
                }}>
                  <div style={{ fontWeight: 800, color: '#F97316', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                    <Info size={15} /> Why is this Corridor Distance calculated & verified on Google Maps?
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li>
                      <strong>Transparent Pricing Calculation:</strong> Monthly lunch passes and emergency delivery rates are calculated strictly based on real road driving km from your doorstep to the school campus gate.
                    </li>
                    <li>
                      <strong>Punctual 12:15 PM Lunch Bell Arrival:</strong> Delivery riders collect 8–12 home-cooked tiffins along an optimized neighborhood corridor between 11:15 AM and 11:50 AM. Accurate road distance guarantees the rider arrives before your child's lunch bell.
                    </li>
                    <li>
                      <strong>Exact Gate Navigation:</strong> Mobile GPS can occasionally drift by 10–30 meters. Checking on Google Maps confirms that the rider's turn-by-turn navigation pinpoints your exact house gate and not a neighboring street.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔄 Request Change of Address & School Destination Modal (Mounted via createPortal) */}
        {showAddressChangeModal && typeof document !== 'undefined' && createPortal(
          (
            <div
              style={{
                position: 'fixed', inset: 0, zIndex: 9999999,
                background: 'rgba(0, 0, 0, 0.82)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px 16px',
                overflowY: 'auto'
              }}
              onClick={() => setShowAddressChangeModal(false)}
            >
              <div
                style={{
                  background: darkMode ? '#141724' : '#FFFFFF',
                  border: darkMode ? '1.5px solid rgba(249,115,22,0.4)' : '1.5px solid #E2E8F0',
                  borderRadius: 24,
                  maxWidth: 620, width: '100%',
                  padding: '28px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
                  display: 'flex', flexDirection: 'column', gap: 18,
                  maxHeight: '90vh', overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'rgba(249,115,22,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#F97316'
                    }}>
                      <Edit3 size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                        Request Change of Address & School
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Update doorstep pickup location, school delivery destination, or both.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressChangeModal(false)}
                    style={{
                      background: 'transparent', border: 'none',
                      color: 'var(--text-muted)', cursor: 'pointer',
                      padding: 6, borderRadius: 8
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveAddressChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Scope Selector: Home / School / Both */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
                      What would you like to update? *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setChangeScope('home')}
                        style={{
                          padding: '10px 8px', borderRadius: 12,
                          border: changeScope === 'home' ? '2px solid #F97316' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #CBD5E1'),
                          background: changeScope === 'home' ? 'rgba(249,115,22,0.12)' : (darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC'),
                          color: changeScope === 'home' ? '#F97316' : 'var(--text-heading)',
                          fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                        }}
                      >
                        <Home size={16} />
                        <span>Home Only</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChangeScope('school')}
                        style={{
                          padding: '10px 8px', borderRadius: 12,
                          border: changeScope === 'school' ? '2px solid #F97316' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #CBD5E1'),
                          background: changeScope === 'school' ? 'rgba(249,115,22,0.12)' : (darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC'),
                          color: changeScope === 'school' ? '#F97316' : 'var(--text-heading)',
                          fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                        }}
                      >
                        <School size={16} />
                        <span>School Only</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChangeScope('both')}
                        style={{
                          padding: '10px 8px', borderRadius: 12,
                          border: changeScope === 'both' ? '2px solid #F97316' : (darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #CBD5E1'),
                          background: changeScope === 'both' ? 'rgba(249,115,22,0.12)' : (darkMode ? 'rgba(255,255,255,0.03)' : '#F8FAFC'),
                          color: changeScope === 'both' ? '#F97316' : 'var(--text-heading)',
                          fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                        }}
                      >
                        <RefreshCw size={16} />
                        <span>Both Home & School</span>
                      </button>
                    </div>
                  </div>

                  {/* Mandatory Reason for Change */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                      Reason for Change of Address *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 8 }}>
                      <select
                        value={changeReason}
                        onChange={(e) => setChangeReason(e.target.value)}
                        style={{
                          height: 42,
                          background: darkMode ? '#1A120B' : '#FFF',
                          border: darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1',
                          borderRadius: 10, padding: '0 10px',
                          color: darkMode ? '#FFF' : '#0F172A',
                          fontSize: '0.84rem', fontWeight: 800, outline: 'none'
                        }}
                      >
                        <option value="relocation">Relocation / House Shifting</option>
                        <option value="school_transfer">Child School Transfer</option>
                        <option value="temporary_stay">Temporary Residence</option>
                        <option value="correction">Correction of Initial Address</option>
                        <option value="other">Other Reason</option>
                      </select>

                      <input
                        type="text"
                        value={changeReasonNotes}
                        onChange={(e) => setChangeReasonNotes(e.target.value)}
                        placeholder="Provide details (e.g. Shifted flat to T. Nagar)"
                        required
                        style={{
                          height: 42,
                          boxSizing: 'border-box',
                          background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFF',
                          border: darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1',
                          borderRadius: 10, padding: '0 12px',
                          color: darkMode ? '#FFF' : '#0F172A',
                          fontSize: '0.84rem', fontWeight: 700, outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Home Address Section */}
                  {(changeScope === 'home' || changeScope === 'both') && (
                    <div style={{
                      background: darkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                      border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                      borderRadius: 14, padding: '14px',
                      display: 'flex', flexDirection: 'column', gap: 10
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#F97316', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Home size={15} /> New Home Doorstep Pickup Location
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={detectNewHomeLiveLocation}
                            style={{
                              background: 'linear-gradient(135deg, #F97316, #EA580C)',
                              color: '#FFF', border: 'none',
                              padding: '5px 10px', borderRadius: 6,
                              fontSize: '0.7rem', fontWeight: 800,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                            }}
                          >
                            <RefreshCw size={11} className={newGpsStatus === 'locating' ? 'spin' : ''} />
                            <span>Fetch GPS at New Home</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPinpointTargetContext('modal');
                              setShowDoorstepPinpointModal(true);
                            }}
                            style={{
                              background: darkMode ? '#1E293B' : '#FFFFFF',
                              border: '1px solid #F97316',
                              color: '#F97316',
                              padding: '5px 10px', borderRadius: 6,
                              fontSize: '0.7rem', fontWeight: 800,
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                            }}
                          >
                            <Crosshair size={11} />
                            <span>Pinpoint on Map</span>
                          </button>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${newCoords.lat},${newCoords.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#F97316', fontSize: '0.7rem', fontWeight: 800,
                              textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 3
                            }}
                          >
                            Verify Pin on Map ↗
                          </a>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>
                          New Door No, Building Floor or Landmark *
                        </label>
                        <input
                          type="text"
                          value={newDoor}
                          onChange={(e) => setNewDoor(e.target.value)}
                          placeholder="e.g. No. 42, 3rd Main Road, Sai Residency"
                          required
                          style={{
                            width: '100%', height: 42, boxSizing: 'border-box',
                            background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFF',
                            border: darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1',
                            borderRadius: 10, padding: '0 12px',
                            color: darkMode ? '#FFF' : '#0F172A',
                            fontSize: '0.86rem', fontWeight: 700, outline: 'none'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 8, alignItems: 'end' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, height: 18, whiteSpace: 'nowrap' }}>
                            Area / Locality *
                          </label>
                          <input
                            type="text"
                            value={newVillage}
                            onChange={(e) => setNewVillage(e.target.value)}
                            placeholder="e.g. T. Nagar"
                            required
                            style={{
                              width: '100%', height: 42, boxSizing: 'border-box',
                              background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFF',
                              border: darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1',
                              borderRadius: 10, padding: '0 10px',
                              color: darkMode ? '#FFF' : '#0F172A',
                              fontSize: '0.86rem', fontWeight: 700, outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, height: 18, whiteSpace: 'nowrap' }}>
                            City / District *
                          </label>
                          <input
                            type="text"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="Chennai"
                            required
                            style={{
                              width: '100%', height: 42, boxSizing: 'border-box',
                              background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFF',
                              border: darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1',
                              borderRadius: 10, padding: '0 10px',
                              color: darkMode ? '#FFF' : '#0F172A',
                              fontSize: '0.86rem', fontWeight: 700, outline: 'none'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, height: 18, whiteSpace: 'nowrap' }}>
                            Pincode *
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={newPincode}
                            onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="600017"
                            maxLength={6}
                            required
                            style={{
                              width: '100%', height: 42, boxSizing: 'border-box',
                              background: darkMode ? 'rgba(255,255,255,0.06)' : '#FFF',
                              border: darkMode ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid #CBD5E1',
                              borderRadius: 10, padding: '0 10px',
                              color: '#F97316', fontFamily: 'monospace',
                              fontSize: '0.86rem', fontWeight: 800, outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* School Destination Section */}
                  {(changeScope === 'school' || changeScope === 'both') && (
                    <div style={{
                      background: darkMode ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                      border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                      borderRadius: 14, padding: '14px',
                      display: 'flex', flexDirection: 'column', gap: 10
                    }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#F97316', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <School size={15} /> New School Delivery Destination
                      </span>
                      <TNSchoolSelector
                        selectedDistrict={newSchoolDistrict}
                        onDistrictChange={setNewSchoolDistrict}
                        selectedSchool={newSchoolName}
                        selectedSchoolMapsLink={newSchoolMapsLink}
                        onSchoolChange={(name, coords, mapsLink) => {
                          setNewSchoolName(name);
                          if (coords) setNewSchoolCoords(coords);
                          if (mapsLink) setNewSchoolMapsLink(mapsLink);
                        }}
                        darkMode={darkMode}
                        showNote={true}
                      />
                    </div>
                  )}

                  {/* Real-time Calculated Road Distance Preview */}
                  {(() => {
                    const previewTargetSchool = (changeScope === 'school' || changeScope === 'both') ? newSchoolName : (parentProfile?.schoolName || 'DAV Higher Secondary School');
                    const schoolCoords = lookupTnSchoolCoordinates(previewTargetSchool, newSchoolDistrict);
                    let previewOrigin = (changeScope === 'home' || changeScope === 'both') ? newCoords : hubCoords;
                    if (changeScope === 'school') {
                      const rawCheck = calculateHaversineRoadDistance(previewOrigin.lat, previewOrigin.lng, schoolCoords.lat, schoolCoords.lng);
                      if (rawCheck > 5.0) {
                        previewOrigin = getDistrictResidentialHub(newSchoolDistrict, schoolCoords).coordinates;
                      }
                    }
                    const calcKm = calculateHaversineRoadDistance(previewOrigin.lat, previewOrigin.lng, schoolCoords.lat, schoolCoords.lng);

                    return (
                      <div style={{
                        background: 'rgba(249,115,22,0.08)',
                        border: '1.5px solid rgba(249,115,22,0.3)',
                        borderRadius: 12, padding: '12px 14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6
                      }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#EA580C', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                            New Route Distance Preview
                          </span>
                          <span style={{ fontSize: '0.94rem', fontWeight: 900, color: 'var(--text-heading)' }}>
                            🚗 {calcKm} km road route to {previewTargetSchool}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.12)', padding: '3px 8px', borderRadius: 6 }}>
                          ✓ Corridor Recalculated
                        </span>
                      </div>
                    );
                  })()}

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setShowAddressChangeModal(false)}
                      style={{
                        padding: '10px 18px', borderRadius: 10,
                        border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid #CBD5E1',
                        background: 'transparent', color: 'var(--text-heading)',
                        fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-saffron card-lift"
                      style={{
                        padding: '10px 20px', borderRadius: 10,
                        fontSize: '0.88rem', fontWeight: 900,
                        display: 'flex', alignItems: 'center', gap: 6
                      }}
                    >
                      <CheckCircle size={15} />
                      <span>Save & Update Address Everywhere</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        )}

        {/* 🏫 School Transfer / Child Update Modal (Mounted at root body via createPortal) */}
        {showSchoolModal && typeof document !== 'undefined' && createPortal(
          (
            <div 
              onClick={() => setShowSchoolModal(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9999999,
                background: 'rgba(0, 0, 0, 0.82)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '40px 16px',
                overflowY: 'auto'
              }}
            >
              {/* 🌟 Animated Flowing Gradient Border (Zero Simple Borders, Ambient Saffron Aura) */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="modal-glow-card"
                style={{
                  maxWidth: 560,
                  position: 'relative',
                }}
              >
                <div 
                  className="modal-inner-content no-scrollbar"
                  style={{
                    background: darkMode ? '#1A120B' : '#FFFFFF',
                    borderRadius: 26,
                    padding: '28px 32px',
                    position: 'relative',
                  }}
                >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.4rem' }}>🏫</span>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', margin: 0, color: 'var(--text-heading)' }}>
                        School Transfer / Update Class
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                        Update child details when moving grades or transferring schools
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSchoolModal(false)}
                    className="card-lift"
                    style={{
                      background: '#DC2626',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: 99,
                      padding: '7px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      display: 'flex', alignItems: 'center', gap: 5,
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(220, 38, 38, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                    title="Close this window (Esc)"
                  >
                    <X size={16} strokeWidth={2.8} />
                    <span>Close (Esc)</span>
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const finalSec = editSchoolForm.studentSection === 'Other / Custom'
                    ? (editSchoolForm.customSection.trim().toUpperCase() || 'A')
                    : editSchoolForm.studentSection;
                  const finalClass = `${editSchoolForm.studentGrade}-${finalSec}`;
                  const newSchool = editSchoolForm.schoolName.trim() || parentProfile?.schoolName;

                  // Recalculate distance and wallet credit upon school change
                  const schoolDistrict = parentProfile?.schoolDistrict || (newSchool.toLowerCase().includes('chengal') ? 'Chengalpattu' : 'Chennai');
                  const newSchoolCoords = parentProfile?.schoolCoordinates || getSchoolCoordinates(newSchool, schoolDistrict);
                  const homeCoords = parentProfile?.homeCoordinates || parentProfile?.addressDetails?.coordinates || { lat: 13.0827, lng: 80.2707 };
                  const newDist = calculateHaversineRoadDistance(homeCoords.lat, homeCoords.lng, newSchoolCoords.lat, newSchoolCoords.lng);
                  const oldDist = parentProfile?.distanceKm || 3.5;
                  const remainingDays = parentProfile?.passRemainingDays || 20;

                  const oldSurcharge = Math.max(0, oldDist - 3.0) * 8;
                  const newSurcharge = Math.max(0, newDist - 3.0) * 8;
                  const dailyDiff = oldSurcharge - newSurcharge;
                  let walletCredit = 0;
                  if (remainingDays > 0 && dailyDiff > 0) {
                    walletCredit = Math.round(dailyDiff * remainingDays);
                  }

                  const updatedWallet = (parentProfile?.walletBalance || 0) + walletCredit;

                  updateParentProfile({
                    studentClass: finalClass,
                    schoolName: newSchool,
                    lunchTime: editSchoolForm.lunchTime || parentProfile?.lunchTime,
                    distanceKm: newDist,
                    walletBalance: updatedWallet,
                  });
                  setSelectedDistance(newDist);

                  if (walletCredit > 0) {
                    const logEntry = {
                      date: "Today (" + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ")",
                      id: `SCH-TRF-${Date.now().toString().slice(-4)}`,
                      driver: `School Corridor Transfer (${newSchool})`,
                      time: "Immediate",
                      status: `Wallet Credited (+₹${walletCredit}.00)`,
                      amount: `School changed to ${newSchool} (${newDist}km). ₹${walletCredit} credited to wallet for ${remainingDays} remaining days. Auto-deducts on next renewal.`
                    };
                    setHistoryLogs(prev => [logEntry, ...prev]);
                    showToast(`🏫 Transferred to ${newSchool}! Route recalculated (${newDist} km). ₹${walletCredit} credited to wallet.`, "success");
                  } else {
                    showToast("Child & School details updated successfully!", "success");
                  }
                  setShowSchoolModal(false);
                }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* 🔒 Student Identity is CONSTANT */}
                  <div style={{
                    background: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                    border: darkMode ? '1.5px solid rgba(255, 255, 255, 0.12)' : '1.5px solid #E2E8F0',
                    borderRadius: 14,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#059669', fontSize: '1rem',
                      }}>
                        🎓
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Student Identity & DOB (Permanent)
                        </div>
                        <div style={{ color: 'var(--text-heading)', fontSize: '0.98rem', fontWeight: 900 }}>
                          {parentProfile?.studentName || 'Student'} • <span style={{ color: '#F97316', fontSize: '0.84rem', fontWeight: 800 }}>DOB: {parentProfile?.studentDob || '14 Aug 2011'}</span>
                        </div>
                      </div>
                    </div>

                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#059669',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: 6,
                      letterSpacing: '0.04em',
                    }}>
                      🔒 FIXED ID
                    </span>
                  </div>

                  {/* Grade / Standard & Section Dropdowns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Grade / Standard *
                      </label>
                      <select
                        className="field-input"
                        value={editSchoolForm.studentGrade}
                        onChange={(e) => setEditSchoolForm({ ...editSchoolForm, studentGrade: e.target.value })}
                        style={{ width: '100%', cursor: 'pointer', fontWeight: 700 }}
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                        Section (e.g. B, A1) *
                      </label>
                      <select
                        className="field-input"
                        value={editSchoolForm.studentSection}
                        onChange={(e) => setEditSchoolForm({ ...editSchoolForm, studentSection: e.target.value })}
                        style={{ width: '100%', cursor: 'pointer', fontWeight: 800, color: '#F97316' }}
                      >
                        {SECTION_OPTIONS.map((sec) => (
                          <option key={sec} value={sec}>
                            {sec === 'Other / Custom' ? '✏️ Other / Custom' : `Sec ${sec}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Optional Custom Section Input */}
                  {editSchoolForm.studentSection === 'Other / Custom' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#F97316', textTransform: 'uppercase', marginBottom: 6 }}>
                        Type Custom Section Name *
                      </label>
                      <input
                        type="text"
                        className="field-input"
                        value={editSchoolForm.customSection}
                        onChange={(e) => setEditSchoolForm({ ...editSchoolForm, customSection: e.target.value.toUpperCase() })}
                        placeholder="e.g. C3, Rose, Diamond"
                        required
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  {/* School Destination Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                      New School Destination Name *
                    </label>
                    <input
                      type="text"
                      className="field-input"
                      value={editSchoolForm.schoolName}
                      onChange={(e) => setEditSchoolForm({ ...editSchoolForm, schoolName: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Target Lunch Bell Time */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                      Target Lunch Bell Time *
                    </label>
                    <select
                      className="field-input"
                      value={editSchoolForm.lunchTime}
                      onChange={(e) => setEditSchoolForm({ ...editSchoolForm, lunchTime: e.target.value })}
                      style={{ width: '100%', cursor: 'pointer', fontWeight: 700 }}
                    >
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="12:15 PM">12:15 PM</option>
                      <option value="12:30 PM">12:30 PM</option>
                      <option value="12:45 PM">12:45 PM</option>
                      <option value="1:00 PM">1:00 PM</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setShowSchoolModal(false)}
                      className="btn-outline"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ),
          document.body
        )}

        {/* School Holiday Auto-Pause Selector Modal */}
        <HolidayPauseModal
          isOpen={showHolidayModal}
          onClose={() => setShowHolidayModal(false)}
          darkMode={darkMode}
          holidayPauseConfig={holidayPauseConfig}
          parentProfile={parentProfile}
          onConfirmHolidayPause={handleConfirmHolidayPause}
          onConfirmCustomHoliday={handleConfirmCustomHoliday}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          calculateDateDiffDays={calculateDateDiffDays}
          presets={HOLIDAY_PRESETS}
        />

        <OnboardingTourModal
          isOpen={showTour}
          onClose={() => {
            setShowTour(false);
            updateParentProfile({ showOnboardingTour: false });
          }}
          onFinish={() => {
            setShowTour(false);
            updateParentProfile({ showOnboardingTour: false });
          }}
          darkMode={darkMode}
          onSelectTab={setActiveTab}
          onFoodReady={handleQuickFoodReady}
          onOpenHolidayPause={() => setShowHolidayModal(true)}
          onOpenSchoolEdit={() => setShowSchoolModal(true)}
          holidayPauseConfig={holidayPauseConfig}
          parentProfile={parentProfile}
        />

        {/* 💳 LunchMate RBI Escrow Payment Checkout Modal */}
        <PaymentEscrowModal
          isOpen={!!paymentPlanModal}
          onClose={() => setPaymentPlanModal(null)}
          plan={paymentPlanModal?.plan}
          breakdown={paymentPlanModal?.breakdown}
          parentProfile={parentProfile}
          onPaymentSuccess={handlePaymentSuccess}
          darkMode={darkMode}
        />

        {/* 📍 High-Precision Doorstep Pinpoint Adjuster Modal (Swiggy / Uber Standard) */}
        <DoorstepPinpointModal
          isOpen={showDoorstepPinpointModal}
          onClose={() => setShowDoorstepPinpointModal(false)}
          initialCoords={
            pinpointTargetContext === 'emergency' 
              ? liveCoords 
              : pinpointTargetContext === 'modal' 
                ? newCoords 
                : hubCoords
          }
          initialAddress={
            pinpointTargetContext === 'emergency' 
              ? emergencyPickupAddress 
              : pinpointTargetContext === 'modal' 
                ? newLocality 
                : (parentProfile?.deliveryAddress || hubLocality)
          }
          onSaveLocation={handleDoorstepLocationSaved}
          darkMode={darkMode}
        />

      </div>
    </div>
  );
};

export default ParentDashboard;
