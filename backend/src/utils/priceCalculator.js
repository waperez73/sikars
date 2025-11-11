/**
 * Price Calculator Utility
 * Calculates total price for custom cigar orders
 */

const BASE_PRICE = parseFloat(process.env.BASE_PRICE) || 30.00;
const TAX_RATE = parseFloat(process.env.TAX_RATE) || 0.08;
const SHIPPING_COST_STANDARD = parseFloat(process.env.SHIPPING_COST_STANDARD) || 9.99;
const SHIPPING_COST_EXPRESS = parseFloat(process.env.SHIPPING_COST_EXPRESS) || 24.99;

/**
 * Calculate item price based on customizations
 * @param {Object} options - Product options
 * @returns {number} Item price
 */
const calculateItemPrice = (options) => {
  const {
    cigarSizePrice = 0,
    binderPrice = 0,
    flavorPrice = 0,
    bandStylePrice = 0,
    boxPrice = 0
  } = options;

  return BASE_PRICE + 
         cigarSizePrice + 
         binderPrice + 
         flavorPrice + 
         bandStylePrice + 
         boxPrice;
};

/**
 * Calculate order subtotal
 * @param {Array} items - Array of order items
 * @returns {number} Subtotal
 */
const calculateSubtotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity);
  }, 0);
};

/**
 * Calculate tax amount
 * @param {number} subtotal - Order subtotal
 * @returns {number} Tax amount
 */
const calculateTax = (subtotal) => {
  return subtotal * TAX_RATE;
};

/**
 * Get shipping cost based on method
 * @param {string} shippingMethod - 'standard' or 'express'
 * @returns {number} Shipping cost
 */
const getShippingCost = (shippingMethod = 'standard') => {
  return shippingMethod === 'express' 
    ? SHIPPING_COST_EXPRESS 
    : SHIPPING_COST_STANDARD;
};

/**
 * Calculate order total
 * @param {Object} orderData - Order information
 * @returns {Object} Price breakdown
 */
const calculateOrderTotal = (orderData) => {
  const { items, shippingMethod = 'standard' } = orderData;

  const subtotal = calculateSubtotal(items);
  const tax = calculateTax(subtotal);
  const shipping = getShippingCost(shippingMethod);
  const total = subtotal + tax + shipping;

  return {
    subtotal: roundToTwo(subtotal),
    tax: roundToTwo(tax),
    shipping: roundToTwo(shipping),
    total: roundToTwo(total)
  };
};

/**
 * Round number to 2 decimal places
 * @param {number} num - Number to round
 * @returns {number} Rounded number
 */
const roundToTwo = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Format price for display
 * @param {number} price - Price amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted price
 */
const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
};

/**
 * Validate price is within acceptable range
 * @param {number} price - Price to validate
 * @returns {boolean} Is valid
 */
const isValidPrice = (price) => {
  return price >= 0 && price <= 10000; // Max order $10,000
};

module.exports = {
  calculateItemPrice,
  calculateSubtotal,
  calculateTax,
  getShippingCost,
  calculateOrderTotal,
  roundToTwo,
  formatPrice,
  isValidPrice,
  BASE_PRICE,
  TAX_RATE,
  SHIPPING_COST_STANDARD,
  SHIPPING_COST_EXPRESS
};
