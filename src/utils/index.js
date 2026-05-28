/**
 * Utility functions for common tasks
 */

// Check if value is empty
export const isEmpty = (value) => {
  return value === null || value === undefined || value === '';
};


// Export all utilities
export * from './format';
export * from './validate';
export * from './helpers';
export * from './booking';
export * from './voucher';
