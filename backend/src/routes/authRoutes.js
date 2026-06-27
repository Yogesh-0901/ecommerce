const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


// POST http://192.168.1.38:5000/api/auth/signup
router.post('/signup', authController.signup);


// POST http://192.168.1.38:5000/api/auth/login
router.post('/login', authController.login);

// POST http://192.168.1.38:5000/api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);




module.exports = router;