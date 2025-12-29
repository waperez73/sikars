import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Sparkles, Package, Award, Users, User, ShoppingBag, LogOut, Menu, X, Home, Plus, Edit3, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function LandingPage() {
  const { getCartSummary, addProduct } = useCart();
  const summary = getCartSummary();
  
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [language, setLanguage] = useState('en');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customizationModal, setCustomizationModal] = useState(false);
  const [customization, setCustomization] = useState({
    bandText: '',
    engraving: '',
    quantity: 1
  });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const heroImages = [
    '/images/hero-image-1.jpg',
    '/images/hero-image-2.jpg',
    '/images/hero-image-3.jpg'
  ];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load featured and all products
  useEffect(() => {
    loadFeaturedProducts();
    loadAllProducts();
  }, []);

  const transformProduct = (product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.short_description || product.description,
    image: product.primary_image_url || '/images/placeholder-product.jpg',
    price: parseFloat(product.base_price),
    salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
    configuration: {
      size: product.cigar_size,
      binder: product.binder_type,
      flavor: product.flavor_profile,
      bandStyle: product.band_style,
      box: product.box_type
    },
    details: {
      size: product.cigar_size,
      strength: product.flavor_profile,
      wrapper: product.binder_type,
      box: product.box_type,
      cigarCount: product.cigar_count || 20
    },
    inStock: product.in_stock,
    stockQuantity: product.stock_quantity,
    averageRating: product.average_rating || 0,
    reviewCount: product.review_count || 0,
    featured: product.featured || false
  });

  const loadFeaturedProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products?featured=true`);
      if (response.ok) {
        const data = await response.json();
        const transformedProducts = data.map(transformProduct);
        setFeaturedProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoadingFeatured(false);
    }
  };

  const loadAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      if (response.ok) {
        const data = await response.json();
        const transformedProducts = data.map(transformProduct);
        setAllProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error loading all products:', error);
    } finally {
      setLoadingAll(false);
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setCustomization({
      bandText: '',
      engraving: '',
      quantity: 1
    });
    setCustomizationModal(true);
  };

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated()) {
      // Save order to localStorage for after login
      const orderData = {
        productId: selectedProduct.id,
        ...selectedProduct.configuration,
        bandText: customization.bandText,
        engraving: customization.engraving,
        quantity: customization.quantity,
        price: selectedProduct.price * customization.quantity,
        productName: selectedProduct.name,
        currency: 'USD'
      };
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      alert(language === 'en'
        ? 'Please sign in or create an account to complete your order.'
        : 'Por favor inicia sesión o crea una cuenta para completar tu pedido.');
      navigate('/signup');
      return;
    }

    // Add to cart
    setAddingToCart(true);
    
    const result = await addProduct(selectedProduct.id, customization.quantity);
    
    setAddingToCart(false);
    
    if (result.success) {
      alert(language === 'en' ? 'Added to cart!' : '¡Agregado al carrito!');
      setCustomizationModal(false);
      navigate('/cart');
    } else {
      alert(language === 'en' 
        ? 'Failed to add to cart. Please try again.'
        : 'Error al agregar al carrito. Por favor intenta de nuevo.');
    }
  };

  const handleCustomBuilder = () => {
    navigate('/builder');
  };

  const ProductCard = ({ product, featured = false }) => (
    <div
      style={{
        background: featured ? 'linear-gradient(135deg, #f9f5f0, #ede3d9)' : '#f9f5f0',
        borderRadius: '16px',
        overflow: 'hidden',
        border: featured ? '3px solid #d4af37' : '2px solid #e0e0e0',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        position: 'relative'
      }}
      onClick={() => navigate(`/products/${product.slug}`)}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Featured Badge */}
      {featured && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
          color: '#1f1a17',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '700',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
        }}>
          <Sparkles size={12} />
          {language === 'en' ? 'FEATURED' : 'DESTACADO'}
        </div>
      )}

      {/* Product Image */}
      <div style={{ 
        width: '100%', 
        height: '220px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.src = '/images/placeholder-product.jpg';
          }}
        />
        {!product.inStock && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: '#dc3545',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {language === 'en' ? 'Out of Stock' : 'Agotado'}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div style={{ padding: '24px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#6a4f3a',
          margin: '0 0 8px 0',
          minHeight: '48px'
        }}>
          {product.name}
        </h3>
        
        <p style={{
          fontSize: '14px',
          color: '#8b7a6b',
          margin: '0 0 12px 0',
          minHeight: '40px',
          lineHeight: '1.4'
        }}>
          {product.description}
        </p>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                color="#d4af37"
                fill={i < Math.floor(product.averageRating || 0) ? "#d4af37" : "none"}
              />
            ))}
          </div>
          <span style={{ fontSize: '13px', color: '#8b7a6b' }}>
            {product.averageRating > 0 
              ? `${product.averageRating.toFixed(1)} (${product.reviewCount})`
              : language === 'en' ? 'No reviews' : 'Sin reseñas'}
          </span>
        </div>

        {/* Cigar Count */}
        <div style={{
          fontSize: '12px',
          color: '#8b7a6b',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Package size={14} />
          {product.details.cigarCount} {language === 'en' ? 'cigars per box' : 'puros por caja'}
        </div>

        {/* Price & Add to Cart */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <div>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#6a4f3a'
            }}>
              ${product.price.toFixed(2)}
            </div>
            {product.salePrice && product.salePrice < product.price && (
              <div style={{
                fontSize: '14px',
                color: '#8b7a6b',
                textDecoration: 'line-through'
              }}>
                ${product.salePrice.toFixed(2)}
              </div>
            )}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={!product.inStock}
            style={{
              padding: '12px 20px',
              background: !product.inStock
                ? '#ccc'
                : 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: !product.inStock ? '#666' : '#1f1a17',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: !product.inStock ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (product.inStock) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {!product.inStock ? (
              language === 'en' ? 'Out of Stock' : 'Agotado'
            ) : (
              <>
                <Plus size={16} />
                {language === 'en' ? 'Add to Cart' : 'Agregar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const content = {
    en: {
      hero: {
        title: "Heritage in Your Hands. Uniquely Yours.",
        subtitle: "Choose from our curated collection of premium cigars, each crafted with ancient Dominican traditions.",
        cta: "Shop Our Collection",
        customBuilder: "Custom Builder"
      },
      featured: {
        title: "Featured Collections",
        subtitle: "Our most popular premium selections"
      },
      allProducts: {
        title: "Complete Collection",
        subtitle: "Explore our entire range of handcrafted cigars"
      }
    },
    sp: {
      hero: {
        title: "Herencia en tus manos. Únicamente tuyo.",
        subtitle: "Elige de nuestra colección curada de puros premium, cada uno elaborado con antiguas tradiciones dominicanas.",
        cta: "Ver Colección",
        customBuilder: "Constructor Personalizado"
      },
      featured: {
        title: "Colecciones Destacadas",
        subtitle: "Nuestras selecciones premium más populares"
      },
      allProducts: {
        title: "Colección Completa",
        subtitle: "Explora nuestra gama completa de puros artesanales"
      }
    }
  };

  const t = content[language];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1f1a17'
    }}>
      {/* Header */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: '#6a4f3a',
        color: 'white',
        padding: '16px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'white' }}>
              <Package size={28} />
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Sikars</h1>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                  {language === 'en' ? 'Custom Cigars with Ancient Soul' : 'Cigarros a medida con alma antigua'}
                </p>
              </div>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="desktop-nav">
            {/* Language Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
              <button
                onClick={() => setLanguage('en')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'en' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: language === 'en' ? '#1f1a17' : 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('sp')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'sp' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: language === 'sp' ? '#1f1a17' : 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ES
              </button>
            </div>

            {/* Cart Icon */}
            <button
              onClick={() => navigate('/cart')}
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}
            >
              <ShoppingCart size={20} />
              {summary.itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#d4af37',
                  color: '#1f1a17',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {summary.itemCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated() ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Home size={16} />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ShoppingBag size={16} />
                  Orders
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <User size={16} />
                  {user?.firstName || 'Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#dc3545',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '8px 12px'
                }}>
                  {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
                </a>
                <button
                  onClick={() => navigate('/signup')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#d4af37',
                    color: '#1f1a17',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {language === 'en' ? 'Sign Up' : 'Registrarse'}
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              padding: '8px',
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#6a4f3a',
            padding: '16px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Language Switcher */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setLanguage('en')} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: language === 'en' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                color: language === 'en' ? '#1f1a17' : 'white', fontWeight: '600', cursor: 'pointer'
              }}>EN</button>
              <button onClick={() => setLanguage('sp')} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: language === 'sp' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                color: language === 'sp' ? '#1f1a17' : 'white', fontWeight: '600', cursor: 'pointer'
              }}>ES</button>
            </div>

            {/* Cart */}
            <button onClick={() => { navigate('/cart'); setMobileMenuOpen(false); }} style={{
              padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.2)',
              color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <ShoppingCart size={20} />
              Cart {summary.itemCount > 0 && `(${summary.itemCount})`}
            </button>

            {isAuthenticated() ? (
              <>
                <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.2)',
                  color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <Home size={20} />Dashboard
                </button>
                <button onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }} style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.2)',
                  color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <ShoppingBag size={20} />Orders
                </button>
                <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.2)',
                  color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <User size={20} />Profile
                </button>
                <button onClick={handleLogout} style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: '#dc3545',
                  color: 'white', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <LogOut size={20} />Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.2)',
                  color: 'white', fontWeight: '600', cursor: 'pointer'
                }}>
                  Sign In
                </button>
                <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: '#d4af37',
                  color: '#1f1a17', fontWeight: '600', cursor: 'pointer'
                }}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={{
        marginTop: '80px',
        minHeight: '90vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Image Carousel */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}>
          {heroImages.map((image, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: currentImageIndex === index ? 1 : 0,
                transition: 'opacity 1s ease-in-out'
              }}
            />
          ))}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(31, 26, 23, 0.85) 0%, rgba(61, 47, 36, 0.75) 100%)'
          }} />
        </div>

        {/* Hero Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px 32px'
        }}>
          <div style={{
            maxWidth: '800px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '56px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 24px 0',
              lineHeight: '1.2',
              textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
            }}>
              {t.hero.title}
            </h2>
            
            <p style={{
              fontSize: '20px',
              color: '#e9ded4',
              margin: '0 0 40px 0',
              lineHeight: '1.6',
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
            }}>
              {t.hero.subtitle}
            </p>
            
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => document.getElementById('featured-section').scrollIntoView({ behavior: 'smooth' })}
                style={{
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#1f1a17',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '18px 48px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)'
                }}
              >
                <Package size={24} />
                {t.hero.cta}
              </button>

              <button
                onClick={handleCustomBuilder}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '12px',
                  padding: '18px 48px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <Edit3 size={24} />
                {t.hero.customBuilder}
              </button>
            </div>

            {!isAuthenticated() && (
              <p style={{
                marginTop: '20px',
                color: 'white',
                fontSize: '14px'
              }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: '#d4af37', textDecoration: 'underline' }}>
                  Sign In
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 2
        }}>
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              style={{
                width: currentImageIndex === index ? '40px' : '12px',
                height: '12px',
                borderRadius: '6px',
                border: '2px solid white',
                background: currentImageIndex === index ? 'white' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2px solid white',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2px solid white',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <ChevronRight size={24} />
        </button>
      </section>

      {/* Featured Products Section */}
      <section id="featured-section" style={{
        background: 'white',
        padding: '80px 32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#1f1a17',
              padding: '8px 20px',
              borderRadius: '24px',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <Sparkles size={16} />
              {language === 'en' ? 'FEATURED' : 'DESTACADO'}
            </div>
            <h2 style={{
              fontSize: '42px',
              fontWeight: '700',
              color: '#6a4f3a',
              margin: '0 0 16px 0'
            }}>
              {t.featured.title}
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#8b7a6b',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              {t.featured.subtitle}
            </p>
          </div>

          {loadingFeatured ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Package size={48} color="#6a4f3a" style={{ marginBottom: '16px' }} />
              <p style={{ color: '#8b7a6b' }}>Loading featured products...</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#8b7a6b' }}>No featured products available</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} featured={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All Products Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
        padding: '80px 32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#6a4f3a',
            textAlign: 'center',
            margin: '0 0 16px 0'
          }}>
            {t.allProducts.title}
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 64px auto',
            lineHeight: '1.6'
          }}>
            {t.allProducts.subtitle}
          </p>

          {loadingAll ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Package size={48} color="#6a4f3a" style={{ marginBottom: '16px' }} />
              <p style={{ color: '#8b7a6b' }}>Loading products...</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: '#8b7a6b' }}>No products available</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} featured={false} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customization Modal */}
      {customizationModal && selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#6a4f3a',
              margin: '0 0 24px 0'
            }}>
              {language === 'en' ? 'Personalize Your Order' : 'Personaliza Tu Pedido'}
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                {language === 'en' ? 'Text on Cigar Band' : 'Texto en la Banda'}
              </label>
              <input
                type="text"
                value={customization.bandText}
                onChange={(e) => setCustomization({...customization, bandText: e.target.value.slice(0, 18)})}
                placeholder={language === 'en' ? 'Enter text (max 18 chars)' : 'Ingresa texto (máx 18 chars)'}
                maxLength={18}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ fontSize: '12px', color: '#8b7a6b', marginTop: '4px' }}>
                {customization.bandText.length}/18
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                {language === 'en' ? 'Box Engraving' : 'Grabado en Caja'}
              </label>
              <input
                type="text"
                value={customization.engraving}
                onChange={(e) => setCustomization({...customization, engraving: e.target.value.slice(0, 20)})}
                placeholder={language === 'en' ? 'Enter engraving (max 20 chars)' : 'Ingresa grabado (máx 20 chars)'}
                maxLength={20}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ fontSize: '12px', color: '#8b7a6b', marginTop: '4px' }}>
                {customization.engraving.length}/20
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
                {language === 'en' ? 'Quantity' : 'Cantidad'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setCustomization({...customization, quantity: Math.max(1, customization.quantity - 1)})}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '2px solid #6a4f3a',
                    background: 'white',
                    color: '#6a4f3a',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                  {customization.quantity}
                </span>
                <button
                  onClick={() => setCustomization({...customization, quantity: customization.quantity + 1})}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    border: '2px solid #6a4f3a',
                    background: 'white',
                    color: '#6a4f3a',
                    fontSize: '18px',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: '#f9f5f0',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: '600',
                color: '#6a4f3a'
              }}>
                <span>{language === 'en' ? 'Total' : 'Total'}:</span>
                <span>${(selectedProduct.price * customization.quantity).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setCustomizationModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: '2px solid #6a4f3a',
                  background: 'white',
                  color: '#6a4f3a',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={handleProceedToCheckout}
                disabled={addingToCart}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: addingToCart ? '#ccc' : 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: addingToCart ? '#666' : '#1f1a17',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: addingToCart ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {addingToCart ? (
                  'Adding...'
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {language === 'en' ? 'Add to Cart' : 'Agregar al Carrito'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: '#6a4f3a',
        color: 'white',
        padding: '48px 32px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '24px',
          fontWeight: '600',
          margin: '0 0 24px 0',
          color: '#d4af37'
        }}>
          Heritage in Your Hands. Uniquely Yours.
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <a href="/builder" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            {language === 'en' ? 'Custom Builder' : 'Constructor Personalizado'}
          </a>
          <a href="/products" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            {language === 'en' ? 'Products' : 'Productos'}
          </a>
          {isAuthenticated() ? (
            <>
              <a href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                Dashboard
              </a>
              <a href="/orders" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                {language === 'en' ? 'Orders' : 'Pedidos'}
              </a>
              <a href="/profile" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                {language === 'en' ? 'Profile' : 'Perfil'}
              </a>
            </>
          ) : (
            <>
              <a href="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
              </a>
              <a href="/signup" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                {language === 'en' ? 'Sign Up' : 'Registrarse'}
              </a>
            </>
          )}
        </div>

        <p style={{
          fontSize: '12px',
          color: '#8b7a6b',
          margin: 0
        }}>
          © 2025 Sikars. {language === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
        </p>
      </footer>

      {/* Mobile Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;