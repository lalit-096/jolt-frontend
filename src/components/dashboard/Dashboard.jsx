// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCSVFiles } from '../../services/scholarService';
import { getJSONFiles } from '../../services/pdfService';
import Loader from '../common/Loader';
import ErrorAlert from '../common/ErrorAlert';

const Dashboard = () => {
  const [csvFiles, setCsvFiles] = useState([]);
  const [jsonFiles, setJsonFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [csvResponse, jsonResponse] = await Promise.all([
          getCSVFiles(),
          getJSONFiles()
        ]);
        
        setCsvFiles(csvResponse);
        setJsonFiles(jsonResponse);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFiles();
  }, []);
  
  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }
  
  if (error) {
    return <ErrorAlert message={error} />;
  }
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Google Scholar Scraper</h1>
        <p className="lead">
          Search Google Scholar, extract PDF metadata, and analyze research papers
        </p>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Search Google Scholar</h2>
              <p className="card-text">
                Search for academic papers on Google Scholar with advanced options
              </p>
              <Link to="/search" className="btn btn-primary">
                New Search
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Extract PDF Metadata</h2>
              <p className="card-text">
                Extract metadata from PDF files found in your search results
              </p>
              <Link to="/pdf-extract" className="btn btn-primary">
                Extract Metadata
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-4">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">PDF Library</h2>
              <p className="card-text">
                View and manage PDFs. Load PDFs from JSON files or browse existing PDFs.
              </p>
              <Link to="/pdf-list" className="btn btn-primary">
                <i className="bi bi-file-pdf me-2" />
                View PDF Library
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-2">
        <div className="col-md-6 mb-4">
          <div className="card">
            <h5 className="card-header">Recent Search Results</h5>
            <div className="card-body">
              {csvFiles.length > 0 ? (
                <ul className="list-group">
                  {csvFiles.slice(0, 5).map((file, index) => (
                    <li key={index} className="list-group-item">
                      <Link to="/results" state={{ filename: file }}>
                        {file}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No search results found. Try running a search first.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-4">
          <div className="card">
            <h5 className="card-header">Recent PDF Metadata</h5>
            <div className="card-body">
              {jsonFiles.length > 0 ? (
                <>
                  <ul className="list-group mb-3">
                    {jsonFiles.slice(0, 5).map((file, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <Link to="/pdf-results" state={{ filename: file }}>
                          {file}
                        </Link>
                        <Link 
                          to="/pdf-list" 
                          state={{ jsonFilename: file, autoLoad: true }}
                          className="btn btn-sm btn-outline-primary"
                          title="Load PDFs from this JSON file"
                        >
                          <i className="bi bi-upload me-1" />
                          Load PDFs
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to="/pdf-list" className="btn btn-primary w-100">
                    <i className="bi bi-file-pdf me-2" />
                    Go to PDF Library
                  </Link>
                </>
              ) : (
                <>
                  <p>No PDF metadata found. Try extracting metadata first.</p>
                  <Link to="/pdf-list" className="btn btn-primary w-100">
                    <i className="bi bi-file-pdf me-2" />
                    Go to PDF Library
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body">
              <h3>Quick Guide</h3>
              <ol>
                <li><strong>Search Google Scholar</strong> - Enter your query and get a list of papers</li>
                <li><strong>View Results</strong> - See all papers found in your search</li>
                <li><strong>Extract PDF Metadata</strong> - Process PDFs found in search results</li>
                <li><strong>Load PDFs from JSON</strong> - Fetch PDFs from existing JSON metadata files</li>
                <li><strong>PDF Library</strong> - View, filter, and download PDFs from your collection</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;