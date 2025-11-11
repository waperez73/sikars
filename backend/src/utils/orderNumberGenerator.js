const { format } = require('date-fns');

/**
 * Generate unique order number
 * Format: SKR-YYYYMMDD-XXXXX
 * Example: SKR-20250103-A1B2C
 * @returns {string} Order number
 */
const generateOrderNumber = () => {
  const date = format(new Date(), 'yyyyMMdd');
  const random = generateRandomString(5);
  return `SKR-${date}-${random}`;
};

/**
 * Generate random alphanumeric string
 * @param {number} length - String length
 * @returns {string} Random string
 */
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate tracking number
 * Format: SKR-TRK-XXXXXXXXXXXX
 * @returns {string} Tracking number
 */
const generateTrackingNumber = () => {
  const random = generateRandomString(12);
  return `SKR-TRK-${random}`;
};

/**
 * Validate order number format
 * @param {string} orderNumber
 * @returns {boolean}
 */
const isValidOrderNumber = (orderNumber) => {
  const pattern = /^SKR-\d{8}-[A-Z0-9]{5}$/;
  return pattern.test(orderNumber);
};

module.exports = {
  generateOrderNumber,
  generateTrackingNumber,
  generateRandomString,
  isValidOrderNumber
};
