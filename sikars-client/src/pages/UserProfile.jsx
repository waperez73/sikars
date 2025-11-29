import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Check,
  AlertCircle,
  Home,
  Package,
  LogOut,
  Shield,
  Bell,
  CreditCard
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UserProfile() {
  const navigate = useNavigate();
  const { user, updateUser, getAuthHeader, logout } = useAuth();
  
  // Profile states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [originalProfileData, setOriginalProfileData] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: 'shipping',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isDefault: false
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [addressLoading, setAddressLoading] = useState(false);

  // Email verification states
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified || false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setOriginalProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setEmailVerified(user?.emailVerified || false);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/addresses`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Handle profile edit
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileData = () => {
    const errors = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (profileData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (profileData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Invalid email format';
    }

    if (profileData.phone && !/^\+?[\d\s\-\(\)]+$/.test(profileData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileData()) return;

    setProfileLoading(true);
    setProfileSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        updateUser({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phone: data.user.phone
        });
        setOriginalProfileData(profileData);
        setIsEditingProfile(false);
        setProfileSuccess('Profile updated successfully!');
        setTimeout(() => setProfileSuccess(''), 3000);
      } else {
        setProfileErrors({ general: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileErrors({ general: 'Unable to update profile. Please try again.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData(originalProfileData);
    setIsEditingProfile(false);
    setProfileErrors({});
  };

  // Handle address operations
  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (addressErrors[name]) {
      setAddressErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddress = () => {
    const errors = {};

    if (!addressForm.street.trim()) errors.street = 'Street address is required';
    if (!addressForm.city.trim()) errors.city = 'City is required';
    if (!addressForm.state.trim()) errors.state = 'State is required';
    if (!addressForm.zipCode.trim()) errors.zipCode = 'ZIP code is required';

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddress()) return;

    setAddressLoading(true);

    try {
      const url = editingAddressId 
        ? `${API_URL}/api/users/addresses/${editingAddressId}`
        : `${API_URL}/api/users/addresses`;
      
      const method = editingAddressId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressForm)
      });

      if (response.ok) {
        await fetchAddresses();
        setIsAddingAddress(false);
        setEditingAddressId(null);
        setAddressForm({
          type: 'shipping',
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA',
          isDefault: false
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setAddressErrors({ general: 'Failed to save address' });
    } finally {
      setAddressLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(`${API_URL}/api/users/addresses/${addressId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const handleCancelAddress = () => {
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddressForm({
      type: 'shipping',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      isDefault: false
    });
    setAddressErrors({});
  };

  // Handle email verification
  const handleSendVerification = async () => {
    setVerificationLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/send-verification`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setVerificationSent(true);
        setTimeout(() => setVerificationSent(false), 5000);
      }
    } catch (error) {
      console.error('Error sending verification:', error);
    } finally {
      setVerificationLoading(false);
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
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>My Profile</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/dashboard')}
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
              <Home size={16} />
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
            Account Settings
          </h2>
          <p style={{ fontSize: '16px', color: '#8b7a6b', margin: 0 }}>
            Manage your profile information and preferences
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #e0e0e0',
          borderBottom: 'none',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                flex: 1,
                padding: '16px',
                background: activeTab === 'profile' ? '#f9f5f0' : 'white',
                border: 'none',
                borderBottom: activeTab === 'profile' ? '3px solid #6a4f3a' : 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: activeTab === 'profile' ? '#6a4f3a' : '#8b7a6b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <User size={20} />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              style={{
                flex: 1,
                padding: '16px',
                background: activeTab === 'addresses' ? '#f9f5f0' : 'white',
                border: 'none',
                borderBottom: activeTab === 'addresses' ? '3px solid #6a4f3a' : 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: activeTab === 'addresses' ? '#6a4f3a' : '#8b7a6b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <MapPin size={20} />
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('security')}
              style={{
                flex: 1,
                padding: '16px',
                background: activeTab === 'security' ? '#f9f5f0' : 'white',
                border: 'none',
                borderBottom: activeTab === 'security' ? '3px solid #6a4f3a' : 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                color: activeTab === 'security' ? '#6a4f3a' : '#8b7a6b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Shield size={20} />
              Security
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'white',
          borderRadius: '0 0 16px 16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #e0e0e0',
          borderTop: 'none'
        }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                  Personal Information
                </h3>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Success Message */}
              {profileSuccess && (
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
                  <Check size={20} color="#155724" />
                  <span style={{ color: '#155724', fontSize: '14px' }}>{profileSuccess}</span>
                </div>
              )}

              {/* Error Message */}
              {profileErrors.general && (
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
                  <span style={{ color: '#721c24', fontSize: '14px' }}>{profileErrors.general}</span>
                </div>
              )}

              {/* Email Verification Alert */}
              {!emailVerified && (
                <div style={{
                  background: '#fff3cd',
                  border: '2px solid #ffc107',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                    <AlertCircle size={24} color="#856404" />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#856404', margin: '0 0 8px 0' }}>
                        Email Not Verified
                      </h4>
                      <p style={{ fontSize: '14px', color: '#856404', margin: '0 0 12px 0' }}>
                        Please verify your email address to access all features.
                      </p>
                      <button
                        onClick={handleSendVerification}
                        disabled={verificationLoading || verificationSent}
                        style={{
                          padding: '8px 16px',
                          background: verificationSent ? '#28a745' : '#6a4f3a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: verificationLoading || verificationSent ? 'not-allowed' : 'pointer',
                          opacity: verificationLoading || verificationSent ? 0.7 : 1
                        }}
                      >
                        {verificationLoading ? 'Sending...' : verificationSent ? '✓ Verification Email Sent' : 'Send Verification Email'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {/* First Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f1a17',
                    marginBottom: '8px'
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: `2px solid ${profileErrors.firstName ? '#dc3545' : '#e0e0e0'}`,
                      borderRadius: '12px',
                      background: isEditingProfile ? 'white' : '#f9f5f0',
                      cursor: isEditingProfile ? 'text' : 'not-allowed'
                    }}
                  />
                  {profileErrors.firstName && (
                    <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                      {profileErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f1a17',
                    marginBottom: '8px'
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '16px',
                      border: `2px solid ${profileErrors.lastName ? '#dc3545' : '#e0e0e0'}`,
                      borderRadius: '12px',
                      background: isEditingProfile ? 'white' : '#f9f5f0',
                      cursor: isEditingProfile ? 'text' : 'not-allowed'
                    }}
                  />
                  {profileErrors.lastName && (
                    <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                      {profileErrors.lastName}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f1a17',
                    marginBottom: '8px'
                  }}>
                    Email Address
                    {emailVerified && (
                      <span style={{ 
                        marginLeft: '8px',
                        padding: '2px 8px',
                        background: '#d4edda',
                        color: '#155724',
                        fontSize: '11px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        ✓ Verified
                      </span>
                    )}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail 
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
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        fontSize: '16px',
                        border: '2px solid #e0e0e0',
                        borderRadius: '12px',
                        background: '#f9f5f0',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#8b7a6b', margin: '4px 0 0 0' }}>
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f1a17',
                    marginBottom: '8px'
                  }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone 
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
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      placeholder="+1 (555) 123-4567"
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        fontSize: '16px',
                        border: `2px solid ${profileErrors.phone ? '#dc3545' : '#e0e0e0'}`,
                        borderRadius: '12px',
                        background: isEditingProfile ? 'white' : '#f9f5f0',
                        cursor: isEditingProfile ? 'text' : 'not-allowed'
                      }}
                    />
                  </div>
                  {profileErrors.phone && (
                    <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                      {profileErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditingProfile && (
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={profileLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: profileLoading ? '#ccc' : 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: profileLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Save size={20} />
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={profileLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'white',
                      color: '#6a4f3a',
                      border: '2px solid #6a4f3a',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: profileLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: 0 }}>
                  Saved Addresses
                </h3>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                    Add Address
                  </button>
                )}
              </div>

              {/* Add/Edit Address Form */}
              {isAddingAddress && (
                <div style={{
                  background: '#f9f5f0',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '2px solid #e0e0e0'
                }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1f1a17', marginBottom: '20px' }}>
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h4>

                  {addressErrors.general && (
                    <div style={{
                      background: '#f8d7da',
                      border: '1px solid #f5c6cb',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertCircle size={20} color="#721c24" />
                      <span style={{ color: '#721c24', fontSize: '14px' }}>{addressErrors.general}</span>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: '16px' }}>
                    {/* Address Type */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f1a17',
                        marginBottom: '8px'
                      }}>
                        Address Type
                      </label>
                      <select
                        name="type"
                        value={addressForm.type}
                        onChange={handleAddressChange}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="shipping">Shipping Address</option>
                        <option value="billing">Billing Address</option>
                      </select>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f1a17',
                        marginBottom: '8px'
                      }}>
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressChange}
                        placeholder="123 Main Street"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          border: `2px solid ${addressErrors.street ? '#dc3545' : '#e0e0e0'}`,
                          borderRadius: '12px'
                        }}
                      />
                      {addressErrors.street && (
                        <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                          {addressErrors.street}
                        </p>
                      )}
                    </div>

                    {/* City, State, ZIP */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1f1a17',
                          marginBottom: '8px'
                        }}>
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={addressForm.city}
                          onChange={handleAddressChange}
                          placeholder="New York"
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: `2px solid ${addressErrors.city ? '#dc3545' : '#e0e0e0'}`,
                            borderRadius: '12px'
                          }}
                        />
                        {addressErrors.city && (
                          <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                            {addressErrors.city}
                          </p>
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
                          State
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={addressForm.state}
                          onChange={handleAddressChange}
                          placeholder="NY"
                          maxLength="2"
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: `2px solid ${addressErrors.state ? '#dc3545' : '#e0e0e0'}`,
                            borderRadius: '12px'
                          }}
                        />
                        {addressErrors.state && (
                          <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                            {addressErrors.state}
                          </p>
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
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={addressForm.zipCode}
                          onChange={handleAddressChange}
                          placeholder="10001"
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            border: `2px solid ${addressErrors.zipCode ? '#dc3545' : '#e0e0e0'}`,
                            borderRadius: '12px'
                          }}
                        />
                        {addressErrors.zipCode && (
                          <p style={{ color: '#dc3545', fontSize: '12px', margin: '4px 0 0 0' }}>
                            {addressErrors.zipCode}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1f1a17',
                        marginBottom: '8px'
                      }}>
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={addressForm.country}
                        onChange={handleAddressChange}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '16px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '12px'
                        }}
                      />
                    </div>

                    {/* Default Address */}
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={addressForm.isDefault}
                          onChange={handleAddressChange}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f1a17' }}>
                          Set as default {addressForm.type} address
                        </span>
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button
                        onClick={handleSaveAddress}
                        disabled={addressLoading}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 24px',
                          background: addressLoading ? '#ccc' : 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: addressLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <Save size={20} />
                        {addressLoading ? 'Saving...' : 'Save Address'}
                      </button>
                      <button
                        onClick={handleCancelAddress}
                        disabled={addressLoading}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 24px',
                          background: 'white',
                          color: '#6a4f3a',
                          border: '2px solid #6a4f3a',
                          borderRadius: '8px',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: addressLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <X size={20} />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Address List */}
              {addresses.length === 0 && !isAddingAddress ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 24px',
                  background: '#f9f5f0',
                  borderRadius: '12px',
                  border: '2px dashed #e0e0e0'
                }}>
                  <MapPin size={48} color="#e0e0e0" style={{ margin: '0 auto 16px' }} />
                  <h4 style={{ fontSize: '18px', color: '#1f1a17', marginBottom: '8px' }}>
                    No addresses saved
                  </h4>
                  <p style={{ fontSize: '14px', color: '#8b7a6b', marginBottom: '16px' }}>
                    Add an address to use for shipping and billing
                  </p>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: address.isDefault ? '2px solid #6a4f3a' : '2px solid #e0e0e0',
                        position: 'relative'
                      }}
                    >
                      {address.isDefault && (
                        <span style={{
                          position: 'absolute',
                          top: '16px',
                          right: '16px',
                          padding: '4px 12px',
                          background: '#6a4f3a',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: '600',
                          borderRadius: '4px'
                        }}>
                          DEFAULT
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <MapPin size={20} color="#6a4f3a" />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17', margin: '0 0 4px 0' }}>
                            {address.type === 'shipping' ? 'Shipping Address' : 'Billing Address'}
                          </h4>
                          <p style={{ fontSize: '14px', color: '#8b7a6b', margin: '0 0 4px 0' }}>
                            {address.street}
                          </p>
                          <p style={{ fontSize: '14px', color: '#8b7a6b', margin: 0 }}>
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p style={{ fontSize: '14px', color: '#8b7a6b', margin: 0 }}>
                            {address.country}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <button
                          onClick={() => handleEditAddress(address)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: '#f9f5f0',
                            color: '#6a4f3a',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'white',
                            color: '#dc3545',
                            border: '2px solid #dc3545',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', marginBottom: '24px' }}>
                Security Settings
              </h3>

              {/* Email Verification */}
              <div style={{
                background: emailVerified ? '#d4edda' : '#fff3cd',
                border: `2px solid ${emailVerified ? '#c3e6cb' : '#ffc107'}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  {emailVerified ? (
                    <Check size={24} color="#155724" />
                  ) : (
                    <AlertCircle size={24} color="#856404" />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: emailVerified ? '#155724' : '#856404', 
                      margin: '0 0 8px 0' 
                    }}>
                      Email Verification
                    </h4>
                    <p style={{ 
                      fontSize: '14px', 
                      color: emailVerified ? '#155724' : '#856404', 
                      margin: '0 0 12px 0' 
                    }}>
                      {emailVerified 
                        ? `Your email address (${user?.email}) has been verified.`
                        : `Please verify your email address (${user?.email}) to secure your account.`
                      }
                    </p>
                    {!emailVerified && (
                      <button
                        onClick={handleSendVerification}
                        disabled={verificationLoading || verificationSent}
                        style={{
                          padding: '10px 20px',
                          background: verificationSent ? '#28a745' : '#6a4f3a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: verificationLoading || verificationSent ? 'not-allowed' : 'pointer',
                          opacity: verificationLoading || verificationSent ? 0.7 : 1
                        }}
                      >
                        {verificationLoading ? 'Sending...' : verificationSent ? '✓ Email Sent - Check Your Inbox' : 'Send Verification Email'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div style={{
                background: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17', marginBottom: '12px' }}>
                  Change Password
                </h4>
                <p style={{ fontSize: '14px', color: '#8b7a6b', marginBottom: '16px' }}>
                  Update your password to keep your account secure
                </p>
                <button
                  onClick={() => navigate('/change-password')}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Change Password
                </button>
              </div>

              {/* Account Status */}
              <div style={{
                background: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1f1a17', marginBottom: '12px' }}>
                  Account Status
                </h4>
                <div style={{ fontSize: '14px', color: '#8b7a6b' }}>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>Account Created:</strong> {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong> <span style={{ color: '#28a745', fontWeight: '600' }}>Active</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserProfile;
