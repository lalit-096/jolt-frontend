// src/services/pdfService.js
import api from './api';

export const extractPDFMetadata = async (pdfUrls) => {
  try {
    const response = await api.post('/pdf/extract', {
      urls: pdfUrls
    });
    return response.data;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw error;
  }
};

export const uploadCSVWithPDFs = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/files/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('CSV upload error:', error);
    throw error;
  }
};