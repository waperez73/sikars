/**
 * Authentication Controller (Backend)
 * Handles user registration and login
 * 
 * File: backend/src/controllers/authController.js
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // Validation
    const errors = [];

    // Email validation
    if (!email || !email.trim()) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    // Password validation
    if (!password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain uppercase, lowercase, and number' });
    }

    // Name validation
    if (!first_name || !first_name.trim()) {
      errors.push({ field: 'first_name', message: 'First name is required' });
    }

    if (!last_name || !last_name.trim()) {
      errors.push({ field: 'last_name', message: 'Last name is required' });
    }

    // Phone validation (if provided)
    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }

    // Return validation errors
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM users WHERE email = $1';
    const existingUser = await client.query(checkUserQuery, [email.toLowerCase()]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        errors: [{ field: 'email', message: 'Email already registered' }]
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertUserQuery = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, first_name, last_name, phone, created_at
    `;

    const result = await client.query(insertUserQuery, [
      email.toLowerCase(),
      password_hash,
      first_name.trim(),
      last_name.trim(),
      phone ? phone.trim() : null
    ]);

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Log the registration in audit log (optional)
    const auditLogQuery = `
      INSERT INTO audit_log (user_id, user_type, action, entity_type, entity_id, ip_address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    await client.query(auditLogQuery, [
      newUser.id,
      'customer',
      'register',
      'user',
      newUser.id,
      req.ip
    ]);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        phone: newUser.phone,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Registration failed due to a server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const findUserQuery = `
      SELECT id, email, password_hash, first_name, last_name, phone, is_active
      FROM users
      WHERE email = $1
    `;
    const result = await client.query(findUserQuery, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    const updateLoginQuery = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await client.query(updateLoginQuery, [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Log the login in audit log (optional)
    const auditLogQuery = `
      INSERT INTO audit_log (user_id, user_type, action, entity_type, entity_id, ip_address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    await client.query(auditLogQuery, [
      user.id,
      'customer',
      'login',
      'user',
      user.id,
      req.ip
    ]);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Login failed due to a server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Verify JWT token
 * GET /api/auth/verify
 */
exports.verifyToken = async (req, res) => {
  try {
    // Token is already verified by auth middleware
    // Just return user info
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

/**
 * Logout (optional - mainly handled on frontend)
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    // Log the logout in audit log
    const client = await pool.connect();
    const auditLogQuery = `
      INSERT INTO audit_log (user_id, user_type, action, entity_type, entity_id, ip_address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    await client.query(auditLogQuery, [
      req.user.userId,
      'customer',
      'logout',
      'user',
      req.user.userId,
      req.ip
    ]);
    client.release();

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};
