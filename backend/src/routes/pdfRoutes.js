const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Import the createPDF function from pdfGenerator
const { createPDF } = require('../utils/pdfGenerator');

/**
 * POST /api/pdf/generate
 * Generate a PDF for an order and send it as download
 * 
 * Request body should contain:
 * {
 *   orderId: string,
 *   size: string,
 *   box: string,
 *   binder: string,
 *   flavor: string,
 *   bandStyle: string,
 *   bandText: string,
 *   engraving: string,
 *   quantity: number,
 *   subtotal: number,
 *   tax: number,
 *   shipping: number,
 *   total: number,
 *   imageUrl: string (optional)
 * }
 */
router.post('/generate', async (req, res) => {
  let pdfPath = null;
  
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.orderId) {
      return res.status(400).json({ 
        error: 'Order ID is required' 
      });
    }
    
    // Generate PDF filename and path
    const pdfFilename = `order-${orderData.orderId}.pdf`;
    pdfPath = path.join(__dirname, '../../temp', pdfFilename);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    console.log('Generating PDF for order:', orderData.orderId);
    
    // Generate PDF
    const result = await createPDF(orderData, orderData.orderId, pdfPath);
    
    console.log('PDF generated successfully:', pdfPath);
    
    // Send PDF file as download
    res.download(pdfPath, pdfFilename, (err) => {
      // Clean up temp file after sending
      if (pdfPath && fs.existsSync(pdfPath)) {
        try {
          fs.unlinkSync(pdfPath);
          console.log('Temp PDF file deleted:', pdfPath);
        } catch (cleanupError) {
          console.error('Error deleting temp file:', cleanupError);
        }
      }
      
      if (err) {
        console.error('Error sending PDF:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to send PDF file' });
        }
      }
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Clean up on error
    if (pdfPath && fs.existsSync(pdfPath)) {
      try {
        fs.unlinkSync(pdfPath);
      } catch (cleanupError) {
        console.error('Error deleting temp file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/pdf/preview
 * Generate a PDF and return file info (without forcing download)
 */
router.post('/preview', async (req, res) => {
  try {
    const orderData = req.body;
    
    if (!orderData.orderId) {
      return res.status(400).json({ 
        error: 'Order ID is required' 
      });
    }
    
    const pdfFilename = `order-${orderData.orderId}.pdf`;
    const pdfPath = path.join(__dirname, '../../temp', pdfFilename);
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Generate PDF
    const result = await createPDF(orderData, orderData.orderId, pdfPath);
    
    // Return file info
    res.json({
      success: true,
      message: 'PDF generated successfully',
      orderId: orderData.orderId,
      trackingUrl: result.trackingUrl,
      pdfPath: pdfPath,
      downloadUrl: `/api/pdf/download/${orderData.orderId}`
    });
    
  } catch (error) {
    console.error('PDF preview error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF preview',
      message: error.message
    });
  }
});

/**
 * GET /api/pdf/download/:orderId
 * Download a previously generated PDF
 */
router.get('/download/:orderId', (req, res) => {
  try {
    const { orderId } = req.params;
    const pdfFilename = `order-${orderId}.pdf`;
    const pdfPath = path.join(__dirname, '../../temp', pdfFilename);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ 
        error: 'PDF not found',
        message: 'The requested PDF does not exist or has been deleted'
      });
    }
    
    res.download(pdfPath, pdfFilename);
    
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ 
      error: 'Failed to download PDF',
      message: error.message
    });
  }
});

/**
 * GET /api/pdf/test
 * Test endpoint to verify routes are working
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'PDF routes are working',
    endpoints: {
      generate: 'POST /api/pdf/generate',
      preview: 'POST /api/pdf/preview',
      download: 'GET /api/pdf/download/:orderId',
      test: 'GET /api/pdf/test'
    }
  });
});

// Export the router using CommonJS
module.exports = router;