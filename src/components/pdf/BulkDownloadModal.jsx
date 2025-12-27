import React, { useState, useEffect } from 'react';
import { getSizeRanges, getUniqueYears } from '../../utils/formatters';

const BulkDownloadModal = ({ pdfs, onConfirm, onCancel, loading }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  const sizeRanges = getSizeRanges(pdfs);
  const years = getUniqueYears(pdfs);

  useEffect(() => {
    setError(null);
  }, [selectedOption]);

  const handleConfirm = () => {
    if (!selectedOption) {
      setError('Please select a grouping option');
      return;
    }

    onConfirm(selectedOption);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header border-bottom">
            <h5 className="modal-title">
              <i className="bi bi-download me-2" />
              Download All PDFs
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
              disabled={loading}
            />
          </div>

          <div className="modal-body">
            <p className="text-muted mb-4">
              Select how you want to organize the PDFs in the download:
            </p>

            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                <small>{error}</small>
              </div>
            )}

            <div className="grouping-options">
              {/* Group by Size */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-diagram-3 me-2" />
                  Group by Size
                </h6>
                <div className="ps-3">
                  {sizeRanges.map((range) => (
                    <div className="form-check mb-2" key={`size-${range.label}`}>
                      <input
                        className="form-check-input"
                        type="radio"
                        id={`size-${range.label}`}
                        name="grouping"
                        value={`size_${range.min}_${range.max}`}
                        checked={selectedOption === `size_${range.min}_${range.max}`}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`size-${range.label}`}
                      >
                        {range.label}
                        <span className="badge bg-secondary ms-2">
                          {range.count} PDF{range.count !== 1 ? 's' : ''}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group by Name */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-sort-alpha-down me-2" />
                  Group by Name
                </h6>
                <div className="ps-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      id="name-alphabetical"
                      name="grouping"
                      value="name"
                      checked={selectedOption === 'name'}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="name-alphabetical">
                      Alphabetical Order (A-Z)
                      <span className="badge bg-secondary ms-2">
                        {pdfs.length} PDF{pdfs.length !== 1 ? 's' : ''}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Group by Year */}
              <div className="mb-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-calendar me-2" />
                  Group by Year
                </h6>
                <div className="ps-3">
                  {years.length > 0 ? (
                    years.map((year) => {
                      const count = pdfs.filter(pdf => pdf.year === year).length;
                      return (
                        <div className="form-check mb-2" key={`year-${year}`}>
                          <input
                            className="form-check-input"
                            type="radio"
                            id={`year-${year}`}
                            name="grouping"
                            value={`year_${year}`}
                            checked={selectedOption === `year_${year}`}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            disabled={loading}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`year-${year}`}
                          >
                            {year}
                            <span className="badge bg-secondary ms-2">
                              {count} PDF{count !== 1 ? 's' : ''}
                            </span>
                          </label>
                        </div>
                      );
                    })
                  ) : (
                    <small className="text-muted">No year information available</small>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={loading || !selectedOption}
            >
              {loading ? (
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
      </div>
    </div>
  );
};

export default BulkDownloadModal;
