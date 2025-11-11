const { query } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all cigar sizes
 */
const getCigarSizes = async () => {
  try {
    const result = await query(
      `SELECT id, name, value, base_price, length_inches, ring_gauge, 
        description, image_url, sort_order
       FROM cigar_sizes
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      value: row.value,
      price: parseFloat(row.base_price),
      length: parseFloat(row.length_inches),
      ringGauge: row.ring_gauge,
      description: row.description,
      image: row.image_url
    }));
  } catch (error) {
    logger.error('Get cigar sizes error:', error);
    throw new AppError('Failed to get cigar sizes', 500);
  }
};

/**
 * Get all binders
 */
const getBinders = async () => {
  try {
    const result = await query(
      `SELECT id, name, value, price_modifier, description, image_url, sort_order
       FROM binders
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      value: row.value,
      price: parseFloat(row.price_modifier),
      description: row.description,
      image: row.image_url
    }));
  } catch (error) {
    logger.error('Get binders error:', error);
    throw new AppError('Failed to get binders', 500);
  }
};

/**
 * Get all flavors
 */
const getFlavors = async () => {
  try {
    const result = await query(
      `SELECT id, name, value, price_modifier, strength_level, 
        description, image_url, sort_order
       FROM flavors
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      value: row.value,
      price: parseFloat(row.price_modifier),
      strength: row.strength_level,
      description: row.description,
      image: row.image_url
    }));
  } catch (error) {
    logger.error('Get flavors error:', error);
    throw new AppError('Failed to get flavors', 500);
  }
};

/**
 * Get all band styles
 */
const getBandStyles = async () => {
  try {
    const result = await query(
      `SELECT id, name, value, price_modifier, description, image_url, sort_order
       FROM band_styles
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      value: row.value,
      price: parseFloat(row.price_modifier),
      description: row.description,
      image: row.image_url
    }));
  } catch (error) {
    logger.error('Get band styles error:', error);
    throw new AppError('Failed to get band styles', 500);
  }
};

/**
 * Get all box types
 */
const getBoxTypes = async () => {
  try {
    const result = await query(
      `SELECT id, name, value, base_price, capacity, material, 
        description, image_url, sort_order
       FROM box_types
       WHERE is_active = true
       ORDER BY sort_order ASC`
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      value: row.value,
      price: parseFloat(row.base_price),
      capacity: row.capacity,
      material: row.material,
      description: row.description,
      image: row.image_url
    }));
  } catch (error) {
    logger.error('Get box types error:', error);
    throw new AppError('Failed to get box types', 500);
  }
};

/**
 * Get all products (combined)
 */
const getAllProducts = async () => {
  try {
    const [sizes, binders, flavors, bands, boxes] = await Promise.all([
      getCigarSizes(),
      getBinders(),
      getFlavors(),
      getBandStyles(),
      getBoxTypes()
    ]);

    return {
      sizes,
      binders,
      flavors,
      bandStyles: bands,
      boxes
    };
  } catch (error) {
    logger.error('Get all products error:', error);
    throw new AppError('Failed to get products', 500);
  }
};

module.exports = {
  getCigarSizes,
  getBinders,
  getFlavors,
  getBandStyles,
  getBoxTypes,
  getAllProducts
};
