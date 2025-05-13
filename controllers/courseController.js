// controllers/courseController.js
const pool = require('../config/database');

// Helper cek kepemilikan
async function isOwner(courseId, ownerId) {
  const { rowCount } = await pool.query(
    `SELECT 1 FROM courses WHERE course_id = $1 AND owner_id = $2`,
    [courseId, ownerId]
  );
  return rowCount > 0;
}

// ADD COURSE
exports.addCourse = async (req, res) => {
  const { title, description, end_courses } = req.body;
  const ownerId = req.user.id;

  // Validasi sederhana
  if (!title || title.trim().length < 3) {
    return res.status(400).json({ message: 'Title minimal 3 karakter.' });
  }

  // Siapkan URL gambar jika ada
  const course_gambar = req.file
    ? `/uploads/${req.file.filename}`
    : null;

  try {
    const { rows } = await pool.query(
      `INSERT INTO courses
        (owner_id, title, description, course_gambar, end_courses, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       RETURNING *;`,
      [ownerId, title, description, course_gambar, end_courses || null]
    );
    res.status(201).json({
      message: 'Course berhasil dibuat',
      course: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY COURSES
exports.getMyCourses = async (req, res) => {
  if (req.user.role !== 'Owner') {
    return res.status(403).json({ message: 'Hanya owner yang bisa mengakses.' });
  }
  try {
    const { rows } = await pool.query(
    `SELECT * FROM courses
     WHERE owner_id = $1
     ORDER BY created_at DESC;`,
    [req.user.id]
  );
  res.json({ message: 'Daftar courses Anda', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// EDIT COURSE
exports.editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    const ownerId = req.user.id;

    // Pastikan course ada dan milik owner ini
    const { rowCount } = await pool.query(
      'SELECT 1 FROM courses WHERE course_id = $1 AND owner_id = $2',
      [courseId, ownerId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: 'Course not found or not owned by you' });
    }

    // Siapkan URL gambar baru (atau null kalau tidak upload)
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Update semua field, gunakan COALESCE supaya gambar lama tetap jika imageUrl null
    const { rows } = await pool.query(
      `
      UPDATE courses
      SET title = $1,
          description = $2,
          course_gambar = COALESCE($3, course_gambar),
          updated_at = NOW()
      WHERE course_id = $4
      RETURNING *;
      `,
      [title, description, imageUrl, courseId]
    );

    return res.status(200).json({
      message: 'Course updated successfully',
      course: rows[0]
    });
  } catch (error) {
    console.error('Edit course error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// === DELETE COURSE ===
// DELETE /course/:courseId
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const ownerId = req.user.id;
    console.log('Attempt delete courseId=', courseId, 'ownerId=', ownerId);

    const { rowCount } = await pool.query(
      'SELECT 1 FROM courses WHERE course_id = $1 AND owner_id = $2',
      [courseId, ownerId]
    );
    if (rowCount === 0) {
      console.log('Delete failed: no matching row');
      return res.status(404).json({ message: 'Course not found or not owned by you' });
    }

    await pool.query('DELETE FROM courses WHERE course_id = $1', [courseId]);
    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// GET ALL COURSES (user/view saja)
exports.getAvailableCourses = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         c.course_id,
         c.title,
         c.description,
         c.course_gambar,
         c.created_at,
         u.full_name AS owner_name
       FROM courses c
       JOIN users u ON u.id = c.owner_id
       ORDER BY c.created_at DESC;`
    );
    res.json({ message: 'Semua courses', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};