// src/components/common/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="app-footer bg-light py-3 mt-auto">
      <div className="container text-center">
        <p className="mb-0">
          &copy; {new Date().getFullYear()} Google Scholar Scraper
        </p>
        <p className="small text-muted mb-0">
          For educational and research purposes only
        </p>
      </div>
    </footer>
  );
};

export default Footer;