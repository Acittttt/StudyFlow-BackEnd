const pool = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Membuat user baru di database
 * @param {string} fullName
 * @param {string} username
 * @param {string} password
 * @param {string} email
 * @param {string} role
 * @returns {object} data user yang baru dibuat
 */
async function createUser(fullName, username, password, email, role) {
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (full_name, username, password, email, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [fullName, username, hashedPassword, email, role];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

/**
 * Mencari user berdasarkan username
 * @param {string} username
 * @returns {object | null} user yang ditemukan atau null jika tidak ada
 */
async function findUserByUsername(username) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const { rows } = await pool.query(query, [username]);
  return rows[0] || null;
}

module.exports = {
  createUser,
  findUserByUsername,
};