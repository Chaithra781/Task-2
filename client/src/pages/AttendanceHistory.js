import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary } from '../store/slices/attendanceSlice';
import Navbar from '../components/Navbar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';

const AttendanceHistory = () => {
  const dispatch = useDispatch();
  const { history, summary } = useSelector((state) => state.attendance);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'

  useEffect(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    dispatch(getMyHistory({ month, year }));
    dispatch(getMySummary({ month, year }));
  }, [dispatch, currentDate]);

  const getStatusForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = history.find(att => {
      const attDate = format(new Date(att.date), 'yyyy-MM-dd');
      return attDate === dateStr;
    });
    return attendance?.status || null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getAttendanceForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return history.find(att => {
      const attDate = format(new Date(att.date), 'yyyy-MM-dd');
      return attDate === dateStr;
    });
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add days from previous month to fill first week
  const firstDayOfWeek = monthStart.getDay();
  const daysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const previousMonthDays = [];
  for (let i = daysToAdd - 1; i >= 0; i--) {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - i - 1);
    previousMonthDays.push(date);
  }

  const allDays = [...previousMonthDays, ...daysInMonth];
  
  // Add days from next month to fill last week
  const remainingDays = 42 - allDays.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i);
    allDays.push(date);
  }

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '24px' }}>Attendance History</h1>

        {/* Summary */}
        {summary && (
          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>Monthly Summary</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Present</h3>
                <div className="value" style={{ color: '#28a745' }}>{summary.present}</div>
              </div>
              <div className="stat-card">
                <h3>Absent</h3>
                <div className="value" style={{ color: '#dc3545' }}>{summary.absent}</div>
              </div>
              <div className="stat-card">
                <h3>Late</h3>
                <div className="value" style={{ color: '#ffc107' }}>{summary.late}</div>
              </div>
              <div className="stat-card">
                <h3>Total Hours</h3>
                <div className="value">{summary.totalHours.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Calendar View</h2>
            <div>
              <button
                onClick={() => setViewMode('calendar')}
                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ marginRight: '10px' }}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Table
              </button>
            </div>
          </div>

          {viewMode === 'calendar' ? (
            <>
              {/* Month Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button onClick={() => changeMonth(-1)} className="btn btn-secondary">Previous</button>
                <h3>{format(currentDate, 'MMMM yyyy')}</h3>
                <button onClick={() => changeMonth(1)} className="btn btn-secondary">Next</button>
              </div>

              {/* Calendar */}
              <div className="calendar-header">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="calendar-header-day">{day}</div>
                ))}
              </div>
              <div className="calendar">
                {allDays.map((day, idx) => {
                  const status = getStatusForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);
                  
                  return (
                    <div
                      key={idx}
                      className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isTodayDate ? 'today' : ''} ${status || ''}`}
                      onClick={() => handleDateClick(day)}
                      style={{ cursor: 'pointer' }}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#d4edda', border: '1px solid #ddd', borderRadius: '4px' }}></div>
                  <span>Present</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#f8d7da', border: '1px solid #ddd', borderRadius: '4px' }}></div>
                  <span>Absent</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#fff3cd', border: '1px solid #ddd', borderRadius: '4px' }}></div>
                  <span>Late</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#ffeaa7', border: '1px solid #ddd', borderRadius: '4px' }}></div>
                  <span>Half Day</span>
                </div>
              </div>

              {/* Selected Date Details */}
              {selectedDate && (
                <div className="card" style={{ marginTop: '20px' }}>
                  <h3>Details for {format(selectedDate, 'MMMM d, yyyy')}</h3>
                  {(() => {
                    const attendance = getAttendanceForDate(selectedDate);
                    if (attendance) {
                      return (
                        <div>
                          <p><strong>Status:</strong> <span className={`badge badge-${attendance.status}`}>{attendance.status}</span></p>
                          {attendance.checkInTime && (
                            <p><strong>Check In:</strong> {new Date(attendance.checkInTime).toLocaleString()}</p>
                          )}
                          {attendance.checkOutTime && (
                            <p><strong>Check Out:</strong> {new Date(attendance.checkOutTime).toLocaleString()}</p>
                          )}
                          {attendance.totalHours && (
                            <p><strong>Total Hours:</strong> {attendance.totalHours.toFixed(2)}</p>
                          )}
                        </div>
                      );
                    } else {
                      return <p>No attendance record for this date.</p>;
                    }
                  })()}
                </div>
              )}
            </>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((att) => (
                      <tr key={att._id}>
                        <td>{new Date(att.date).toLocaleDateString()}</td>
                        <td>{att.checkInTime ? new Date(att.checkInTime).toLocaleString() : '-'}</td>
                        <td>{att.checkOutTime ? new Date(att.checkOutTime).toLocaleString() : '-'}</td>
                        <td><span className={`badge badge-${att.status}`}>{att.status}</span></td>
                        <td>{att.totalHours ? att.totalHours.toFixed(2) : '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>No attendance records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AttendanceHistory;

