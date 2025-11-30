import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children, role }) => {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/dashboard'} />;
  }

  return children;
};

export default PrivateRoute;

