/**
 * Utility functions to sanitize inputs before writing to LocalStorage,
 * rendering to DOM, or constructing URLs, preventing XSS and injection vulnerabilities.
 */

export const sanitizeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeData = (data) => {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    return sanitizeHTML(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }
  if (typeof data === 'object') {
    const sanitized = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeData(data[key]);
      }
    }
    return sanitized;
  }
  return data;
};

export const sanitizeUrlParam = (param) => {
  if (param === null || param === undefined) return '';
  return encodeURIComponent(String(param).trim());
};
