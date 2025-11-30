import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../store/slices/authSlice';
import { checkIn, checkOut, getTodayStatus } from '../store/slices/attendanceSlice';
import { getEmployeeDashboard } from '../services/dashboardService';
import Navbar from '../components/Navbar';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { todayStatus } = useSelector((state) => state.attendance);
  const [dashboardData, setDashboardData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (!user) {
      dispatch(getMe());
    } else if (user.role === 'manager') {
      navigate('/manager/dashboard');
    }
  }, [user, dispatch, navigate]);

  useEffect(() => {
    loadDashboard();
    dispatch(getTodayStatus());
  }, [dispatch]);

  const loadDashboard = async () => {
    try {
      const data = await getEmployeeDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    await dispatch(checkIn());
    await dispatch(getTodayStatus());
    loadDashboard();
  };

  const handleCheckOut = async () => {
    await dispatch(checkOut());
    await dispatch(getTodayStatus());
    loadDashboard();
  };

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
        <h1 style={{ marginBottom: '24px' }}>Dashboard</h1>

        {/* Today's Status */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Today's Status</h2>
          <div style={{ marginBottom: '20px' }}>
            {todayStatus?.checkedIn ? (
              <div>
                <p><strong>Status:</strong> Checked In</p>
                {todayStatus.attendance?.checkInTime && (
                  <p><strong>Check In Time:</strong> {new Date(todayStatus.attendance.checkInTime).toLocaleString()}</p>
                )}
                {!todayStatus.checkedOut && (
                  <button onClick={handleCheckOut} className="btn btn-danger" style={{ marginTop: '16px' }}>
                    Check Out
                  </button>
                )}
                {todayStatus.checkedOut && todayStatus.attendance?.checkOutTime && (
                  <p><strong>Check Out Time:</strong> {new Date(todayStatus.attendance.checkOutTime).toLocaleString()}</p>
                )}
              </div>
            ) : (
              <div>
                <p><strong>Status:</strong> Not Checked In</p>
                <button onClick={handleCheckIn} className="btn btn-success" style={{ marginTop: '16px' }}>
                  Check In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Summary */}
        {dashboardData?.monthSummary && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>This Month Summary</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Present</h3>
                <div className="value" style={{ color: '#28a745' }}>{dashboardData.monthSummary.present}</div>
              </div>
              <div className="stat-card">
                <h3>Absent</h3>
                <div className="value" style={{ color: '#dc3545' }}>{dashboardData.monthSummary.absent}</div>
              </div>
              <div className="stat-card">
                <h3>Late</h3>
                <div className="value" style={{ color: '#ffc107' }}>{dashboardData.monthSummary.late}</div>
              </div>
              <div className="stat-card">
                <h3>Total Hours</h3>
                <div className="value">{dashboardData.monthSummary.totalHours.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Attendance */}
        {dashboardData?.recentAttendance && dashboardData.recentAttendance.length > 0 && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>Recent Attendance (Last 7 Days)</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentAttendance.map((att) => (
                    <tr key={att._id}>
                      <td>{new Date(att.date).toLocaleDateString()}</td>
                      <td>{att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString() : '-'}</td>
                      <td>{att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString() : '-'}</td>
                      <td><span className={`badge badge-${att.status}`}>{att.status}</span></td>
                      <td>{att.totalHours ? att.totalHours.toFixed(2) : '-'}</td>
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
            <button onClick={() => navigate('/attendance')} className="btn btn-primary">
              Mark Attendance
            </button>
            <button onClick={() => navigate('/history')} className="btn btn-secondary">
              View History
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;

