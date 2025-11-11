const { query, transaction } = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../config/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
const register = async (userData) => {
  const { email, password, firstName, lastName, phone } = userData;

  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, created_at`,
      [email.toLowerCase(), passwordHash, firstName, lastName, phone || null]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken({ userId: user.id });

    logger.info(`New user registered: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      },
      token
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Registration error:', error);
    throw new AppError('Registration failed', 500);
  }
};

/**
 * Login user
 */
const login = async (credentials) => {
  const { email, password } = credentials;

  try {
    // Get user
    const result = await query(
      `SELECT id, email, password_hash, first_name, last_name, is_active
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      throw new AppError('Account has been deactivated', 403);
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken({ userId: user.id });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Login error:', error);
    throw new AppError('Login failed', 500);
  }
};

/**
 * Get user profile
 */
const getProfile = async (userId) => {
  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone, created_at, last_login
       FROM users
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Get profile error:', error);
    throw new AppError('Failed to get profile', 500);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
  const { firstName, lastName, phone } = updates;

  try {
    const result = await query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND is_active = true
       RETURNING id, email, first_name, last_name, phone, updated_at`,
      [firstName, lastName, phone, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const user = result.rows[0];

    logger.info(`User profile updated: ${user.email}`);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      updatedAt: user.updated_at
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Update profile error:', error);
    throw new AppError('Failed to update profile', 500);
  }
};

/**
 * Change password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, result.rows[0].password_hash);

    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newPasswordHash, userId]
    );

    logger.info(`Password changed for user ID: ${userId}`);

    return { message: 'Password changed successfully' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Change password error:', error);
    throw new AppError('Failed to change password', 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
