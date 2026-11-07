const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// ─── YOUPI PAY-IN ROUTES (0% Platform Fee Parent Meal Pass Collection) ───
router.post('/youpi/create-charge', paymentController.createYoupiCharge);
router.post('/youpi/verify-utr', paymentController.verifyYoupiUtr);
router.post('/youpi/webhook', paymentController.youpiWebhook);

// ─── RAZORPAYX PAY-OUT ROUTES (Automated Driver Payout upon Gate OTP) ───
router.post('/razorpayx/payout', paymentController.razorpayxPayout);

// ─── GENERAL CONFIGURATION & STATUS ───
router.get('/config', paymentController.getPaymentConfig);

module.exports = router;
