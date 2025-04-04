const pool = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Membuat user baru di database dan sekaligus membuat record pada tabel users_profile.
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
  const user = rows[0];

  // Buat record profil awal pada tabel users_profile
  const profileQuery = `
    INSERT INTO users_profile (user_id, profile_picture_url, alamat, tanggal_bergabung)
    VALUES ($1, '', '', $2)
    RETURNING *
  `;
  // Menggunakan created_at dari tabel users sebagai tanggal_bergabung
  const profileValues = [user.id, user.created_at];
  await pool.query(profileQuery, profileValues);

  return user;
}

/**
 * Mencari user berdasarkan username.
 */
async function findUserByUsername(username) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const { rows } = await pool.query(query, [username]);
  return rows[0] || null;
}

/**
 * Mengambil data profil pengguna dengan join antara tabel users dan users_profile.
 */
async function findProfileByUserId(userId) {
  const query = `
    SELECT 
      u.id, u.full_name, u.username, u.email, u.role, u.created_at,
      up.profile_picture_url, up.alamat, up.tanggal_bergabung
    FROM users u
    LEFT JOIN users_profile up ON u.id = up.user_id
    WHERE u.id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows[0] || null;
}

/**
 * Memperbarui data di tabel users (username, email, full_name).
 */
async function updateUser(userId, full_name, username, email) {
  const query = `
    UPDATE users
    SET 
      full_name = COALESCE($1, full_name), 
      username = COALESCE($2, username), 
      email = COALESCE($3, email)
    WHERE id = $4
    RETURNING *
  `;
  const { rows } = await pool.query(query, [full_name, username, email, userId]);
  return rows[0] || null;
}

/**
 * Memperbarui data pada tabel users_profile (alamat, profile_picture_url).
 */
async function updateProfileDetails(userId, alamat, profile_picture_url) {
  const query = `
    UPDATE users_profile
    SET 
      alamat = COALESCE($1, alamat), 
      profile_picture_url = COALESCE($2, profile_picture_url)
    WHERE user_id = $3
    RETURNING *
  `;
  const { rows } = await pool.query(query, [alamat, profile_picture_url, userId]);
  return rows[0] || null;
}

/**
 * Menyimpan atau memperbarui token pengguna pada tabel users_token.
 * Token lama dihapus terlebih dahulu agar hanya menyimpan token terbaru.
 */
async function saveUserToken(userId, token, expiredAt) {
  // Hapus token lama untuk user tersebut (jika ada)
  const deleteQuery = "DELETE FROM users_token WHERE user_id = $1";
  await pool.query(deleteQuery, [userId]);

  // Simpan token baru
  const insertQuery = `
    INSERT INTO users_token (user_id, token, expired_at)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const { rows } = await pool.query(insertQuery, [userId, token, expiredAt]);
  return rows[0];
}

module.exports = {
  createUser,
  findUserByUsername,
  findProfileByUserId,
  updateUser,
  updateProfileDetails,
  saveUserToken,
};