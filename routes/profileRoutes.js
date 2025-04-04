const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticate = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Menggunakan PUT untuk memperbarui data profil
router.put('/profile', authenticate, upload.single('profile_picture'), profileController.updateProfile);

// Pastikan ada route GET juga untuk mengambil data profil
router.get('/profile', authenticate, profileController.getProfile);

module.exports = router;