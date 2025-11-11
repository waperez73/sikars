const { query, transaction } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { calculateOrderTotal, calculateItemPrice } = require('../utils/priceCalculator');
const { generateOrderNumber } = require('../utils/orderNumberGenerator');
const logger = require('../utils/logger');
const emailService = require('./emailService');
const pdfService = require('./pdfService');
const qrService = require('./qrService');

/**
 * Create a new order
 */
const createOrder = async (userId, orderData) => {
  const {
    items,
    shippingAddressId,
    billingAddressId,
    shippingMethod = 'standard',
    customerNotes = ''
  } = orderData;

  try {
    return await transaction(async (client) => {
      // Get product prices from database
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const prices = await getProductPrices(item);
          const unitPrice = calculateItemPrice(prices);
          
          return {
            ...item,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
            ...prices
          };
        })
      );

      // Calculate totals
      const pricing = calculateOrderTotal({
        items: enrichedItems,
        shippingMethod
      });

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          order_number, user_id, status, payment_status,
          subtotal, tax, shipping_cost, total_amount, currency,
          shipping_address_id, billing_address_id, shipping_method,
          customer_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          orderNumber,
          userId,
          'pending',
          'pending',
          pricing.subtotal,
          pricing.tax,
          pricing.shipping,
          pricing.total,
          'USD',
          shippingAddressId,
          billingAddressId,
          shippingMethod,
          customerNotes
        ]
      );

      const order = orderResult.rows[0];

      // Create order items
      for (const item of enrichedItems) {
        await client.query(
          `INSERT INTO order_items (
            order_id, cigar_size_id, binder_id, flavor_id,
            band_style_id, box_type_id, band_text, engraving_text,
            quantity, unit_price, total_price
          ) VALUES (
            $1,
            (SELECT id FROM cigar_sizes WHERE value = $2),
            (SELECT id FROM binders WHERE value = $3),
            (SELECT id FROM flavors WHERE value = $4),
            (SELECT id FROM band_styles WHERE value = $5),
            (SELECT id FROM box_types WHERE value = $6),
            $7, $8, $9, $10, $11
          )`,
          [
            order.id,
            item.cigarSize,
            item.binder,
            item.flavor,
            item.bandStyle,
            item.box,
            item.bandText || '',
            item.engraving || '',
            item.quantity,
            item.unitPrice,
            item.totalPrice
          ]
        );
      }

      logger.info(`Order created: ${orderNumber} for user ${userId}`);

      return {
        orderId: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: order.total_amount,
        currency: order.currency,
        createdAt: order.created_at
      };
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Create order error:', error);
    throw new AppError('Failed to create order', 500);
  }
};

/**
 * Get product prices for an item
 */
const getProductPrices = async (item) => {
  try {
    const [sizeResult, binderResult, flavorResult, bandResult, boxResult] = await Promise.all([
      query('SELECT base_price FROM cigar_sizes WHERE value = $1', [item.cigarSize]),
      query('SELECT price_modifier FROM binders WHERE value = $1', [item.binder]),
      query('SELECT price_modifier FROM flavors WHERE value = $1', [item.flavor]),
      query('SELECT price_modifier FROM band_styles WHERE value = $1', [item.bandStyle]),
      query('SELECT base_price FROM box_types WHERE value = $1', [item.box])
    ]);

    return {
      cigarSizePrice: parseFloat(sizeResult.rows[0]?.base_price || 0),
      binderPrice: parseFloat(binderResult.rows[0]?.price_modifier || 0),
      flavorPrice: parseFloat(flavorResult.rows[0]?.price_modifier || 0),
      bandStylePrice: parseFloat(bandResult.rows[0]?.price_modifier || 0),
      boxPrice: parseFloat(boxResult.rows[0]?.base_price || 0)
    };
  } catch (error) {
    logger.error('Get product prices error:', error);
    throw new AppError('Failed to calculate prices', 500);
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (orderId, userId) => {
  try {
    const orderResult = await query(
      `SELECT o.*, 
        sa.street_address as shipping_street, sa.city as shipping_city,
        sa.state as shipping_state, sa.zip_code as shipping_zip,
        ba.street_address as billing_street, ba.city as billing_city,
        ba.state as billing_state, ba.zip_code as billing_zip
       FROM orders o
       LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
       LEFT JOIN addresses ba ON o.billing_address_id = ba.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT oi.*,
        cs.name as size_name, cs.value as size_value,
        b.name as binder_name, b.value as binder_value,
        f.name as flavor_name, f.value as flavor_value,
        bs.name as band_name, bs.value as band_value,
        bt.name as box_name, bt.value as box_value
       FROM order_items oi
       LEFT JOIN cigar_sizes cs ON oi.cigar_size_id = cs.id
       LEFT JOIN binders b ON oi.binder_id = b.id
       LEFT JOIN flavors f ON oi.flavor_id = f.id
       LEFT JOIN band_styles bs ON oi.band_style_id = bs.id
       LEFT JOIN box_types bt ON oi.box_type_id = bt.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      shipping: parseFloat(order.shipping_cost),
      total: parseFloat(order.total_amount),
      currency: order.currency,
      shippingMethod: order.shipping_method,
      trackingNumber: order.tracking_number,
      customerNotes: order.customer_notes,
      createdAt: order.created_at,
      confirmedAt: order.confirmed_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
      shippingAddress: {
        street: order.shipping_street,
        city: order.shipping_city,
        state: order.shipping_state,
        zip: order.shipping_zip
      },
      billingAddress: {
        street: order.billing_street,
        city: order.billing_city,
        state: order.billing_state,
        zip: order.billing_zip
      },
      items: itemsResult.rows.map(item => ({
        id: item.id,
        size: { name: item.size_name, value: item.size_value },
        binder: { name: item.binder_name, value: item.binder_value },
        flavor: { name: item.flavor_name, value: item.flavor_value },
        bandStyle: { name: item.band_name, value: item.band_value },
        box: { name: item.box_name, value: item.box_value },
        bandText: item.band_text,
        engraving: item.engraving_text,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        totalPrice: parseFloat(item.total_price),
        previewUrl: item.preview_image_url
      }))
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Get order error:', error);
    throw new AppError('Failed to get order', 500);
  }
};

/**
 * Get user's orders
 */
const getUserOrders = async (userId, pagination) => {
  const { limit, offset } = pagination;

  try {
    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM orders WHERE user_id = $1',
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);

    // Get orders
    const result = await query(
      `SELECT id, order_number, status, payment_status, total_amount, 
        currency, created_at, confirmed_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return {
      orders: result.rows.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        total: parseFloat(order.total_amount),
        currency: order.currency,
        createdAt: order.created_at,
        confirmedAt: order.confirmed_at
      })),
      pagination: {
        total,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  } catch (error) {
    logger.error('Get user orders error:', error);
    throw new AppError('Failed to get orders', 500);
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  try {
    const result = await query(
      `UPDATE orders
       SET status = $1,
           ${status === 'confirmed' ? 'confirmed_at = CURRENT_TIMESTAMP,' : ''}
           ${status === 'completed' ? 'delivered_at = CURRENT_TIMESTAMP,' : ''}
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, order_number, status`,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    logger.info(`Order ${result.rows[0].order_number} status updated to ${status}`);

    return result.rows[0];
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Update order status error:', error);
    throw new AppError('Failed to update order status', 500);
  }
};

/**
 * Cancel order
 */
const cancelOrder = async (orderId, userId) => {
  try {
    const result = await query(
      `UPDATE orders
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND status IN ('pending', 'confirmed')
       RETURNING id, order_number`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Order cannot be cancelled', 400);
    }

    logger.info(`Order ${result.rows[0].order_number} cancelled by user ${userId}`);

    return { message: 'Order cancelled successfully' };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Cancel order error:', error);
    throw new AppError('Failed to cancel order', 500);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  getProductPrices
};
