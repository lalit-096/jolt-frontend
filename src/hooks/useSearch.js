// src/hooks/useSearch.js
import { useState, useEffect } from 'react';
import { searchScholar } from '../services/searchService';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (searchQuery, options = {}) => {
    setLoading(true);
    setError(null);
    setQuery(searchQuery);
    
    try {
      const response = await searchScholar(
        searchQuery, 
        options.maxPages, 
        options.useThreading, 
        options.maxThreads
      );
      setResults(response.papers || []);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { results, query, loading, error, search };
};