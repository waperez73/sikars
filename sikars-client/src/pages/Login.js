import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

// API configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get any passed state (like success message from registration)
  const registrationMessage = location.state?.message;
  const registrationEmail = location.state?.email;

  const [formData, setFormData] = useState({
    email: registrationEmail || '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState(registrationMessage || '');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setApiError('');
    setSuccessMessage('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      // Call backend API
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        }),
      });

      // Parse response
      const data = await response.json();

      // Handle response
      if (response.ok) {
        // Success! Store token and user data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // If "Remember Me" is checked, also store in sessionStorage
        if (formData.rememberMe) {
          sessionStorage.setItem('rememberMe', 'true');
        }

        // Show success message briefly
        setSuccessMessage('Login successful! Redirecting...');

        // Redirect to builder or intended destination
        const intendedDestination = location.state?.from || '/';
        
        setTimeout(() => {
          navigate(intendedDestination, { replace: true });
        }, 1000);

      } else {
        // Handle error responses
        if (response.status === 401) {
          // Invalid credentials
          setApiError(data.message || 'Invalid email or password. Please try again.');
          setErrors({ 
            email: ' ',  // Mark field as error without specific message
            password: ' '
          });
        } else if (response.status === 403) {
          // Account deactivated
          setApiError(data.message || 'Your account has been deactivated. Please contact support.');
        } else if (response.status === 400) {
          // Validation errors
          setApiError(data.message || 'Please check your input and try again.');
        } else if (response.status === 500) {
          // Server error
          setApiError('Server error. Please try again later.');
        } else {
          // Generic error
          setApiError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      // Network or other errors
      console.error('Login error:', error);
      setApiError('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      // Reset loading state
      setIsSubmitting(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    // Navigate to forgot password page (to be implemented)
    navigate('/forgot-password');
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
        padding: '40px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        border: '2px solid #e0e0e0'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Package size={32} color="#6a4f3a" />
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#6a4f3a',
              margin: 0
            }}>
              Welcome Back
            </h2>
          </div>
          <p style={{ color: '#8b7a6b', fontSize: '14px', margin: 0 }}>
            Sign in to your Sikars account
          </p>
        </div>

        {/* Success Message (from registration or login) */}
        {successMessage && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={20} color="#155724" />
            <span style={{ color: '#155724', fontSize: '14px' }}>{successMessage}</span>
          </div>
        )}

        {/* API Error Message */}
        {apiError && (
          <div style={{
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={20} color="#721c24" />
            <span style={{ color: '#721c24', fontSize: '14px' }}>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={isSubmitting}
              autoComplete="email"
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.email ? '#dc3545' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                opacity: isSubmitting ? 0.6 : 1
              }}
            />
            {errors.email && errors.email !== ' ' && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={isSubmitting}
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '45px',
                  fontSize: '16px',
                  border: `2px solid ${errors.password ? '#dc3545' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#8b7a6b'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && errors.password !== ' ' && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1f1a17'
            }}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{ 
                  width: '16px', 
                  height: '16px',
                  cursor: 'pointer' 
                }}
              />
              <span>Remember me</span>
            </label>

            <a
              href="/forgot-password"
              onClick={handleForgotPassword}
              style={{
                color: '#6a4f3a',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Forgot Password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              background: isSubmitting 
                ? '#ccc' 
                : 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#8b7a6b'
          }}>
            Don't have an account?{' '}
            <a 
              href="/signup" 
              style={{ 
                color: '#6a4f3a', 
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onClick={(e) => {
                if (!isSubmitting) {
                  e.preventDefault();
                  navigate('/signup');
                }
              }}
            >
              Sign Up
            </a>
          </div>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '24px 0',
          color: '#8b7a6b',
          fontSize: '14px'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
          <span style={{ padding: '0 16px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
        </div>

        {/* Continue as Guest */}
        <button
          onClick={() => navigate('/builder')}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '14px',
            background: 'white',
            color: '#6a4f3a',
            border: '2px solid #6a4f3a',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
            opacity: isSubmitting ? 0.6 : 1
          }}
        >
          Continue as Guest
        </button>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a 
            href="/" 
            style={{
              color: '#8b7a6b',
              textDecoration: 'none',
              fontSize: '14px'
            }}
            onClick={(e) => {
              if (!isSubmitting) {
                e.preventDefault();
                navigate('/');
              }
            }}
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
