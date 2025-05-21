const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticate = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

console.log('Upload middleware loaded in profileRoutes:', upload ? 'Success' : 'Failed');

router.put('/edit', authenticate, upload.single('profile_picture'), profileController.updateProfile);
router.get('/data', authenticate, profileController.getProfile);

module.exports = router;