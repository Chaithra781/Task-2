const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected');
  console.log('📊 Database: attendance_system');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('⚠️  Server will continue but database operations may fail');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('✅ Backend server is running');
  console.log(`🔌 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

