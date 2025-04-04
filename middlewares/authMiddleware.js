const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Ambil token dari header Authorization
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = decoded; // Simpan data pengguna yang didekodekan di req.user
    next(); // Lanjutkan ke middleware atau rute berikutnya
  });
};

module.exports = authenticate;