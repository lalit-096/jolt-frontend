// src/hooks/usePDFMetadata.js
import { useState } from 'react';
import { extractPDFMetadata, uploadCSVWithPDFs } from '../services/pdfService';

export const usePDFMetadata = () => {
  const [metadata, setMetadata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractFromUrls = async (urls) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await extractPDFMetadata(urls);
      setMetadata(response || []);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extractFromCSV = async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await uploadCSVWithPDFs(file);
      setMetadata(response.metadata || []);
      return response;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { metadata, loading, error, extractFromUrls, extractFromCSV };
};