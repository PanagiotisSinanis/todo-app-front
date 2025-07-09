
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GuestRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('apiToken');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (token) {
      
      if (userRole === 'superadmin') {
        navigate('/superadmin/dashboard', { replace: true });
      } else if (userRole === 'user') {
        navigate('/user/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [token, userRole, navigate]); 

  if (token) return null; 

  return children;
};

export default GuestRoute;
