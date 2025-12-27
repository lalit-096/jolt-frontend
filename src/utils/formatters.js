// Format file size to MB with 2 decimal places
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};

// Format date to readable format
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
};

// Truncate string with ellipsis
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

// Get size range label
export const getSizeRangeLabel = (minMB, maxMB) => {
  if (maxMB === null) return `${minMB}+ MB`;
  return `${minMB}-${maxMB} MB`;
};

// Sanitize filename
export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
};

// Get unique years from PDFs
export const getUniqueYears = (pdfs) => {
  const years = new Set();
  pdfs.forEach(pdf => {
    if (pdf.year) {
      years.add(pdf.year);
    }
  });
  return Array.from(years).sort((a, b) => b - a);
};

// Get size statistics for PDFs
export const getSizeRanges = (pdfs) => {
  const ranges = [
    { min: 0, max: 10, label: '0-10 MB' },
    { min: 10, max: 20, label: '10-20 MB' },
    { min: 20, max: 50, label: '20-50 MB' },
    { min: 50, max: 100, label: '50-100 MB' },
    { min: 100, max: null, label: '100+ MB' },
  ];

  return ranges.map(range => ({
    ...range,
    count: pdfs.filter(pdf => {
      const sizeMB = (pdf.file_size || 0) / (1024 * 1024);
      if (range.max === null) return sizeMB >= range.min;
      return sizeMB >= range.min && sizeMB < range.max;
    }).length,
  }));
};
