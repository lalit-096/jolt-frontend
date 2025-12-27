// src/services/scholarService.js
import api from './api';

// Scrape Google Scholar based on user query
export const scrapeScholar = async (params) => {
  try {
    const response = await api.post('/scholar/scrape', {
      query: params.query,
      max_pages: params.maxPages ? parseInt(params.maxPages, 10) : null,
      filters: {
        year_from: params.yearFrom,
        year_to: params.yearTo,
        doc_type: "0,5",
        exclude_patents: true
      },
      output_filename: params.outputFilename || null,
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