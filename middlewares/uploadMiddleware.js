const multer = require('multer');
const { put } = require('@vercel/blob');
const path = require('path');
const sharp = require('sharp');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
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

const uploadToVercelBlob = async (file) => {
  try {
    console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'Present' : 'Absent');
    console.log('Attempting to upload to Vercel Blob:', file.originalname, 'Size:', file.size);

    const compressedImage = await sharp(file.buffer)
      .resize({ width: 800 })
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toBuffer();

    const blob = await put(`profiles/${Date.now()}.jpg`, compressedImage, {
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