import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ Component, allowedRoles }) => {
  const token = localStorage.getItem('apiToken');
  const role = localStorage.getItem('userRole');

  if (!token || (allowedRoles && !allowedRoles.includes(role))) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
};

export default PrivateRoute;
