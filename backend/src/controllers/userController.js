/**
 * User Controller (Backend)
 * Handles user profile and address management
 * 
 * File: backend/src/controllers/userController.js
 */

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Get user profile
 * GET /api/users/profile
 */
exports.getProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;

    const query = `
      SELECT id, email, first_name, last_name, phone, created_at, last_login, email_verified
      FROM users
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        emailVerified: user.email_verified
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const { first_name, last_name, phone } = req.body;

    // Validation
    const errors = [];

    if (first_name && first_name.trim().length < 2) {
      errors.push({ field: 'first_name', message: 'First name must be at least 2 characters' });
    }

    if (last_name && last_name.trim().length < 2) {
      errors.push({ field: 'last_name', message: 'Last name must be at least 2 characters' });
    }

    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (first_name) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(first_name.trim());
    }

    if (last_name) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(last_name.trim());
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone ? phone.trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, updated_at
    `;

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Get user addresses
 * GET /api/users/addresses
 */
exports.getAddresses = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;

    const query = `
      SELECT id, address_type, street_address, city, state, zip_code, country, is_default, created_at
      FROM addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;
    
    const result = await client.query(query, [userId]);

    res.status(200).json({
      success: true,
      addresses: result.rows.map(addr => ({
        id: addr.id,
        type: addr.address_type,
        street: addr.street_address,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zip_code,
        country: addr.country,
        isDefault: addr.is_default,
        createdAt: addr.created_at
      }))
    });

  } catch (error) {
    console.error('Get addresses error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve addresses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Add new address
 * POST /api/users/addresses
 */
exports.addAddress = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    // Validation
    const errors = [];

    if (!type || !['shipping', 'billing'].includes(type)) {
      errors.push({ field: 'type', message: 'Type must be either "shipping" or "billing"' });
    }

    if (!street || !street.trim()) {
      errors.push({ field: 'street', message: 'Street address is required' });
    }

    if (!city || !city.trim()) {
      errors.push({ field: 'city', message: 'City is required' });
    }

    if (!state || !state.trim()) {
      errors.push({ field: 'state', message: 'State is required' });
    }

    if (!zipCode || !zipCode.trim()) {
      errors.push({ field: 'zipCode', message: 'ZIP code is required' });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    await client.query('BEGIN');

    // If this is set as default, unset other defaults
    if (isDefault) {
      await client.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1 AND address_type = $2',
        [userId, type]
      );
    }

    // Insert new address
    const insertQuery = `
      INSERT INTO addresses (user_id, address_type, street_address, city, state, zip_code, country, is_default, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, address_type, street_address, city, state, zip_code, country, is_default, created_at
    `;

    const result = await client.query(insertQuery, [
      userId,
      type,
      street.trim(),
      city.trim(),
      state.trim(),
      zipCode.trim(),
      country || 'USA',
      isDefault || false
    ]);

    await client.query('COMMIT');

    const address = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: {
        id: address.id,
        type: address.address_type,
        street: address.street_address,
        city: address.city,
        state: address.state,
        zipCode: address.zip_code,
        country: address.country,
        isDefault: address.is_default,
        createdAt: address.created_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add address error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to add address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Update address
 * PUT /api/users/addresses/:id
 */
exports.updateAddress = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    // Verify address belongs to user
    const checkQuery = 'SELECT id, address_type FROM addresses WHERE id = $1 AND user_id = $2';
    const checkResult = await client.query(checkQuery, [addressId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const addressType = checkResult.rows[0].address_type;

    await client.query('BEGIN');

    // If setting as default, unset other defaults
    if (isDefault) {
      await client.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1 AND address_type = $2 AND id != $3',
        [userId, addressType, addressId]
      );
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (street) {
      updates.push(`street_address = $${paramCount++}`);
      values.push(street.trim());
    }

    if (city) {
      updates.push(`city = $${paramCount++}`);
      values.push(city.trim());
    }

    if (state) {
      updates.push(`state = $${paramCount++}`);
      values.push(state.trim());
    }

    if (zipCode) {
      updates.push(`zip_code = $${paramCount++}`);
      values.push(zipCode.trim());
    }

    if (country) {
      updates.push(`country = $${paramCount++}`);
      values.push(country.trim());
    }

    if (isDefault !== undefined) {
      updates.push(`is_default = $${paramCount++}`);
      values.push(isDefault);
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(addressId, userId);

    const updateQuery = `
      UPDATE addresses
      SET ${updates.join(', ')}
      WHERE id = $${paramCount++} AND user_id = $${paramCount}
      RETURNING id, address_type, street_address, city, state, zip_code, country, is_default, updated_at
    `;

    const result = await client.query(updateQuery, values);

    await client.query('COMMIT');

    const address = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address: {
        id: address.id,
        type: address.address_type,
        street: address.street_address,
        city: address.city,
        state: address.state,
        zipCode: address.zip_code,
        country: address.country,
        isDefault: address.is_default,
        updatedAt: address.updated_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update address error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Delete address
 * DELETE /api/users/addresses/:id
 */
exports.deleteAddress = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;

    const deleteQuery = 'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id';
    const result = await client.query(deleteQuery, [addressId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });

  } catch (error) {
    console.error('Delete address error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};