import React, { useState } from 'react';
import { downloadPDFById } from '../../services/pdfService';
import { formatFileSize, truncateText } from '../../utils/formatters';

const PDFListItem = ({ pdf, onDownloadSuccess }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);

    try {
      const blob = await downloadPDFById(pdf.id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdf.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (onDownloadSuccess) {
        onDownloadSuccess(pdf.id);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setDownloadError('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pdf-list-item card mb-3 shadow-sm">
      <div className="card-body">
        <div className="row align-items-center">
          {/* PDF Name */}
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="card-title mb-1">
              <strong>{truncateText(pdf.name || 'Untitled', 40)}</strong>
            </h6>
            <small className="text-muted d-block">{pdf.source || 'Unknown Source'}</small>
          </div>

          {/* File Size */}
          <div className="col-md-2 mb-3 mb-md-0 text-md-center">
            <small className="text-muted d-block">Size</small>
            <span className="badge bg-info text-dark">
              {formatFileSize(pdf.file_size)}
            </span>
          </div>

          {/* Year */}
          <div className="col-md-2 mb-3 mb-md-0 text-md-center">
            <small className="text-muted d-block">Year</small>
            <span className="badge bg-secondary">
              {pdf.year || 'N/A'}
            </span>
          </div>

          {/* Additional Metadata */}
          {pdf.author && (
            <div className="col-md-2 mb-3 mb-md-0">
              <small className="text-muted d-block">Author</small>
              <small className="d-block">{truncateText(pdf.author, 30)}</small>
            </div>
          )}

          {/* Download Button */}
          <div className="col-md-2 d-grid gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleDownload}
              disabled={downloading}
              title="Download this PDF"
            >
              {downloading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Downloading...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {downloadError && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            <small>{downloadError}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFListItem;
