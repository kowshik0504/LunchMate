const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// When the frontend makes a POST request to /api/users/register, it runs the controller
router.post('/register', userController.registerTestUser);

module.exports = router;