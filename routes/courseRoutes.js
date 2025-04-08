const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authenticate = require('../middlewares/authMiddleware');

// Route Course(hanya untuk owner)
router.post('/add', authenticate, courseController.addCourse);
router.get('/my-courses', authenticate, courseController.getMyCourses);
router.put('/edit/:courseId', authenticate, courseController.editCourse);
router.delete('/:courseId', authenticate, courseController.deleteCourse);



module.exports = router;
