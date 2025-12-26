// src/components/common/ErrorAlert.jsx
import React from 'react';

const ErrorAlert = ({ message }) => {
  return (
    <div className="alert alert-danger" role="alert">
      <strong>Error:</strong> {message}
    </div>
  );
};

export default ErrorAlert;