import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Builder from './Builder';
import Signup from './Signup';
import SubmitPayment from './Submitpayment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/login" element={<LoginPlaceholder />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment" element={<SubmitPayment />} />
      </Routes>
    </Router>
  );
}
// Placeholder Login Page - replace with your actual login component
function LoginPlaceholder() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        border: '2px solid #e0e0e0'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#6a4f3a',
          margin: '0 0 24px 0',
          textAlign: 'center'
        }}>
          Login to Sikars
        </h2>
        
        <form onSubmit={(e) => { e.preventDefault(); alert('Login functionality to be implemented'); }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            Sign In
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: '#8b7a6b'
          }}>
            <a href="/forgot-password" style={{ color: '#6a4f3a', textDecoration: 'none' }}>
              Forgot Password?
            </a>
            <a href="/signup" style={{ color: '#6a4f3a', textDecoration: 'none' }}>
              Sign Up
            </a>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/" style={{
            color: '#8b7a6b',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;