// src/components/search/SearchResults.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ResultItem from './ResultItem';
import { getCSVDetails } from '../../services/scholarService';
import ErrorAlert from '../common/ErrorAlert';
import Loader from '../common/Loader';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get results from location state or fetch from API
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // If results passed through navigation
        if (location.state?.results) {
          setResults(location.state.results.papers || []);
          setQuery(location.state.query || '');
          setFilename(location.state.filename || '');
          setLoading(false);
          return;
        }
        
        // If only filename passed, fetch details from API
        if (location.state?.filename) {
          const csvDetails = await getCSVDetails(location.state.filename);
          setResults(csvDetails.papers || []);
          setQuery(csvDetails.query || '');
          setFilename(location.state.filename);
        } else {
          // No results found, redirect to search
          navigate('/search');
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('Failed to load search results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [location, navigate]);
  
  const handleExtractMetadata = () => {
    navigate('/pdf-extract', { 
      state: { csvFilename: filename }
    });
  };

  if (loading) {
    return <Loader message="Loading search results..." />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!results || results.length === 0) {
    return (
      <div className="no-results">
        <h3>No results found</h3>
        <p>Try a different search query or check your connection.</p>
        <button 
          className="btn btn-primary" 
          onClick={() => navigate('/search')}
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="results-header">
        <h2>Search Results for: "{query}"</h2>
        <p>Found {results.length} results in {filename}</p>
      </div>

      <div className="results-list">
        {results.map((item, index) => (
          <ResultItem key={index} item={item} />
        ))}
      </div>

      <div className="export-options">
        <button 
          className="btn btn-primary"
          onClick={handleExtractMetadata}
        >
          Extract PDF Metadata
        </button>
      </div>
    </div>
  );
};

export default SearchResults;