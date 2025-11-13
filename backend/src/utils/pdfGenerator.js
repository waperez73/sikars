const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const axios = require('axios');

// Import QR generator - adjust path based on your structure
// If qrGenerator.js is in the same utils folder, use:
const { createQRCode } = require('./qrGenerator.js');
// OR if it's in a different location, adjust accordingly

/**
 * Create a professional PDF for a Sikars cigar order
 * @param {Object} data - Order data (size, box, binder, flavor, etc.)
 * @param {string} orderId - Unique order ID
 * @param {string} pdfPath - Full path where PDF should be saved
 * @returns {Promise<Object>} - Returns { trackingUrl, pdfPath }
 */
const createPDF = async function (data, orderId, pdfPath) {
  try {
    // Generate tracking URL and QR code
    const trackingUrl = `https://sikars.com/orders/${orderId}`;
    const qrImage = await createQRCode(trackingUrl);

    // Create PDF document
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'LETTER',
      info: {
        Title: `Sikars Order ${orderId}`,
        Author: 'Sikars Custom Cigars'
      }
    });
    
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // ====== HEADER SECTION ======
    doc.fontSize(24)
       .fillColor("#6a4f3a")
       .text("SIKARS", { align: "center" });
    
    doc.fontSize(10)
       .fillColor("#8b7a6b")
       .text("Custom Cigars with Ancient Soul", { align: "center" });
    
    doc.moveDown(0.5);
    
    doc.fontSize(18)
       .fillColor("#1f1a17")
       .text("Order Summary", { align: "center" });

    doc.moveDown(1.5);

    // Divider line
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .strokeColor('#d4af37')
       .lineWidth(2)
       .stroke();

    doc.moveDown();

    // ====== ORDER INFO SECTION ======
    doc.fontSize(12).fillColor("#1f1a17");
    doc.text(`Order ID: ${orderId}`, { bold: true });
    doc.text(`Order Date: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`);
    
    doc.moveDown(1.5);

    // ====== ORDER DETAILS SECTION ======
    doc.fontSize(14)
       .fillColor("#6a4f3a")
       .text("Your Custom Cigar Details", { underline: true });
    
    doc.moveDown(0.5);
    
    doc.fontSize(11).fillColor("#1f1a17");
    
    // Format and display order fields
    const orderDetails = [
      { label: 'Cigar Size', value: data.details.size },
      { label: 'Box Type', value: data.details.box },
      { label: 'Binder/Wrapper', value: data.details.binder },
      { label: 'Flavor Profile', value: data.details.flavor },
      { label: 'Band Style', value: data.details.bandStyle },
      { label: 'Band Text', value: data.details.bandText },
      { label: 'Box Engraving', value: data.details.engraving },
      { label: 'Quantity', value: data.details.quantity }
    ];

    orderDetails.forEach(detail => {
      if (detail.value) {
        doc.fillColor("#8b7a6b").text(`${detail.label}:`, { continued: true })
           .fillColor("#1f1a17").text(` ${detail.value}`);
      }
    });

    doc.moveDown(1.5);

    // ====== PRICING SECTION (if available) ======
    if (data.price || data.total) {
      doc.fontSize(14)
         .fillColor("#6a4f3a")
         .text("Order Total", { underline: true });
      
      doc.moveDown(0.5);
      
      doc.fontSize(11).fillColor("#1f1a17");
      
      if (data.subtotal) {
        doc.text(`Subtotal: $${parseFloat(data.subtotal).toFixed(2)}`);
      }
      if (data.tax) {
        doc.text(`Tax: $${parseFloat(data.tax).toFixed(2)}`);
      }
      if (data.shipping) {
        doc.text(`Shipping: $${parseFloat(data.shipping).toFixed(2)}`);
      }
      
      doc.fontSize(12)
         .fillColor("#6a4f3a")
         .text(`Total: $${parseFloat(data.total || data.price || 0).toFixed(2)}`, { bold: true });
      
      doc.moveDown(1.5);
    }

    // ====== PREVIEW IMAGE SECTION ======
    if (data.imageUrl) {
      try {
        doc.fontSize(14)
           .fillColor("#6a4f3a")
           .text("Preview Render", { underline: true });
        
        doc.moveDown(0.5);
        
        // Download image
        const response = await axios.get(data.imageUrl, { 
          responseType: "arraybuffer",
          timeout: 10000 // 10 second timeout
        });
        
        const imageBuffer = Buffer.from(response.data, "binary");
        const imageTemp = path.join(__dirname, `temp_${orderId}.png`);
        
        fs.writeFileSync(imageTemp, imageBuffer);
        
        // Add image to PDF
        doc.image(imageTemp, {
          fit: [400, 300],
          align: "center"
        });
        
        // Clean up temp file
        fs.unlinkSync(imageTemp);
        
        doc.moveDown(1);
      } catch (imageError) {
        console.error('Error adding image to PDF:', imageError);
        doc.fontSize(10)
           .fillColor("#8b7a6b")
           .text("(Preview image unavailable)");
        doc.moveDown(1);
      }
    }

    // ====== QR CODE & TRACKING SECTION ======
    doc.addPage(); // New page for QR code and tracking
    
    doc.fontSize(16)
       .fillColor("#6a4f3a")
       .text("Track Your Order", { align: "center" });
    
    doc.moveDown();
    
    doc.fontSize(11)
       .fillColor("#1f1a17")
       .text("Scan the QR code below or visit the URL to track your order status:", { 
         align: "center" 
       });
    
    doc.moveDown(1);

    // Add QR code
    try {
      const qrTemp = path.join(__dirname, `qr_${orderId}.png`);
      fs.writeFileSync(qrTemp, qrImage);
      
      // Center the QR code
      const qrSize = 150;
      const pageWidth = 612; // Letter size width in points
      const qrX = (pageWidth - qrSize) / 2;
      
      doc.image(qrTemp, qrX, doc.y, { 
        width: qrSize,
        height: qrSize
      });
      
      fs.unlinkSync(qrTemp);
      
      doc.moveDown(8); // Move down to account for QR code height
    } catch (qrError) {
      console.error('Error adding QR code to PDF:', qrError);
      doc.moveDown(2);
    }

    // Tracking URL
    doc.fontSize(10)
       .fillColor("#8b7a6b")
       .text("Tracking URL:", { align: "center" });
    
    doc.fontSize(10)
       .fillColor("#6a4f3a")
       .text(trackingUrl, { 
         align: "center",
         link: trackingUrl,
         underline: true
       });

    doc.moveDown(3);

    // ====== FOOTER SECTION ======
    doc.fontSize(10)
       .fillColor("#8b7a6b")
       .text("Thank you for choosing Sikars!", { align: "center" });
    
    doc.fontSize(8)
       .fillColor("#8b7a6b")
       .text("© 2025 Sikars.com – The Custom Cigar Experience", { align: "center" });
    
    doc.moveDown(0.5);
    
    doc.fontSize(8)
       .fillColor("#8b7a6b")
       .text("For questions: orders@sikars.com", { align: "center" });

    // Finalize PDF
    doc.end();

    // Wait for PDF to finish writing
    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    console.log(`PDF generated successfully: ${pdfPath}`);

    return { 
      trackingUrl,
      pdfPath 
    };

  } catch (error) {
    console.error('Error creating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

// FIXED: Changed from module.export to module.exports (with 's')
module.exports = { createPDF };