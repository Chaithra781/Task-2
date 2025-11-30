const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Create manager
    const manager = new User({
      name: 'John Manager',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Management'
    });
    await manager.save();
    console.log('Created manager:', manager.email);

    // Create employees
    const employees = [
      {
        name: 'Alice Smith',
        email: 'alice@company.com',
        password: 'employee123',
        employeeId: 'EMP001',
        department: 'Engineering'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@company.com',
        password: 'employee123',
        employeeId: 'EMP002',
        department: 'Engineering'
      },
      {
        name: 'Carol Williams',
        email: 'carol@company.com',
        password: 'employee123',
        employeeId: 'EMP003',
        department: 'Sales'
      },
      {
        name: 'David Brown',
        email: 'david@company.com',
        password: 'employee123',
        employeeId: 'EMP004',
        department: 'Sales'
      },
      {
        name: 'Eva Davis',
        email: 'eva@company.com',
        password: 'employee123',
        employeeId: 'EMP005',
        department: 'HR'
      }
    ];

    const createdEmployees = [];
    for (const emp of employees) {
      const user = new User(emp);
      await user.save();
      createdEmployees.push(user);
      console.log('Created employee:', user.email);
    }

    // Create sample attendance data for the last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends (optional - you can remove this if you want weekend data)
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const employee of createdEmployees) {
        // Randomly create attendance (80% chance)
        if (Math.random() > 0.2) {
          const checkIn = new Date(date);
          checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
          
          // Determine status
          let status = 'present';
          if (checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 0)) {
            status = 'late';
          }

          const checkOut = new Date(checkIn);
          checkOut.setHours(checkIn.getHours() + 8 + Math.floor(Math.random() * 2));

          const attendance = new Attendance({
            userId: employee._id,
            date: date,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            status: status
          });

          await attendance.save();
        }
      }
    }

    console.log('Created sample attendance data');
    console.log('\nSeed data created successfully!');
    console.log('\nLogin credentials:');
    console.log('Manager - Email: manager@company.com, Password: manager123');
    console.log('Employee - Email: alice@company.com, Password: employee123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

