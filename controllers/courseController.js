const pool = require('../config/database')

//ADD COURSE//
const addCourse = async (req, res) => {
    try {
      const { title, description, price } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
        // Cek role
      if (userRole !== 'Owner') {
        return res.status(403).json({ message: 'Only owner can add a course' });
      }
  
      const query = `
        INSERT INTO courses (teacher_id, title, description, price, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *;
      `;
      const { rows } = await pool.query(query, [userId, title, description, price]);
  
      return res.status(201).json({
        message: 'Course added successfully',
        course: rows[0],
      });
    } catch (error) {
      console.error('Add course error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

//GET COURSE//
const getMyCourses = async (req, res) => {
    try {
      if (req.user.role !== 'Owner') {
        return res.status(403).json({ message: 'Only owners can view their courses' });
      }
  
      const result = await pool.query( // ← ini sudah benar
        `SELECT * FROM courses WHERE teacher_id = $1`, // pakai teacher_id, bukan owner_id
        [req.user.id]
      );
  
      res.status(200).json({
        message: 'Courses retrieved successfully',
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching owner courses:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

//PUT COURSE//
const editCourse = async (req, res) => {
    console.log('Edit request from user:', req.user);
    console.log('Course ID:', req.params.courseId);
    console.log('New data:', req.body);

    try {
      const { courseId } = req.params;
      const { title, description, price } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
  
      // Cek role
      if (userRole !== 'Owner') {
        return res.status(403).json({ message: 'Only owners can edit a course' });
      }
  
      // Cek apakah course ini milik owner yang login
      const checkQuery = `SELECT * FROM courses WHERE id = $1 AND teacher_id = $2`;
      const checkResult = await pool.query(checkQuery, [courseId, userId]);
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found or not owned by you' });
      }
  
      // Update course
      const updateQuery = `
        UPDATE courses
        SET title = $1, description = $2, price = $3, updated_at = NOW()
        WHERE id = $4
        RETURNING *;
      `;
      const updateResult = await pool.query(updateQuery, [
        title,
        description,
        price,
        courseId,
      ]);
  
      return res.status(200).json({
        message: 'Course updated successfully',
        course: updateResult.rows[0],
      });
    } catch (error) {
      console.error('Edit course error:', error);
      res.status(500).json({ message: 'Internal server error', detail: error.message });
    }
  };
  
  const deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
  
      if (userRole !== 'Owner') {
        return res.status(403).json({ message: 'Only owners can delete courses' });
      }
  
      // Cek apakah course itu milik owner
      const checkQuery = `SELECT * FROM courses WHERE id = $1 AND teacher_id = $2`;
      const checkResult = await pool.query(checkQuery, [courseId, userId]);
  
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found or not owned by you' });
      }
  
      // Delete course
      const deleteQuery = `DELETE FROM courses WHERE id = $1`;
      await pool.query(deleteQuery, [courseId]);
  
      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({ message: 'Internal server error', detail: error.message });
    }
  };
  
  // GET ALL COURSES FOR USER
const getAvailableCourses = async (req, res) => {
  try {
    const query = `
      SELECT title, description, price, created_at 
      FROM courses 
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query);
    res.status(200).json({
      message: 'Courses retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  
  
  module.exports = {
    addCourse,
    getMyCourses,
    editCourse,
    deleteCourse,
    getAvailableCourses
  };