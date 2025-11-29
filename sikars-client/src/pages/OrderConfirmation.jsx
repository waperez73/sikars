import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { 
  Package, 
  CheckCircle, 
  Download, 
  MapPin, 
  CreditCard, 
  Calendar,
  Truck,
  Mail,
  Phone,
  Home,
  ChevronRight
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader, user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/pdf`, {
        headers: {
          ...getAuthHeader()
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sikars-Invoice-${order.orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #6a4f3a',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: '#6a4f3a', fontSize: '16px' }}>Loading order details...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
        padding: '16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          <Package size={64} color="#e0e0e0" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '24px', color: '#1f1a17', marginBottom: '16px' }}>
            {error || 'Order Not Found'}
          </h2>
          <p style={{ color: '#8b7a6b', marginBottom: '24px' }}>
            We couldn't find the order you're looking for.
          </p>
          <button
            onClick={() => navigate('/orders')}
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
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      processing: '#007bff',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending Confirmation',
      confirmed: 'Order Confirmed',
      processing: 'In Production',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '40px'
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
          <button
            onClick={() => navigate('/orders')}
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
            View All Orders
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Success Banner */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '2px solid #d4af37',
          textAlign: 'center'
        }}>
          <CheckCircle size={64} color="#28a745" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f1a17', margin: '0 0 12px 0' }}>
            Order Confirmed!
          </h2>
          <p style={{ fontSize: '18px', color: '#8b7a6b', margin: '0 0 24px 0' }}>
            Thank you for your order, {user?.firstName}!
          </p>
          <div style={{
            display: 'inline-block',
            background: '#f9f5f0',
            padding: '16px 32px',
            borderRadius: '12px',
            border: '2px solid #e0e0e0'
          }}>
            <p style={{ fontSize: '14px', color: '#8b7a6b', margin: '0 0 8px 0' }}>
              Order Number
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', color: '#6a4f3a', margin: 0 }}>
              #{order.orderNumber}
            </p>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', marginBottom: '20px' }}>
            Order Status
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: getStatusColor(order.status)
            }} />
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: getStatusColor(order.status)
            }}>
              {getStatusText(order.status)}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#8b7a6b', margin: 0 }}>
            Your order is being processed. We'll send you updates via email.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Order Details */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #e0e0e0'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f1a17', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Package size={24} color="#6a4f3a" />
              Order Details
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Calendar size={16} color="#8b7a6b" />
                <span style={{ fontSize: '14px', color: '#8b7a6b' }}>Order Date</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17', margin: '0 0 0 24px' }}>
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Mail size={16} color="#8b7a6b" />
                <span style={{ fontSize: '14px', color: '#8b7a6b' }}>Email</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17', margin: '0 0 0 24px' }}>
                {user?.email}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Phone size={16} color="#8b7a6b" />
                <span style={{ fontSize: '14px', color: '#8b7a6b' }}>Phone</span>
              </div>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17', margin: '0 0 0 24px' }}>
                {user?.phone || 'Not provided'}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #e0e0e0'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#1f1a17', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <MapPin size={24} color="#6a4f3a" />
              Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17', margin: '0 0 4px 0' }}>
                  {order.shippingAddress.street}
                </p>
                <p style={{ fontSize: '14px', color: '#8b7a6b', margin: '0 0 4px 0' }}>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p style={{ fontSize: '14px', color: '#8b7a6b', margin: 0 }}>
                  {order.shippingAddress.country || 'USA'}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: '#8b7a6b' }}>
                Address will be confirmed via email
              </p>
            )}

            {order.shippingMethod && (
              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '1px solid #e0e0e0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Truck size={16} color="#8b7a6b" />
                  <span style={{ fontSize: '14px', color: '#8b7a6b' }}>Shipping Method</span>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17', margin: '0 0 0 24px' }}>
                  {order.shippingMethod}
                </p>
              </div>
            )}

            {order.trackingNumber && (
              <div style={{ 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '1px solid #e0e0e0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Package size={16} color="#8b7a6b" />
                  <span style={{ fontSize: '14px', color: '#8b7a6b' }}>Tracking Number</span>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#6a4f3a', margin: '0 0 0 24px' }}>
                  {order.trackingNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', marginBottom: '20px' }}>
            Order Items
          </h3>
          
          {order.items && order.items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                marginBottom: index < order.items.length - 1 ? '16px' : 0,
                background: '#f9f5f0',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                  Custom Cigar #{index + 1}
                </h4>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#6a4f3a' }}>
                  ${item.totalPrice?.toFixed(2) || '0.00'}
                </span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '0 0 4px 0' }}>Size</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                    {item.size || 'N/A'}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '0 0 4px 0' }}>Binder</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                    {item.binder || 'N/A'}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '0 0 4px 0' }}>Flavor</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                    {item.flavor || 'N/A'}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '0 0 4px 0' }}>Band Style</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                    {item.bandStyle || 'N/A'}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '0 0 4px 0' }}>Box Type</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                    {item.box || 'N/A'}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '0 0 4px 0' }}>Quantity</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                    {item.quantity || 1}
                  </p>
                </div>
              </div>

              {(item.bandText || item.engraving) && (
                <div style={{ 
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  {item.bandText && (
                    <div style={{ marginBottom: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '0 0 4px 0' }}>
                        Band Text
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#6a4f3a', margin: 0 }}>
                        "{item.bandText}"
                      </p>
                    </div>
                  )}

                  {item.engraving && (
                    <div>
                      <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '0 0 4px 0' }}>
                        Box Engraving
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#6a4f3a', margin: 0 }}>
                        "{item.engraving}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #e0e0e0'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1f1a17', 
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CreditCard size={24} color="#6a4f3a" />
            Order Summary
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px', color: '#8b7a6b' }}>Subtotal</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17' }}>
                ${order.subtotal?.toFixed(2) || '0.00'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '16px', color: '#8b7a6b' }}>Tax</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17' }}>
                ${order.tax?.toFixed(2) || '0.00'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '16px', color: '#8b7a6b' }}>Shipping</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17' }}>
                ${order.shippingCost?.toFixed(2) || '0.00'}
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '2px solid #e0e0e0'
            }}>
              <span style={{ fontSize: '20px', fontWeight: '700', color: '#1f1a17' }}>Total</span>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#6a4f3a' }}>
                ${order.totalAmount?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <button
            onClick={downloadInvoice}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Download size={20} />
            Download Invoice
          </button>

          <button
            onClick={() => navigate('/builder')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: 'white',
              color: '#6a4f3a',
              border: '2px solid #6a4f3a',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Package size={20} />
            Create Another Order
          </button>

          <button
            onClick={() => navigate('/orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: 'white',
              color: '#6a4f3a',
              border: '2px solid #6a4f3a',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Home size={20} />
            View All Orders
          </button>
        </div>

        {/* Help Section */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: '#fff3cd',
          borderRadius: '12px',
          border: '2px solid #ffc107',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f1a17', marginBottom: '8px' }}>
            Need Help?
          </h3>
          <p style={{ fontSize: '14px', color: '#8b7a6b', marginBottom: '16px' }}>
            If you have any questions about your order, please contact us.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <a
              href="mailto:support@sikars.com"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6a4f3a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <Mail size={16} />
              support@sikars.com
            </a>
            <a
              href="tel:+15551234567"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#6a4f3a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <Phone size={16} />
              (555) 123-4567
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderConfirmation;