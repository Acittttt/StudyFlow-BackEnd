const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticate = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// PUT profile/profile
router.put('/edit', authenticate, upload.single('profile_picture'), profileController.updateProfile);

// GET profile/profile
router.get('/data', authenticate, profileController.getProfile);

module.exports = router;