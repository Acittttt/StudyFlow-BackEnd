// controllers/enrollmentsController.js
const pool = require('../config/database');

// Enroll user ke course
const enrollCourse = async (req, res) => {
  try {
    const userId   = req.user.id;
    const userRole = req.user.role;
    const { courseId } = req.body;

    // Hanya role User yang boleh enroll
    if (userRole !== 'User') {
      return res.status(403).json({ message: 'Only users can enroll in courses' });
    }

    // Cek apakah course ada
    const courseCheck = await pool.query(
      'SELECT 1 FROM courses WHERE course_id = $1',
      [courseId]
    );
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Cek apakah sudah pernah enroll
    const alreadyEnrolled = await pool.query(
      'SELECT 1 FROM course_enrollments WHERE student_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    if (alreadyEnrolled.rows.length > 0) {
      return res.status(400).json({ message: 'You have already enrolled in this course' });
    }

    // Lakukan enroll
    const enrollQuery = `
      INSERT INTO course_enrollments (student_id, course_id, enrolled_at)
      VALUES ($1, $2, NOW())
      RETURNING *;
    `;
    const result = await pool.query(enrollQuery, [userId, courseId]);

    return res.status(201).json({
      message: 'Enrollment successful',
      enrollment: result.rows[0]
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    return res.status(500).json({ message: 'Internal server error', detail: error.message });
  }
};

// Ambil daftar course yang sudah di-enroll user
const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrolledCourses = await pool.query(
      `
      SELECT
        c.course_id   AS id,         -- alias jadi 'id' untuk klien
        c.title,
        c.description,
        c.created_at,
        ce.enrolled_at
      FROM course_enrollments ce
      JOIN courses c
        ON ce.course_id = c.course_id
      WHERE ce.student_id = $1
      ORDER BY ce.enrolled_at DESC;
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: enrolledCourses.rows,
      message: 'Daftar kursus yang diikuti berhasil diambil'
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar kursus'
    });
  }
};

module.exports = {
  enrollCourse,
  getUserEnrollments
};
