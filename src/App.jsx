// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Dashboard from './components/dashboard/Dashboard';
import SearchForm from './components/search/SearchForm';
import SearchResults from './components/search/SearchResults';
import PDFExtractor from './components/pdf/PDFExtractor';
import PDFResults from './components/pdf/PDFResults';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content container py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<SearchForm />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/pdf-extract" element={<PDFExtractor />} />
            <Route path="/pdf-results" element={<PDFResults />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;