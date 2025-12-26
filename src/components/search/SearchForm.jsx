// src/components/search/SearchForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrapeScholar } from '../../services/scholarService';
import Loader from '../common/Loader';
import ErrorAlert from '../common/ErrorAlert';

const SearchForm = () => {
  const [formData, setFormData] = useState({
    query: '',
    maxPages: '',
    useThreading: true,
    numThreads: 3,
    delay: 10,
    outputFilename: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progressMsg, setProgressMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateFilename = () => {
    const sanitizedQuery = formData.query.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${sanitizedQuery}_${timestamp}.csv`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setProgressMsg('Initializing scraper...');

    // Auto-generate filename if not provided
    const outputFilename = formData.outputFilename || generateFilename();
    
    try {
      setProgressMsg('Connecting to Google Scholar...');
      
      // Call the scrapeScholar service
      const response = await scrapeScholar({
        ...formData,
        outputFilename
      });
      
      // Navigate to results page with the response data
      navigate('/results', { 
        state: { 
          results: response,
          query: formData.query,
          filename: outputFilename
        }
      });
      
    } catch (err) {
      let errorMsg = 'An error occurred during scraping';
      
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      if (errorMsg.includes('CAPTCHA')) {
        errorMsg = 'Google Scholar is showing a CAPTCHA. Please wait 30-60 minutes before trying again.';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="search-form-container">
      <h2>Google Scholar Search</h2>
      
      {error && <ErrorAlert message={error} />}
      
      {loading ? (
        <Loader message={progressMsg || 'Scraping in progress...'} />
      ) : (
        <form onSubmit={handleSubmit} className="search-form">
          <div className="form-group">
            <label htmlFor="query">Search Query</label>
            <input
              type="text"
              id="query"
              name="query"
              value={formData.query}
              onChange={handleChange}
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
              name="maxPages"
              value={formData.maxPages}
              onChange={handleChange}
              placeholder="Auto-detect"
              min="1"
              max="20"
              className="form-control"
            />
            <small className="form-text text-muted">
              Leave blank to automatically detect maximum pages
            </small>
          </div>

          <div className="form-group form-check">
            <input
              type="checkbox"
              id="useThreading"
              name="useThreading"
              checked={formData.useThreading}
              onChange={handleChange}
              className="form-check-input"
            />
            <label className="form-check-label" htmlFor="useThreading">
              Use Parallel Scraping (faster)
            </label>
          </div>

          {formData.useThreading && (
            <div className="form-group">
              <label htmlFor="numThreads">Thread Count (1-5 recommended)</label>
              <select
                id="numThreads"
                name="numThreads"
                value={formData.numThreads}
                onChange={handleChange}
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
          
          <div className="form-group">
            <label htmlFor="delay">Delay Between Pages (seconds)</label>
            <input
              type="number"
              id="delay"
              name="delay"
              value={formData.delay}
              onChange={handleChange}
              min="5"
              max="180"
              className="form-control"
            />
            <small className="form-text text-muted">
              Recommended: 10-15 seconds to avoid blocking
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="outputFilename">Output Filename (optional)</label>
            <input
              type="text"
              id="outputFilename"
              name="outputFilename"
              value={formData.outputFilename}
              onChange={handleChange}
              placeholder="auto_generated_name.csv"
              className="form-control"
            />
            <small className="form-text text-muted">
              Leave blank for auto-generated filename
            </small>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !formData.query.trim()}
          >
            Search Google Scholar
          </button>
        </form>
      )}
      
      <div className="search-tips mt-4">
        <h3>Search Tips</h3>
        <ul>
          <li>Use specific terms for more targeted results</li>
          <li>Add "filetype:pdf" to find papers with PDFs</li>
          <li>Auto-detection works best for common topics</li>
          <li>Use fewer threads (1-3) if you encounter errors</li>
          <li>Be patient - scraping may take time to avoid blocking</li>
          <li>If you see a CAPTCHA error, wait 30-60 minutes before trying again</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchForm;