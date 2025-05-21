require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/auth', authRoutes);
app.get('/profile', profileRoutes);
app.use('/uploads', express.static('uploads'));
app.get('/course', courseRoutes)
app.get('/enroll', enrollmentRoutes);

// Get
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

console.log('Rute yang terdaftar:');
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path)
  } else if (r.name === 'router') {
    r.handle.stack.forEach(function(layer) {
      if (layer.route) {
        console.log(r.regexp, layer.route.path);
      }
    });
  }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});