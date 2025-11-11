const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate PDF order summary with preview image and QR code
 */
const generatePDF = async (req, res) => {
  try {
    const data = req.body;

    // Create folders if they don't exist
    const ordersDir = path.join(__dirname, '..', 'static', 'orders');
    await fs.mkdir(ordersDir, { recursive: true });

    // Generate a unique order ID
    const orderId = uuidv4().slice(0, 8).toUpperCase();
    const orderFilename = `sikars_order_${orderId}.pdf`;
    const orderPath = path.join(ordersDir, orderFilename);

    // Generate QR code (tracking or order link)
    const qrLink = `https://sikars.com/orders/${orderId}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrLink, {
      width: 300,
      margin: 1,
      errorCorrectionLevel: 'H'
    });

    // Create PDF document
    const doc = new PDFDocument({ 
      size: 'letter',
      margins: { top: 60, bottom: 60, left: 60, right: 60 }
    });

    // Pipe to file
    const writeStream = require('fs').createWriteStream(orderPath);
    doc.pipe(writeStream);

    // Define colors
    const brandBrown = '#6a4f3a';
    const brandGold = '#d4af37';
    const textBlack = '#1f1a17';
    const errorRed = '#b00020';

    const margin = 60;
    let y = doc.page.height - margin;

    // --- Brand header ---
    const logoPath = path.join(__dirname, '..', 'static', 'images', 'sikars_logo.png');
    
    try {
      // Check if logo exists
      await fs.access(logoPath);
      doc.image(logoPath, margin, y - 40, { width: 100, height: 40 });
    } catch (err) {
      // Logo doesn't exist, skip it
      console.log('Logo not found, skipping...');
    }

    // Title
    doc.fontSize(22)
       .fillColor(brandBrown)
       .font('Helvetica-Bold')
       .text('Sikars Custom Cigar Order Summary', margin + 120, y - 10);

    y -= 70;

    // Gold divider line
    doc.strokeColor(brandGold)
       .lineWidth(2)
       .moveTo(margin, y)
       .lineTo(doc.page.width - margin, y)
       .stroke();

    y -= 30;

    // --- Order Info ---
    doc.fontSize(11)
       .fillColor(textBlack)
       .font('Helvetica')
       .text(`Order ID: ${orderId}`, margin, y);

    y -= 20;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    doc.text(`Order Date: ${formattedDate}`, margin, y);
    y -= 35;

    // Section header
    doc.fontSize(14)
       .fillColor(brandBrown)
       .font('Helvetica-Bold')
       .text('Order Details:', margin, y);

    y -= 25;

    // Order details
    doc.fontSize(11)
       .fillColor(textBlack)
       .font('Helvetica');

    const details = [
      ['Cigar Size', data.size || 'N/A'],
      ['Box Style', data.box || 'N/A'],
      ['Binder', data.binder || 'N/A'],
      ['Flavor', data.flavor || 'N/A'],
      ['Band Style', data.bandStyle || 'N/A'],
      ['Engraving', data.engraving || 'None'],
      ['Band Text', data.bandText || 'None'],
      ['Quantity', data.quantity || '1']
    ];

    details.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, margin, y);
      y -= 18;
    });

    // --- Image Section ---
    y -= 20;

    // Gold divider
    doc.strokeColor(brandGold)
       .lineWidth(1)
       .moveTo(margin, y)
       .lineTo(doc.page.width - margin, y)
       .stroke();

    y -= 30;

    doc.fontSize(14)
       .fillColor(brandBrown)
       .font('Helvetica-Bold')
       .text('Preview Render:', margin, y);

    y -= 20;

    // Try to fetch and embed the preview image
    const imageUrl = data.imageUrl;
    if (imageUrl) {
      try {
        // Fetch image
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000
        });
        
        const imageBuffer = Buffer.from(response.data);
        
        // Add image to PDF
        const imgHeight = 250;
        doc.image(imageBuffer, margin, y, { 
          width: 300, 
          height: imgHeight,
          align: 'left'
        });
        
        y -= imgHeight + 30;
        
      } catch (error) {
        console.error('Error loading image:', error.message);
        doc.fontSize(10)
           .fillColor(errorRed)
           .font('Helvetica-Oblique')
           .text(`Image could not be loaded: ${error.message}`, margin, y);
        y -= 25;
      }
    } else {
      doc.fontSize(10)
         .fillColor(errorRed)
         .font('Helvetica-Oblique')
         .text('No preview image available.', margin, y);
      y -= 25;
    }

    // --- QR Code (bottom-right corner) ---
    const qrSize = 100;
    const qrX = doc.page.width - margin - qrSize;
    const qrY = 100;

    doc.image(qrCodeBuffer, qrX, qrY, { 
      width: qrSize, 
      height: qrSize 
    });

    // QR code label
    doc.fontSize(9)
       .fillColor(textBlack)
       .font('Helvetica')
       .text(`Track Order:`, qrX, qrY - 15, { 
         width: qrSize, 
         align: 'center' 
       })
       .text(qrLink, qrX, qrY + qrSize + 5, { 
         width: qrSize, 
         align: 'center' 
       });

    // --- Footer ---
    const footerY = 80;
    
    doc.strokeColor(brandGold)
       .lineWidth(1)
       .moveTo(margin, footerY)
       .lineTo(doc.page.width - margin, footerY)
       .stroke();

    doc.fontSize(10)
       .fillColor(brandBrown)
       .font('Helvetica')
       .text(
         '© 2025 Sikars.com – The Custom Cigar Experience',
         0,
         65,
         { align: 'center' }
       );

    // Finalize PDF
    doc.end();

    // Wait for file to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Return response with URLs
    const publicPdfUrl = `/static/orders/${orderFilename}`;

    return res.json({
      orderId: orderId,
      downloadUrl: publicPdfUrl,
      trackingUrl: qrLink,
      pdfUrl: publicPdfUrl
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate PDF' 
    });
  }
};

module.exports = {
  generatePDF
};
