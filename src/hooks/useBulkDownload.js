import { useState, useCallback } from 'react';
import { bulkDownloadPDFs } from '../services/pdfService';

export const useBulkDownload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDFs = useCallback(async (groupingOption) => {
    // Prevent multiple simultaneous requests
    if (isDownloading) {
      console.warn('Download already in progress');
      return;
    }

    // Validate grouping option
    if (!groupingOption) {
      setError('Please select a grouping option');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setIsDownloading(true);

    try {
      const blob = await bulkDownloadPDFs(groupingOption);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pdfs_${groupingOption}_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      console.error('Error downloading PDFs:', err);
      setError(
        err.response?.data?.detail || 'Failed to download PDFs. Please try again.'
      );
    } finally {
      setLoading(false);
      setIsDownloading(false);
    }
  }, [isDownloading]);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    success,
    isDownloading,
    downloadPDFs,
    resetState,
  };
};
