import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  ShoppingCart, Trash2, Plus, Minus, Package, 
  ArrowRight, ArrowLeft, AlertCircle, CheckCircle 
} from 'lucide-react';

function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, updateQuantity, removeItem, getCartSummary } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingItems, setUpdatingItems] = useState({});
  const [removingItems, setRemovingItems] = useState({});

  const summary = getCartSummary();

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
    const result = await updateQuantity(itemId, newQuantity);
    setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    
    if (!result.success) {
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Remove this item from your cart?')) return;
    
    setRemovingItems(prev => ({ ...prev, [itemId]: true }));
    const result = await removeItem(itemId);
    setRemovingItems(prev => ({ ...prev, [itemId]: false }));
    
    if (!result.success) {
      alert('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      // Save cart and redirect to login
      alert('Please sign in to complete your purchase');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Package size={48} color="#6a4f3a" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#6a4f3a', fontSize: '18px' }}>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#6a4f3a',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ShoppingCart size={36} color="#6a4f3a" />
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#6a4f3a', margin: 0 }}>
                Shopping Cart
              </h1>
              <p style={{ color: '#8b7a6b', fontSize: '14px', margin: 0 }}>
                {summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={24} color="#721c24" />
            <span style={{ color: '#721c24' }}>{error}</span>
          </div>
        )}

        {cartItems.length === 0 ? (
          // Empty Cart
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '64px 32px',
            textAlign: 'center',
            border: '2px solid #e0e0e0'
          }}>
            <ShoppingCart size={64} color="#8b7a6b" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#6a4f3a', marginBottom: '12px' }}>
              Your cart is empty
            </h2>
            <p style={{ color: '#8b7a6b', marginBottom: '32px' }}>
              Start building your perfect cigar collection!
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/products')}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Browse Products
              </button>
              <button
                onClick={() => navigate('/builder')}
                style={{
                  padding: '14px 32px',
                  background: 'white',
                  color: '#6a4f3a',
                  border: '2px solid #6a4f3a',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Custom Builder
              </button>
            </div>
          </div>
        ) : (
          // Cart with Items
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', '@media (min-width: 768px)': { gridTemplateColumns: '2fr 1fr' } }}>
            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '2px solid #e0e0e0',
                    opacity: removingItems[item.id] ? 0.5 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {/* Product Image */}
                    {item.primary_image_url && (
                      <img
                        src={item.primary_image_url}
                        alt={item.product_name || 'Custom Cigar'}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '1px solid #e0e0e0'
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}

                    {/* Item Details */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#6a4f3a', margin: '0 0 8px 0' }}>
                        {item.is_custom ? 'Custom Cigar Box' : item.product_name}
                      </h3>
                      
                      {item.is_custom ? (
                        // Custom cigar details
                        <div style={{ fontSize: '14px', color: '#8b7a6b', marginBottom: '12px' }}>
                          <div>Size: {item.custom_cigar_size}</div>
                          <div>Binder: {item.custom_binder}</div>
                          <div>Flavor: {item.custom_flavor}</div>
                          <div>Band: {item.custom_band_style}</div>
                          {item.custom_engraving && <div>Engraving: "{item.custom_engraving}"</div>}
                        </div>
                      ) : (
                        // Product details
                        <p style={{ fontSize: '14px', color: '#8b7a6b', margin: '0 0 12px 0' }}>
                          {item.short_description}
                        </p>
                      )}

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updatingItems[item.id] || item.quantity <= 1}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '2px solid #6a4f3a',
                              background: 'white',
                              color: '#6a4f3a',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: item.quantity <= 1 ? 0.5 : 1
                            }}
                          >
                            <Minus size={16} />
                          </button>
                          
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            minWidth: '40px', 
                            textAlign: 'center' 
                          }}>
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updatingItems[item.id]}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '2px solid #6a4f3a',
                              background: 'white',
                              color: '#6a4f3a',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingItems[item.id]}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: '#dc3545',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#6a4f3a' }}>
                        ${parseFloat(item.total_price).toFixed(2)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8b7a6b', marginTop: '4px' }}>
                        ${parseFloat(item.unit_price).toFixed(2)} each
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: '2px solid #e0e0e0',
                position: 'sticky',
                top: '20px'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#6a4f3a', margin: '0 0 20px 0' }}>
                  Order Summary
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#8b7a6b' }}>Subtotal ({summary.totalQuantity} boxes)</span>
                    <span style={{ fontWeight: '600' }}>${summary.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#8b7a6b' }}>Tax (8%)</span>
                    <span style={{ fontWeight: '600' }}>${summary.tax.toFixed(2)}</span>
                  </div>
                  <div style={{ 
                    borderTop: '2px solid #e0e0e0', 
                    paddingTop: '12px', 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '18px'
                  }}>
                    <span style={{ fontWeight: '700', color: '#6a4f3a' }}>Total</span>
                    <span style={{ fontWeight: '700', color: '#6a4f3a' }}>${summary.total.toFixed(2)}</span>
                  </div>
                </div>

                {!isAuthenticated() && (
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    fontSize: '13px',
                    color: '#856404'
                  }}>
                    <AlertCircle size={16} style={{ marginRight: '8px', display: 'inline' }} />
                    Please sign in to complete your purchase
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                    color: '#1f1a17',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>

                <button
                  onClick={() => navigate('/products')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'white',
                    color: '#6a4f3a',
                    border: '2px solid #6a4f3a',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Responsive CSS */}
      <style>{`
        @media (min-width: 768px) {
          .cart-layout {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Cart;
