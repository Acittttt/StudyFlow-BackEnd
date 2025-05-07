const userModel = require('../models/user');

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
        tanggal_bergabung: userProfile.tanggal_bergabung
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Ambil ID pengguna dari token JWT
  
    // Ambil data yang ingin diperbarui dari request body
    let { full_name, username, email, alamat } = req.body;
    let profile_picture_url = null;
  
    // Jika ada gambar yang diunggah, simpan gambar dan buat URL-nya
    if (req.file) {
      profile_picture_url = `/uploads/${req.file.filename}`;
    }    
  
    // Memperbarui data di tabel users (jika ada perubahan pada username, email, full_name)
    let updatedUser = null;
    if (full_name || username || email) {
      updatedUser = await userModel.updateUser(userId, full_name, username, email);
    }
  
    // Memperbarui data di tabel users_profile (alamat, gambar profil)
    let updatedProfile = await userModel.updateProfileDetails(userId, alamat, profile_picture_url);
  
    // Jika tidak ada perubahan pada keduanya
    if (!updatedUser && !updatedProfile) {
      return res.status(400).json({ message: 'Failed to update profile' });
    }
  
    // Mengembalikan hasil update profil
    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: { ...updatedUser, ...updatedProfile },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};