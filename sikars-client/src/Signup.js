import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically send the data to your backend
      console.log('Signup data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email, // This will be used as username
        password: formData.password        
      });
      
      
      // For now, just show an alert
      alert(`Account created successfully!\n\nName: ${formData.firstName} ${formData.lastName}\nEmail/Username: ${formData.email}`);
      
      // Navigate to login page after successful signup
      navigate('/login');
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
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        border: '2px solid #e0e0e0'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#6a4f3a',
          margin: '0 0 8px 0',
          textAlign: 'center'
        }}>
          Create Your Account
        </h2>
        
        <p style={{
          fontSize: '14px',
          color: '#8b7a6b',
          textAlign: 'center',
          margin: '0 0 24px 0'
        }}>
          Join Sikars today
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.firstName ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.firstName && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.firstName}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.lastName ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.lastName && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.lastName}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Email (Username) *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.email ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.email && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.password ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.password && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.confirmPassword ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.confirmPassword && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.confirmPassword}
              </span>
            )}
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
            Create Account
          </button>

          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#8b7a6b'
          }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#6a4f3a', textDecoration: 'none', fontWeight: '600' }}>
              Sign In
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

export default Signup;