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

const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Cek apakah course ada
    const courseCheck = await pool.query(
      'SELECT * FROM courses WHERE course_id = $1',
      [courseId]
    );

    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Ambil data detail: modules, materials, tasks
    const detailQuery = `
      SELECT
        c.course_id,
        c.title AS course_title,
        m.module_id,
        m.title AS module_title,
        mat.material_id,
        mat.title AS material_title,
        mat.content,
        mat.material_type,
        t.tasks_id,
        t.title AS task_title,
        t.description AS task_description,
        t.deadline,
        t.created_at AS task_created_at
      FROM courses c
      JOIN modules m ON m.course_id = c.course_id
      LEFT JOIN materials mat ON mat.module_id = m.module_id
      LEFT JOIN tasks t ON t.module_id = m.module_id
      WHERE c.course_id = $1
      ORDER BY m.module_id, mat.material_id, t.tasks_id;
    `;

    const detailResult = await pool.query(detailQuery, [courseId]);

    // Format data menjadi terstruktur per module
    const structuredData = {};
    for (const row of detailResult.rows) {
      const moduleId = row.module_id;

      if (!structuredData[moduleId]) {
        structuredData[moduleId] = {
          module_id: moduleId,
          module_title: row.module_title,
          materials: [],
          tasks: []
        };
      }

      if (row.material_id && !structuredData[moduleId].materials.some(m => m.material_id === row.material_id)) {
        structuredData[moduleId].materials.push({
          material_id: row.material_id,
          title: row.material_title,
          content: row.content,
          material_type: row.material_type
        });
      }

      if (row.tasks_id && !structuredData[moduleId].tasks.some(t => t.tasks_id === row.tasks_id)) {
        structuredData[moduleId].tasks.push({
          tasks_id: row.tasks_id,
          title: row.task_title,
          description: row.task_description,
          deadline: row.deadline,
          created_at: row.task_created_at
        });
      }
    }

    return res.status(200).json({
      success: true,
      course: {
        course_id: courseCheck.rows[0].course_id,
        title: courseCheck.rows[0].title,
        description: courseCheck.rows[0].description,
        modules: Object.values(structuredData)
      }
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    return res.status(500).json({ message: 'Internal server error', detail: error.message });
  }
};

module.exports = {
  enrollCourse,
  getUserEnrollments,
  getCourseDetails
};
