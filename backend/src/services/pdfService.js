const PDFDocument = require('pdfkit');
const { uploadFile } = require('../config/storage');
const logger = require('../utils/logger');

const generateInvoice = async (orderData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunks.push.bind(chunks));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      try {
        const url = await uploadFile(
          pdfBuffer,
          `invoice-${orderData.orderNumber}.pdf`,
          'application/pdf',
          'invoices'
        );
        resolve(url);
      } catch (error) {
        reject(error);
      }
    });

    doc.fontSize(20).text('SIKARS INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order: ${orderData.orderNumber}`);
    doc.text(`Total: $${orderData.total}`);
    doc.end();
  });
};

module.exports = { generateInvoice };