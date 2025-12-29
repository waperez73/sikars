import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addProduct, isInCart, getItemQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setAdding(true);
    const result = await addProduct(product.id, quantity);
    setAdding(false);
    
    if (result.success) {
      alert('Added to cart!');
      navigate('/cart');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!product) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Product not found</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/products')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#6a4f3a',
            fontSize: '14px',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '40px' 
        }}>
          {/* Product Image */}
          <div>
            <img
              src={product.primary_image_url}
              alt={product.name}
              style={{
                width: '100%',
                borderRadius: '16px',
                border: '2px solid #e0e0e0'
              }}
            />
          </div>

          {/* Product Details */}
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#6a4f3a', marginBottom: '16px' }}>
              {product.name}
            </h1>

            <p style={{ fontSize: '18px', color: '#8b7a6b', lineHeight: '1.6', marginBottom: '24px' }}>
              {product.description}
            </p>

            {/* Product Specs */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: '2px solid #e0e0e0'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Specifications</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b7a6b' }}>Cigar Count:</span>
                  <span style={{ fontWeight: '600' }}>{product.cigar_count} cigars</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b7a6b' }}>Size:</span>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{product.cigar_size}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b7a6b' }}>Binder:</span>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{product.binder_type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b7a6b' }}>Flavor:</span>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{product.flavor_profile}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b7a6b' }}>Box Type:</span>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{product.box_type}</span>
                </div>
              </div>
            </div>

            {/* Price & Add to Cart */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '2px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#6a4f3a', marginBottom: '16px' }}>
                ${parseFloat(product.base_price).toFixed(2)}
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Quantity:</span>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '2px solid #6a4f3a',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: '2px solid #6a4f3a',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || !product.in_stock}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: adding || !product.in_stock
                    ? '#ccc'
                    : 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#1f1a17',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: adding || !product.in_stock ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <ShoppingCart size={20} />
                {adding ? 'Adding...' : product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {product.stock_quantity <= product.low_stock_threshold && product.in_stock && (
                <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                  Only {product.stock_quantity} left in stock!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;