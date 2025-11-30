const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

// Helper function to get start and end of day
const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @route   POST /api/attendance/checkin
// @desc    Check in for the day
// @access  Private (Employee)
router.post('/checkin', auth, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Determine if late (assuming 9 AM is the standard time)
    const checkInTime = new Date();
    const standardTime = new Date(today);
    standardTime.setHours(9, 0, 0, 0);
    
    let status = 'present';
    if (checkInTime > standardTime) {
      status = 'late';
    }

    if (attendance) {
      attendance.checkInTime = checkInTime;
      attendance.status = status;
      await attendance.save();
    } else {
      attendance = new Attendance({
        userId: req.user._id,
        date: today,
        checkInTime: checkInTime,
        status: status
      });
      await attendance.save();
    }

    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out for the day
// @access  Private (Employee)
router.post('/checkout', auth, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    attendance.checkOutTime = new Date();
    
    // Check if half-day (less than 4 hours)
    const hoursWorked = (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60);
    if (hoursWorked < 4) {
      attendance.status = 'half-day';
    }

    await attendance.save();

    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my-history
// @desc    Get employee's attendance history
// @access  Private (Employee)
router.get('/my-history', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId department');

    res.json(attendance);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my-summary
// @desc    Get employee's monthly summary
// @access  Private (Employee)
router.get('/my-summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      present: attendance.filter(a => a.status === 'present').length,
      absent: 0, // Calculate based on working days
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    // Calculate absent days (simplified - assumes 30 days per month)
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const presentDays = attendance.length;
    summary.absent = daysInMonth - presentDays;

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private (Employee)
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    });

    if (!attendance) {
      return res.json({ checkedIn: false, checkedOut: false, attendance: null });
    }

    res.json({
      checkedIn: !!attendance.checkInTime,
      checkedOut: !!attendance.checkOutTime,
      attendance
    });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all employees' attendance
// @access  Private (Manager)
router.get('/all', auth, isManager, async (req, res) => {
  try {
    const { employeeId, date, status, month, year } = req.query;
    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      } else {
        return res.json([]);
      }
    }

    if (date) {
      const targetDate = new Date(date);
      const { start, end } = getDayBounds(targetDate);
      query.date = { $gte: start, $lte: end };
    } else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId department');

    res.json(attendance);
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/employee/:id
// @desc    Get specific employee's attendance
// @access  Private (Manager)
router.get('/employee/:id', auth, isManager, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.params.id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId department');

    res.json(attendance);
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get team attendance summary
// @access  Private (Manager)
router.get('/summary', auth, isManager, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || currentDate.getMonth() + 1;
    const targetYear = year || currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    const summary = {
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      present: attendance.filter(a => a.status === 'present').length,
      absent: 0,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    res.json(summary);
  } catch (error) {
    console.error('Get team summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/export
// @desc    Export attendance to CSV
// @access  Private (Manager)
router.get('/export', auth, isManager, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    let query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      } else {
        return res.status(404).json({ message: 'Employee not found' });
      }
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId department');

    // Convert to CSV format
    const csvHeader = 'Date,Employee ID,Name,Department,Check In,Check Out,Status,Total Hours\n';
    const csvRows = attendance.map(a => {
      const date = new Date(a.date).toLocaleDateString();
      const checkIn = a.checkInTime ? new Date(a.checkInTime).toLocaleString() : '';
      const checkOut = a.checkOutTime ? new Date(a.checkOutTime).toLocaleString() : '';
      return `${date},${a.userId.employeeId},${a.userId.name},${a.userId.department},${checkIn},${checkOut},${a.status},${a.totalHours}`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/today-status
// @desc    Get today's attendance status for all employees
// @access  Private (Manager)
router.get('/today-status', auth, isManager, async (req, res) => {
  try {
    const today = new Date();
    const { start, end } = getDayBounds(today);

    const attendance = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate('userId', 'name employeeId department');

    const present = attendance.filter(a => a.checkInTime).length;
    const absent = await User.countDocuments({ role: 'employee' }) - present;
    const late = attendance.filter(a => a.status === 'late').length;

    const absentEmployees = await User.find({ role: 'employee' }).then(users => {
      const presentUserIds = attendance.map(a => a.userId._id.toString());
      return users.filter(u => !presentUserIds.includes(u._id.toString()));
    });

    res.json({
      present,
      absent,
      late,
      attendance,
      absentEmployees: absentEmployees.map(u => ({
        id: u._id,
        name: u.name,
        employeeId: u.employeeId,
        department: u.department
      }))
    });
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

