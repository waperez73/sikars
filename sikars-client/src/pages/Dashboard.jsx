import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Package, User, ShoppingBag, LogOut, Settings } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, getAuthHeader } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: '#6a4f3a',
        color: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={28} />
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Sikars</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px' }}>
              Welcome, {user?.firstName || 'User'}!
            </span>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f1a17', marginBottom: '24px' }}>
          Dashboard
        </h2>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => navigate('/builder')}
            style={{
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Package size={32} color="#6a4f3a" />
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1f1a17' }}>
                Build Custom Cigar
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#8b7a6b' }}>
                Create your perfect cigar
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/orders')}
            style={{
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <ShoppingBag size={32} color="#6a4f3a" />
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1f1a17' }}>
                Order History
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#8b7a6b' }}>
                View past orders
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <User size={32} color="#6a4f3a" />
            <div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1f1a17' }}>
                Profile
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#8b7a6b' }}>
                Manage your account
              </p>
            </div>
          </button>
        </div>

        {/* Recent Orders */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '2px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', marginBottom: '16px' }}>
            Recent Orders
          </h3>

          {loading ? (
            <p style={{ color: '#8b7a6b', textAlign: 'center', padding: '24px' }}>
              Loading orders...
            </p>
          ) : error ? (
            <p style={{ color: '#dc3545', textAlign: 'center', padding: '24px' }}>
              {error}
            </p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <Package size={48} color="#e0e0e0" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#8b7a6b', fontSize: '16px', marginBottom: '16px' }}>
                No orders yet
              </p>
              <button
                onClick={() => navigate('/builder')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Your First Order
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  style={{
                    padding: '16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1f1a17' }}>
                      Order #{order.orderNumber}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#8b7a6b' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '700', color: '#6a4f3a' }}>
                      ${order.totalAmount}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#8b7a6b' }}>
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
