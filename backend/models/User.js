const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Create a new user
   */
  static async create({ email, password, firstName, lastName, phone, dateOfBirth }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const sql = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, phone, date_of_birth, created_at, is_active, email_verified
    `;
    
    const result = await query(sql, [
      email.toLowerCase(),
      hashedPassword,
      firstName,
      lastName,
      phone,
      dateOfBirth
    ]);
    
    return result.rows[0];
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const sql = `
      SELECT * FROM users WHERE email = $1
    `;
    const result = await query(sql, [email.toLowerCase()]);
    return result.rows[0];
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const sql = `
      SELECT id, email, first_name, last_name, phone, date_of_birth, 
             created_at, updated_at, last_login, is_active, email_verified
      FROM users WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login
   */
  static async updateLastLogin(userId) {
    const sql = `
      UPDATE users SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await query(sql, [userId]);
  }

  /**
   * Update user profile
   */
  static async update(userId, { firstName, lastName, phone }) {
    const sql = `
      UPDATE users 
      SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, email, first_name, last_name, phone, date_of_birth
    `;
    const result = await query(sql, [firstName, lastName, phone, userId]);
    return result.rows[0];
  }

  /**
   * Verify email
   */
  static async verifyEmail(userId) {
    const sql = `
      UPDATE users SET email_verified = true WHERE id = $1
    `;
    await query(sql, [userId]);
  }

  /**
   * Check if user is over 21
   */
  static calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validate age (must be 21+)
   */
  static isAgeValid(dateOfBirth) {
    const age = this.calculateAge(dateOfBirth);
    return age >= 21;
  }

  /**
   * Deactivate user account
   */
  static async deactivate(userId) {
    const sql = `
      UPDATE users SET is_active = false WHERE id = $1
    `;
    await query(sql, [userId]);
  }
}

module.exports = User;
