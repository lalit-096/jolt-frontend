import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { usePDFList } from '../../hooks/usePDFList';
import { useBulkDownload } from '../../hooks/useBulkDownload';
import { getJSONFiles } from '../../services/pdfService';
import PDFListItem from './PDFListItem';
import BulkDownloadModal from './BulkDownloadModal';
import Loader from '../common/Loader';
import ErrorAlert from '../common/ErrorAlert';
import { truncateText } from '../../utils/formatters';

const PDFList = () => {
  const location = useLocation();
  const {
    pdfs,
    allPDFs,
    loading,
    loadingFromJSON,
    error,
    page,
    totalPages,
    hasMore,
    loadNextPage,
    goToPage,
    filterBySearch,
    filterByYear,
    filterBySize,
    loadFromJSON,
    totalCount,
  } = usePDFList();

  const { loading: bulkLoading, error: bulkError, downloadPDFs, resetState } =
    useBulkDownload();

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedJsonFile, setSelectedJsonFile] = useState('');
  const [loadingJsonFiles, setLoadingJsonFiles] = useState(false);
  const [jsonError, setJsonError] = useState(null);

  // Handle search filter
  const handleSearch = (value) => {
    setSearchTerm(value);
    filterBySearch(value);
  };

  // Handle year filter
  const handleYearFilter = (value) => {
    setFilterYear(value);
    if (value) {
      filterByYear(value);
    } else {
      filterBySearch(searchTerm);
    }
  };

  // Handle size filter
  const handleSizeFilter = (value) => {
    setFilterSize(value);
    if (value) {
      const [minStr, maxStr] = value.split('-');
      const min = minStr ? parseInt(minStr) : null;
      const max = maxStr ? parseInt(maxStr) : null;
      filterBySize(min, max);
    } else {
      filterBySearch(searchTerm);
    }
  };

  // Handle bulk download
  const handleBulkDownload = async (groupingOption) => {
    try {
      await downloadPDFs(groupingOption);
      setShowBulkModal(false);
      resetState();
    } catch (error) {
      console.error('Bulk download error:', error);
    }
  };

  // Handle loading PDFs from JSON file
  const handleLoadFromJSON = useCallback(async (filename = null) => {
    const fileToLoad = filename || selectedJsonFile;
    
    if (!fileToLoad) {
      setJsonError('Please select a JSON file');
      return;
    }
    
    setJsonError(null);
    try {
      await loadFromJSON(fileToLoad);
      // Reset selection after successful load
      setSelectedJsonFile('');
    } catch (err) {
      // Error is already handled in the hook
      console.error('Error loading from JSON:', err);
    }
  }, [selectedJsonFile, loadFromJSON]);

  // Fetch available JSON files on component mount
  useEffect(() => {
    const fetchJSONFiles = async () => {
      setLoadingJsonFiles(true);
      setJsonError(null);
      
      try {
        const files = await getJSONFiles();
        setJsonFiles(files);
        
        // If JSON filename was passed through navigation, select it
        if (location.state?.jsonFilename) {
          const filename = location.state.jsonFilename;
          if (files.includes(filename)) {
            setSelectedJsonFile(filename);
          }
        }
      } catch (err) {
        console.error('Error fetching JSON files:', err);
        setJsonError('Failed to load JSON files');
      } finally {
        setLoadingJsonFiles(false);
      }
    };
    
    fetchJSONFiles();
  }, [location.state]);

  // Auto-load PDFs if autoLoad flag is set in navigation state
  useEffect(() => {
    if (location.state?.autoLoad && location.state?.jsonFilename && selectedJsonFile) {
      // Small delay to ensure JSON files are loaded first
      const timer = setTimeout(() => {
        handleLoadFromJSON(selectedJsonFile);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedJsonFile, location.state, handleLoadFromJSON]);

  // Get unique years from all PDFs
  const getUniqueYears = () => {
    const years = new Set();
    allPDFs.forEach(pdf => {
      if (pdf.year) {
        years.add(pdf.year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const uniqueYears = getUniqueYears();

  return (
    <div className="pdf-list-container">
      {/* Header Section */}
      <div className="mb-5">
        <h2 className="mb-3">
          <i className="bi bi-file-pdf me-3" />
          PDF Metadata Library
        </h2>
        <p className="text-muted">
          {totalCount > 0
            ? `Total PDFs available: ${totalCount}`
            : 'No PDFs available'}
        </p>
      </div>

      {/* Bulk Download Error */}
      {bulkError && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          <strong>Download Error:</strong> {bulkError}
          <button
            type="button"
            className="btn-close"
            onClick={() => resetState()}
          />
        </div>
      )}

      {/* Main Error */}
      {error && <ErrorAlert message={error} />}

      {/* JSON Load Error */}
      {jsonError && (
        <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
          <strong>JSON Load Error:</strong> {jsonError}
          <button
            type="button"
            className="btn-close"
            onClick={() => setJsonError(null)}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && page === 1 && <Loader message="Loading PDF metadata..." />}
      
      {/* Loading from JSON State */}
      {loadingFromJSON && (
        <div className="alert alert-info mb-4">
          <span className="spinner-border spinner-border-sm me-2" role="status" />
          Loading PDFs from JSON file...
        </div>
      )}

      {/* Load from JSON Section */}
      {!loading && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-file-earmark-code me-2" />
              Load PDFs from JSON File
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-8">
                <label htmlFor="jsonFileSelect" className="form-label">
                  Select JSON Metadata File
                </label>
                {loadingJsonFiles ? (
                  <div className="form-control">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Loading JSON files...
                  </div>
                ) : (
                  <select
                    id="jsonFileSelect"
                    className="form-select"
                    value={selectedJsonFile}
                    onChange={(e) => {
                      setSelectedJsonFile(e.target.value);
                      setJsonError(null);
                    }}
                    disabled={loadingFromJSON || jsonFiles.length === 0}
                  >
                    <option value="">
                      {jsonFiles.length === 0
                        ? 'No JSON files available'
                        : '-- Select a JSON file --'}
                    </option>
                    {jsonFiles.map((file, index) => (
                      <option key={index} value={file}>
                        {file}
                      </option>
                    ))}
                  </select>
                )}
                {jsonFiles.length === 0 && !loadingJsonFiles && (
                  <small className="form-text text-muted">
                    No JSON metadata files found. Extract PDF metadata first.
                  </small>
                )}
              </div>
              <div className="col-md-4 d-grid">
                <button
                  className="btn btn-primary"
                  onClick={() => handleLoadFromJSON()}
                  disabled={
                    !selectedJsonFile ||
                    loadingFromJSON ||
                    loading ||
                    jsonFiles.length === 0
                  }
                  title={
                    !selectedJsonFile
                      ? 'Please select a JSON file'
                      : 'Load PDFs from selected JSON file'
                  }
                >
                  {loadingFromJSON ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Loading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload me-2" />
                      Load from JSON
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      {!loading && pdfs.length > 0 && (
        <div className="controls-section mb-4">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or source..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Year Filter */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterYear}
                onChange={(e) => handleYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterSize}
                onChange={(e) => handleSizeFilter(e.target.value)}
              >
                <option value="">All Sizes</option>
                <option value="0-10">0-10 MB</option>
                <option value="10-20">10-20 MB</option>
                <option value="20-50">20-50 MB</option>
                <option value="50-100">50-100 MB</option>
              </select>
            </div>

            {/* Bulk Download Button */}
            <div className="col-md-2 d-grid">
              <button
                className="btn btn-success"
                onClick={() => setShowBulkModal(true)}
                disabled={pdfs.length === 0 || bulkLoading}
                title={
                  pdfs.length === 0 ? 'No PDFs to download' : 'Download all PDFs'
                }
              >
                {bulkLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    />
                    Downloading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-download me-2" />
                    Download All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && pdfs.length === 0 && totalCount === 0 && (
        <div className="alert alert-info text-center py-5">
          <h4>No PDFs Found</h4>
          <p>
            Start by extracting PDF metadata or load PDFs from an existing JSON file above.
          </p>
        </div>
      )}

      {/* No Results State */}
      {!loading && pdfs.length === 0 && totalCount > 0 && (
        <div className="alert alert-warning text-center">
          <p>No PDFs match your current filters. Try adjusting your search criteria.</p>
        </div>
      )}

      {/* PDF List */}
      {!loading && pdfs.length > 0 && (
        <div className="pdf-list">
          {pdfs.map(pdf => (
            <PDFListItem
              key={pdf.id || `${pdf.name}-${pdf.file_size}`}
              pdf={pdf}
              onDownloadSuccess={() => {
                // Optionally show a toast notification
                console.log(`PDF ${pdf.name} downloaded successfully`);
              }}
            />
          ))}
        </div>
      )}

      {/* Loading More Indicator */}
      {loading && page > 1 && (
        <div className="text-center py-4">
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
          />
          Loading more PDFs...
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <nav className="mt-5">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
            </li>

            {/* Page numbers */}
            {Array.from(
              { length: Math.min(5, totalPages) },
              (_, i) => Math.max(1, page - 2) + i
            ).map(p => (
              <li
                key={p}
                className={`page-item ${p === page ? 'active' : ''}`}
              >
                <button
                  className="page-link"
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              </li>
            ))}

            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
          <div className="text-center text-muted">
            Page {page} of {totalPages}
          </div>
        </nav>
      )}

      {/* Infinite Scroll Load More Button */}
      {!loading && hasMore && totalPages <= 10 && (
        <div className="text-center mt-5">
          <button
            className="btn btn-outline-primary"
            onClick={loadNextPage}
            disabled={loading}
          >
            Load More PDFs
          </button>
        </div>
      )}

      {/* Bulk Download Modal */}
      {showBulkModal && (
        <>
          <BulkDownloadModal
            pdfs={pdfs}
            loading={bulkLoading}
            onConfirm={handleBulkDownload}
            onCancel={() => {
              setShowBulkModal(false);
              resetState();
            }}
          />
        </>
      )}
    </div>
  );
};

export default PDFList;
