const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authenticate = require('../middlewares/authMiddleware');

// Route: POST /enroll
router.post('/', authenticate, enrollmentController.enrollCourse);
router.get('/user', authenticate, enrollmentController.getUserEnrollments);
router.get('/:courseId/detail', enrollmentController.getCourseDetails);

module.exports = router;
