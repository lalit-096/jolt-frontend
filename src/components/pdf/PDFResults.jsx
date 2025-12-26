// src/components/pdf/PDFResults.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getJSONDetails } from '../../services/pdfService';
import Loader from '../common/Loader';
import ErrorAlert from '../common/ErrorAlert';

const PDFResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState([]);
  const [summary, setSummary] = useState({});
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadMetadata = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // If metadata passed through navigation
        if (location.state?.metadata) {
          setMetadata(location.state.metadata);
          setFilename(location.state.filename || '');
          
          // Generate summary for years
          generateSummary(location.state.metadata);
          setLoading(false);
          return;
        }
        
        // If only filename passed, fetch details from API
        if (location.state?.filename) {
          const jsonDetails = await getJSONDetails(location.state.filename);
          setMetadata(jsonDetails.metadata || []);
          setSummary(jsonDetails.summary_by_year || {});
          setFilename(location.state.filename);
        } else {
          // No results found, redirect
          navigate('/pdf-extract');
        }
      } catch (err) {
        console.error('Error loading PDF metadata:', err);
        setError('Failed to load PDF metadata results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadMetadata();
  }, [location, navigate]);
  
  // Generate summary statistics from metadata
  const generateSummary = (metadataArray) => {
    const yearSummary = {};
    
    metadataArray.forEach(item => {
      const year = item.year_publication || item.year_creation || 'Unknown';
      
      if (!yearSummary[year]) {
        yearSummary[year] = 0;
      }
      
      yearSummary[year]++;
    });
    
    setSummary(yearSummary);
  };
  
  // Group metadata by publication year
  const getGroupedMetadata = () => {
    const grouped = {};
    
    metadata.forEach(item => {
      const year = item.year_publication || item.year_creation || 'Unknown';
      
      if (!grouped[year]) {
        grouped[year] = [];
      }
      
      grouped[year].push(item);
    });
    
    return grouped;
  };
  
  if (loading) {
    return <Loader message="Loading PDF metadata results..." />;
  }
  
  if (error) {
    return <ErrorAlert message={error} />;
  }
  
  if (!metadata || metadata.length === 0) {
    return (
      <div className="no-results">
        <h3>No PDF metadata found</h3>
        <p>No metadata could be extracted from the provided PDFs.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/pdf-extract')}
        >
          Back to PDF Extractor
        </button>
      </div>
    );
  }
  
  // Group metadata by year
  const groupedMetadata = getGroupedMetadata();
  // Get years sorted in descending order
  const sortedYears = Object.keys(groupedMetadata).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return b - a;
  });
  
  return (
    <div className="pdf-results-container">
      <h2>PDF Metadata Results</h2>
      
      <div className="results-summary">
        <p>
          Found metadata for <strong>{metadata.length}</strong> PDFs
          {filename && <> in <strong>{filename}</strong></>}
        </p>
        
        <div className="year-distribution">
          <h4>Distribution by Year</h4>
          <div className="year-charts">
            {Object.entries(summary).map(([year, count]) => (
              <div key={year} className="year-bar">
                <span className="year-label">{year}</span>
                <div 
                  className="year-value" 
                  style={{ width: `${Math.min(100, count * 5)}%` }}
                >
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="metadata-by-year">
        {sortedYears.map(year => (
          <div key={year} className="year-section">
            <h3>{year} ({groupedMetadata[year].length} papers)</h3>
            <div className="papers-list">
              {groupedMetadata[year].map((paper, index) => (
                <div key={index} className="paper-card">
                  <h4>{paper.title || 'Untitled PDF'}</h4>
                  
                  <div className="paper-details">
                    {paper.author && (
                      <p><strong>Author:</strong> {paper.author}</p>
                    )}
                    
                    <p>
                      <strong>Filename:</strong> {paper.filename || 'Unknown'}
                    </p>
                    
                    {paper.size_mb && (
                      <p><strong>Size:</strong> {paper.size_mb} MB</p>
                    )}
                    
                    {paper.url && (
                      <p>
                        <strong>URL:</strong>{' '}
                        <a href={paper.url} target="_blank" rel="noopener noreferrer">
                          {paper.url.length > 50 ? 
                           `${paper.url.substring(0, 50)}...` : 
                           paper.url}
                        </a>
                      </p>
                    )}
                    
                    {paper.error && (
                      <p className="text-danger">
                        <strong>Error:</strong> {paper.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="result-actions">
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/pdf-extract')}
        >
          Extract More PDFs
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PDFResults;