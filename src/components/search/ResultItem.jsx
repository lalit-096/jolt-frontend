// src/components/search/ResultItem.jsx
import React from 'react';

const ResultItem = ({ item }) => {
  return (
    <div className="result-item">
      <h3 className="result-title">
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h3>
      
      <div className="result-metadata">
        {item.has_pdf && (
          <span className="badge badge-success">PDF Available</span>
        )}
        {item.has_multimedia && (
          <span className="badge badge-info">Multimedia</span>
        )}
      </div>
      
      <div className="result-actions">
        <button className="btn btn-sm btn-primary">Extract Metadata</button>
        <button className="btn btn-sm btn-outline-secondary">Save</button>
      </div>
    </div>
  );
};

export default ResultItem;