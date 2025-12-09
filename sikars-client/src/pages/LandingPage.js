import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Sparkles, Package, Award, Users, User, ShoppingBag, LogOut, Menu, X, Home, Plus, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
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

  const heroImages = [
    '/images/hero-image-1.jpg',
    '/images/hero-image-2.jpg',
    '/images/hero-image-3.jpg'
  ];

  // Auto-rotate carousel every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Product Configurations (Pre-configured cigars)
  const products = [
    {
      id: 'classic-robusto',
      name: language === 'en' ? 'Classic Robusto' : 'Robusto Clásico',
      description: language === 'en' 
        ? 'Rich and balanced, our most popular choice'
        : 'Rico y equilibrado, nuestra elección más popular',
      image: '/images/robusto.png',
      price: 75.00,
      configuration: {
        size: 'robusto',
        binder: 'habano',
        flavor: 'medium',
        bandStyle: 'beveled',
        box: 'classic'
      },
      details: {
        size: '5" x 50',
        strength: language === 'en' ? 'Medium' : 'Medio',
        wrapper: 'Habano',
        box: language === 'en' ? 'Classic Cedar' : 'Cedro Clásico'
      }
    },
    {
      id: 'premium-gordo',
      name: language === 'en' ? 'Premium Gordo' : 'Gordo Premium',
      description: language === 'en'
        ? 'Bold and full-bodied for the aficionado'
        : 'Audaz y con cuerpo para el aficionado',
      image: '/images/gordo.png',
      price: 95.00,
      configuration: {
        size: 'gordo',
        binder: 'maduro',
        flavor: 'strong',
        bandStyle: 'dome',
        box: 'modern'
      },
      details: {
        size: '6" x 60',
        strength: language === 'en' ? 'Full' : 'Fuerte',
        wrapper: 'Maduro',
        box: language === 'en' ? 'Modern Lacquered' : 'Lacado Moderno'
      }
    },
    {
      id: 'elegant-churchill',
      name: language === 'en' ? 'Elegant Churchill' : 'Churchill Elegante',
      description: language === 'en'
        ? 'Refined taste, perfect for special occasions'
        : 'Sabor refinado, perfecto para ocasiones especiales',
      image: '/images/churchill.png',
      price: 110.00,
      configuration: {
        size: 'churchill',
        binder: 'connecticut',
        flavor: 'light',
        bandStyle: 'round',
        box: 'rustic'
      },
      details: {
        size: '7" x 47',
        strength: language === 'en' ? 'Mild-Medium' : 'Suave-Medio',
        wrapper: 'Connecticut',
        box: language === 'en' ? 'Rustic Wood' : 'Madera Rústica'
      }
    },
    {
      id: 'signature-belicoso',
      name: language === 'en' ? 'Signature Belicoso' : 'Belicoso Signature',
      description: language === 'en'
        ? 'Complex flavor profile with a distinctive shape'
        : 'Perfil de sabor complejo con forma distintiva',
      image: '/images/belicoso.png',
      price: 105.00,
      configuration: {
        size: 'belicoso',
        binder: 'habano',
        flavor: 'strong',
        bandStyle: 'square',
        box: 'modern'
      },
      details: {
        size: '5.5" x 52',
        strength: language === 'en' ? 'Medium-Full' : 'Medio-Fuerte',
        wrapper: 'Habano',
        box: language === 'en' ? 'Modern Lacquered' : 'Lacado Moderno'
      }
    }
  ];

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setCustomization({
      bandText: '',
      engraving: '',
      quantity: 1
    });
    setCustomizationModal(true);
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated()) {
      // Save order to localStorage for after login
      const orderData = {
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

    // Navigate to payment with configuration
    const orderData = {
      ...selectedProduct.configuration,
      bandText: customization.bandText,
      engraving: customization.engraving,
      quantity: customization.quantity,
      price: selectedProduct.price * customization.quantity,
      productName: selectedProduct.name,
      currency: 'USD'
    };
    localStorage.setItem('orderData', JSON.stringify(orderData));
    setCustomizationModal(false);
    navigate('/payment');
  };

  const handleCustomBuilder = () => {
    navigate('/builder');
  };

  const content = {
    en: {
      hero: {
        title: "Heritage in Your Hands. Uniquely Yours.",
        subtitle: "Choose from our curated collection of premium cigars, each crafted with ancient Dominican traditions.",
        cta: "Shop Our Collection",
        customBuilder: "Custom Builder"
      },
      products: {
        title: "Our Premium Collection",
        subtitle: "Hand-selected configurations, ready to personalize",
        addToCart: "Add to Cart",
        customize: "Customize & Order",
        details: "Details"
      },
      customization: {
        title: "Personalize Your Order",
        bandText: "Text on Cigar Band",
        bandPlaceholder: "Enter text (max 18 chars)",
        engraving: "Box Engraving",
        engravingPlaceholder: "Enter engraving (max 20 chars)",
        quantity: "Quantity",
        cancel: "Cancel",
        proceedToCheckout: "Proceed to Checkout",
        total: "Total"
      }
    },
    sp: {
      hero: {
        title: "Herencia en tus manos. Únicamente tuyo.",
        subtitle: "Elige de nuestra colección curada de puros premium, cada uno elaborado con antiguas tradiciones dominicanas.",
        cta: "Ver Colección",
        customBuilder: "Constructor Personalizado"
      },
      products: {
        title: "Nuestra Colección Premium",
        subtitle: "Configuraciones seleccionadas, listas para personalizar",
        addToCart: "Agregar al Carrito",
        customize: "Personalizar y Ordenar",
        details: "Detalles"
      },
      customization: {
        title: "Personaliza Tu Pedido",
        bandText: "Texto en la Banda",
        bandPlaceholder: "Ingresa texto (máx 18 chars)",
        engraving: "Grabado en Caja",
        engravingPlaceholder: "Ingresa grabado (máx 20 chars)",
        quantity: "Cantidad",
        cancel: "Cancelar",
        proceedToCheckout: "Proceder al Pago",
        total: "Total"
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

            {isAuthenticated() ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
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
                  {language === 'en' ? 'Dashboard' : 'Panel'}
                </button>

                <button
                  onClick={() => navigate('/orders')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
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
                  <ShoppingBag size={16} />
                  {language === 'en' ? 'Orders' : 'Pedidos'}
                </button>

                <button
                  onClick={() => navigate('/profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
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
                  <User size={16} />
                  {user?.firstName || (language === 'en' ? 'Profile' : 'Perfil')}
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'rgba(220, 53, 69, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} />
                  {language === 'en' ? 'Logout' : 'Salir'}
                </button>
              </>
            ) : (
              <>
                <a 
                  href="/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                >
                  {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
                </a>

                <a 
                  href="/signup" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/signup');
                  }}
                  style={{
                    color: '#1f1a17',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    padding: '8px 16px',
                    background: '#d4af37',
                    borderRadius: '8px'
                  }}
                >
                  {language === 'en' ? 'Sign Up' : 'Registrarse'}
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'white'
            }}
            className="mobile-menu-btn"
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => {
                  setLanguage('en');
                  setMobileMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'en' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: language === 'en' ? '#1f1a17' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                EN
              </button>
              <button
                onClick={() => {
                  setLanguage('sp');
                  setMobileMenuOpen(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'sp' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: language === 'sp' ? '#1f1a17' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ES
              </button>
            </div>

            {isAuthenticated() ? (
              <>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Home size={18} />
                  {language === 'en' ? 'Dashboard' : 'Panel'}
                </button>

                <button
                  onClick={() => {
                    navigate('/orders');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <ShoppingBag size={18} />
                  {language === 'en' ? 'My Orders' : 'Mis Pedidos'}
                </button>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <User size={18} />
                  {user?.firstName ? `${user.firstName}'s Profile` : (language === 'en' ? 'Profile' : 'Perfil')}
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    background: 'rgba(220, 53, 69, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={18} />
                  {language === 'en' ? 'Logout' : 'Cerrar Sesión'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
                </button>

                <button
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    padding: '12px',
                    background: '#d4af37',
                    border: 'none',
                    borderRadius: '8px',
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
        )}
      </header>

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

      {/* Hero Section */}
      <section style={{
        marginTop: '80px',
        minHeight: '70vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
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

        <div style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '70vh',
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
                onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
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
                <ShoppingBag size={24} />
                {t.hero.cta}
              </button>

              <button
                onClick={handleCustomBuilder}
                style={{
                  background: 'rgba(255,255,255,0.2)',
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
      </section>

      {/* Products Section */}
      <section id="products" style={{
        background: '#f9f5f0',
        padding: '80px 32px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#6a4f3a',
            textAlign: 'center',
            margin: '0 0 16px 0'
          }}>
            {t.products.title}
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '0 auto 64px auto'
          }}>
            {t.products.subtitle}
          </p>

          {/* Product Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            marginBottom: '48px'
          }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid #e0e0e0',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
              >
                {/* Product Image */}
                <div style={{
                  background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
                  padding: '40px',
                  textAlign: 'center',
                  minHeight: '250px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Product Info */}
                <div style={{ padding: '24px' }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#6a4f3a',
                    margin: '0 0 8px 0'
                  }}>
                    {product.name}
                  </h3>

                  <p style={{
                    fontSize: '14px',
                    color: '#8b7a6b',
                    margin: '0 0 16px 0',
                    minHeight: '40px'
                  }}>
                    {product.description}
                  </p>

                  {/* Product Details */}
                  <div style={{
                    background: '#f9f5f0',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      fontSize: '12px'
                    }}>
                      <div>
                        <strong style={{ color: '#6a4f3a' }}>Size:</strong>
                        <div style={{ color: '#8b7a6b' }}>{product.details.size}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#6a4f3a' }}>Strength:</strong>
                        <div style={{ color: '#8b7a6b' }}>{product.details.strength}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#6a4f3a' }}>Wrapper:</strong>
                        <div style={{ color: '#8b7a6b' }}>{product.details.wrapper}</div>
                      </div>
                      <div>
                        <strong style={{ color: '#6a4f3a' }}>Box:</strong>
                        <div style={{ color: '#8b7a6b' }}>{product.details.box}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: '#6a4f3a',
                    marginBottom: '16px'
                  }}>
                    ${product.price.toFixed(2)}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(product)}
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Plus size={20} />
                    {t.products.customize}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Builder CTA */}
          <div style={{
            textAlign: 'center',
            padding: '48px',
            background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
            borderRadius: '16px',
            color: 'white'
          }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 16px 0'
            }}>
              {language === 'en' ? 'Want Complete Control?' : '¿Quieres Control Completo?'}
            </h3>
            <p style={{
              fontSize: '16px',
              margin: '0 0 24px 0',
              opacity: 0.9
            }}>
              {language === 'en' 
                ? 'Use our custom builder to create your perfect cigar from scratch'
                : 'Usa nuestro constructor personalizado para crear tu cigarro perfecto desde cero'}
            </p>
            <button
              onClick={handleCustomBuilder}
              style={{
                padding: '16px 48px',
                background: '#d4af37',
                color: '#1f1a17',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Edit3 size={24} />
              {language === 'en' ? 'Open Custom Builder' : 'Abrir Constructor Personalizado'}
            </button>
          </div>
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
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#6a4f3a',
              margin: '0 0 8px 0'
            }}>
              {t.customization.title}
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#8b7a6b',
              margin: '0 0 24px 0'
            }}>
              {selectedProduct.name}
            </p>

            {/* Band Text */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                {t.customization.bandText}
              </label>
              <input
                type="text"
                value={customization.bandText}
                onChange={(e) => setCustomization({
                  ...customization,
                  bandText: e.target.value.slice(0, 18)
                })}
                placeholder={t.customization.bandPlaceholder}
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
                {customization.bandText.length}/18 {language === 'en' ? 'characters' : 'caracteres'}
              </div>
            </div>

            {/* Engraving */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                {t.customization.engraving}
              </label>
              <input
                type="text"
                value={customization.engraving}
                onChange={(e) => setCustomization({
                  ...customization,
                  engraving: e.target.value.slice(0, 20)
                })}
                placeholder={t.customization.engravingPlaceholder}
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
                {customization.engraving.length}/20 {language === 'en' ? 'characters' : 'caracteres'}
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1f1a17',
                marginBottom: '8px'
              }}>
                {t.customization.quantity}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setCustomization({
                    ...customization,
                    quantity: Math.max(1, customization.quantity - 1)
                  })}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #6a4f3a',
                    background: 'white',
                    color: '#6a4f3a',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  -
                </button>
                <span style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  minWidth: '40px',
                  textAlign: 'center'
                }}>
                  {customization.quantity}
                </span>
                <button
                  onClick={() => setCustomization({
                    ...customization,
                    quantity: customization.quantity + 1
                  })}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #6a4f3a',
                    background: 'white',
                    color: '#6a4f3a',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div style={{
              padding: '16px',
              background: '#f9f5f0',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#6a4f3a' }}>
                  {t.customization.total}:
                </span>
                <span style={{ fontSize: '28px', fontWeight: '700', color: '#6a4f3a' }}>
                  ${(selectedProduct.price * customization.quantity).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setCustomizationModal(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'white',
                  color: '#6a4f3a',
                  border: '2px solid #6a4f3a',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {t.customization.cancel}
              </button>
              <button
                onClick={handleProceedToCheckout}
                style={{
                  flex: 2,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
                  color: '#1f1a17',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <ChevronRight size={20} />
                {t.customization.proceedToCheckout}
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
          {language === 'en' ? 'Heritage in Your Hands. Uniquely Yours.' : 'Herencia en tus manos. Únicamente tuyo.'}
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <a href="/builder" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            {language === 'en' ? 'Custom Builder' : 'Constructor'}
          </a>
          {isAuthenticated() ? (
            <>
              <a href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
                {language === 'en' ? 'Dashboard' : 'Panel'}
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
    </div>
  );
}

export default LandingPage;