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

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard stats
// @access  Private (Employee)
router.get('/employee', auth, async (req, res) => {
  try {
    const today = new Date();
    const { start: todayStart, end: todayEnd } = getDayBounds(today);
    
    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // Current month stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    const monthAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: monthStart, $lte: monthEnd }
    });

    const present = monthAttendance.filter(a => a.status === 'present').length;
    const late = monthAttendance.filter(a => a.status === 'late').length;
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const absent = daysInMonth - monthAttendance.length;
    const totalHours = monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);

    // Recent attendance (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo, $lte: todayEnd }
    }).sort({ date: -1 }).limit(7);

    res.json({
      todayStatus: {
        checkedIn: !!todayAttendance?.checkInTime,
        checkedOut: !!todayAttendance?.checkOutTime,
        attendance: todayAttendance
      },
      monthSummary: {
        present,
        absent,
        late,
        totalHours: Math.round(totalHours * 100) / 100
      },
      recentAttendance
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/manager
// @desc    Get manager dashboard stats
// @access  Private (Manager)
router.get('/manager', auth, isManager, async (req, res) => {
  try {
    const today = new Date();
    const { start: todayStart, end: todayEnd } = getDayBounds(today);

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd }
    }).populate('userId', 'name employeeId department');

    const todayPresent = todayAttendance.filter(a => a.checkInTime).length;
    const todayAbsent = totalEmployees - todayPresent;
    const todayLate = todayAttendance.filter(a => a.status === 'late').length;

    // Absent employees today
    const allEmployees = await User.find({ role: 'employee' });
    const presentUserIds = todayAttendance.map(a => a.userId._id.toString());
    const absentEmployees = allEmployees
      .filter(u => !presentUserIds.includes(u._id.toString()))
      .map(u => ({
        id: u._id,
        name: u.name,
        employeeId: u.employeeId,
        department: u.department
      }));

    // Weekly attendance trend (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyAttendance = await Attendance.find({
      date: { $gte: sevenDaysAgo, $lte: todayEnd }
    }).populate('userId', 'department');

    // Group by date
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const { start, end } = getDayBounds(date);
      
      const dayAttendance = weeklyAttendance.filter(a => {
        const attDate = new Date(a.date);
        return attDate >= start && attDate <= end;
      });
      
      weeklyTrend.push({
        date: date.toISOString().split('T')[0],
        present: dayAttendance.filter(a => a.checkInTime).length,
        absent: totalEmployees - dayAttendance.filter(a => a.checkInTime).length
      });
    }

    // Department-wise attendance
    const departmentStats = {};
    allEmployees.forEach(emp => {
      if (!departmentStats[emp.department]) {
        departmentStats[emp.department] = { total: 0, present: 0 };
      }
      departmentStats[emp.department].total++;
    });

    todayAttendance.forEach(att => {
      if (att.userId && att.checkInTime) {
        const dept = att.userId.department;
        if (departmentStats[dept]) {
          departmentStats[dept].present++;
        }
      }
    });

    const departmentWise = Object.entries(departmentStats).map(([dept, stats]) => ({
      department: dept,
      total: stats.total,
      present: stats.present,
      absent: stats.total - stats.present
    }));

    res.json({
      totalEmployees,
      todayAttendance: {
        present: todayPresent,
        absent: todayAbsent,
        late: todayLate
      },
      absentEmployees,
      weeklyTrend,
      departmentWise
    });
  } catch (error) {
    console.error('Get manager dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

