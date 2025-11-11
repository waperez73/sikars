const axios = require('axios');
const logger = require('../utils/logger');

const AUTHORIZE_NET_API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID;
const AUTHORIZE_NET_TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
const AUTHORIZE_NET_ENV = process.env.AUTHORIZE_NET_ENV || 'sandbox';

// API endpoint based on environment
const API_URL = AUTHORIZE_NET_ENV === 'production'
  ? 'https://api.authorize.net/xml/v1/request.api'
  : 'https://apitest.authorize.net/xml/v1/request.api';

/**
 * Process payment through Authorize.net
 * @param {Object} paymentData - Payment information
 * @returns {Promise<Object>} Payment result
 */
const processPayment = async (paymentData) => {
  const {
    amount,
    cardNumber,
    expirationDate,
    cvv,
    firstName,
    lastName,
    address,
    city,
    state,
    zip,
    orderId
  } = paymentData;

  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: AUTHORIZE_NET_API_LOGIN_ID,
        transactionKey: AUTHORIZE_NET_TRANSACTION_KEY
      },
      refId: orderId,
      transactionRequest: {
        transactionType: 'authCaptureTransaction',
        amount: amount.toFixed(2),
        payment: {
          creditCard: {
            cardNumber: cardNumber,
            expirationDate: expirationDate,
            cardCode: cvv
          }
        },
        billTo: {
          firstName: firstName,
          lastName: lastName,
          address: address,
          city: city,
          state: state,
          zip: zip
        },
        order: {
          invoiceNumber: orderId,
          description: 'Sikars Custom Cigar Order'
        }
      }
    }
  };

  try {
    const response = await axios.post(API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.transactionResponse;

    if (result.responseCode === '1') {
      // Approved
      return {
        success: true,
        transactionId: result.transId,
        authCode: result.authCode,
        message: result.messages[0].description
      };
    } else {
      // Declined or Error
      return {
        success: false,
        errorCode: result.errors?.[0]?.errorCode,
        errorMessage: result.errors?.[0]?.errorText || 'Payment declined'
      };
    }
  } catch (error) {
    logger.error('Authorize.net payment error:', error);
    throw new Error('Payment processing failed');
  }
};

/**
 * Refund a transaction
 * @param {string} transactionId - Original transaction ID
 * @param {number} amount - Refund amount
 * @param {string} cardLastFour - Last 4 digits of card
 * @returns {Promise<Object>} Refund result
 */
const refundPayment = async (transactionId, amount, cardLastFour) => {
  const requestBody = {
    createTransactionRequest: {
      merchantAuthentication: {
        name: AUTHORIZE_NET_API_LOGIN_ID,
        transactionKey: AUTHORIZE_NET_TRANSACTION_KEY
      },
      transactionRequest: {
        transactionType: 'refundTransaction',
        amount: amount.toFixed(2),
        payment: {
          creditCard: {
            cardNumber: cardLastFour,
            expirationDate: 'XXXX'
          }
        },
        refTransId: transactionId
      }
    }
  };

  try {
    const response = await axios.post(API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.transactionResponse;

    return {
      success: result.responseCode === '1',
      transactionId: result.transId,
      message: result.messages?.[0]?.description || 'Refund processed'
    };
  } catch (error) {
    logger.error('Authorize.net refund error:', error);
    throw new Error('Refund processing failed');
  }
};

module.exports = {
  processPayment,
  refundPayment,
  API_URL
};
