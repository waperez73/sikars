const { query } = require('../config/database');

class Payment {
  /**
   * Create payment record
   */
  static async create(paymentData) {
    const {
      orderId,
      amount,
      currency,
      paymentMethod,
      transactionId,
      processor,
      cardLastFour,
      cardType,
      cardholderName,
      billingStreet,
      billingCity,
      billingState,
      billingZip,
      status
    } = paymentData;

    const sql = `
      INSERT INTO payments (
        order_id, amount, currency, payment_method, transaction_id, processor,
        card_last_four, card_type, cardholder_name,
        billing_street, billing_city, billing_state, billing_zip,
        status, processed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
              CASE WHEN $14 = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END)
      RETURNING *
    `;

    const result = await query(sql, [
      orderId,
      amount,
      currency || 'USD',
      paymentMethod,
      transactionId,
      processor,
      cardLastFour,
      cardType,
      cardholderName,
      billingStreet,
      billingCity,
      billingState,
      billingZip,
      status
    ]);

    return result.rows[0];
  }

  /**
   * Find payment by transaction ID
   */
  static async findByTransactionId(transactionId) {
    const sql = `
      SELECT * FROM payments WHERE transaction_id = $1
    `;
    const result = await query(sql, [transactionId]);
    return result.rows[0];
  }

  /**
   * Find payments by order
   */
  static async findByOrder(orderId) {
    const sql = `
      SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC
    `;
    const result = await query(sql, [orderId]);
    return result.rows;
  }

  /**
   * Update payment status
   */
  static async updateStatus(paymentId, status, errorMessage = null) {
    const sql = `
      UPDATE payments 
      SET status = $1, 
          error_message = $2,
          processed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE processed_at END
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await query(sql, [status, errorMessage, paymentId]);
    return result.rows[0];
  }

  /**
   * Process refund
   */
  static async refund(paymentId, refundAmount, refundReason) {
    const sql = `
      UPDATE payments 
      SET status = 'refunded',
          refund_amount = $1,
          refund_reason = $2,
          refunded_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await query(sql, [refundAmount, refundReason, paymentId]);
    return result.rows[0];
  }

  /**
   * Get payment statistics (admin)
   */
  static async getStatistics(dateFrom, dateTo) {
    const sql = `
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COUNT(CASE WHEN status = 'refunded' THEN 1 END) as refunded_payments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
        SUM(CASE WHEN status = 'refunded' THEN refund_amount ELSE 0 END) as total_refunded,
        AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as average_transaction
      FROM payments
      WHERE created_at BETWEEN $1 AND $2
    `;
    
    const result = await query(sql, [dateFrom, dateTo]);
    return result.rows[0];
  }
}

module.exports = Payment;
