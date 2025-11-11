const User = require('../models/User');
const { query } = require('../config/database');

class UserController {
  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        profile: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          dateOfBirth: user.date_of_birth,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          lastLogin: user.last_login
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, phone } = req.body;
      
      const user = await User.update(req.user.id, {
        firstName,
        lastName,
        phone
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        profile: user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: error.message
      });
    }
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(req, res) {
    try {
      await User.deactivate(req.user.id);

      res.json({
        success: true,
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate account error:', error);
      res.status(500).json({
        error: 'Failed to deactivate account',
        message: error.message
      });
    }
  }

  /**
   * Get all addresses
   */
  async getAddresses(req, res) {
    try {
      const sql = `
        SELECT * FROM addresses 
        WHERE user_id = $1 
        ORDER BY is_default DESC, created_at DESC
      `;
      
      const result = await query(sql, [req.user.id]);

      res.json({
        success: true,
        addresses: result.rows
      });
    } catch (error) {
      console.error('Get addresses error:', error);
      res.status(500).json({
        error: 'Failed to get addresses',
        message: error.message
      });
    }
  }

  /**
   * Get specific address
   */
  async getAddress(req, res) {
    try {
      const { id } = req.params;
      
      const sql = `
        SELECT * FROM addresses 
        WHERE id = $1 AND user_id = $2
      `;
      
      const result = await query(sql, [id, req.user.id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Address not found'
        });
      }

      res.json({
        success: true,
        address: result.rows[0]
      });
    } catch (error) {
      console.error('Get address error:', error);
      res.status(500).json({
        error: 'Failed to get address',
        message: error.message
      });
    }
  }

  /**
   * Add new address
   */
  async addAddress(req, res) {
    try {
      const {
        addressType,
        streetAddress,
        city,
        state,
        zipCode,
        country,
        isDefault
      } = req.validatedBody;

      // If setting as default, unset other defaults
      if (isDefault) {
        await query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1 AND address_type = $2',
          [req.user.id, addressType]
        );
      }

      const sql = `
        INSERT INTO addresses (
          user_id, address_type, street_address, city, state, zip_code, country, is_default
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await query(sql, [
        req.user.id,
        addressType,
        streetAddress,
        city,
        state,
        zipCode,
        country || 'USA',
        isDefault || false
      ]);

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        address: result.rows[0]
      });
    } catch (error) {
      console.error('Add address error:', error);
      res.status(500).json({
        error: 'Failed to add address',
        message: error.message
      });
    }
  }

  /**
   * Update address
   */
  async updateAddress(req, res) {
    try {
      const { id } = req.params;
      const {
        streetAddress,
        city,
        state,
        zipCode,
        country,
        isDefault
      } = req.validatedBody;

      // Check if address belongs to user
      const checkResult = await query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Address not found'
        });
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await query(
          'UPDATE addresses SET is_default = false WHERE user_id = $1 AND address_type = $2 AND id != $3',
          [req.user.id, checkResult.rows[0].address_type, id]
        );
      }

      const sql = `
        UPDATE addresses 
        SET street_address = $1, city = $2, state = $3, zip_code = $4, 
            country = $5, is_default = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id = $7 AND user_id = $8
        RETURNING *
      `;

      const result = await query(sql, [
        streetAddress,
        city,
        state,
        zipCode,
        country || 'USA',
        isDefault || false,
        id,
        req.user.id
      ]);

      res.json({
        success: true,
        message: 'Address updated successfully',
        address: result.rows[0]
      });
    } catch (error) {
      console.error('Update address error:', error);
      res.status(500).json({
        error: 'Failed to update address',
        message: error.message
      });
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Address not found'
        });
      }

      res.json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({
        error: 'Failed to delete address',
        message: error.message
      });
    }
  }

  /**
   * Set default address
   */
  async setDefaultAddress(req, res) {
    try {
      const { id } = req.params;

      // Get address to check ownership and type
      const checkResult = await query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Address not found'
        });
      }

      const addressType = checkResult.rows[0].address_type;

      // Unset other defaults of same type
      await query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1 AND address_type = $2',
        [req.user.id, addressType]
      );

      // Set this address as default
      const result = await query(
        'UPDATE addresses SET is_default = true WHERE id = $1 RETURNING *',
        [id]
      );

      res.json({
        success: true,
        message: 'Default address updated',
        address: result.rows[0]
      });
    } catch (error) {
      console.error('Set default address error:', error);
      res.status(500).json({
        error: 'Failed to set default address',
        message: error.message
      });
    }
  }
}

module.exports = new UserController();
