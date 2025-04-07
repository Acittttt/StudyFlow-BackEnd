const multer = require('multer');
const path = require('path');

// Setup storage engine untuk menyimpan gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    // Nama file unik dengan timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Inisialisasi multer dengan konfigurasi storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|heic|heif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only image files are allowed!');
    }
  }
});

module.exports = upload;