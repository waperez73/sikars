const db = require('../config/database'); // Your database connection

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.query.sessionId;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    // Find cart
    let cart;
    if (userId) {
      cart = await db.query(
        'SELECT * FROM shopping_cart WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      );
    } else {
      cart = await db.query(
        'SELECT * FROM shopping_cart WHERE session_id = $1 AND status = $2',
        [sessionId, 'active']
      );
    }

    if (cart.rows.length === 0) {
      return res.json({ cartId: null, items: [] });
    }

    const cartId = cart.rows[0].id;

    // Get cart items with product details
    const items = await db.query(`
      SELECT 
        ci.*,
        p.name as product_name,
        p.short_description,
        p.primary_image_url,
        p.stock_quantity
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.added_at DESC
    `, [cartId]);

    res.json({
      cartId,
      items: items.rows
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Failed to load cart' });
  }
};

// Add item to cart
exports.addItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity, isCustom, customization, sessionId } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'User ID or session ID required' });
    }

    // Find or create cart
    let cart;
    if (userId) {
      cart = await db.query(
        'SELECT * FROM shopping_cart WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      );
    } else {
      cart = await db.query(
        'SELECT * FROM shopping_cart WHERE session_id = $1 AND status = $2',
        [sessionId, 'active']
      );
    }

    let cartId;
    if (cart.rows.length === 0) {
      // Create new cart
      const newCart = await db.query(
        'INSERT INTO shopping_cart (user_id, session_id, status) VALUES ($1, $2, $3) RETURNING id',
        [userId || null, sessionId || null, 'active']
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cart.rows[0].id;
    }

    // Calculate price
    let unitPrice, totalPrice;
    
    if (isCustom) {
      // Calculate custom cigar price (use your pricing logic)
      unitPrice = calculateCustomPrice(customization);
      totalPrice = unitPrice * quantity;

      // Add custom item
      await db.query(`
        INSERT INTO cart_items (
          cart_id, is_custom, custom_cigar_size, custom_binder,
          custom_flavor, custom_band_style, custom_box_type,
          custom_engraving, custom_band_text,
          quantity, unit_price, total_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        cartId, true,
        customization.size, customization.binder,
        customization.flavor, customization.bandStyle,
        customization.box, customization.engraving,
        customization.bandText,
        quantity, unitPrice, totalPrice
      ]);
    } else {
      // Get product details
      const product = await db.query(
        'SELECT * FROM products WHERE id = $1 AND is_active = true',
        [productId]
      );

      if (product.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const productData = product.rows[0];
      unitPrice = productData.sale_price || productData.base_price;
      totalPrice = unitPrice * quantity;

      // Check if product already in cart
      const existingItem = await db.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
      );

      if (existingItem.rows.length > 0) {
        // Update quantity
        const newQuantity = existingItem.rows[0].quantity + quantity;
        const newTotal = unitPrice * newQuantity;
        
        await db.query(
          'UPDATE cart_items SET quantity = $1, total_price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
          [newQuantity, newTotal, existingItem.rows[0].id]
        );
      } else {
        // Add new item
        await db.query(`
          INSERT INTO cart_items (
            cart_id, product_id, is_custom,
            quantity, unit_price, total_price,
            product_snapshot
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          cartId, productId, false,
          quantity, unitPrice, totalPrice,
          JSON.stringify(productData)
        ]);
      }
    }

    // Return updated cart
    const updatedItems = await db.query(`
      SELECT 
        ci.*,
        p.name as product_name,
        p.short_description,
        p.primary_image_url
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    res.json({
      cartId,
      items: updatedItems.rows
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

// Update item quantity
exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    // Get item
    const item = await db.query('SELECT * FROM cart_items WHERE id = $1', [itemId]);
    
    if (item.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const itemData = item.rows[0];
    const newTotal = itemData.unit_price * quantity;

    // Update quantity
    await db.query(
      'UPDATE cart_items SET quantity = $1, total_price = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [quantity, newTotal, itemId]
    );

    // Return updated cart
    const updatedItems = await db.query(`
      SELECT 
        ci.*,
        p.name as product_name,
        p.short_description,
        p.primary_image_url
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [itemData.cart_id]);

    res.json({ items: updatedItems.rows });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Failed to update item' });
  }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Get item to find cart
    const item = await db.query('SELECT cart_id FROM cart_items WHERE id = $1', [itemId]);
    
    if (item.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const cartId = item.rows[0].cart_id;

    // Delete item
    await db.query('DELETE FROM cart_items WHERE id = $1', [itemId]);

    // Return updated cart
    const updatedItems = await db.query(`
      SELECT 
        ci.*,
        p.name as product_name,
        p.short_description,
        p.primary_image_url
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId]);

    res.json({ items: updatedItems.rows });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ message: 'Failed to remove item' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.query.sessionId;

    let cart;
    if (userId) {
      cart = await db.query(
        'SELECT id FROM shopping_cart WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      );
    } else {
      cart = await db.query(
        'SELECT id FROM shopping_cart WHERE session_id = $1 AND status = $2',
        [sessionId, 'active']
      );
    }

    if (cart.rows.length > 0) {
      const cartId = cart.rows[0].id;
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};

// Helper function to calculate custom cigar price
function calculateCustomPrice(customization) {
  const BASE_PRICE = 30;
  
  const SIZE_PRICES = {
    robusto: 10,
    gordo: 12,
    churchill: 14,
    belicoso: 14
  };
  
  const BINDER_PRICES = {
    habano: 0,
    maduro: 1,
    connecticut: 0.5
  };
  
  const FLAVOR_PRICES = {
    light: 0,
    medium: 2,
    strong: 2
  };
  
  const BAND_PRICES = {
    beveled: 2,
    round: 2,
    dome: 2,
    square: 2
  };
  
  const BOX_PRICES = {
    classic: 20,
    rustic: 18,
    modern: 24
  };
  
  return BASE_PRICE +
    (SIZE_PRICES[customization.size] || 0) +
    (BINDER_PRICES[customization.binder] || 0) +
    (FLAVOR_PRICES[customization.flavor] || 0) +
    (BAND_PRICES[customization.bandStyle] || 0) +
    (BOX_PRICES[customization.box] || 0);
}

module.exports = exports;