const { query, transaction } = require('../config/database');

class Order {
  /**
   * Create a new order with items
   */
  static async create(orderData) {
    return await transaction(async (client) => {
      const {
        userId,
        items,
        shippingAddressId,
        billingAddressId,
        subtotal,
        tax,
        shippingCost,
        totalAmount,
        customerNotes
      } = orderData;

      // Generate order number
      const orderNumber = await this.generateOrderNumber();

      // Create order
      const orderSql = `
        INSERT INTO orders (
          order_number, user_id, shipping_address_id, billing_address_id,
          subtotal, tax, shipping_cost, total_amount, customer_notes,
          status, payment_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'pending')
        RETURNING *
      `;

      const orderResult = await client.query(orderSql, [
        orderNumber,
        userId,
        shippingAddressId,
        billingAddressId,
        subtotal,
        tax,
        shippingCost,
        totalAmount,
        customerNotes
      ]);

      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        const itemSql = `
          INSERT INTO order_items (
            order_id, cigar_size_id, binder_id, flavor_id, band_style_id, box_type_id,
            band_text, engraving_text, quantity, unit_price, total_price
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;

        await client.query(itemSql, [
          order.id,
          item.cigarSizeId,
          item.binderId,
          item.flavorId,
          item.bandStyleId,
          item.boxTypeId,
          item.bandText,
          item.engravingText,
          item.quantity,
          item.unitPrice,
          item.totalPrice
        ]);
      }

      return order;
    });
  }

  /**
   * Generate unique order number
   */
  static async generateOrderNumber() {
    const prefix = 'SKR';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Get count of orders today
    const countSql = `
      SELECT COUNT(*) as count FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    const result = await query(countSql);
    const count = parseInt(result.rows[0].count) + 1;
    const sequence = String(count).padStart(4, '0');
    
    return `${prefix}-${year}${month}-${sequence}`;
  }

  /**
   * Find order by ID with items
   */
  static async findById(orderId, userId = null) {
    const sql = `
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'cigarSize', cs.name,
            'binder', b.name,
            'flavor', f.name,
            'bandStyle', bs.name,
            'boxType', bt.name,
            'bandText', oi.band_text,
            'engravingText', oi.engraving_text,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'totalPrice', oi.total_price,
            'previewImageUrl', oi.preview_image_url
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN cigar_sizes cs ON oi.cigar_size_id = cs.id
      LEFT JOIN binders b ON oi.binder_id = b.id
      LEFT JOIN flavors f ON oi.flavor_id = f.id
      LEFT JOIN band_styles bs ON oi.band_style_id = bs.id
      LEFT JOIN box_types bt ON oi.box_type_id = bt.id
      WHERE o.id = $1 ${userId ? 'AND o.user_id = $2' : ''}
      GROUP BY o.id
    `;
    
    const params = userId ? [orderId, userId] : [orderId];
    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Find orders by user
   */
  static async findByUser(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT o.id, o.order_number, o.status, o.payment_status, o.total_amount,
             o.created_at, o.updated_at,
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await query(sql, [userId, limit, offset]);
    return result.rows;
  }

  /**
   * Update order status
   */
  static async updateStatus(orderId, status, adminNotes = null) {
    const sql = `
      UPDATE orders 
      SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await query(sql, [status, adminNotes, orderId]);
    return result.rows[0];
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(orderId, paymentStatus, transactionId = null) {
    const sql = `
      UPDATE orders 
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP,
          confirmed_at = CASE WHEN $1 = 'paid' THEN CURRENT_TIMESTAMP ELSE confirmed_at END
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await query(sql, [paymentStatus, orderId]);
    
    // If payment successful, update status to confirmed
    if (paymentStatus === 'paid') {
      await this.updateStatus(orderId, 'confirmed');
    }
    
    return result.rows[0];
  }

  /**
   * Add PDF and QR URLs to order
   */
  static async updateDocuments(orderId, pdfUrl, qrTrackingUrl) {
    const sql = `
      UPDATE orders 
      SET pdf_url = $1, qr_tracking_url = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await query(sql, [pdfUrl, qrTrackingUrl, orderId]);
    return result.rows[0];
  }

  /**
   * Cancel order
   */
  static async cancel(orderId, userId = null) {
    const sql = `
      UPDATE orders 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 
        AND status IN ('pending', 'confirmed')
        ${userId ? 'AND user_id = $2' : ''}
      RETURNING *
    `;
    
    const params = userId ? [orderId, userId] : [orderId];
    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Get all orders (admin)
   */
  static async findAll(filters = {}, limit = 50, offset = 0) {
    let whereClauses = [];
    let params = [];
    let paramCount = 1;

    if (filters.status) {
      whereClauses.push(`o.status = $${paramCount++}`);
      params.push(filters.status);
    }

    if (filters.paymentStatus) {
      whereClauses.push(`o.payment_status = $${paramCount++}`);
      params.push(filters.paymentStatus);
    }

    if (filters.dateFrom) {
      whereClauses.push(`o.created_at >= $${paramCount++}`);
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      whereClauses.push(`o.created_at <= $${paramCount++}`);
      params.push(filters.dateTo);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT o.id, o.order_number, o.user_id, o.status, o.payment_status, 
             o.total_amount, o.created_at, o.updated_at,
             u.email, u.first_name, u.last_name,
             COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, u.email, u.first_name, u.last_name
      ORDER BY o.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);
    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get order statistics (admin)
   */
  static async getStatistics(dateFrom, dateTo) {
    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN payment_status = 'paid' THEN total_amount ELSE NULL END) as average_order_value
      FROM orders
      WHERE created_at BETWEEN $1 AND $2
    `;
    
    const result = await query(sql, [dateFrom, dateTo]);
    return result.rows[0];
  }
}

module.exports = Order;
