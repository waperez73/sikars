import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

function CartBadge({ color = 'white', badgeColor = '#d4af37' }) {
  const navigate = useNavigate();
  const { getCartSummary } = useCart();
  const summary = getCartSummary();

  return (
    <button
      onClick={() => navigate('/cart')}
      style={{
        position: 'relative',
        padding: '8px',
        borderRadius: '8px',
        border: 'none',
        background: 'rgba(255,255,255,0.2)',
        color: color,
        cursor: 'pointer'
      }}
    >
      <ShoppingCart size={20} />
      {summary.itemCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: badgeColor,
          color: '#1f1a17',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '11px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {summary.itemCount}
        </span>
      )}
    </button>
  );
}

export default CartBadge;