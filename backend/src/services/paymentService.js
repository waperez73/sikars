const { query, transaction } = require('../config/database');
const { processPayment, refundPayment } = require('../config/payment');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const processOrderPayment = async (paymentData) => {
  const { orderId, cardNumber, expirationDate, cvv, cardholderName, billingAddress } = paymentData;

  try {
    return await transaction(async (client) => {
      const orderResult = await client.query(
        'SELECT id, total_amount, order_number, user_id FROM orders WHERE id = $1',
        [orderId]
      );

      if (orderResult.rows.length === 0) {
        throw new AppError('Order not found', 404);
      }

      const order = orderResult.rows[0];
      const [firstName, ...lastNameParts] = cardholderName.split(' ');
      const lastName = lastNameParts.join(' ');

      const paymentResult = await processPayment({
        amount: parseFloat(order.total_amount),
        cardNumber,
        expirationDate,
        cvv,
        firstName,
        lastName,
        address: billingAddress.street,
        city: billingAddress.city,
        state: billingAddress.state,
        zip: billingAddress.zip,
        orderId: order.order_number
      });

      if (!paymentResult.success) {
        throw new AppError(paymentResult.errorMessage || 'Payment declined', 402);
      }

      const cardLastFour = cardNumber.slice(-4);
      
      await client.query(
        `INSERT INTO payments (
          order_id, amount, currency, payment_method,
          transaction_id, processor, card_last_four, cardholder_name,
          billing_street, billing_city, billing_state, billing_zip,
          status, processed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)`,
        [
          orderId,
          order.total_amount,
          'USD',
          'credit_card',
          paymentResult.transactionId,
          'authorize_net',
          cardLastFour,
          cardholderName,
          billingAddress.street,
          billingAddress.city,
          billingAddress.state,
          billingAddress.zip,
          'completed'
        ]
      );

      await client.query(
        `UPDATE orders SET payment_status = 'paid', status = 'confirmed', 
         confirmed_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [orderId]
      );

      logger.info(`Payment processed for order ${order.order_number}`);

      return {
        success: true,
        transactionId: paymentResult.transactionId,
        orderId: order.id,
        orderNumber: order.order_number
      };
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Payment processing error:', error);
    throw new AppError('Payment processing failed', 500);
  }
};

module.exports = { processOrderPayment, refundPayment };