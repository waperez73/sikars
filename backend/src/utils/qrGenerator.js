const QRCode = require('qrcode');

const createQRCode= async function(text) {
  return await QRCode.toBuffer(text, { width: 256 });
}

module.exports = { createQRCode };