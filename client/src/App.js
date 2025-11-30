import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceHistory from './pages/AttendanceHistory';
import AllEmployeesAttendance from './pages/AllEmployeesAttendance';
import Reports from './pages/Reports';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [token, user, dispatch]);

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/dashboard'} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/dashboard'} />} />
        
        <Route path="/dashboard" element={<PrivateRoute><EmployeeDashboard /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute><MarkAttendance /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><AttendanceHistory /></PrivateRoute>} />
        
        <Route path="/manager/dashboard" element={<PrivateRoute role="manager"><ManagerDashboard /></PrivateRoute>} />
        <Route path="/manager/attendance" element={<PrivateRoute role="manager"><AllEmployeesAttendance /></PrivateRoute>} />
        <Route path="/manager/reports" element={<PrivateRoute role="manager"><Reports /></PrivateRoute>} />
        
        <Route path="/" element={<Navigate to={user ? (user.role === 'manager' ? '/manager/dashboard' : '/dashboard') : '/login'} />} />
      </Routes>
    </div>
  );
}

export default App;

