const pool = require('../config/database');

const enrollCourse = async (req, res) => {
  try {
    // Di controller enroll
    console.log("🔥 BODY:", req.body);
    const userId = req.user.id;
    const userRole = req.user.role;
    let courseId = req.body.courseId; // Ambil langsung dari camelCase
    console.log("courseId:", courseId, typeof courseId);
    console.log("Body yg diterima dari Android:", req.body);

    if (!courseId || typeof courseId !== 'number' || courseId <= 0) {
      return res.status(400).json({ message: 'Invalid courseId' });
    }
    
    if (userRole !== 'User') {
      return res.status(403).json({ message: 'Only users can enroll in courses' });
    }

    const courseCheck = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const alreadyEnrolled = await pool.query(
      'SELECT * FROM course_enrollments WHERE student_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (alreadyEnrolled.rows.length > 0) {
      return res.status(400).json({ message: 'You have already enrolled in this course' });
    }

    const enrollQuery = `
      INSERT INTO course_enrollments (student_id, course_id, enrolled_at)
      VALUES ($1, $2, NOW())
      RETURNING *;
    `;
    const result = await pool.query(enrollQuery, [userId, courseId]);

    res.status(201).json({
      message: 'Enrollment successful',
      enrollment: result.rows[0]
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Internal server error', detail: error.message });
  }
};

const getUserEnrollments = async (req, res) => {
    try {
      const userId = req.user.id; // Mengambil ID user dari token JWT
      
      const enrolledCourses = await pool.query(
        `SELECT c.id, c.title, c.description, c.created_at, ce.enrolled_at
        FROM course_enrollments ce
        JOIN courses c ON ce.course_id = c.id
        WHERE ce.student_id = $1
        ORDER BY ce.enrolled_at DESC;`,
        [userId]
      );
      
      return res.status(200).json({
        success: true,
        data: enrolledCourses.rows,
        message: "Daftar kursus yang diikuti berhasil diambil"
      });
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat mengambil daftar kursus"
      });
    }
  };

  module.exports = {
    enrollCourse,
    getUserEnrollments // Tambahkan ini
  };
