// src/components/pdf/PDFMetadataViewer.jsx
import React from 'react';

const PDFMetadataViewer = ({ metadata }) => {
  // Group papers by year
  const groupedByYear = metadata.reduce((acc, paper) => {
    const year = paper.year_publication || paper.year_creation || 'Unknown Year';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(paper);
    return acc;
  }, {});
  
  // Sort years in descending order
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => {
    if (a === 'Unknown Year') return 1;
    if (b === 'Unknown Year') return -1;
    return parseInt(b, 10) - parseInt(a, 10);
  });
  
  return (
    <div className="pdf-metadata-container">
      <h2>PDF Metadata Results</h2>
      
      {sortedYears.length === 0 ? (
        <div className="no-results">
          <p>No PDF metadata found. Try different URLs or check the format.</p>
        </div>
      ) : (
        <div className="metadata-by-year">
          {sortedYears.map(year => (
            <div key={year} className="year-section">
              <h3 className="year-header">{year}</h3>
              <div className="papers-list">
                {groupedByYear[year].map((paper, index) => (
                  <div key={index} className="paper-metadata-card">
                    <h4 className="paper-title">{paper.title || 'Untitled'}</h4>
                    
                    <div className="paper-details">
                      {paper.author && (
                        <p className="paper-author">
                          <strong>Author:</strong> {paper.author}
                        </p>
                      )}
                      
                      <p className="paper-url">
                        <strong>URL:</strong>{' '}
                        <a href={paper.url} target="_blank" rel="noopener noreferrer">
                          {paper.url.length > 60 ? paper.url.substring(0, 60) + '...' : paper.url}
                        </a>
                      </p>
                      
                      {paper.size && (
                        <p className="paper-size">
                          <strong>Size:</strong> {formatFileSize(paper.size)}
                        </p>
                      )}
                      
                      <div className="paper-years">
                        {paper.year_creation && (
                          <span className="year-badge">
                            Created: {paper.year_creation}
                          </span>
                        )}
                        {paper.year_publication && (
                          <span className="year-badge">
                            Published: {paper.year_publication}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="export-options">
        <button className="btn btn-secondary">Export to JSON</button>
      </div>
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'Unknown';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default PDFMetadataViewer;