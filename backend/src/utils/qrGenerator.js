const QRCode = require('qrcode');

async function createQRCode(text,width=256) {
  return await QRCode.toBuffer(text, {width});
}

module.exports = { createQRCode };