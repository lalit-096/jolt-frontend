// src/components/search/SearchResults.jsx
import React from 'react';
import ResultItem from './ResultItem';
// import Pagination from './Pagination';
// import Loader from '../common/Loader';
// import ErrorAlert from '../common/ErrorAlert';

const SearchResults = ({ results, loading, error, query }) => {
  // if (loading) {
  //   return <Loader message="Fetching search results..." />;
  // }

  // if (error) {
  //   return <ErrorAlert message={error.message || 'An error occurred while searching'} />;
  // }

  if (!results || results.length === 0) {
    return (
      <div className="no-results">
        <h3>No results found</h3>
        <p>Try a different search query or check your connection.</p>
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="results-header">
        <h2>Search Results for: {query}</h2>
        <p>Found {results.length} results</p>
      </div>

      <div className="results-list">
        {results.map((item, index) => (
          <ResultItem key={index} item={item} />
        ))}
      </div>

      <div className="export-options">
        <button className="btn btn-secondary">Export to CSV</button>
      </div>
    </div>
  );
};

export default SearchResults;