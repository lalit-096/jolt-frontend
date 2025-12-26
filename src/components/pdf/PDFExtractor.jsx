// src/components/pdf/PDFExtractor.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCSVFiles } from '../../services/scholarService';
import { extractPDFMetadataFromCSV, extractPDFMetadataFromURLs } from '../../services/pdfService';
import Loader from '../common/Loader';
import ErrorAlert from '../common/ErrorAlert';

const PDFExtractor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [csvFiles, setCsvFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingPDFs, setProcessingPDFs] = useState(false);
  const [error, setError] = useState(null);
  const [progressMsg, setProgressMsg] = useState('');
  const [formData, setFormData] = useState({
    inputType: 'csv',
    csvFilename: '',
    manualUrls: '',
    numThreads: 3,
    maxRetries: 3,
    maxPDFs: '',
    outputFilename: ''
  });

  // Fetch available CSV files on component mount
  useEffect(() => {
    const fetchCSVFiles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const files = await getCSVFiles();
        setCsvFiles(files);
        
        // If CSV filename was passed through navigation
        if (location.state?.csvFilename) {
          setFormData(prev => ({
            ...prev,
            inputType: 'csv',
            csvFilename: location.state.csvFilename
          }));
        }
      } catch (err) {
        console.error('Error fetching CSV files:', err);
        setError('Failed to load CSV files. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCSVFiles();
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateFilename = (baseType = 'pdf_metadata') => {
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${baseType}_${timestamp}.json`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProcessingPDFs(true);
    setProgressMsg('Initializing PDF metadata extraction...');
    
    // Generate output filename if not provided
    const outputFilename = formData.outputFilename || generateFilename();
    
    try {
      let response;
      
      if (formData.inputType === 'csv') {
        if (!formData.csvFilename) {
          throw new Error('Please select a CSV file');
        }
        
        setProgressMsg(`Processing PDFs from ${formData.csvFilename}...`);
        response = await extractPDFMetadataFromCSV({
          filename: formData.csvFilename,
          outputFilename,
          numThreads: parseInt(formData.numThreads, 10),
          maxRetries: parseInt(formData.maxRetries, 10),
          maxPDFs: formData.maxPDFs ? parseInt(formData.maxPDFs, 10) : null
        });
      } else {
        if (!formData.manualUrls.trim()) {
          throw new Error('Please enter at least one PDF URL');
        }
        
        setProgressMsg('Processing manual PDF URLs...');
        response = await extractPDFMetadataFromURLs({
          urls: formData.manualUrls,
          outputFilename,
          numThreads: parseInt(formData.numThreads, 10),
          maxRetries: parseInt(formData.maxRetries, 10)
        });
      }
      
      // Navigate to results page
      navigate('/pdf-results', { 
        state: { 
          metadata: response.metadata || response,
          filename: outputFilename 
        }
      });
      
    } catch (err) {
      console.error('PDF extraction error:', err);
      
      let errorMsg = 'An error occurred during PDF metadata extraction';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setProcessingPDFs(false);
      setProgressMsg('');
    }
  };

  if (loading) {
    return <Loader message="Loading CSV files..." />;
  }

  return (
    <div className="pdf-extractor-container">
      <h2>Extract PDF Metadata</h2>
      
      {error && <ErrorAlert message={error} />}
      
      {processingPDFs ? (
        <Loader message={progressMsg || 'Processing PDFs...'} />
      ) : (
        <form onSubmit={handleSubmit} className="pdf-form">
          <div className="form-group mb-3">
            <label className="form-label">Input Source</label>
            <div className="form-check">
              <input
                type="radio"
                id="csvInput"
                name="inputType"
                value="csv"
                checked={formData.inputType === 'csv'}
                onChange={handleChange}
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="csvInput">
                CSV File
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                id="manualInput"
                name="inputType"
                value="manual"
                checked={formData.inputType === 'manual'}
                onChange={handleChange}
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="manualInput">
                Manual URLs
              </label>
            </div>
          </div>
          
          {formData.inputType === 'csv' ? (
            <div className="form-group mb-3">
              <label htmlFor="csvFilename">Select CSV File</label>
              {csvFiles.length > 0 ? (
                <select
                  id="csvFilename"
                  name="csvFilename"
                  value={formData.csvFilename}
                  onChange={handleChange}
                  className="form-select"
                  required={formData.inputType === 'csv'}
                >
                  <option value="">-- Select a CSV file --</option>
                  {csvFiles.map((file, index) => (
                    <option key={index} value={file}>
                      {file}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="alert alert-warning">
                  No CSV files found. Please run a Google Scholar search first.
                </div>
              )}
            </div>
          ) : (
            <div className="form-group mb-3">
              <label htmlFor="manualUrls">PDF URLs</label>
              <textarea
                id="manualUrls"
                name="manualUrls"
                value={formData.manualUrls}
                onChange={handleChange}
                placeholder="Enter one URL per line or comma-separated"
                className="form-control"
                rows="5"
                required={formData.inputType === 'manual'}
              />
              <small className="form-text text-muted">
                Enter URLs of PDFs to extract metadata from (one per line or comma-separated)
              </small>
            </div>
          )}
          
          <div className="form-group mb-3">
            <label htmlFor="numThreads">Number of Parallel Threads</label>
            <select
              id="numThreads"
              name="numThreads"
              value={formData.numThreads}
              onChange={handleChange}
              className="form-select"
            >
              <option value="1">1 (Slowest, most reliable)</option>
              <option value="2">2</option>
              <option value="3">3 (Recommended)</option>
              <option value="5">5 (Faster)</option>
              <option value="10">10 (Fastest, may cause errors)</option>
            </select>
          </div>
          
          <div className="form-group mb-3">
            <label htmlFor="maxRetries">Max Retries per PDF</label>
            <input
              type="number"
              id="maxRetries"
              name="maxRetries"
              value={formData.maxRetries}
              onChange={handleChange}
              min="1"
              max="5"
              className="form-control"
            />
          </div>
          
          {formData.inputType === 'csv' && (
            <div className="form-group mb-3">
              <label htmlFor="maxPDFs">Max PDFs to Process (optional)</label>
              <input
                type="number"
                id="maxPDFs"
                name="maxPDFs"
                value={formData.maxPDFs}
                onChange={handleChange}
                min="1"
                placeholder="Process all PDFs"
                className="form-control"
              />
              <small className="form-text text-muted">
                Leave blank to process all PDFs
              </small>
            </div>
          )}
          
          <div className="form-group mb-3">
            <label htmlFor="outputFilename">Output Filename (optional)</label>
            <input
              type="text"
              id="outputFilename"
              name="outputFilename"
              value={formData.outputFilename}
              onChange={handleChange}
              placeholder="pdf_metadata_YYYY-MM-DD.json"
              className="form-control"
            />
            <small className="form-text text-muted">
              Leave blank for auto-generated filename
            </small>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={processingPDFs || (formData.inputType === 'csv' && !formData.csvFilename) || 
                      (formData.inputType === 'manual' && !formData.manualUrls.trim())}
          >
            Extract PDF Metadata
          </button>
        </form>
      )}
      
      <div className="extraction-tips mt-4">
        <h3>PDF Extraction Tips</h3>
        <ul>
          <li>PDF extraction may take time depending on the number of URLs</li>
          <li>Some PDFs may fail to extract due to access restrictions or invalid URLs</li>
          <li>3 threads is recommended for reliability</li>
          <li>Results will be saved as a JSON file for future reference</li>
        </ul>
      </div>
    </div>
  );
};

export default PDFExtractor;