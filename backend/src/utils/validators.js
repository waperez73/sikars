const Joi = require('joi');

/**
 * Validation schemas using Joi
 */

// User Registration Schema
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'any.required': 'First name is required'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'any.required': 'Last name is required'
    }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
});

// Login Schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .required()
});

// Address Schema
const addressSchema = Joi.object({
  addressType: Joi.string()
    .valid('shipping', 'billing')
    .required(),
  streetAddress: Joi.string()
    .required(),
  city: Joi.string()
    .required(),
  state: Joi.string()
    .required(),
  zipCode: Joi.string()
    .pattern(/^\d{5}(-\d{4})?$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid ZIP code'
    }),
  country: Joi.string()
    .default('USA'),
  isDefault: Joi.boolean()
    .default(false)
});

// Order Item Schema
const orderItemSchema = Joi.object({
  cigarSize: Joi.string()
    .valid('robusto', 'gordo', 'churchill', 'belicoso')
    .required(),
  binder: Joi.string()
    .valid('habano', 'maduro', 'connecticut')
    .required(),
  flavor: Joi.string()
    .valid('light', 'medium', 'strong')
    .required(),
  bandStyle: Joi.string()
    .valid('beveled', 'round', 'dome', 'square')
    .required(),
  box: Joi.string()
    .valid('classic', 'rustic', 'modern')
    .required(),
  bandText: Joi.string()
    .max(18)
    .allow('')
    .optional(),
  engraving: Joi.string()
    .max(20)
    .allow('')
    .optional(),
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .required()
});

// Order Schema
const orderSchema = Joi.object({
  items: Joi.array()
    .items(orderItemSchema)
    .min(1)
    .required(),
  shippingAddressId: Joi.string()
    .uuid()
    .required(),
  billingAddressId: Joi.string()
    .uuid()
    .required(),
  shippingMethod: Joi.string()
    .valid('standard', 'express')
    .default('standard'),
  customerNotes: Joi.string()
    .max(500)
    .allow('')
    .optional()
});

// Payment Schema
const paymentSchema = Joi.object({
  orderId: Joi.string()
    .uuid()
    .required(),
  cardNumber: Joi.string()
    .creditCard()
    .required()
    .messages({
      'string.creditCard': 'Please provide a valid credit card number'
    }),
  expirationDate: Joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Expiration date must be in MM/YY format'
    }),
  cvv: Joi.string()
    .pattern(/^\d{3,4}$/)
    .required()
    .messages({
      'string.pattern.base': 'CVV must be 3 or 4 digits'
    }),
  cardholderName: Joi.string()
    .required(),
  billingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required()
  }).required()
});

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate UUID
 * @param {string} uuid
 * @returns {boolean}
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitize string input
 * @param {string} input
 * @returns {string}
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

module.exports = {
  registerSchema,
  loginSchema,
  addressSchema,
  orderItemSchema,
  orderSchema,
  paymentSchema,
  isValidEmail,
  isValidPhone,
  isValidUUID,
  sanitizeString
};
