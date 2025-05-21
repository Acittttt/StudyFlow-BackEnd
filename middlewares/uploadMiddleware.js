const multer = require('multer');
const { put } = require('@vercel/blob');
const path = require('path');

// Konfigurasi multer untuk menyimpan file di memori sebelum upload ke Vercel Blob
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5 MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|heic|heif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
});

// Fungsi untuk mengunggah file ke Vercel Blob
const uploadToVercelBlob = async (file) => {
  try {
    console.log('Attempting to upload to Vercel Blob:', file.originalname, 'Size:', file.size);
    const blob = await put(`profiles/${Date.now()}${path.extname(file.originalname)}`, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log('Vercel Blob upload successful:', blob.url);
    return blob;
  } catch (error) {
    console.error('Vercel Blob upload error:', error.message);
    throw new Error(`Failed to upload to Vercel Blob: ${error.message}`);
  }
};

module.exports = { upload, uploadToVercelBlob };