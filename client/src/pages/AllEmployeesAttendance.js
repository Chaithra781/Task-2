import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../store/slices/attendanceSlice';
import Navbar from '../components/Navbar';

const AllEmployeesAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    employeeId: '',
    date: '',
    status: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    dispatch(getAllAttendance(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (e) => {
    const newFilters = { ...filters, [e.target.name]: e.target.value };
    setFilters(newFilters);
    dispatch(getAllAttendance(newFilters));
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '24px' }}>All Employees Attendance</h1>

        {/* Filters */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Filters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                placeholder="e.g., EMP001"
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>
            <div className="form-group">
              <label>Month</label>
              <input
                type="number"
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                min="1"
                max="12"
              />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                min="2020"
                max="2030"
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Attendance Records</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {allAttendance.length > 0 ? (
                  allAttendance.map((att) => (
                    <tr key={att._id}>
                      <td>{new Date(att.date).toLocaleDateString()}</td>
                      <td>{att.userId?.employeeId || '-'}</td>
                      <td>{att.userId?.name || '-'}</td>
                      <td>{att.userId?.department || '-'}</td>
                      <td>{att.checkInTime ? new Date(att.checkInTime).toLocaleString() : '-'}</td>
                      <td>{att.checkOutTime ? new Date(att.checkOutTime).toLocaleString() : '-'}</td>
                      <td><span className={`badge badge-${att.status}`}>{att.status}</span></td>
                      <td>{att.totalHours ? att.totalHours.toFixed(2) : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center' }}>No attendance records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllEmployeesAttendance;

