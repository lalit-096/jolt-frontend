// src/services/api.js
import axios from 'axios';

// Base URL for API requests
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with non-2xx status
      console.error('API Error:', error.response.data);
      
      // Check for CAPTCHA detection (custom handling based on backend response)
      if (error.response.data.detail && error.response.data.detail.includes('CAPTCHA')) {
        console.warn('CAPTCHA detected, manual solving required');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error: No response received');
    } else {
      // Something else caused the error
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;