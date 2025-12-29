-- Sikars Cigar Customization Database Schema
-- PostgreSQL/MySQL compatible

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Users table (from signup page requirements)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

-- User addresses for shipping and billing
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL, -- 'shipping' or 'billing'
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PRODUCT CATALOG
-- ============================================

-- Cigar sizes/vitolas
CREATE TABLE cigar_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    value VARCHAR(50) UNIQUE NOT NULL, -- 'robusto', 'gordo', etc.
    base_price DECIMAL(10, 2) NOT NULL,
    length_inches DECIMAL(4, 2), -- e.g., 6.5
    ring_gauge INTEGER, -- e.g., 52
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- Binder types
CREATE TABLE binders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    value VARCHAR(50) UNIQUE NOT NULL, -- 'habano', 'maduro', 'connecticut'
    price_modifier DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- Flavor profiles/strengths
CREATE TABLE flavors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    value VARCHAR(50) UNIQUE NOT NULL, -- 'light', 'medium', 'strong'
    price_modifier DECIMAL(10, 2) DEFAULT 0.00,
    strength_level INTEGER, -- 1-5 scale
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- Band styles
CREATE TABLE band_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    value VARCHAR(50) UNIQUE NOT NULL, -- 'beveled', 'round', 'dome', 'square'
    price_modifier DECIMAL(10, 2) DEFAULT 0.00,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- Box types
CREATE TABLE box_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    value VARCHAR(50) UNIQUE NOT NULL, -- 'classic', 'rustic', 'modern'
    base_price DECIMAL(10, 2) NOT NULL,
    capacity INTEGER, -- number of cigars it holds
    material VARCHAR(100),
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- ============================================
-- ORDERS & CUSTOMIZATIONS
-- ============================================

-- Main orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Human-readable order number
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Order status
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, completed, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
    
    -- Pricing
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Shipping info
    shipping_address_id UUID REFERENCES addresses(id),
    billing_address_id UUID REFERENCES addresses(id),
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT
);

-- Order items (individual cigar customizations)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Cigar customization references
    cigar_size_id UUID REFERENCES cigar_sizes(id),
    binder_id UUID REFERENCES binders(id),
    flavor_id UUID REFERENCES flavors(id),
    band_style_id UUID REFERENCES band_styles(id),
    box_type_id UUID REFERENCES box_types(id),
    
    -- Custom text/engraving
    band_text VARCHAR(100),
    engraving_text VARCHAR(200),
    
    -- Quantity and pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Preview image (if generated)
    preview_image_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- PAYMENTS
-- ============================================

-- Payment transactions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    
    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50), -- 'credit_card', 'debit_card', etc.
    
    -- Payment processor info
    transaction_id VARCHAR(255), -- External payment processor transaction ID
    processor VARCHAR(50), -- 'authorize_net', 'stripe', etc.
    
    -- Card details (last 4 digits only for security)
    card_last_four VARCHAR(4),
    card_type VARCHAR(50), -- 'visa', 'mastercard', etc.
    cardholder_name VARCHAR(255),
    
    -- Billing address (stored separately for payment record)
    billing_street VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_zip VARCHAR(20),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    -- Refund info
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    refunded_at TIMESTAMP
);

-- ============================================
-- SAVED CUSTOMIZATIONS (CART/WISHLIST)
-- ============================================

-- User's saved customizations (not yet ordered)
CREATE TABLE saved_customizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Customization details (same as order_items)
    cigar_size_id UUID REFERENCES cigar_sizes(id),
    binder_id UUID REFERENCES binders(id),
    flavor_id UUID REFERENCES flavors(id),
    band_style_id UUID REFERENCES band_styles(id),
    box_type_id UUID REFERENCES box_types(id),
    
    band_text VARCHAR(100),
    engraving_text VARCHAR(200),
    quantity INTEGER DEFAULT 1,
    
    -- Type
    save_type VARCHAR(50) DEFAULT 'cart', -- 'cart' or 'wishlist'
    
    -- Preview
    preview_image_url VARCHAR(500),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REVIEWS & FEEDBACK
-- ============================================

-- Product reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_item_id UUID REFERENCES order_items(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    review_text TEXT,
    
    -- Admin moderation
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INVENTORY & PRODUCTION
-- ============================================

-- Production queue
CREATE TABLE production_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id),
    
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, quality_check
    assigned_to VARCHAR(100), -- Craftsperson/team name
    
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    production_notes TEXT,
    quality_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ADMIN & SETTINGS
-- ============================================

-- Site settings/configuration
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users (separate from customers)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- 'super_admin', 'admin', 'production', 'support'
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Could be user or admin
    user_type VARCHAR(20), -- 'customer' or 'admin'
    action VARCHAR(100) NOT NULL, -- 'create_order', 'update_status', etc.
    entity_type VARCHAR(50), -- 'order', 'user', 'product', etc.
    entity_id UUID,
    changes JSONB, -- Store the actual changes made
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_saved_customizations_user_id ON saved_customizations(user_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_production_queue_status ON production_queue(status);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert default cigar sizes
INSERT INTO cigar_sizes (name, value, base_price, length_inches, ring_gauge, description, sort_order) VALUES
('Robusto', 'robusto', 10.00, 5.0, 50, 'Classic robust size, perfect for a 45-minute smoke', 1),
('Gordo', 'gordo', 12.00, 6.0, 60, 'Thick and satisfying, provides a cool smoke', 2),
('Churchill', 'churchill', 14.00, 7.0, 47, 'Named after Winston Churchill, elegant and long', 3),
('Belicoso', 'belicoso', 14.00, 5.5, 52, 'Torpedo-shaped with a tapered head', 4);

-- Insert default binders
INSERT INTO binders (name, value, price_modifier, description, sort_order) VALUES
('Habano', 'habano', 0.00, 'Rich and spicy, traditional Cuban-seed wrapper', 1),
('Maduro', 'maduro', 1.00, 'Dark and sweet, aged for fuller flavor', 2),
('Connecticut', 'connecticut', 0.50, 'Smooth and mild, golden appearance', 3);

-- Insert default flavors
INSERT INTO flavors (name, value, price_modifier, strength_level, description, sort_order) VALUES
('Light', 'light', 0.00, 2, 'Mild and smooth, perfect for beginners', 1),
('Medium', 'medium', 2.00, 3, 'Balanced flavor with moderate strength', 2),
('Strong', 'strong', 2.00, 5, 'Bold and full-bodied, for experienced smokers', 3);

-- Insert default band styles
INSERT INTO band_styles (name, value, price_modifier, description, sort_order) VALUES
('Beveled', 'beveled', 2.00, 'Classic beveled edge design', 1),
('Round', 'round', 2.00, 'Smooth round band', 2),
('Dome', 'dome', 2.00, 'Elegant domed design', 3),
('Square', 'square', 2.00, 'Modern square edges', 4);

-- Insert default box types
INSERT INTO box_types (name, value, base_price, capacity, material, description, sort_order) VALUES
('Classic', 'classic', 20.00, 20, 'Cedar', 'Traditional cedar box with classic finish', 1),
('Rustic', 'rustic', 18.00, 20, 'Reclaimed Wood', 'Handcrafted rustic wooden box', 2),
('Modern', 'modern', 24.00, 20, 'Lacquered Wood', 'Contemporary design with glossy finish', 3);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('base_price', '30.00', 'Base price for all cigars before customization'),
('tax_rate', '0.08', 'Sales tax rate (8%)'),
('shipping_cost_standard', '9.99', 'Standard shipping cost'),
('shipping_cost_express', '24.99', 'Express shipping cost'),
('min_order_quantity', '1', 'Minimum order quantity'),
('max_order_quantity', '100', 'Maximum order quantity per order');
