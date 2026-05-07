/**
 * Common Utility Functions
 */

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Trim and remove extra spaces
export const trimSpace = (str) => {
  return str.trim().replace(/\s+/g, ' ');
};

// Check if all values are equal
export const allEqual = (arr) => {
  return arr.every((val) => val === arr[0]);
};

// Get first n items from array
export const getFirst = (arr, n) => {
  return arr.slice(0, n);
};

// Get last n items from array
export const getLast = (arr, n) => {
  return arr.slice(-n);
};
