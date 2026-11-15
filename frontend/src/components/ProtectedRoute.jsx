import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const getDashboardPath = (role) => {
  switch (role) {
    case 'student':
      return '/student-dashboard';
    case 'resolver':
      return '/resolver-dashboard';
    case 'hod':
      return '/hod-dashboard';
    case 'higher_authority':
      return '/higher-authority-dashboard';
    case 'admin':
    default:
      return '/admin-dashboard';
  }
};

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
