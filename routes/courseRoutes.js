const express = require('express');
const router = express.Router();
const { upload } = require('../middlewares/uploadMiddleware'); // Destructure upload
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/courseController');

// Logging untuk debugging
console.log('Upload middleware loaded in courseRoutes:', upload ? 'Success' : 'Failed');

// Semua user (terautentikasi) bisa lihat:
router.get('/', auth, ctrl.getAvailableCourses);

// Hanya Owner:
router.post(
  '/add',
  auth,
  upload.single('course_gambar'),
  ctrl.addCourse
);
router.get(
  '/my-courses',
  auth,
  ctrl.getMyCourses
);
router.put(
  '/edit/:courseId',
  auth,
  upload.single('course_gambar'),
  ctrl.editCourse
);
router.delete(
  '/delete/:courseId',
  auth,
  ctrl.deleteCourse
);

module.exports = router;