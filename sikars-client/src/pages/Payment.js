import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SubmitPayment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    amount: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Limit to 16 digits + 3 spaces
    }

    // Format expiry date as MM/YY
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }

    // Limit CVV to 4 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    }

    // Limit zip code to 10 characters
    if (name === 'zipCode' && value.length > 10) return;

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
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

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumberDigits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cardNumberDigits.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid format (MM/YY)';
    }

    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    if (!formData.billingAddress.trim()) {
      newErrors.billingAddress = 'Billing address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would typically send the payment data to your backend
      console.log('Payment data:', {
        cardName: formData.cardName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        billingAddress: formData.billingAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        amount: formData.amount
      });
      
      // Show success message
      console.log(`Payment of $${parseFloat(formData.amount).toFixed(2)} submitted successfully!`);
      
      // Navigate back to order confirmation or home page
      navigate('/order-confirmation');
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
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#6a4f3a',
          margin: '0 0 8px 0',
          textAlign: 'center'
        }}>
          Submit Payment
        </h2>
        
        <p style={{
          fontSize: '14px',
          color: '#8b7a6b',
          textAlign: 'center',
          margin: '0 0 24px 0'
        }}>
          Secure payment processing
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* Payment Amount */}
          <div style={{ marginBottom: '24px', padding: '16px', background: '#f9f5f0', borderRadius: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Payment Amount *
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#6a4f3a',
                fontWeight: '600'
              }}>$</span>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 28px',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: `2px solid ${errors.amount ? '#e74c3c' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {errors.amount && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.amount}
              </span>
            )}
          </div>

          {/* Card Information */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#6a4f3a',
            margin: '0 0 16px 0'
          }}>
            Card Information
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Cardholder Name *
            </label>
            <input
              type="text"
              name="cardName"
              value={formData.cardName}
              onChange={handleChange}
              placeholder="John Doe"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.cardName ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.cardName && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.cardName}
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
              Card Number *
            </label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="1234 5678 9012 3456"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.cardNumber ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.cardNumber && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.cardNumber}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                Expiry Date *
              </label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: `2px solid ${errors.expiryDate ? '#e74c3c' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              {errors.expiryDate && (
                <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                  {errors.expiryDate}
                </span>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                CVV *
              </label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: `2px solid ${errors.cvv ? '#e74c3c' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              {errors.cvv && (
                <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                  {errors.cvv}
                </span>
              )}
            </div>
          </div>

          {/* Billing Address */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#6a4f3a',
            margin: '0 0 16px 0'
          }}>
            Billing Address
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Street Address *
            </label>
            <input
              type="text"
              name="billingAddress"
              value={formData.billingAddress}
              onChange={handleChange}
              placeholder="123 Main Street"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.billingAddress ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.billingAddress && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.billingAddress}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: `2px solid ${errors.city ? '#e74c3c' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              {errors.city && (
                <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                  {errors.city}
                </span>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: `2px solid ${errors.state ? '#e74c3c' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              {errors.state && (
                <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                  {errors.state}
                </span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f1a17',
              marginBottom: '8px'
            }}>
              Zip Code *
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="10001"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: `2px solid ${errors.zipCode ? '#e74c3c' : '#e0e0e0'}`,
                borderRadius: '12px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
            {errors.zipCode && (
              <span style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px', display: 'block' }}>
                {errors.zipCode}
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
            Submit Payment
          </button>

          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#8b7a6b',
            marginBottom: '16px'
          }}>
            🔒 Your payment information is secure and encrypted
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a href="/" style={{
            color: '#8b7a6b',
            textDecoration: 'none',
            fontSize: '14px'
          }}>
            ← Cancel Payment
          </a>
        </div>
      </div>
    </div>
  );
}

export default SubmitPayment;