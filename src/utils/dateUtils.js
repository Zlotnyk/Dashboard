// Date utility functions for consistent date handling across the application

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  // getMonth() is 0-indexed, so add 1 and pad with leading zero if needed
  const month = String(d.getMonth() + 1).padStart(2, '0');
  // getDate() returns the day of month, pad with leading zero if needed
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Parse YYYY-MM-DD string to Date object preserving local date
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object set to midnight on the specified date
 */
export const parseYYYYMMDDToDate = (dateString) => {
  if (!dateString) return new Date();
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date;
};

/**
 * Normalize date for comparison (set to midnight UTC)
 * @param {Date} date - The date to normalize
 * @returns {number} UTC timestamp at midnight
 */
export const normalizeDateForComparison = (date) => {
  const d = new Date(date);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Compare two dates (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if dates are the same day
 */
export const areDatesEqual = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getDate() === d2.getDate();
};

/**
 * Check if date1 is before or equal to date2 (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if date1 is before or equal to date2
 */
export const isDateBeforeOrEqual = (date1, date2) => {
  const d1UTC = normalizeDateForComparison(date1);
  const d2UTC = normalizeDateForComparison(date2);
  
  return d1UTC <= d2UTC;
};

/**
 * Check if date1 is after or equal to date2 (ignoring time)
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if date1 is after or equal to date2
 */
export const isDateAfterOrEqual = (date1, date2) => {
  const d1UTC = normalizeDateForComparison(date1);
  const d2UTC = normalizeDateForComparison(date2);
  
  return d1UTC >= d2UTC;
};