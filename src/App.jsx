// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Header from './components/common/Header';
// import Footer from './components/common/Footer';
// import Dashboard from './components/dashboard/Dashboard';
import SearchForm from './components/search/SearchForm';
import SearchResults from './components/search/SearchResults';
import PDFUploader from './components/pdf/PDFUploader';
import PDFMetadataViewer from './components/pdf/PDFMetadataViewer';
import { AppProvider } from './context/AppContext';
// import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          {/* <Header /> */}
          
          <main className="main-content">
            <Routes>
              {/* <Route path="/" element={<Dashboard />} /> */}
              <Route path="/search" element={<SearchForm />} />
              <Route path="/results" element={<SearchResults />} />
              <Route path="/pdf-upload" element={<PDFUploader />} />
              <Route path="/pdf-results" element={<PDFMetadataViewer />} />
            </Routes>
          </main>
          
          {/* <Footer /> */}
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;