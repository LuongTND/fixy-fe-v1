/**
 * Validation Utilities
 */

// Validate email
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Validate required field
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Validate min length
export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

// Validate max length
export const validateMaxLength = (value, max) => {
  return value && value.length <= max;
};

// Validate phone number (Vietnam)
export const validatePhone = (phone) => {
  const re = /^(0|\+84)[0-9]{9}$/;
  return re.test(phone);
};

// Validate URL
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Check if value is empty
export const isEmpty = (value) => {
  return value === null || value === undefined || value === '';
};
