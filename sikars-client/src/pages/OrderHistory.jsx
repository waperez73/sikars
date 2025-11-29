import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar,
  DollarSign,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  LogOut
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function OrderHistory() {
  const navigate = useNavigate();
  const { getAuthHeader, user, logout } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchQuery, statusFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (response.status === 401) {
        setError('Session expired. Please log in again.');
        setTimeout(() => logout(), 2000);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount-desc':
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'amount-asc':
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock size={20} color="#ffc107" />,
      confirmed: <CheckCircle size={20} color="#17a2b8" />,
      processing: <RefreshCw size={20} color="#007bff" />,
      completed: <CheckCircle size={20} color="#28a745" />,
      cancelled: <XCircle size={20} color="#dc3545" />
    };
    return icons[status] || <Package size={20} color="#6c757d" />;
  };

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
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'In Production',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const downloadInvoice = async (orderId, orderNumber) => {
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
        a.download = `Sikars-Invoice-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download invoice');
      }
    } catch (err) {
      console.error('Error downloading invoice:', err);
      alert('Failed to download invoice');
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
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
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
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Sikars</h1>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>Order History</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
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
              Dashboard
            </button>
            <button
              onClick={logout}
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

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#1f1a17', marginBottom: '8px' }}>
            My Orders
          </h2>
          <p style={{ fontSize: '16px', color: '#8b7a6b', margin: 0 }}>
            View and manage your order history
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #e0e0e0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Search */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                Search Orders
              </label>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8b7a6b'
                  }}
                />
                <input
                  type="text"
                  placeholder="Order number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                Status
              </label>
              <div style={{ position: 'relative' }}>
                <Filter 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8b7a6b',
                    pointerEvents: 'none'
                  }}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    fontSize: '16px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontFamily: 'inherit',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">In Production</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ fontSize: '14px', color: '#8b7a6b', margin: 0 }}>
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <button
              onClick={fetchOrders}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'transparent',
                border: '2px solid #6a4f3a',
                borderRadius: '8px',
                color: '#6a4f3a',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e0e0e0',
              borderTop: '4px solid #6a4f3a',
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#8b7a6b', fontSize: '16px' }}>Loading orders...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #dc3545'
          }}>
            <AlertCircle size={48} color="#dc3545" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', color: '#dc3545', marginBottom: '8px' }}>
              {error}
            </h3>
            <button
              onClick={fetchOrders}
              style={{
                marginTop: '16px',
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
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px 24px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <Package size={64} color="#e0e0e0" style={{ margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: '24px', color: '#1f1a17', marginBottom: '12px' }}>
              {searchQuery || statusFilter !== 'all' ? 'No matching orders' : 'No orders yet'}
            </h3>
            <p style={{ fontSize: '16px', color: '#8b7a6b', marginBottom: '24px' }}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more results'
                : 'Start building your custom cigars today!'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/builder')}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Package size={20} />
                Create Your First Order
              </button>
            )}
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: '2px solid #e0e0e0',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/order-confirmation/${order.id}`)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '20px',
                  alignItems: 'center'
                }}>
                  {/* Status Icon */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${getStatusColor(order.status)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getStatusIcon(order.status)}
                  </div>

                  {/* Order Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                        Order #{order.orderNumber}
                      </h3>
                      <span style={{
                        padding: '4px 12px',
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '6px'
                      }}>
                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      gap: '20px', 
                      fontSize: '14px', 
                      color: '#8b7a6b',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={16} />
                        <span>{order.items?.length || 0} item(s)</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <DollarSign size={16} />
                        <span style={{ fontWeight: '600', color: '#6a4f3a' }}>
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>

                      {order.trackingNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Truck size={16} />
                          <span>Tracking: {order.trackingNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order-confirmation/${order.id}`);
                      }}
                      style={{
                        padding: '10px',
                        background: '#f9f5f0',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        color: '#6a4f3a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadInvoice(order.id, order.orderNumber);
                      }}
                      style={{
                        padding: '10px',
                        background: '#f9f5f0',
                        border: '2px solid #e0e0e0',
                        borderRadius: '8px',
                        color: '#6a4f3a',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Download Invoice"
                    >
                      <Download size={20} />
                    </button>

                    <ChevronRight size={24} color="#8b7a6b" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create New Order Button */}
        {!loading && filteredOrders.length > 0 && (
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/builder')}
              style={{
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Package size={20} />
              Create New Order
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default OrderHistory;