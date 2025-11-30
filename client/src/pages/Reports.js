import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { exportAttendance } from '../store/slices/attendanceSlice';
import Navbar from '../components/Navbar';

const Reports = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await dispatch(exportAttendance(filters));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '24px' }}>Reports</h1>

        <div className="card">
          <h2 style={{ marginBottom: '16px' }}>Generate Attendance Report</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Employee ID (Optional)</label>
              <input
                type="text"
                name="employeeId"
                value={filters.employeeId}
                onChange={handleFilterChange}
                placeholder="Leave empty for all employees"
              />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="btn btn-primary"
            disabled={loading || !filters.startDate || !filters.endDate}
          >
            {loading ? 'Exporting...' : 'Export to CSV'}
          </button>

          <p style={{ marginTop: '16px', color: '#666' }}>
            Select a date range and optionally filter by employee ID. The report will be downloaded as a CSV file.
          </p>
        </div>
      </div>
    </>
  );
};

export default Reports;

