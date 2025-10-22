import React, { useState, useEffect } from 'react';
import { Menu, X, Package, Sparkles, CheckCircle, Users, Award } from 'lucide-react';

import enTranslations from './languages/landing-en';
import esTranslations from './languages/landing-es';

const TRANSLATIONS = { en: enTranslations, es: esTranslations };

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get language from URL or default to English
  const getLanguageFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    return (lang === 'es' || lang === 'es') ? 'es' : 'en';
  };

  const [language, setLanguage] = useState(getLanguageFromURL());
  const t = TRANSLATIONS[language];

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    const url = new URL(window.location);
    url.searchParams.set('lang', newLang);
    window.history.pushState({}, '', url);
  };

  /* const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  }; */

  useEffect(() => {
    const handleURLChange = () => {
      setLanguage(getLanguageFromURL());
    };
    window.addEventListener('popstate', handleURLChange);
    return () => window.removeEventListener('popstate', handleURLChange);
  }, []);

  useEffect(() => {
    // Load Splide CSS
    const splideCSS = document.createElement('link');
    splideCSS.rel = 'stylesheet';
    splideCSS.href = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css';
    document.head.appendChild(splideCSS);

    // Load Splide JS
    const splideJS = document.createElement('script');
    splideJS.src = 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js';
    splideJS.async = true;
    splideJS.onload = () => {
      if (window.Splide) {
        new window.Splide('#image-carousel', {
          type: 'loop',
          perPage: 1,
          autoplay: true,
          interval: 5000,
          pauseOnHover: true,
          pauseOnFocus: true,
          arrows: true,
          pagination: true,
          speed: 800,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        }).mount();
      }
    };
    document.body.appendChild(splideJS);

    return () => {
      document.head.removeChild(splideCSS);
      document.body.removeChild(splideJS);
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9f5f0 0%, #e9ded4 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sticky Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(106, 79, 58, 0.98)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        color: 'white'
      }}>
        <nav style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={32} />
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Sikars</h1>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Custom Cigars</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div style={{
            display: 'none',
            gap: '24px',
            alignItems: 'center'
          }}
          className="desktop-menu">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} 
               style={{ color: 'white', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
              {t.home}
            </a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} 
               style={{ color: 'white', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
              {t.features}
            </a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} 
               style={{ color: 'white', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
              {t.howItWorks}
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} 
               style={{ color: 'white', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
              {t.about}
            </a>
            
            {/* Language Switcher */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => changeLanguage('en')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: language === 'en' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: language === 'en' ? '#1f1a17' : 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('es')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: language === 'es' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: language === 'es' ? '#1f1a17' : 'white',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ES
              </button>
            </div>
            
            <a href="/login" 
               style={{
                 padding: '8px 20px',
                 background: '#d4af37',
                 color: '#1f1a17',
                 textDecoration: 'none',
                 borderRadius: '8px',
                 fontWeight: '600',
                 transition: 'transform 0.2s'
               }}>
              {t.login}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px'
            }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            background: '#6a4f3a',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }} 
               style={{ color: 'white', textDecoration: 'none', padding: '12px', fontWeight: '500' }}>
              {t.home}
            </a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} 
               style={{ color: 'white', textDecoration: 'none', padding: '12px', fontWeight: '500' }}>
              {t.features}
            </a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} 
               style={{ color: 'white', textDecoration: 'none', padding: '12px', fontWeight: '500' }}>
              {t.howItWorks}
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} 
               style={{ color: 'white', textDecoration: 'none', padding: '12px', fontWeight: '500' }}>
              {t.about}
            </a>
            
            {/* Language Switcher - Mobile */}
            <div style={{ display: 'flex', gap: '8px', padding: '12px 0' }}>
              <button
                onClick={() => changeLanguage('en')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'en' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: language === 'en' ? '#1f1a17' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('es')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: language === 'es' ? '#d4af37' : 'rgba(255,255,255,0.2)',
                  color: language === 'es' ? '#1f1a17' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Español
              </button>
            </div>
            
            <a href="/login" 
               style={{
                 padding: '12px',
                 background: '#d4af37',
                 color: '#1f1a17',
                 textDecoration: 'none',
                 borderRadius: '8px',
                 fontWeight: '600',
                 textAlign: 'center'
               }}>
              {t.login}
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 16px',
        textAlign: 'center'
      }}>
        {/* Image Carousel */}
        <div id="image-carousel" className="splide" style={{
          marginBottom: '40px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }}>
          <div className="splide__track">
            <ul className="splide__list">
              <li className="splide__slide">
                <img 
                  src="/images/tobacco-field-1.jpg" 
                  alt={t.imgAlt1}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover'
                  }}
                />
              </li>
              <li className="splide__slide">
                <img 
                  src="/images/tobacco-field-2.jpg" 
                  alt={t.imgAlt2}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover'
                  }}
                />
              </li>
              <li className="splide__slide">
                <img 
                  src="/images/tobacco-drying.jpg" 
                  alt={t.imgAlt3}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover'
                  }}
                />
              </li>
            </ul>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px 24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          border: '2px solid #e0e0e0'
        }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#6a4f3a',
            margin: '0 0 16px 0',
            lineHeight: '1.2'
          }}>
            {t.heroTitle}
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            margin: '0 0 32px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {t.heroSubtitle}
          </p>
          <a href="/builder" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(106, 79, 58, 0.3)',
            transition: 'transform 0.2s'
          }}>
            <Sparkles size={24} />
            {t.startBuilding}
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 16px'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#6a4f3a',
          textAlign: 'center',
          margin: '0 0 40px 0'
        }}>
          {t.whyChoose}
        </h2>
        <div style={{
          display: 'grid',
          gap: '20px',
          gridTemplateColumns: '1fr'
        }}
        className="features-grid">
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Sparkles size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: '0 0 8px 0' }}>
              {t.fullyCustomizable}
            </h3>
            <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
              {t.fullyCustomizableDesc}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: '0 0 8px 0' }}>
              {t.premiumQuality}
            </h3>
            <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
              {t.premiumQualityDesc}
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Package size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: '0 0 8px 0' }}>
              {t.elegantPackaging}
            </h3>
            <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
              {t.elegantPackagingDesc}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 16px',
        background: 'white',
        borderRadius: '24px',
        marginLeft: '16px',
        marginRight: '16px'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#6a4f3a',
          textAlign: 'center',
          margin: '0 0 40px 0'
        }}>
          {t.howItWorksTitle}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#d4af37',
              color: '#1f1a17',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '18px',
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: '0 0 8px 0' }}>
                {t.step1Title}
              </h3>
              <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
                {t.step1Desc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#d4af37',
              color: '#1f1a17',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '18px',
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: '0 0 8px 0' }}>
                {t.step2Title}
              </h3>
              <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
                {t.step2Desc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#d4af37',
              color: '#1f1a17',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '18px',
              flexShrink: 0
            }}>
              3
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: '0 0 8px 0' }}>
                {t.step3Title}
              </h3>
              <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
                {t.step3Desc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#d4af37',
              color: '#1f1a17',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '18px',
              flexShrink: 0
            }}>
              4
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f1a17', margin: '0 0 8px 0' }}>
                {t.step4Title}
              </h3>
              <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
                {t.step4Desc}
              </p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a href="/builder" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'transform 0.2s'
          }}>
            {t.getStartedNow}
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 16px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px 24px',
          border: '2px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#6a4f3a',
            margin: '0 0 16px 0'
          }}>
            {t.aboutTitle}
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            lineHeight: '1.8',
            maxWidth: '800px',
            margin: '0 auto 32px'
          }}>
            {t.aboutDesc}
          </p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6a4f3a' }}>10k+</div>
              <div style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.customCigarsMade}</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6a4f3a' }}>5k+</div>
              <div style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.happyCustomers}</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6a4f3a' }}>100%</div>
              <div style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.premiumQualityLabel}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#6a4f3a',
        color: 'white',
        padding: '40px 16px',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
            <Package size={32} />
            <h3 style={{ margin: 0, fontSize: '24px' }}>Sikars</h3>
          </div>
          <p style={{ margin: '0 0 24px 0', opacity: 0.9 }}>
            {t.craftingSince}
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: '14px'
          }}>
            <a href="/privacy" style={{ color: 'white', textDecoration: 'none' }}>{t.privacyPolicy}</a>
            <a href="/terms" style={{ color: 'white', textDecoration: 'none' }}>{t.termsOfService}</a>
            <a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>{t.contactUs}</a>
          </div>
          <p style={{ margin: '24px 0 0', fontSize: '14px', opacity: 0.7 }}>
            {t.allRightsReserved}
          </p>
        </div>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          #image-carousel {
            height: 500px;
          }
          #image-carousel img {
            height: 500px !important;
          }
        }
        
        /* Splide Custom Styling */
        .splide__arrow {
          background: rgba(106, 79, 58, 0.8) !important;
          width: 3em !important;
          height: 3em !important;
        }
        .splide__arrow:hover {
          background: rgba(106, 79, 58, 1) !important;
        }
        .splide__pagination__page {
          background: #d4af37 !important;
          opacity: 0.5;
        }
        .splide__pagination__page.is-active {
          opacity: 1;
          transform: scale(1.4);
        }
        .splide__slide img {
          display: block;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;