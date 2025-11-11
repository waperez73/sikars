const { query } = require('../config/database');

class Product {
  /**
   * Get all cigar sizes
   */
  static async getCigarSizes() {
    const sql = `
      SELECT * FROM cigar_sizes 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get all binders
   */
  static async getBinders() {
    const sql = `
      SELECT * FROM binders 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get all flavors
   */
  static async getFlavors() {
    const sql = `
      SELECT * FROM flavors 
      WHERE is_active = true 
      ORDER BY sort_order, strength_level
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get all band styles
   */
  static async getBandStyles() {
    const sql = `
      SELECT * FROM band_styles 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get all box types
   */
  static async getBoxTypes() {
    const sql = `
      SELECT * FROM box_types 
      WHERE is_active = true 
      ORDER BY sort_order, base_price
    `;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get product by ID
   */
  static async getById(table, id) {
    const sql = `SELECT * FROM ${table} WHERE id = $1 AND is_active = true`;
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  /**
   * Calculate price for customization
   */
  static async calculatePrice(customization) {
    const { cigarSizeId, binderId, flavorId, bandStyleId, boxTypeId, quantity } = customization;

    // Get base price from settings or default
    const basePriceResult = await query(
      "SELECT value FROM settings WHERE key = 'base_price'"
    );
    const basePrice = parseFloat(basePriceResult.rows[0]?.value || 30.00);

    let totalPrice = basePrice;

    // Add cigar size price
    if (cigarSizeId) {
      const size = await this.getById('cigar_sizes', cigarSizeId);
      if (size) totalPrice += parseFloat(size.base_price);
    }

    // Add binder price modifier
    if (binderId) {
      const binder = await this.getById('binders', binderId);
      if (binder) totalPrice += parseFloat(binder.price_modifier);
    }

    // Add flavor price modifier
    if (flavorId) {
      const flavor = await this.getById('flavors', flavorId);
      if (flavor) totalPrice += parseFloat(flavor.price_modifier);
    }

    // Add band style price modifier
    if (bandStyleId) {
      const bandStyle = await this.getById('band_styles', bandStyleId);
      if (bandStyle) totalPrice += parseFloat(bandStyle.price_modifier);
    }

    // Add box type price
    if (boxTypeId) {
      const boxType = await this.getById('box_types', boxTypeId);
      if (boxType) totalPrice += parseFloat(boxType.base_price);
    }

    // Multiply by quantity
    const itemTotal = totalPrice * (quantity || 1);

    // Get tax rate
    const taxRateResult = await query(
      "SELECT value FROM settings WHERE key = 'tax_rate'"
    );
    const taxRate = parseFloat(taxRateResult.rows[0]?.value || 0.08);

    const tax = itemTotal * taxRate;

    // Get shipping cost
    const shippingResult = await query(
      "SELECT value FROM settings WHERE key = 'shipping_cost_standard'"
    );
    const shipping = parseFloat(shippingResult.rows[0]?.value || 9.99);

    return {
      unitPrice: totalPrice,
      subtotal: itemTotal,
      tax: parseFloat(tax.toFixed(2)),
      shipping: shipping,
      total: parseFloat((itemTotal + tax + shipping).toFixed(2))
    };
  }

  /**
   * Get all products (for admin)
   */
  static async getAllProducts() {
    const [sizes, binders, flavors, bands, boxes] = await Promise.all([
      this.getCigarSizes(),
      this.getBinders(),
      this.getFlavors(),
      this.getBandStyles(),
      this.getBoxTypes()
    ]);

    return {
      cigarSizes: sizes,
      binders,
      flavors,
      bandStyles: bands,
      boxTypes: boxes
    };
  }
}

module.exports = Product;
