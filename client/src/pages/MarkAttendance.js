import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodayStatus, checkIn, checkOut } from '../store/slices/attendanceSlice';
import Navbar from '../components/Navbar';

const MarkAttendance = () => {
  const dispatch = useDispatch();
  const { todayStatus } = useSelector((state) => state.attendance);
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    dispatch(getTodayStatus());
  }, [dispatch]);

  const handleCheckIn = async () => {
    try {
      const result = await dispatch(checkIn());
      if (result.type.endsWith('/fulfilled')) {
        setMessage('Checked in successfully!');
        setTimeout(() => setMessage(''), 3000);
        dispatch(getTodayStatus());
      } else {
        setMessage(result.payload || 'Check-in failed');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Check-in failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCheckOut = async () => {
    try {
      const result = await dispatch(checkOut());
      if (result.type.endsWith('/fulfilled')) {
        setMessage('Checked out successfully!');
        setTimeout(() => setMessage(''), 3000);
        dispatch(getTodayStatus());
      } else {
        setMessage(result.payload || 'Check-out failed');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Check-out failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '600px', marginTop: '50px' }}>
        <div className="card">
          <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Mark Attendance</h2>
          
          {message && (
            <div className={message.includes('success') ? 'success-message' : 'error-message'} style={{ marginBottom: '20px', textAlign: 'center' }}>
              {message}
            </div>
          )}

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
              <strong>Today:</strong> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {todayStatus?.checkedIn ? (
            <div>
              {todayStatus.attendance?.checkInTime && (
                <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                  <p><strong>Check In Time:</strong> {new Date(todayStatus.attendance.checkInTime).toLocaleString()}</p>
                </div>
              )}
              
              {todayStatus.checkedOut ? (
                <div>
                  {todayStatus.attendance?.checkOutTime && (
                    <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <p><strong>Check Out Time:</strong> {new Date(todayStatus.attendance.checkOutTime).toLocaleString()}</p>
                      {todayStatus.attendance?.totalHours && (
                        <p><strong>Total Hours:</strong> {todayStatus.attendance.totalHours.toFixed(2)} hours</p>
                      )}
                    </div>
                  )}
                  <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                    Already Checked Out
                  </button>
                </div>
              ) : (
                <button onClick={handleCheckOut} className="btn btn-danger" style={{ width: '100%' }}>
                  Check Out
                </button>
              )}
            </div>
          ) : (
            <button onClick={handleCheckIn} className="btn btn-success" style={{ width: '100%', fontSize: '18px', padding: '16px' }}>
              Check In
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MarkAttendance;

