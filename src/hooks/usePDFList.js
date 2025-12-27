import { useState, useEffect, useCallback } from 'react';
import { fetchPDFMetadataList, loadPDFsFromJSON } from '../services/pdfService';

export const usePDFList = () => {
  const [pdfs, setPDFs] = useState([]);
  const [filteredPDFs, setFilteredPDFs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFromJSON, setLoadingFromJSON] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingFromJSON, setIsLoadingFromJSON] = useState(false);

  // Load PDF metadata from backend
  const loadPDFs = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchPDFMetadataList(pageNum, pageSize);
      
      // Extract PDFs and filter out those with errors
      const allPDFs = response.pdfs || response.data || [];
      const validPDFs = allPDFs.filter(pdf => !pdf.error && !pdf.failed);
      
      if (pageNum === 1) {
        setPDFs(validPDFs);
        setFilteredPDFs(validPDFs);
      } else {
        setPDFs(prev => [...prev, ...validPDFs]);
        setFilteredPDFs(prev => [...prev, ...validPDFs]);
      }

      // Handle pagination
      setTotalPages(response.total_pages || 1);
      setPage(pageNum);
      setHasMore(pageNum < (response.total_pages || 1));
    } catch (err) {
      console.error('Error loading PDF metadata:', err);
      setError(err.response?.data?.detail || 'Failed to load PDF metadata');
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // Load PDFs on component mount
  useEffect(() => {
    loadPDFs(1);
  }, [loadPDFs]);

  // Get next page of PDFs
  const loadNextPage = useCallback(async () => {
    if (page < totalPages && !loading) {
      await loadPDFs(page + 1);
    }
  }, [page, totalPages, loading, loadPDFs]);

  // Go to specific page
  const goToPage = useCallback(async (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      await loadPDFs(pageNum);
    }
  }, [totalPages, loadPDFs]);

  // Filter PDFs by search term
  const filterBySearch = useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredPDFs(pdfs);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = pdfs.filter(pdf =>
      pdf.name?.toLowerCase().includes(lowerSearchTerm) ||
      pdf.source?.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredPDFs(filtered);
  }, [pdfs]);

  // Filter PDFs by year
  const filterByYear = useCallback((year) => {
    if (!year) {
      setFilteredPDFs(pdfs);
      return;
    }

    const filtered = pdfs.filter(pdf => pdf.year === parseInt(year));
    setFilteredPDFs(filtered);
  }, [pdfs]);

  // Filter PDFs by size range
  const filterBySize = useCallback((minSize, maxSize) => {
    if (minSize === null && maxSize === null) {
      setFilteredPDFs(pdfs);
      return;
    }

    const filtered = pdfs.filter(pdf => {
      const size = pdf.file_size || 0;
      if (minSize !== null && size < minSize) return false;
      if (maxSize !== null && size > maxSize) return false;
      return true;
    });
    setFilteredPDFs(filtered);
  }, [pdfs]);

  // Load PDFs from JSON file
  const loadFromJSON = useCallback(async (filename) => {
    // Prevent duplicate calls
    if (isLoadingFromJSON || loading) {
      console.warn('PDF loading already in progress');
      return;
    }

    if (!filename || !filename.trim()) {
      setError('Please select a JSON file');
      return;
    }

    setLoadingFromJSON(true);
    setError(null);
    setIsLoadingFromJSON(true);

    try {
      const response = await loadPDFsFromJSON(filename.trim());
      
      // Check if response indicates success
      // Accept various success indicators: message, success: true, or loaded_count
      const isSuccess = 
        response.message || 
        response.success === true || 
        response.loaded_count !== undefined ||
        (response.success !== false && response !== null);
      
      if (isSuccess) {
        // Reload PDFs from the backend to get the updated list
        // Reset to page 1 and reload
        await loadPDFs(1);
      } else {
        throw new Error('Failed to load PDFs from JSON file');
      }
    } catch (err) {
      console.error('Error loading PDFs from JSON:', err);
      
      // Provide specific error messages
      let errorMessage = 'Failed to load PDFs from JSON file';
      
      if (err.response?.status === 404) {
        errorMessage = 'JSON file not found. Please check the filename.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.detail || 'Invalid JSON file or empty file.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingFromJSON(false);
      setIsLoadingFromJSON(false);
    }
  }, [isLoadingFromJSON, loading, loadPDFs]);

  return {
    pdfs: filteredPDFs,
    allPDFs: pdfs,
    loading,
    loadingFromJSON,
    error,
    page,
    totalPages,
    hasMore,
    loadPDFs,
    loadNextPage,
    goToPage,
    filterBySearch,
    filterByYear,
    filterBySize,
    loadFromJSON,
    totalCount: pdfs.length,
  };
};
