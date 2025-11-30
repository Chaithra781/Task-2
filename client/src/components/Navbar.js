import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">Employee Attendance System</div>
        <div className="navbar-links">
          {user && (
            <>
              {user.role === 'manager' ? (
                <>
                  <Link to="/manager/dashboard">Dashboard</Link>
                  <Link to="/manager/attendance">All Attendance</Link>
                  <Link to="/manager/reports">Reports</Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/attendance">Mark Attendance</Link>
                  <Link to="/history">History</Link>
                </>
              )}
              <span style={{ marginLeft: '10px' }}>{user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

