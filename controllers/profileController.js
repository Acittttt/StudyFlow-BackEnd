const userModel = require('../models/user');
const { uploadToVercelBlob } = require('../middlewares/uploadMiddleware');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProfile = await userModel.findProfileByUserId(userId);
    if (!userProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({
      message: 'Profile fetched successfully',
      profile: {
        full_name: userProfile.full_name,
        username: userProfile.username,
        email: userProfile.email,
        role: userProfile.role,
        created_at: userProfile.created_at,
        profile_picture_url: userProfile.profile_picture_url,
        alamat: userProfile.alamat,
        tanggal_bergabung: userProfile.tanggal_bergabung,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let { full_name, username, email, alamat } = req.body;
    let profile_picture_url = null;

    // Jika ada file yang diunggah, upload ke Vercel Blob
    if (req.file) {
      console.log('Uploading file:', req.file.originalname, 'Size:', req.file.size);
      const blob = await uploadToVercelBlob(req.file);
      profile_picture_url = blob.url; // URL publik dari Vercel Blob
      console.log('File uploaded to Vercel Blob:', profile_picture_url);
    }

    // Update data di tabel users
    let updatedUser = null;
    if (full_name || username || email) {
      updatedUser = await userModel.updateUser(userId, full_name, username, email);
      console.log('User updated:', updatedUser);
    }

    // Update data di tabel users_profile
    let updatedProfile = await userModel.updateProfileDetails(userId, alamat, profile_picture_url);
    console.log('Profile updated:', updatedProfile);

    // Jika tidak ada perubahan
    if (!updatedUser && !updatedProfile) {
      return res.status(400).json({ message: 'Failed to update profile' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: { ...updatedUser, ...updatedProfile },
    });
  } catch (error) {
    console.error('Error updating profile:', error.message, error.stack);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};