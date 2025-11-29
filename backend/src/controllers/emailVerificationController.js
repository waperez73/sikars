/**
 * Email Verification Controller (Backend)
 * Handles email verification and resending verification emails
 * 
 * File: backend/src/controllers/emailVerificationController.js
 */

const { Pool } = require('pg');
const crypto = require('crypto');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Email service (you'll need to implement this with SendGrid, AWS SES, etc.)
const sendVerificationEmail = async (email, token, firstName) => {
  // TODO: Implement with your email service
  // For now, we'll just log it
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  
  console.log(`
    ========================================
    EMAIL VERIFICATION
    ========================================
    To: ${email}
    Name: ${firstName}
    Verification URL: ${verificationUrl}
    ========================================
  `);

  // In production, use SendGrid or similar:
  /*
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: 'Verify Your Sikars Account',
    html: `
      <h1>Welcome to Sikars, ${firstName}!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  };
  
  await sgMail.send(msg);
  */
  
  return true;
};

/**
 * Send verification email
 * POST /api/auth/send-verification
 */
exports.sendVerification = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    
    // Get user details
    const userQuery = 'SELECT email, first_name, email_verified FROM users WHERE id = $1';
    const userResult = await client.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const user = userResult.rows[0];
    
    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }
    
    // Check for existing token that's still valid
    const existingTokenQuery = `
      SELECT * FROM email_verification_tokens 
      WHERE user_id = $1 
      AND expires_at > NOW() 
      AND used = false
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const existingTokenResult = await client.query(existingTokenQuery, [userId]);
    
    // If a valid token exists and was created less than 1 minute ago, prevent spam
    if (existingTokenResult.rows.length > 0) {
      const lastToken = existingTokenResult.rows[0];
      const oneMinuteAgo = new Date(Date.now() - 60000);
      
      if (new Date(lastToken.created_at) > oneMinuteAgo) {
        return res.status(429).json({
          success: false,
          message: 'Verification email already sent. Please wait before requesting another.'
        });
      }
    }
    
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store token in database
    const insertTokenQuery = `
      INSERT INTO email_verification_tokens (user_id, token, expires_at, created_at)
      VALUES ($1, $2, $3, NOW())
    `;
    await client.query(insertTokenQuery, [userId, token, expiresAt]);
    
    // Send verification email
    await sendVerificationEmail(user.email, token, user.first_name);
    
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    console.error('Send verification error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Verify email with token
 * POST /api/auth/verify-email
 */
exports.verifyEmail = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }
    
    await client.query('BEGIN');
    
    // Find token
    const tokenQuery = `
      SELECT * FROM email_verification_tokens 
      WHERE token = $1 
      AND used = false
    `;
    const tokenResult = await client.query(tokenQuery, [token]);
    
    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    const verificationToken = tokenResult.rows[0];
    
    // Check if token is expired
    if (new Date(verificationToken.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }
    
    // Update user as verified
    const updateUserQuery = `
      UPDATE users 
      SET email_verified = true, updated_at = NOW() 
      WHERE id = $1
    `;
    await client.query(updateUserQuery, [verificationToken.user_id]);
    
    // Mark token as used
    const updateTokenQuery = `
      UPDATE email_verification_tokens 
      SET used = true 
      WHERE token = $1
    `;
    await client.query(updateTokenQuery, [token]);
    
    await client.query('COMMIT');
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verify email error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to verify email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Check verification status
 * GET /api/auth/verification-status
 */
exports.checkVerificationStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    
    const query = 'SELECT email_verified FROM users WHERE id = $1';
    const result = await client.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      verified: result.rows[0].email_verified
    });
    
  } catch (error) {
    console.error('Check verification status error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to check verification status'
    });
  } finally {
    client.release();
  }
};
