Name : Chaithra B V
College : Adichunchanagiri Institute of Technology, Chikkmagaluru
Contact Number : 7676365421

# Employee Attendance System

A full-stack employee attendance tracking system built with React, Redux Toolkit, Node.js, Express, and MongoDB.

## Features

### Employee Features
- Register/Login
- Mark attendance (Check In / Check Out)
- View attendance history (calendar or table format)
- View monthly summary (showing Present/Absent/Late days)
- Dashboard with personal attendance statistics

### Manager Features
- Login
- View all employees' attendance
- Filter attendance by employee, date, and status
- View team attendance summary
- Export attendance reports (CSV format)
- Dashboard with team statistics and charts

## Tech Stack

- **Frontend:** React + Redux Toolkit
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Task 2"
```

### 2. Install Dependencies

Install root dependencies:
```bash
npm install
```

Install server dependencies:
```bash
cd server
npm install
```

Install client dependencies:
```bash
cd ../client
npm install
```

Or use the convenience script:
```bash
npm run install-all
```

### 3. Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

**Note:** Change the `JWT_SECRET` to a secure random string in production.

### 4. Seed the Database

Run the seed script to create sample users and attendance data:

```bash
cd server
npm run seed
```

This will create:
- 1 manager account (manager@company.com / manager123)
- 5 employee accounts (alice@company.com / employee123, etc.)
- Sample attendance data for the last 30 days

### 5. Run the Application

#### Option 1: Run both server and client together (recommended)

From the root directory:
```bash
npm run dev
```

#### Option 2: Run separately

Terminal 1 - Start the server:
```bash
cd server
npm run dev
```

Terminal 2 - Start the client:
```bash
cd client
npm start
```

The server will run on `http://localhost:5000`
The client will run on `http://localhost:3000`

## Default Login Credentials

After running the seed script, you can use these credentials:

**Manager:**
- Email: `manager@company.com`
- Password: `manager123`

**Employee:**
- Email: `alice@company.com`
- Password: `employee123`

(Other employees: bob@company.com, carol@company.com, david@company.com, eva@company.com - all with password `employee123`)

## API Endpoints

### Auth Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Attendance Endpoints (Employee)
- `POST /api/attendance/checkin` - Check in for the day
- `POST /api/attendance/checkout` - Check out for the day
- `GET /api/attendance/my-history` - Get attendance history
- `GET /api/attendance/my-summary` - Get monthly summary
- `GET /api/attendance/today` - Get today's status

### Attendance Endpoints (Manager)
- `GET /api/attendance/all` - Get all employees' attendance
- `GET /api/attendance/employee/:id` - Get specific employee's attendance
- `GET /api/attendance/summary` - Get team summary
- `GET /api/attendance/export` - Export attendance to CSV
- `GET /api/attendance/today-status` - Get today's attendance status

### Dashboard Endpoints
- `GET /api/dashboard/employee` - Get employee dashboard stats
- `GET /api/dashboard/manager` - Get manager dashboard stats

## Project Structure

```
Task 2/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── scripts/
│   │   └── seed.js
│   ├── index.js
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   │   └── slices/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Database Schema

### Users Collection
- `id` - ObjectId
- `name` - String
- `email` - String (unique)
- `password` - String (hashed)
- `role` - String (employee/manager)
- `employeeId` - String (unique, e.g., EMP001)
- `department` - String
- `createdAt` - Date
- `updatedAt` - Date

### Attendance Collection
- `id` - ObjectId
- `userId` - ObjectId (reference to User)
- `date` - Date
- `checkInTime` - Date
- `checkOutTime` - Date
- `status` - String (present/absent/late/half-day)
- `totalHours` - Number
- `createdAt` - Date
- `updatedAt` - Date

## Screenshots

The application includes:
- Modern, responsive UI
- Calendar view for attendance history
- Interactive dashboards with charts
- Real-time attendance tracking
- CSV export functionality

## Development

### Running in Development Mode

The server uses `nodemon` for auto-reloading, and the client uses React's development server with hot reloading.

### Building for Production

Build the client:
```bash
cd client
npm run build
```

The production build will be in the `client/build` directory.

## Troubleshooting

1. **MongoDB Connection Error**: Make sure MongoDB is running and the connection string in `.env` is correct.

2. **Port Already in Use**: Change the PORT in `.env` or stop the process using the port.

3. **CORS Errors**: Ensure the server is running and the API URL in the client matches the server URL.

4. **Authentication Issues**: Clear localStorage and try logging in again.

## License

This project is open source and available under the MIT License.

## Author

Built as part of Task 2 - Employee Attendance System

