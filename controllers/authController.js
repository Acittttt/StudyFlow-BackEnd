const userModel = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { full_name, username, password, email, role } = req.body;

    // Cek apakah username sudah ada
    const existingUser = await userModel.findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Buat user baru
    const newUser = await userModel.createUser(full_name, username, password, email, role);

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cari user berdasarkan username
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Bandingkan password yang diinput dengan password di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Tentukan masa aktif token selama 24 jam (dalam detik)
    const jwtExpirySeconds = 24 * 60 * 60;

    // Buat token dengan masa aktif 24 jam
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: jwtExpirySeconds }
    );

    // Hitung waktu kadaluarsa (expired_at) sebagai waktu saat ini + 24 jam
    const expiredAt = new Date(Date.now() + jwtExpirySeconds * 1000);

    // Simpan token dan expired_at ke dalam tabel users_token
    await userModel.saveUserToken(user.id, token, expiredAt);

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { username, email, newPassword } = req.body;
    
    // Cari user berdasarkan username
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Pastikan email yang dikirim cocok dengan email user
    if (user.email !== email) {
      return res.status(400).json({ message: 'Email does not match' });
    }
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Perbarui password di database
    const updatedUser = await userModel.updatePassword(user.id, hashedPassword);
    
    if (updatedUser) {
      return res.status(200).json({ message: 'Password updated successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to update password' });
    }
  } catch (error) {
    console.error('Forgot Password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.verifyUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await userModel.findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ valid: false, message: 'User not found' });
    }
    if (user.email !== email) {
      return res.status(400).json({ valid: false, message: 'Email does not match' });
    }
    return res.status(200).json({ valid: true, message: 'User verified' });
  } catch (error) {
    console.error('Verify user error:', error);
    return res.status(500).json({ valid: false, message: 'Internal server error' });
  }
};