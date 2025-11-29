import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';

// Import pages
import LandingPage from './pages/LandingPage';
import Builder from './pages/Builder';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './context/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Semi-Protected Routes (can access as guest but better with auth) */}
          <Route path="/builder" element={<Builder />} />
          
          {/* Protected Routes (require authentication) */}
          <Route 
            path="/payment" 
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/order-confirmation/:orderId" 
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Simple 404 Component
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '72px', margin: '0 0 16px 0', color: '#6a4f3a' }}>404</h1>
        <h2 style={{ fontSize: '24px', margin: '0 0 16px 0', color: '#1f1a17' }}>Page Not Found</h2>
        <p style={{ fontSize: '16px', color: '#8b7a6b', marginBottom: '24px' }}>
          The page you're looking for doesn't exist.
        </p>
        <a 
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: '600'
          }}
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}

export default App;