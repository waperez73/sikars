import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Package } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      setVerifying(true);
      
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Update user data in localStorage if logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.emailVerified = true;
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Redirect after 3 seconds
        setTimeout(() => {
          const isLoggedIn = localStorage.getItem('authToken');
          if (isLoggedIn) {
            navigate('/profile');
          } else {
            navigate('/login');
          }
        }, 3000);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Unable to verify email. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

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
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        border: '2px solid #e0e0e0'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <Package size={64} color="#6a4f3a" style={{ margin: '0 auto' }} />
        </div>

        {/* Loading State */}
        {verifying && (
          <div>
            <Loader 
              size={48} 
              color="#6a4f3a" 
              style={{ 
                margin: '0 auto 24px',
                animation: 'spin 1s linear infinite'
              }} 
            />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1f1a17', marginBottom: '12px' }}>
              Verifying Your Email
            </h2>
            <p style={{ fontSize: '16px', color: '#8b7a6b', margin: 0 }}>
              Please wait while we verify your email address...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Success State */}
        {!verifying && success && (
          <div>
            <CheckCircle size={64} color="#28a745" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#28a745', marginBottom: '12px' }}>
              Email Verified!
            </h2>
            <p style={{ fontSize: '16px', color: '#8b7a6b', marginBottom: '24px' }}>
              Your email has been successfully verified. You now have full access to all Sikars features.
            </p>
            <div style={{
              padding: '16px',
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', color: '#155724', margin: 0 }}>
                Redirecting you in a few seconds...
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
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
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Error State */}
        {!verifying && error && (
          <div>
            <XCircle size={64} color="#dc3545" style={{ margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#dc3545', marginBottom: '12px' }}>
              Verification Failed
            </h2>
            <p style={{ fontSize: '16px', color: '#8b7a6b', marginBottom: '24px' }}>
              {error}
            </p>
            <div style={{
              padding: '16px',
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', color: '#721c24', margin: 0 }}>
                The verification link may have expired or already been used.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/profile')}
                style={{
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Request New Link
              </button>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '14px 24px',
                  background: 'white',
                  color: '#6a4f3a',
                  border: '2px solid #6a4f3a',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailVerification;
