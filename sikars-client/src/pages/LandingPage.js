import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Sparkles, Package, Award, Users } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    '/images/hero-image-1.jpg', // Tobacco drying barn
    '/images/hero-image-2.jpg', // Person in tobacco field
    '/images/hero-image-3.jpg'  // Tobacco field with drying barn
  ];

  // Auto-rotate carousel every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const content = {
    en: {
      hero: {
        title: "Heritage in Your Hands. Uniquely Yours.",
        subtitle: "Experience the art of custom cigars, crafted with ancient Dominican traditions. Sikars offers a luxury journey in cigar creation, combining heritage with personal artistry.",
        cta: "Create Your Sikars",
        tagline: "From leaves to ashes - build the cigar that speaks for you."
      },
      distinction: {
        title: "Our Distinction in the Market",
        subtitle: "Sikars stands out by integrating authentic origin with a truly unique cigar experience, going beyond aesthetics to highlight the soul of the cigar.",
        competitors: {
          title: "Competitors' Focus",
          points: [
            "Only customize labels and packaging",
            "Limited focus on origin and complete cigar crafting",
            "Limited customization"
          ]
        },
        sikars: {
          title: "Sikars Advantage",
          points: [
            "Story of origin, cultivation and cigar handling",
            "Complete cigar crafting experience",
            "Diversity in style and customization (color, occasion, etc.)",
            "Custom packaging"
          ]
        }
      },
      differentiation: {
        title: "What Makes Us Different",
        subtitle: "Our commitment to authentic origin and comprehensive customization ensures an unparalleled luxury journey with cigars.",
        features: [
          {
            icon: "🇩🇴",
            title: "100% Dominican Origin",
            description: "From Santiago, the world capital of tobacco."
          },
          {
            icon: "🎨",
            title: "Complete Customization",
            description: "Wrapper, filler, size, strength and band options."
          },
          {
            icon: "📦",
            title: "Luxury Package",
            description: "Engraved boxes, gift-ready packages."
          },
          {
            icon: "🎬",
            title: "Experiential Elements",
            description: "Videos, stories linked to QR codes. (Coming soon)"
          },
          {
            icon: "👑",
            title: "Membership & Subscriptions",
            description: "Exclusive access and premium benefits. (Coming soon)"
          }
        ]
      },
      audience: {
        title: "Our Distinguished Audience",
        segments: [
          {
            icon: "✨",
            title: "Exclusive Experience Enthusiasts",
            description: "Seeking unique, high-end gifts."
          },
          {
            icon: "🎉",
            title: "Event Organizers",
            description: "For weddings, birthdays and corporate events."
          },
          {
            icon: "",
            title: "Cigar Aficionados",
            description: "Discerning connoisseurs who value cigar craftsmanship."
          },
          {
            icon: "🎯",
            title: "Personalized Experience Seekers",
            description: "Who desire unique, quality products."
          }
        ]
      },
      process: {
        title: "User Experience: Custom Creation",
        subtitle: "From conception to delivery, Sikars ensures a smooth and intuitive process for creating your perfect custom cigar.",
        steps: [
          {
            number: "1",
            title: "Customize Your Cigars",
            description: "Use the mobile app to select vitola, wrapper, strength and flavor profile, crafting your ideal cigar."
          },
          {
            number: "2",
            title: "Design Your Exclusive Box",
            description: "Choose box materials and design your personalized engraving, ensuring an unmatched presentation."
          },
          {
            number: "3",
            title: "Verify and Approve",
            description: "Confirm all details: engraving, cigar type, size, and flavor, ensuring your complete satisfaction."
          },
          {
            number: "4",
            title: "Finalize Your Order",
            description: "Authorize the order and make payment to submit your order, including your preferred delivery method."
          }
        ]
      },
      footer: {
        tagline: "Heritage in Your Hands. Uniquely Yours."
      }
    },
    sp: {
      hero: {
        title: "Herencia en tus manos. Únicamente tuyo.",
        subtitle: "Experimente el arte de los cigarros a medida, elaborados con antiguas tradiciones Dominicanas. Sikars ofrece un viaje de lujo en la creación de cigarros, combinando el patrimonio con el arte personal.",
        cta: "Crea Tu Sikar",
        tagline: "De hojas a cenizas - construye el cigarro que hable por ti."
      },
      distinction: {
        title: "Panorama del mercado y nuestra distinción",
        subtitle: "Sikars se destaca al integrar un origen auténtico con una experiencia de puro verdaderamente única, yendo más allá de lo estético para resaltar el alma del puro.",
        competitors: {
          title: "Enfoque de la competencia",
          points: [
            "Únicamente personaliza las etiquetas y el embalaje",
            "Enfoque limitado en el origen y la elaboración completa de puros",
            "Personalización limitada"
          ]
        },
        sikars: {
          title: "Ventaja de Sikars",
          points: [
            "Historia de la procedencia, cultivo y manejo del cigarro",
            "Experiencia completa de elaboración de cigarros",
            "Diversidad en estilo y personalización (color, ocasión, etc.)",
            "Empaque customizado"
          ]
        }
      },
      differentiation: {
        title: "Que nos hace diferente",
        subtitle: "Nuestro compromiso con el origen auténtico y la personalización integral asegura un viaje de lujo sin igual con los puros.",
        features: [
          {
            icon: "🇩🇴",
            title: "100% de origen dominicano",
            description: "Desde Santiago, la capital mundial del tabaco."
          },
          {
            icon: "🎨",
            title: "Personalización completa",
            description: "Opciones de capa, relleno, tamaño, fortaleza y banda."
          },
          {
            icon: "📦",
            title: "Paquete de lujo",
            description: "Cajas grabadas, paquetes listos para regalar."
          },
          {
            icon: "🎬",
            title: "Elementos experienciales",
            description: "Videos, historias vinculadas a QR. (Próximamente)"
          },
          {
            icon: "👑",
            title: "Membresía y suscripciones",
            description: "Acceso exclusivo y beneficios premium. (Próximamente)"
          }
        ]
      },
      audience: {
        title: "Nuestro público distinguido",
        segments: [
          {
            icon: "✨",
            title: "Entusiasta de las experiencias exclusivas",
            description: "Buscando regalos únicos y de alta gama."
          },
          {
            icon: "🎉",
            title: "Organizadores de eventos",
            description: "Para bodas, cumpleaños y eventos corporativos."
          },
          {
            icon: "🚬",
            title: "Aficionados a los puros",
            description: "Conocedores exigentes que valoran la elaboración del cigarro."
          },
          {
            icon: "🎯",
            title: "Buscadores de experiencias personalizadas",
            description: "Que desean productos únicos y de buena calidad."
          }
        ]
      },
      process: {
        title: "Experiencia del Usuario: Creación a tu Medida",
        subtitle: "Desde la concepción hasta la entrega, Sikars asegura un proceso fluido e intuitivo para crear tu cigarro personalizado perfecto.",
        steps: [
          {
            number: "1",
            title: "Personaliza Tu Puros",
            description: "Utiliza la aplicación móvil para seleccionar vitola, capa, fortaleza y perfil de sabor, elaborando tu cigarro ideal."
          },
          {
            number: "2",
            title: "Diseña Tu Caja Exclusiva",
            description: "Elige materiales para la caja y diseña tu grabado personalizado, asegurando una presentación inigualable."
          },
          {
            number: "3",
            title: "Verifica y Aprueba",
            description: "Confirma todos los detalles: grabado, tipo de cigarro, tamaño, y sabor, asegurando tu completa satisfacción."
          },
          {
            number: "4",
            title: "Finaliza Tu Pedido",
            description: "Autoriza la orden y realiza el depósito para someter tu pedido, incluyendo tu método de entrega preferido."
          }
        ]
      },
      footer: {
        tagline: "Herencia en tus manos. Únicamente tuyo."
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
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                  {language === 'en' ? 'Sikars' : 'Sikars'}
                </h1>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                  {language === 'en' ? 'Custom Cigars with Ancient Soul' : 'Cigarros a medida con alma antigua'}
                </p>
              </div>
            </a>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                cursor: 'pointer',
                transition: 'all 0.2s'
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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ES
            </button>
            <a href="/login" style={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              marginLeft: '8px'
            }}>
              {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
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
          {/* Dark overlay for text readability */}
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
              margin: '0 0 16px 0',
              lineHeight: '1.6',
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
            }}>
              {t.hero.subtitle}
            </p>

            <p style={{
              fontSize: '16px',
              color: '#d4af37',
              margin: '0 0 40px 0',
              fontStyle: 'italic',
              fontWeight: '500',
              textShadow: '1px 1px 4px rgba(0,0,0,0.5)'
            }}>
              "{t.hero.tagline}"
            </p>
            
            <button
              onClick={() => navigate('/builder')}
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
                boxShadow: '0 8px 24px rgba(212, 175, 55, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Sparkles size={24} />
              {t.hero.cta}
              <ChevronRight size={24} />
            </button>
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
              aria-label={`Go to slide ${index + 1}`}
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
            zIndex: 2,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
          aria-label="Previous image"
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
            zIndex: 2,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      </section>

      {/* Market Distinction */}
      <section style={{
        background: '#f9f5f0',
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
            {t.distinction.title}
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 64px auto',
            lineHeight: '1.6'
          }}>
            {t.distinction.subtitle}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {/* Competitors */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid #e0e0e0'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#8b7a6b',
                margin: '0 0 20px 0'
              }}>
                {t.distinction.competitors.title}
              </h3>
              {t.distinction.competitors.points.map((point, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <span style={{ color: '#e0e0e0', fontSize: '20px' }}>•</span>
                  <p style={{ margin: 0, fontSize: '16px', color: '#8b7a6b', lineHeight: '1.5' }}>
                    {point}
                  </p>
                </div>
              ))}
            </div>

            {/* Sikars Advantage */}
            <div style={{
              background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 8px 24px rgba(106, 79, 58, 0.3)',
              border: '2px solid #d4af37'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#d4af37',
                margin: '0 0 20px 0'
              }}>
                {t.distinction.sikars.title}
              </h3>
              {t.distinction.sikars.points.map((point, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <Check size={20} style={{ color: '#d4af37', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '16px', color: 'white', lineHeight: '1.5' }}>
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section style={{
        background: 'white',
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
            {t.differentiation.title}
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 64px auto',
            lineHeight: '1.6'
          }}>
            {t.differentiation.subtitle}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {t.differentiation.features.map((feature, i) => (
              <div key={i} style={{
                background: '#f9f5f0',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                border: '2px solid #e0e0e0',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#6a4f3a',
                  margin: '0 0 12px 0'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#8b7a6b',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
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
            margin: '0 0 64px 0'
          }}>
            {t.audience.title}
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px'
          }}>
            {t.audience.segments.map((segment, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                border: '2px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                  {segment.icon}
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#6a4f3a',
                  margin: '0 0 12px 0'
                }}>
                  {segment.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#8b7a6b',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {segment.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Experience Process */}
      <section style={{
        background: 'white',
        padding: '80px 32px'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#6a4f3a',
            textAlign: 'center',
            margin: '0 0 16px 0'
          }}>
            {t.process.title}
          </h2>
          
          <p style={{
            fontSize: '18px',
            color: '#8b7a6b',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto 64px auto',
            lineHeight: '1.6'
          }}>
            {t.process.subtitle}
          </p>

          <div style={{ position: 'relative' }}>
            {t.process.steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '24px',
                marginBottom: i < t.process.steps.length - 1 ? '48px' : 0,
                position: 'relative'
              }}>
                {/* Step Number */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(106, 79, 58, 0.3)',
                  zIndex: 1
                }}>
                  {step.number}
                </div>

                {/* Connecting Line */}
                {i < t.process.steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '30px',
                    top: '60px',
                    width: '2px',
                    height: '48px',
                    background: '#e0e0e0'
                  }} />
                )}

                {/* Step Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#6a4f3a',
                    margin: '0 0 8px 0'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#8b7a6b',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <button
              onClick={() => navigate('/builder')}
              style={{
                background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 40px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {language === 'en' ? 'Start Building' : 'Comenzar a Crear'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section style={{
        background: 'linear-gradient(135deg, #1f1a17 0%, #3d2f24 100%)',
        padding: '80px 32px',
        color: 'white'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#d4af37',
            margin: '0 0 24px 0'
          }}>
            {language === 'en' ? 'Brand Philosophy' : 'Filosofía de Marca'}
          </h2>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '48px',
            border: '2px solid rgba(212, 175, 55, 0.3)'
          }}>
            <p style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#d4af37',
              margin: '0 0 16px 0',
              fontStyle: 'italic'
            }}>
              "{language === 'en' ? 'Heritage in Your Hands. Uniquely Yours.' : 'Herencia en tus manos. Únicamente tuyo.'}"
            </p>
            <p style={{
              fontSize: '18px',
              color: '#e9ded4',
              margin: 0,
              lineHeight: '1.6'
            }}>
              {language === 'en' 
                ? 'Every Sikars cigar embodies the rich tradition of Dominican tobacco craftsmanship, combined with your personal vision and style. From the fertile fields of Santiago to your hands, each cigar tells a unique story.'
                : 'Cada cigarro Sikars encarna la rica tradición de la artesanía del tabaco dominicano, combinada con tu visión personal y estilo. Desde los campos fértiles de Santiago hasta tus manos, cada cigarro cuenta una historia única.'}
            </p>
          </div>
        </div>
      </section>

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
          {t.footer.tagline}
        </h3>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <a href="/builder" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            {language === 'en' ? 'Builder' : 'Constructor'}
          </a>
          <a href="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            {language === 'en' ? 'Sign In' : 'Iniciar Sesión'}
          </a>
          <a href="/signup" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
            {language === 'en' ? 'Sign Up' : 'Registrarse'}
          </a>
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