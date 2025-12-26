// src/services/scholarService.js
import api from './api';

// Scrape Google Scholar based on user query
export const scrapeScholar = async (params) => {
  try {
    const response = await api.post('/scholar/scrape', {
      query: params.query,
      max_pages: params.maxPages === 'auto' ? null : parseInt(params.maxPages, 10) || 5,
      delay_between_pages: params.delay || 10,
      use_threading: params.useThreading || false,
      num_threads: params.numThreads || 3
    });
    
    return response.data;
  } catch (error) {
    console.error('Scholar scraping error:', error);
    throw error;
  }
};

// Get list of available CSV files
export const getCSVFiles = async () => {
  try {
    const response = await api.get('/files/csv');
    return response.data.files || [];
  } catch (error) {
    console.error('Error fetching CSV files:', error);
    throw error;
  }
};

// Get details for a specific CSV file
export const getCSVDetails = async (filename) => {
  try {
    const response = await api.get(`/files/csv/${filename}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${filename}:`, error);
    throw error;
  }
};