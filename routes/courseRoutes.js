// routes/courseRoutes.js
const express  = require('express');
const router   = express.Router();
const upload   = require('../middlewares/uploadMiddleware');
const auth     = require('../middlewares/authMiddleware');
const ctrl     = require('../controllers/courseController');

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
