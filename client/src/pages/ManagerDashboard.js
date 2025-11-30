import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../store/slices/authSlice';
import { getManagerDashboard } from '../services/dashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../components/Navbar';

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      dispatch(getMe());
    } else if (user.role !== 'manager') {
      navigate('/dashboard');
    }
  }, [user, dispatch, navigate]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getManagerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '24px' }}>Manager Dashboard</h1>

        {/* Overview Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Employees</h3>
            <div className="value">{dashboardData?.totalEmployees || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Today Present</h3>
            <div className="value" style={{ color: '#28a745' }}>{dashboardData?.todayAttendance?.present || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Today Absent</h3>
            <div className="value" style={{ color: '#dc3545' }}>{dashboardData?.todayAttendance?.absent || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Late Arrivals</h3>
            <div className="value" style={{ color: '#ffc107' }}>{dashboardData?.todayAttendance?.late || 0}</div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Weekly Trend */}
          {dashboardData?.weeklyTrend && (
            <div className="card">
              <h2 style={{ marginBottom: '16px' }}>Weekly Attendance Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#28a745" name="Present" />
                  <Bar dataKey="absent" fill="#dc3545" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Department Wise */}
          {dashboardData?.departmentWise && (
            <div className="card">
              <h2 style={{ marginBottom: '16px' }}>Department-wise Attendance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.departmentWise}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ department, present, total }) => `${department}: ${present}/${total}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="present"
                  >
                    {dashboardData.departmentWise.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Absent Employees Today */}
        {dashboardData?.absentEmployees && dashboardData.absentEmployees.length > 0 && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>Absent Employees Today</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.absentEmployees.map((emp) => (
                    <tr key={emp.id}>
                      <td>{emp.employeeId}</td>
                      <td>{emp.name}</td>
                      <td>{emp.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => navigate('/manager/attendance')} className="btn btn-primary">
              View All Attendance
            </button>
            <button onClick={() => navigate('/manager/reports')} className="btn btn-secondary">
              Generate Reports
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;

