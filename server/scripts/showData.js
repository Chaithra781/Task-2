const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
require('dotenv').config();

const showData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system');

    console.log('\n=== MONGODB DATA ===\n');

    // Get all users
    const users = await User.find({}).select('-password');
    console.log('📊 USERS (' + users.length + ' total):');
    console.log('─'.repeat(80));
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Employee ID: ${user.employeeId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log('');
    });

    // Get attendance statistics
    const totalAttendance = await Attendance.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });

    console.log('📈 ATTENDANCE STATISTICS:');
    console.log('─'.repeat(80));
    console.log(`Total Attendance Records: ${totalAttendance}`);
    console.log(`Today's Attendance Records: ${todayAttendance}`);
    console.log('');

    // Get recent attendance (last 10 records)
    const recentAttendance = await Attendance.find({})
      .sort({ date: -1 })
      .limit(10)
      .populate('userId', 'name employeeId department');

    console.log('📅 RECENT ATTENDANCE (Last 10 records):');
    console.log('─'.repeat(80));
    recentAttendance.forEach((att, index) => {
      console.log(`${index + 1}. ${att.userId.name} (${att.userId.employeeId})`);
      console.log(`   Date: ${new Date(att.date).toLocaleDateString()}`);
      console.log(`   Status: ${att.status}`);
      if (att.checkInTime) {
        console.log(`   Check In: ${new Date(att.checkInTime).toLocaleString()}`);
      }
      if (att.checkOutTime) {
        console.log(`   Check Out: ${new Date(att.checkOutTime).toLocaleString()}`);
      }
      if (att.totalHours) {
        console.log(`   Total Hours: ${att.totalHours.toFixed(2)}`);
      }
      console.log('');
    });

    // Get attendance by status
    const statusCounts = await Attendance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 ATTENDANCE BY STATUS:');
    console.log('─'.repeat(80));
    statusCounts.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} records`);
    });
    console.log('');

    // Get attendance by department
    const deptAttendance = await Attendance.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user.department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('🏢 ATTENDANCE BY DEPARTMENT:');
    console.log('─'.repeat(80));
    deptAttendance.forEach(dept => {
      console.log(`${dept._id}: ${dept.count} records`);
    });
    console.log('');

    // Get monthly summary
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const monthlyAttendance = await Attendance.find({
      date: { $gte: currentMonth, $lt: nextMonth }
    });

    const monthlyStats = {
      present: monthlyAttendance.filter(a => a.status === 'present').length,
      late: monthlyAttendance.filter(a => a.status === 'late').length,
      'half-day': monthlyAttendance.filter(a => a.status === 'half-day').length,
      totalHours: monthlyAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    console.log('📅 CURRENT MONTH SUMMARY:');
    console.log('─'.repeat(80));
    console.log(`Present: ${monthlyStats.present}`);
    console.log(`Late: ${monthlyStats.late}`);
    console.log(`Half Day: ${monthlyStats['half-day']}`);
    console.log(`Total Hours: ${monthlyStats.totalHours.toFixed(2)}`);
    console.log('');

    console.log('✅ Data display complete!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error displaying data:', error);
    process.exit(1);
  }
};

showData();

