/**
 * Order Controller (Backend)
 * Handles order creation, retrieval, and management
 * 
 * File: backend/src/controllers/orderController.js
 */

const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Get all orders for current user
 * GET /api/orders
 */
exports.getOrders = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;

    const query = `
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.payment_status,
        o.subtotal,
        o.tax,
        o.shipping_cost,
        o.total_amount,
        o.currency,
        o.tracking_number,
        o.created_at,
        o.confirmed_at,
        o.shipped_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    
    const result = await client.query(query, [userId]);

    res.status(200).json({
      success: true,
      orders: result.rows.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.tax),
        shippingCost: parseFloat(order.shipping_cost),
        totalAmount: parseFloat(order.total_amount),
        currency: order.currency,
        trackingNumber: order.tracking_number,
        createdAt: order.created_at,
        confirmedAt: order.confirmed_at,
        shippedAt: order.shipped_at,
        items: Array(parseInt(order.item_count)).fill({})
      }))
    });

  } catch (error) {
    console.error('Get orders error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Get specific order details
 * GET /api/orders/:id
 */
exports.getOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;

    // Get order details
    const orderQuery = `
      SELECT 
        o.*,
        sa.street_address as shipping_street,
        sa.city as shipping_city,
        sa.state as shipping_state,
        sa.zip_code as shipping_zip,
        sa.country as shipping_country,
        ba.street_address as billing_street,
        ba.city as billing_city,
        ba.state as billing_state,
        ba.zip_code as billing_zip,
        ba.country as billing_country
      FROM orders o
      LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
      LEFT JOIN addresses ba ON o.billing_address_id = ba.id
      WHERE o.id = $1 AND o.user_id = $2
    `;
    
    const orderResult = await client.query(orderQuery, [orderId, userId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        cs.name as size_name,
        b.name as binder_name,
        f.name as flavor_name,
        bs.name as band_style_name,
        bt.name as box_name
      FROM order_items oi
      LEFT JOIN cigar_sizes cs ON oi.cigar_size_id = cs.id
      LEFT JOIN binders b ON oi.binder_id = b.id
      LEFT JOIN flavors f ON oi.flavor_id = f.id
      LEFT JOIN band_styles bs ON oi.band_style_id = bs.id
      LEFT JOIN box_types bt ON oi.box_type_id = bt.id
      WHERE oi.order_id = $1
    `;

    const itemsResult = await client.query(itemsQuery, [orderId]);

    res.status(200).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        subtotal: parseFloat(order.subtotal),
        tax: parseFloat(order.tax),
        shippingCost: parseFloat(order.shipping_cost),
        totalAmount: parseFloat(order.total_amount),
        currency: order.currency,
        shippingMethod: order.shipping_method,
        trackingNumber: order.tracking_number,
        customerNotes: order.customer_notes,
        createdAt: order.created_at,
        confirmedAt: order.confirmed_at,
        shippedAt: order.shipped_at,
        deliveredAt: order.delivered_at,
        shippingAddress: order.shipping_street ? {
          street: order.shipping_street,
          city: order.shipping_city,
          state: order.shipping_state,
          zipCode: order.shipping_zip,
          country: order.shipping_country
        } : null,
        billingAddress: order.billing_street ? {
          street: order.billing_street,
          city: order.billing_city,
          state: order.billing_state,
          zipCode: order.billing_zip,
          country: order.billing_country
        } : null,
        items: itemsResult.rows.map(item => ({
          id: item.id,
          size: item.size_name,
          binder: item.binder_name,
          flavor: item.flavor_name,
          bandStyle: item.band_style_name,
          box: item.box_name,
          bandText: item.band_text,
          engraving: item.engraving_text,
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          totalPrice: parseFloat(item.total_price),
          previewImageUrl: item.preview_image_url
        }))
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Create new order
 * POST /api/orders
 */
exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const { items, shippingAddress, billingAddress, paymentMethod, customerNotes } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    await client.query('BEGIN');

    // Generate order number
    const orderNumber = `SK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Calculate totals
    const basePrice = parseFloat(process.env.BASE_PRICE) || 30.00;
    const taxRate = parseFloat(process.env.TAX_RATE) || 0.08;
    const shippingCost = parseFloat(process.env.SHIPPING_COST_STANDARD) || 9.99;

    let subtotal = 0;
    
    // Calculate subtotal from items
    items.forEach(item => {
      const itemPrice = basePrice * (item.quantity || 1);
      subtotal += itemPrice;
    });

    const tax = subtotal * taxRate;
    const totalAmount = subtotal + tax + shippingCost;

    // Insert shipping address if provided
    let shippingAddressId = null;
    if (shippingAddress) {
      const addressResult = await client.query(
        `INSERT INTO addresses (user_id, address_type, street_address, city, state, zip_code, country, created_at, updated_at)
         VALUES ($1, 'shipping', $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [userId, shippingAddress.street, shippingAddress.city, shippingAddress.state, shippingAddress.zipCode, shippingAddress.country || 'USA']
      );
      shippingAddressId = addressResult.rows[0].id;
    }

    // Insert billing address if provided
    let billingAddressId = null;
    if (billingAddress) {
      const addressResult = await client.query(
        `INSERT INTO addresses (user_id, address_type, street_address, city, state, zip_code, country, created_at, updated_at)
         VALUES ($1, 'billing', $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [userId, billingAddress.street, billingAddress.city, billingAddress.state, billingAddress.zipCode, billingAddress.country || 'USA']
      );
      billingAddressId = addressResult.rows[0].id;
    }

    // Create order
    const orderQuery = `
      INSERT INTO orders (
        order_number, user_id, status, payment_status,
        subtotal, tax, shipping_cost, total_amount, currency,
        shipping_address_id, billing_address_id,
        customer_notes, created_at, updated_at
      ) VALUES ($1, $2, 'pending', 'pending', $3, $4, $5, $6, 'USD', $7, $8, $9, NOW(), NOW())
      RETURNING id, order_number, created_at
    `;

    const orderResult = await client.query(orderQuery, [
      orderNumber, userId, subtotal, tax, shippingCost, totalAmount,
      shippingAddressId, billingAddressId, customerNotes
    ]);

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      const itemPrice = basePrice * (item.quantity || 1);
      
      await client.query(
        `INSERT INTO order_items (
          order_id, quantity, unit_price, total_price,
          band_text, engraving_text, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [order.id, item.quantity || 1, basePrice, itemPrice, item.bandText, item.engraving]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Get order PDF/invoice
 * GET /api/orders/:id/pdf
 */
exports.getOrderPDF = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;

    // Verify order belongs to user
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // TODO: Generate PDF using a library like puppeteer or pdfkit
    // For now, return a placeholder response
    res.status(501).json({
      success: false,
      message: 'PDF generation not yet implemented'
    });

  } catch (error) {
    console.error('Get PDF error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
    });
  }
};

/**
 * Get order tracking
 * GET /api/orders/:id/tracking
 */
exports.getTracking = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;

    const query = `
      SELECT 
        o.order_number,
        o.status,
        o.tracking_number,
        o.shipping_method,
        o.created_at,
        o.confirmed_at,
        o.shipped_at,
        o.delivered_at,
        pq.status as production_status,
        pq.started_at as production_started,
        pq.completed_at as production_completed
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN production_queue pq ON oi.id = pq.order_item_id
      WHERE o.id = $1 AND o.user_id = $2
      LIMIT 1
    `;
    
    const result = await client.query(query, [orderId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const tracking = result.rows[0];

    res.status(200).json({
      success: true,
      tracking: {
        orderNumber: tracking.order_number,
        status: tracking.status,
        trackingNumber: tracking.tracking_number,
        shippingMethod: tracking.shipping_method,
        timeline: {
          ordered: tracking.created_at,
          confirmed: tracking.confirmed_at,
          inProduction: tracking.production_started,
          productionComplete: tracking.production_completed,
          shipped: tracking.shipped_at,
          delivered: tracking.delivered_at
        }
      }
    });

  } catch (error) {
    console.error('Get tracking error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tracking information'
    });
  } finally {
    client.release();
  }
};
