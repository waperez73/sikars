-- Shopping Cart & Products Database Schema
-- File: backend/src/database/migrations/add_shopping_cart_and_products.sql

-- ============================================
-- PRODUCTS TABLE (Pre-built Cigar Boxes)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Product Details
    cigar_count INTEGER DEFAULT 20,
    
    -- Cigar Specifications (what's in this box)
    cigar_size VARCHAR(50), -- 'robusto', 'gordo', 'churchill', 'belicoso'
    binder_type VARCHAR(50), -- 'habano', 'maduro', 'connecticut'
    flavor_profile VARCHAR(50), -- 'light', 'medium', 'strong'
    band_style VARCHAR(50), -- 'beveled', 'round', 'dome', 'square'
    
    -- Box Details
    box_type VARCHAR(50), -- 'classic', 'rustic', 'modern'
    box_material VARCHAR(100),
    
    -- Pricing
    base_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2), -- Optional sale price
    cost_price DECIMAL(10, 2), -- Cost for profit tracking
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    in_stock BOOLEAN DEFAULT true,
    
    -- Media
    primary_image_url VARCHAR(500),
    gallery_images JSONB, -- Array of additional image URLs
    
    -- SEO & Marketing
    featured BOOLEAN DEFAULT false,
    best_seller BOOLEAN DEFAULT false,
    new_arrival BOOLEAN DEFAULT false,
    
    -- Categories/Tags (JSONB for flexibility)
    categories JSONB, -- ['premium', 'gift', 'limited-edition']
    tags JSONB, -- ['mild', 'beginner-friendly', 'special-occasion']
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_customizable BOOLEAN DEFAULT false, -- Can customer customize this product?
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB -- Flexible field for additional data
);

-- ============================================
-- SHOPPING CART TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS shopping_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest users
    
    -- Cart status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'abandoned', 'converted'
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- Auto-expire after 30 days
    
    -- Constraints: Either user_id OR session_id must exist
    CONSTRAINT cart_user_or_session CHECK (
        (user_id IS NOT NULL) OR (session_id IS NOT NULL)
    )
);

-- ============================================
-- SHOPPING CART ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES shopping_cart(id) ON DELETE CASCADE,
    
    -- Product Reference (for pre-built boxes)
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    -- Custom Cigar References (for custom builds from Builder)
    is_custom BOOLEAN DEFAULT false,
    custom_cigar_size VARCHAR(50),
    custom_binder VARCHAR(50),
    custom_flavor VARCHAR(50),
    custom_band_style VARCHAR(50),
    custom_box_type VARCHAR(50),
    custom_engraving VARCHAR(200),
    custom_band_text VARCHAR(100),
    
    -- Quantity & Pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Snapshot of product data at time of add (in case product changes)
    product_snapshot JSONB,
    
    -- Timestamps
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (total_price >= 0),
    CHECK (
        (product_id IS NOT NULL AND is_custom = false) OR
        (is_custom = true)
    )
);

-- ============================================
-- PRODUCT REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id), -- Optional: link to verified purchase
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    review_text TEXT,
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Verification
    verified_purchase BOOLEAN DEFAULT false,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    moderation_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one review per user per product
    UNIQUE(product_id, user_id)
);

-- ============================================
-- PRODUCT VARIANTS TABLE (Optional - for future use)
-- ============================================

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    -- Variant Details
    variant_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    
    -- Variant-specific attributes
    attributes JSONB, -- {'size': 'large', 'color': 'dark'}
    
    -- Pricing (can override product pricing)
    price DECIMAL(10, 2),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WISHLIST TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    notes TEXT,
    priority INTEGER, -- 1 = high, 2 = medium, 3 = low
    
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- One product per user in wishlist
    UNIQUE(user_id, product_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Shopping cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_session_id ON shopping_cart(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_status ON shopping_cart(status);
CREATE INDEX IF NOT EXISTS idx_cart_updated_at ON shopping_cart(updated_at);

-- Cart items indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_is_custom ON cart_items(is_custom);

-- Product reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update updated_at timestamp on products
CREATE OR REPLACE FUNCTION update_products_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_timestamp();

-- Update updated_at timestamp on cart
CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_timestamp
BEFORE UPDATE ON shopping_cart
FOR EACH ROW
EXECUTE FUNCTION update_cart_timestamp();

-- Update cart updated_at when cart items change
CREATE OR REPLACE FUNCTION update_cart_on_item_change()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shopping_cart
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = COALESCE(NEW.cart_id, OLD.cart_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cart_on_item_change
AFTER INSERT OR UPDATE OR DELETE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_on_item_change();

-- ============================================
-- SAMPLE PRODUCTS DATA
-- ============================================

-- Classic Collection
INSERT INTO products (
    name, slug, description, short_description,
    cigar_count, cigar_size, binder_type, flavor_profile, band_style, box_type,
    base_price, stock_quantity, primary_image_url,
    featured, categories, tags, is_active
) VALUES
(
    'Classic Robusto Collection',
    'classic-robusto-collection',
    'Our signature Robusto blend featuring the finest Dominican tobacco wrapped in premium Habano leaf. Each box contains 20 perfectly crafted cigars with our classic beveled band and elegant cedar box. Perfect for both connoisseurs and those new to premium cigars.',
    'Premium Robusto cigars in classic cedar box - 20 count',
    20, 'robusto', 'habano', 'medium', 'beveled', 'classic',
    280.00, 50, '/images/products/classic-robusto.jpg',
    true, '["premium", "signature", "gift"]'::jsonb, '["medium-bodied", "smooth", "popular"]'::jsonb, true
),
(
    'Maduro Gordo Reserve',
    'maduro-gordo-reserve',
    'Full-bodied Gordo cigars wrapped in aged Maduro leaf, delivering rich, complex flavors with hints of espresso and dark chocolate. Presented in our rustic hand-crafted wooden box with round signature band.',
    'Rich Maduro Gordo cigars in rustic box - 20 count',
    20, 'gordo', 'maduro', 'strong', 'round', 'rustic',
    340.00, 30, '/images/products/maduro-gordo.jpg',
    true, '["premium", "bold"]'::jsonb, '["full-bodied", "rich", "dark"]'::jsonb, true
),
(
    'Connecticut Churchill Elegance',
    'connecticut-churchill-elegance',
    'Smooth and refined Churchill cigars wrapped in golden Connecticut leaf. A mild to medium smoke with creamy notes and a hint of natural sweetness. Packaged in our modern lacquered box with dome-style bands.',
    'Smooth Connecticut Churchill cigars - 20 count',
    20, 'churchill', 'connecticut', 'light', 'dome', 'modern',
    320.00, 40, '/images/products/connecticut-churchill.jpg',
    false, '["smooth", "gift"]'::jsonb, '["mild", "beginner-friendly", "smooth"]'::jsonb, true
),
(
    'Belicoso Sampler Box',
    'belicoso-sampler-box',
    'A curated selection of our finest Belicoso cigars featuring a variety of wrapper types and flavor profiles. Perfect for exploring different tastes or gifting to the discerning aficionado.',
    'Assorted Belicoso cigars - 20 count sampler',
    20, 'belicoso', 'habano', 'medium', 'square', 'classic',
    300.00, 25, '/images/products/belicoso-sampler.jpg',
    false, '["sampler", "variety"]'::jsonb, '["mixed", "exploration", "gift"]'::jsonb, true
),
(
    'Limited Edition Heritage Box',
    'limited-edition-heritage-box',
    'Our most exclusive offering featuring rare tobacco aged for over 5 years. Only 100 boxes produced annually. Each Robusto is hand-rolled by our master craftsmen and presented in a premium modern box with custom engraving.',
    'Ultra-premium limited edition cigars - 20 count',
    20, 'robusto', 'maduro', 'strong', 'beveled', 'modern',
    480.00, 10, '/images/products/heritage-limited.jpg',
    true, '["premium", "limited-edition", "exclusive"]'::jsonb, '["rare", "collector", "aged"]'::jsonb, true
);

-- Update stock status based on quantity
UPDATE products SET in_stock = (stock_quantity > 0);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for active products with stock
CREATE OR REPLACE VIEW available_products AS
SELECT 
    p.*,
    CASE 
        WHEN p.stock_quantity = 0 THEN 'out_of_stock'
        WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
        ELSE 'in_stock'
    END as stock_status,
    COALESCE(pr.avg_rating, 0) as average_rating,
    COALESCE(pr.review_count, 0) as review_count
FROM products p
LEFT JOIN (
    SELECT 
        product_id,
        AVG(rating) as avg_rating,
        COUNT(*) as review_count
    FROM product_reviews
    WHERE is_approved = true
    GROUP BY product_id
) pr ON p.id = pr.product_id
WHERE p.is_active = true;

-- View for cart summary
CREATE OR REPLACE VIEW cart_summary AS
SELECT 
    c.id as cart_id,
    c.user_id,
    c.session_id,
    COUNT(ci.id) as item_count,
    SUM(ci.quantity) as total_quantity,
    SUM(ci.total_price) as subtotal,
    c.updated_at as last_updated
FROM shopping_cart c
LEFT JOIN cart_items ci ON c.id = ci.cart_id
WHERE c.status = 'active'
GROUP BY c.id, c.user_id, c.session_id, c.updated_at;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE products IS 'Pre-built cigar box products (20 cigars per box)';
COMMENT ON TABLE shopping_cart IS 'User shopping carts (supports both logged-in and guest users)';
COMMENT ON TABLE cart_items IS 'Items in shopping cart (supports both products and custom builds)';
COMMENT ON TABLE product_reviews IS 'Customer reviews for products';
COMMENT ON TABLE wishlist IS 'User wishlist for products';

COMMENT ON COLUMN products.cigar_count IS 'Number of cigars in the box (default: 20)';
COMMENT ON COLUMN products.is_customizable IS 'Whether customers can customize this product';
COMMENT ON COLUMN cart_items.is_custom IS 'True if this is a custom build from Builder, false if pre-built product';
COMMENT ON COLUMN cart_items.product_snapshot IS 'Snapshot of product data at time of add to cart';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✓ Shopping cart and products tables created successfully';
    RAISE NOTICE '✓ 5 sample products added';
    RAISE NOTICE '✓ Indexes and triggers created';
    RAISE NOTICE '✓ Helper views created';
END $$;
