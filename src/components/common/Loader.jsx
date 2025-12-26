// src/components/common/Loader.jsx
import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-container text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">{message}</p>
    </div>
  );
};

export default Loader;