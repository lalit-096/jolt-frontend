// src/services/searchService.js
import api from './api';

export const searchScholar = async (query, maxPages = 5, useThreading = true, maxThreads = 3) => {
  try {
    const response = await api.post('/scraper/search', {
      text: query,
      max_pages: maxPages,
      use_threading: useThreading,
      max_threads: maxThreads
    });
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getRecentSearches = async () => {
  try {
    const response = await api.get('/scraper/recent');
    return response.data;
  } catch (error) {
    console.error('Recent searches error:', error);
    throw error;
  }
};