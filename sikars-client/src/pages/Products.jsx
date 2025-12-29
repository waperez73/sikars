import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Products() {
  const navigate = useNavigate();
  const { addProduct, isInCart, getItemQuantity } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    setAddingProduct(productId);
    const result = await addProduct(productId, 1);
    setAddingProduct(null);
    
    if (result.success) {
      alert('Added to cart!');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#6a4f3a', marginBottom: '32px' }}>
          Pre-Built Cigar Collections
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '2px solid #e0e0e0',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/products/${product.slug}`)}
            >
              {product.primary_image_url && (
                <img
                  src={product.primary_image_url}
                  alt={product.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              )}
              
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#6a4f3a', marginBottom: '8px' }}>
                  {product.name}
                </h3>
                
                <p style={{ fontSize: '14px', color: '#8b7a6b', marginBottom: '16px' }}>
                  {product.short_description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Star size={16} color="#d4af37" fill="#d4af37" />
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {product.average_rating > 0 ? product.average_rating.toFixed(1) : 'No reviews'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#8b7a6b' }}>
                    ({product.review_count} reviews)
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#6a4f3a' }}>
                    ${parseFloat(product.base_price).toFixed(2)}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                    disabled={addingProduct === product.id || !product.in_stock}
                    style={{
                      padding: '10px 20px',
                      background: isInCart(product.id) 
                        ? '#28a745' 
                        : 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShoppingCart size={16} />
                    {isInCart(product.id) ? `In Cart (${getItemQuantity(product.id)})` : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Products;    