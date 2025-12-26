// src/components/search/ResultItem.jsx
import React from 'react';

const ResultItem = ({ item }) => {
  return (
    <div className="result-item">
      <h3 className="result-title">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title || 'Untitled Paper'}
        </a>
      </h3>
      
      <div className="result-metadata">
        {item.has_pdf && (
          <span className="badge bg-success">PDF Available</span>
        )}
        {item.has_multimedia && (
          <span className="badge bg-info">Multimedia</span>
        )}
      </div>
      
      {item.pdf_links && item.pdf_links.length > 0 && (
        <div className="pdf-links">
          <strong>PDF Links:</strong>
          <ul>
            {Array.isArray(item.pdf_links) ? 
              item.pdf_links.map((link, i) => (
                <li key={i}>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {link.length > 60 ? link.substring(0, 60) + '...' : link}
                  </a>
                </li>
              )) : (
                <li>
                  <a href={item.pdf_links} target="_blank" rel="noopener noreferrer">
                    {typeof item.pdf_links === 'string' && item.pdf_links.length > 60 
                      ? item.pdf_links.substring(0, 60) + '...' 
                      : item.pdf_links}
                  </a>
                </li>
              )
            }
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultItem;