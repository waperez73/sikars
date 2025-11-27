import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertCircle, CheckCircle } from 'lucide-react';

// API configuration - reads from environment variable or defaults to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Signup() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '', // Optional field
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, validate format)
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
      // Prepare data for API
      const registrationData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim() || null
      };

      // Call backend API
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      // Parse response
      const data = await response.json();

      // Handle response
      if (response.ok) {
        // Success! Show success message
        setSuccessMessage('Account created successfully! Redirecting to login...');
        
        // Optional: Store token if API returns it immediately
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Wait a moment to show success message, then redirect
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please log in.',
              email: formData.email 
            } 
          });
        }, 2000);
      } else {
        // Handle error response
        if (response.status === 400) {
          // Validation errors from backend
          if (data.errors) {
            // Map backend errors to form fields
            const backendErrors = {};
            data.errors.forEach(error => {
              if (error.field) {
                backendErrors[error.field] = error.message;
              }
            });
            setErrors(backendErrors);
          } else {
            setApiError(data.message || 'Invalid registration data. Please check your inputs.');
          }
        } else if (response.status === 409) {
          // Email already exists
          setApiError('An account with this email already exists. Please log in or use a different email.');
          setErrors({ email: 'This email is already registered' });
        } else if (response.status === 500) {
          // Server error
          setApiError('Server error. Please try again later.');
        } else {
          // Generic error
          setApiError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      // Network or other errors
      console.error('Registration error:', error);
      setApiError('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      // Reset loading state
      setIsSubmitting(false);
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
        padding: '40px',
        maxWidth: '500px',
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
              Create Your Sikars Account
            </h2>
          </div>
          <p style={{ color: '#8b7a6b', fontSize: '14px', margin: 0 }}>
            Join us to start crafting your custom cigars
          </p>
        </div>

        {/* Success Message */}
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
          {/* First Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              First Name <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.firstName ? '#dc3545' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                opacity: isSubmitting ? 0.6 : 1
              }}
            />
            {errors.firstName && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Last Name <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.lastName ? '#dc3545' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                opacity: isSubmitting ? 0.6 : 1
              }}
            />
            {errors.lastName && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Email <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@example.com"
              disabled={isSubmitting}
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
            {errors.email && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Phone Number <span style={{ fontSize: '12px', fontWeight: '400', color: '#8b7a6b' }}>(optional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.phone ? '#dc3545' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                opacity: isSubmitting ? 0.6 : 1
              }}
            />
            {errors.phone && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.phone}
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
              Password <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.password ? '#dc3545' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                opacity: isSubmitting ? 0.6 : 1
              }}
            />
            {errors.password && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.password}
              </p>
            )}
            <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '4px 0 0 0' }}>
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Confirm Password <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.confirmPassword ? '#dc3545' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                opacity: isSubmitting ? 0.6 : 1
              }}
            />
            {errors.confirmPassword && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms Agreement */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#1f1a17'
            }}>
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  marginTop: '2px',
                  cursor: 'pointer' 
                }}
              />
              <span>
                I agree to the <a href="/terms" style={{ color: '#6a4f3a', textDecoration: 'underline' }}>Terms and Conditions</a> and <a href="/privacy" style={{ color: '#6a4f3a', textDecoration: 'underline' }}>Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 26px' }}>
                {errors.agreeToTerms}
              </p>
            )}
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
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#8b7a6b'
          }}>
            Already have an account?{' '}
            <a 
              href="/login" 
              style={{ 
                color: '#6a4f3a', 
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onClick={(e) => {
                if (!isSubmitting) {
                  e.preventDefault();
                  navigate('/login');
                }
              }}
            >
              Sign In
            </a>
          </div>
        </form>

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

export default Signup;
