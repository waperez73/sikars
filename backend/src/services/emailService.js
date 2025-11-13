const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

const sendOrderConfirmation = async (to, orderData) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject: `Order Confirmation - ${orderData.orderNumber}`,
    html: `<h1>Thank you for your order!</h1>
           <p>Order Number: <strong>${orderData.orderNumber}</strong></p>
           <p>Total: $${orderData.total}</p>
           <p>We'll send you an update when your order ships.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Order confirmation sent to ${to}`);
  } catch (error) {
    logger.error('Email send error:', error);
  }
};

module.exports = { sendOrderConfirmation };
