// src/context/AppContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { searchScholar } from '../services/searchService';
import { extractPDFMetadata } from '../services/pdfService';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfMetadata, setPDFMetadata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async ({ query, maxPages, useThreading, maxThreads }) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchScholar(
        query, 
        maxPages === 'auto' ? undefined : maxPages, 
        useThreading, 
        maxThreads
      );
      
      setSearchResults(results.papers || []);
      setSearchQuery(query);
      return results;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processPDFs = useCallback(async (urls) => {
    setLoading(true);
    setError(null);
    
    try {
      const metadata = await extractPDFMetadata(urls);
      setPDFMetadata(metadata || []);
      return metadata;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    searchResults,
    searchQuery,
    pdfMetadata,
    loading,
    error,
    performSearch,
    processPDFs
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};