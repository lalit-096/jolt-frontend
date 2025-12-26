// src/components/search/SearchForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [maxPages, setMaxPages] = useState('');
  const [useThreading, setUseThreading] = useState(true);
  const [maxThreads, setMaxThreads] = useState(3);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    try {
      await onSearch({
        query, 
        maxPages: maxPages || 'auto', 
        useThreading,
        maxThreads: parseInt(maxThreads, 10)
      });
      navigate('/results');
    } catch (error) {
      console.error('Search submission error:', error);
    }
  };

  return (
    <div className="search-form-container">
      <h2>Google Scholar Search</h2>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label htmlFor="query">Search Query</label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search terms (e.g., machine learning)"
            required
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxPages">Maximum Pages (leave empty for auto-detection)</label>
          <input
            type="number"
            id="maxPages"
            value={maxPages}
            onChange={(e) => setMaxPages(e.target.value)}
            placeholder="Auto-detect"
            min="1"
            max="20"
            className="form-control"
          />
        </div>

        <div className="form-group form-check">
          <input
            type="checkbox"
            id="useThreading"
            checked={useThreading}
            onChange={(e) => setUseThreading(e.target.checked)}
            className="form-check-input"
          />
          <label className="form-check-label" htmlFor="useThreading">
            Use Parallel Scraping (faster)
          </label>
        </div>

        {useThreading && (
          <div className="form-group">
            <label htmlFor="maxThreads">Thread Count (1-5 recommended)</label>
            <select
              id="maxThreads"
              value={maxThreads}
              onChange={(e) => setMaxThreads(e.target.value)}
              className="form-control"
            >
              <option value="1">1 (Safest)</option>
              <option value="2">2</option>
              <option value="3">3 (Recommended)</option>
              <option value="4">4</option>
              <option value="5">5 (Faster)</option>
            </select>
          </div>
        )}

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      <div className="search-tips">
        <h3>Search Tips</h3>
        <ul>
          <li>Use specific terms for more targeted results</li>
          <li>Add "filetype:pdf" to find papers with PDFs</li>
          <li>Auto-detection works best for common topics</li>
          <li>Use fewer threads (1-3) if you encounter errors</li>
          <li>Be patient - scraping may take time to avoid blocking</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchForm;