const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  totalHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);

