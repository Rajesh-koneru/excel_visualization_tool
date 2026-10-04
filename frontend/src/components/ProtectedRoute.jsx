// protected rouute component 
import React from 'react';
import { Navigate } from 'react-router-dom';

const Protected = ({ isLoggedin, children,User }) => {
  console.log('user at protected route',User)
  console.log("is logging at ",isLoggedin)
  
  const storedUser=JSON.parse(localStorage.getItem('user'));
  console.log("stored user",storedUser)
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default Protected;
