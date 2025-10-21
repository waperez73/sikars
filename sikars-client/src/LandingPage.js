import React, { useState } from 'react';
import { Menu, X, Package, Sparkles, CheckCircle, Users, Award } from 'lucide-react';

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              Home
            </a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} 
               style={{ color: 'white', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
              Features
            </a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} 
               style={{ color: 'white', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
              How It Works
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} 
               style={{ color: 'white', textDecoration: 'none', fontWeight: '500', cursor: 'pointer' }}>
              About
            </a>
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
              Login
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
              Home
            </a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} 
               style={{ color: 'white', textDecoration: 'none', padding: '12px', fontWeight: '500' }}>
              Features
            </a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} 
               style={{ color: 'white', textDecoration: 'none', padding: '12px', fontWeight: '500' }}>
              How It Works
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} 
               style={{ color: 'white', textDecoration: 'none', padding: '12px', fontWeight: '500' }}>
              About
            </a>
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
              Login
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
            Build Your Perfect<br />Custom Cigar
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            margin: '0 0 32px 0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Create a personalized cigar experience from size to flavor, band to box. 
            Your signature blend, your way.
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
            Start Building
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
          Why Choose Sikars?
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
              Fully Customizable
            </h3>
            <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
              Choose every detail from size, binder, flavor profile, to personalized engraving and band design.
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
              Premium Quality
            </h3>
            <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
              Hand-selected tobacco leaves and expert craftsmanship ensure every cigar meets the highest standards.
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
              Elegant Packaging
            </h3>
            <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
              Choose from classic, rustic, or modern boxes. Add custom engraving for a truly personal touch.
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
          How It Works
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
                Build Your Cigar
              </h3>
              <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
                Select size, binder, flavor profile, and band style to create your perfect smoke.
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
                Choose Your Box
              </h3>
              <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
                Pick from classic wooden, rustic cedar, or modern high-gloss box designs.
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
                Personalize
              </h3>
              <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
                Add custom engraving and band text to make it uniquely yours.
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
                Preview & Order
              </h3>
              <p style={{ color: '#8b7a6b', margin: 0, lineHeight: '1.6' }}>
                Review your custom design and complete your secure checkout.
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
            Get Started Now
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
            About Sikars
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            lineHeight: '1.8',
            maxWidth: '800px',
            margin: '0 auto 32px'
          }}>
            At Sikars, we believe every cigar should be as unique as the person enjoying it. 
            Our custom cigar builder puts you in control, allowing you to craft the perfect smoke 
            from premium tobacco selections to personalized packaging. Whether you're celebrating 
            a special occasion or creating a signature blend, Sikars delivers quality and 
            craftsmanship in every puff.
          </p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6a4f3a' }}>10k+</div>
              <div style={{ color: '#8b7a6b', fontSize: '14px' }}>Custom Cigars Made</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6a4f3a' }}>5k+</div>
              <div style={{ color: '#8b7a6b', fontSize: '14px' }}>Happy Customers</div>
            </div>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#6a4f3a' }}>100%</div>
              <div style={{ color: '#8b7a6b', fontSize: '14px' }}>Premium Quality</div>
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
            Crafting custom cigars since 2024
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            fontSize: '14px'
          }}>
            <a href="/privacy" style={{ color: 'white', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: 'white', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact Us</a>
          </div>
          <p style={{ margin: '24px 0 0', fontSize: '14px', opacity: 0.7 }}>
            © 2024 Sikars. All rights reserved.
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
        }
      `}</style>
    </div>
  );
}

export default LandingPage;