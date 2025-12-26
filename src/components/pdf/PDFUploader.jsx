// src/components/pdf/PDFUploader.jsx
import React, { useState } from 'react';
import { uploadCSVWithPDFs } from '../../services/pdfService';

const PDFUploader = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [manualUrls, setManualUrls] = useState('');
  const [inputMethod, setInputMethod] = useState('csv');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      if (inputMethod === 'csv') {
        if (!file) {
          throw new Error('Please select a CSV file');
        }
        const response = await uploadCSVWithPDFs(file);
        onUploadComplete(response);
      } else {
        if (!manualUrls.trim()) {
          throw new Error('Please enter at least one URL');
        }
        
        // Parse manual URLs (one per line or comma-separated)
        const urls = manualUrls
          .split(/[\n,]/)
          .map(url => url.trim())
          .filter(url => url.length > 0);
        
        if (urls.length === 0) {
          throw new Error('No valid URLs found');
        }
        
        // Call the API endpoint for manual URLs
        onUploadComplete({ urls });
      }
    } catch (err) {
      setError(err.message || 'Failed to process PDF URLs');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="pdf-uploader-container">
      <h2>Extract PDF Metadata</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="input-method-selector">
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="csvMethod"
            checked={inputMethod === 'csv'}
            onChange={() => setInputMethod('csv')}
            className="form-check-input"
          />
          <label className="form-check-label" htmlFor="csvMethod">
            Upload CSV File
          </label>
        </div>
        
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="manualMethod"
            checked={inputMethod === 'manual'}
            onChange={() => setInputMethod('manual')}
            className="form-check-input"
          />
          <label className="form-check-label" htmlFor="manualMethod">
            Enter URLs Manually
          </label>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="upload-form">
        {inputMethod === 'csv' ? (
          <div className="form-group">
            <label htmlFor="csvFile">Select CSV file with PDF URLs</label>
            <input
              type="file"
              id="csvFile"
              accept=".csv"
              onChange={handleFileChange}
              className="form-control-file"
            />
            <small className="form-text text-muted">
              CSV should have a column named 'pdf_links' containing URLs
            </small>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="manualUrls">Enter PDF URLs (one per line or comma-separated)</label>
            <textarea
              id="manualUrls"
              value={manualUrls}
              onChange={(e) => setManualUrls(e.target.value)}
              rows="5"
              placeholder="https://example.com/paper1.pdf&#10;https://example.com/paper2.pdf"
              className="form-control"
            />
          </div>
        )}
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || (inputMethod === 'csv' && !file) || (inputMethod === 'manual' && !manualUrls.trim())}
        >
          {isLoading ? 'Processing...' : 'Extract Metadata'}
        </button>
      </form>
    </div>
  );
};

export default PDFUploader;