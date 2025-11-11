const QRCode = require('qrcode');
const { uploadFile } = require('../config/storage');
const logger = require('../utils/logger');

const generateTrackingQR = async (orderId, orderNumber) => {
  const trackingUrl = `${process.env.TRACKING_BASE_URL}/${orderId}`;
  
  try {
    const qrBuffer = await QRCode.toBuffer(trackingUrl);
    const url = await uploadFile(
      qrBuffer,
      `qr-${orderNumber}.png`,
      'image/png',
      'qr-codes'
    );
    return url;
  } catch (error) {
    logger.error('QR generation error:', error);
    throw error;
  }
};

module.exports = { generateTrackingQR };