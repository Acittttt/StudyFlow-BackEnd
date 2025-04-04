const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /auth/register
router.post('/register', authController.register);

// POST /auth/login
router.post('/login', authController.login);

// PUT /auth/forgot-password
router.put('/forgot-password', authController.forgotPassword);

//POST /auth/verify-user
router.post('/verify-user', authController.verifyUser);

module.exports = router;