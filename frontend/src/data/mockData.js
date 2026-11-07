export const initialDrivers = [
  {
    id: "DRV-101",
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    area: "Guindy, Chennai",
    vehicle: "TVS Jupiter (TN-07-BX-4421)",
    status: "Verified",
    rating: 4.9,
    tripsToday: 6,
    earningsToday: 510,
    documents: {
      aadhaar: "VERIFIED (XXXX-XXXX-4812)",
      license: "TN072021004921",
      pan: "ABCDE1234F",
      photo: "Selfie Verified"
    },
    isOnline: true,
    lat: 13.0067,
    lng: 80.2020
  },
  {
    id: "DRV-102",
    name: "Priya Sundaram",
    phone: "+91 98401 22334",
    area: "Adyar, Chennai",
    vehicle: "Honda Activa 6G (TN-09-CD-1102)",
    status: "Pending Verification",
    rating: 4.8,
    tripsToday: 0,
    earningsToday: 0,
    documents: {
      aadhaar: "UPLOADED (Need Review)",
      license: "TN092023008819",
      pan: "XYZPQ9876K",
      photo: "Selfie Uploaded"
    },
    isOnline: false,
    lat: 13.0012,
    lng: 80.2565
  },
  {
    id: "DRV-103",
    name: "Karthik Raja",
    phone: "+91 97910 88776",
    area: "Velachery, Chennai",
    vehicle: "Hero Splendor Plus (TN-10-AZ-9988)",
    status: "Verified",
    rating: 5.0,
    tripsToday: 8,
    earningsToday: 680,
    documents: {
      aadhaar: "VERIFIED (XXXX-XXXX-9901)",
      license: "TN102020003311",
      pan: "KLMNO5544R",
      photo: "Selfie Verified"
    },
    isOnline: true,
    lat: 12.9815,
    lng: 80.2180
  }
];

export const initialOrders = [
  {
    id: "LUNCH-9901",
    parentName: "Parent",
    parentPhone: "+91 94441 55667",
    studentName: "Akash S.",
    schoolName: "DAV Higher Secondary School, Gopalapuram",
    schoolMapsLink: "https://www.google.com/maps/search/?api=1&query=DAV+Higher+Secondary+School+Gopalapuram+Chennai",
    classDept: "Class 9-B (Roll 14)",
    lunchTime: "12:30 PM",
    pickupAddress: "No. 42, 3rd Main Road, Anna Nagar East, Chennai",
    deliveryAddress: "DAV HSS Gate 2, Gopalapuram",
    distanceKm: 3.2,
    price: 50,
    paymentMode: "emergency",
    paymentStatus: "Advance Paid",
    driverId: null,
    driverName: null,
    status: "Food Ready",
    pickupOtp: "4821",
    deliveryOtp: "9042",
    recipientType: "School Staff / Gate Office",
    prepTime: "11:45 AM",
    pickupTime: "12:05 PM",
    estArrival: "12:25 PM",
    coordinates: {
      start: { lat: 13.0827, lng: 80.2707 },
      current: { lat: 13.0500, lng: 80.2500 },
      end: { lat: 13.0475, lng: 80.2588 }
    }
  },
  {
    id: "LUNCH-9820",
    parentName: "Kavitha Rajan",
    parentPhone: "+91 98888 12345",
    studentName: "Varun Rajan",
    schoolName: "KV Ashok Nagar",
    schoolMapsLink: "https://www.google.com/maps/search/?api=1&query=Kendriya+Vidyalaya+Ashok+Nagar+Chennai",
    classDept: "Class 10-A",
    lunchTime: "12:15 PM",
    pickupAddress: "Ashok Nagar, Chennai",
    deliveryAddress: "KV Ashok Nagar Gate 1",
    distanceKm: 3.5,
    price: 45,
    paymentMode: "monthly",
    paymentStatus: "Advance Paid",
    driverId: "DRV-101",
    driverName: "Ramesh Kumar",
    status: "Delivered",
    pickupOtp: "1234",
    deliveryOtp: "5678",
    recipientType: "Student",
    prepTime: "11:30 AM",
    pickupTime: "11:50 AM",
    estArrival: "12:10 PM",
    coordinates: {
      start: { lat: 13.0827, lng: 80.2707 },
      current: { lat: 13.0500, lng: 80.2500 },
      end: { lat: 13.0475, lng: 80.2588 }
    }
  },
  {
    id: "LUNCH-9744",
    parentName: "Suresh Kumar",
    parentPhone: "+91 97777 54321",
    studentName: "Aditi Suresh",
    schoolName: "Velammal Surapet",
    classDept: "Class 8-C",
    lunchTime: "12:45 PM",
    pickupAddress: "Surapet, Chennai",
    deliveryAddress: "Velammal Gate 3",
    distanceKm: 3.2,
    price: 50,
    paymentMode: "emergency",
    paymentStatus: "Fully Paid",
    driverId: "DRV-101",
    driverName: "Ramesh Kumar",
    status: "Delivered",
    pickupOtp: "4321",
    deliveryOtp: "8765",
    recipientType: "School Staff",
    prepTime: "12:00 PM",
    pickupTime: "12:20 PM",
    estArrival: "12:40 PM",
    coordinates: {
      start: { lat: 13.0827, lng: 80.2707 },
      current: { lat: 13.0500, lng: 80.2500 },
      end: { lat: 13.0475, lng: 80.2588 }
    }
  }
];

export const subscriptionPlans = [
  {
    id: 'monthly',
    name: '20-Day Standard Pass (Batched Route)',
    pricePerDay: '₹42/day',
    discount: 'Fair Dabbawala Route',
    popular: true,
    badge: 'MOST POPULAR',
    features: [
      'Corridor delivery (0–3 km base)',
      'Assigned verified rider (Ramesh 4.9★)',
      'Zero-Hunger Canteen backup included',
      'Free pause on sick days & holidays'
    ]
  },
  {
    id: 'vip',
    name: '20-Day Premium VIP Pass (Dedicated 1:1)',
    pricePerDay: '₹58/day',
    discount: 'Express 10-Min Window',
    popular: false,
    badge: 'PRIORITY EXPRESS',
    features: [
      'Dedicated solo rider (zero batching)',
      'Guaranteed 10-min lunch bell window',
      'Exclusive 1:1 standby floater backup',
      '₹5,000 transit & tiffin container cover'
    ]
  },
  {
    id: 'quarterly',
    name: '60-Day Term Pass (Same Driver Lock)',
    pricePerDay: '₹35/day',
    discount: 'Save ₹420 vs Standard',
    popular: false,
    badge: 'BEST VALUE (3 MONTHS)',
    features: [
      'Permanent same driver lock all term',
      'Lowest rate: Only ₹35/day across 60 days',
      '8 Free emergency holiday pause days',
      'School reception priority handover'
    ]
  },
  {
    id: 'weekly',
    name: '5-Day Trial Pass (Starter Week)',
    pricePerDay: '₹50/day',
    discount: 'No Long Commitment',
    popular: false,
    badge: '1-WEEK TRIAL',
    features: [
      '5 school weekdays trial test',
      'Live 3-sec GPS telemetry & Double OTP',
      'Zero-Hunger school canteen guarantee',
      '100% credit rollover on pass upgrade'
    ]
  }
];


