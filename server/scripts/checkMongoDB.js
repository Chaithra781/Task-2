const mongoose = require('mongoose');
require('dotenv').config();

const checkMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system');
    console.log('✅ MongoDB Connected');
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
    return false;
  }
};

if (require.main === module) {
  checkMongoDB().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = checkMongoDB;

