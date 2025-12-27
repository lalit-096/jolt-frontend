// src/services/pdfService.js
import api from './api';

// Extract metadata from PDFs in a CSV file
export const extractPDFMetadataFromCSV = async (params) => {
  try {
    const response = await api.post('/pdf/metadata', {
      input_source: 'csv',
      input_filename: params.filename,
      output_filename: params.outputFilename || null,
      num_threads: params.numThreads || 3,
      max_retries: params.maxRetries || 3,
      max_pdfs: params.maxPDFs || null
    });
    
    return response.data;
  } catch (error) {
    console.error('PDF metadata extraction error:', error);
    throw error;
  }
};

// Extract metadata from PDF URLs directly
export const extractPDFMetadataFromURLs = async (params) => {
  try {
    // Parse URLs if they come as a string (one per line or comma-separated)
    let urls = params.urls;
    if (typeof urls === 'string') {
      urls = urls
        .split(/[\n,]/)
        .map(url => url.trim())
        .filter(url => url.length > 0 && url.startsWith('http'));
    }
    
    const response = await api.post('/pdf/metadata', {
      input_source: 'direct',
      pdf_urls: urls,
      output_filename: params.outputFilename || null,
      num_threads: params.numThreads || 3,
      max_retries: params.maxRetries || 3
    });
    
    return response.data;
  } catch (error) {
    console.error('PDF metadata extraction error:', error);
    throw error;
  }
};

// Get list of available JSON metadata files
export const getJSONFiles = async () => {
  try {
    const response = await api.get('/files/json');
    return response.data.files || [];
  } catch (error) {
    console.error('Error fetching JSON files:', error);
    throw error;
  }
};

// Get details for a specific JSON file
export const getJSONDetails = async (filename) => {
  try {
    const response = await api.get(`/files/json/${filename}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${filename}:`, error);
    throw error;
  }
};

// Fetch PDF metadata list from backend
export const fetchPDFMetadataList = async (page = 1, pageSize = 20) => {
  try {
    const response = await api.get('/pdf/metadata/list', {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching PDF metadata list:', error);
    throw error;
  }
};

// Download individual PDF by ID
export const downloadPDFById = async (pdfId) => {
  try {
    const response = await api.get(`/pdf/download/${pdfId}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Bulk download PDFs with grouping option
export const bulkDownloadPDFs = async (groupingOption) => {
  try {
    const response = await api.post(
      '/pdf/bulk-download',
      { grouping_option: groupingOption },
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error('Error bulk downloading PDFs:', error);
    throw error;
  }
};

// Load PDFs from a JSON metadata file
export const loadPDFsFromJSON = async (filename) => {
  try {
    const response = await api.post('/pdf/metadata/json', {
      json_filename: filename,
    });
    return response.data;
  } catch (error) {
    console.error('Error loading PDFs from JSON:', error);
    throw error;
  }
};