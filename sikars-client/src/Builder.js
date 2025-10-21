import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, Package, Sparkles } from 'lucide-react';
import enTranslations from './languages/en';
import spTranslations from './languages/sp';

const TRANSLATIONS = { en: enTranslations, sp: spTranslations };

const STEPS = [
  { id: 1, title: 'cigar', key: 'cigar' },
  { id: 2, title: 'box', key: 'box' },
  { id: 3, title: 'customize', key: 'customize' },
  { id: 4, title: 'preview', key: 'preview' }
];

const OPTIONS = {
  size: [
    { value: 'robusto', price: 10, image: '/images/robusto.png' },
    { value: 'gordo', price: 12, image: '/images/gordo.png' },
    { value: 'churchill', price: 14, image: '/images/churchill.png' },
    { value: 'belicoso', price: 14, image: '/images/belicoso.png' }
  ],
  binder: [
    { value: 'habano', price: 0, image: '/images/habano.png' },
    { value: 'maduro', price: 1, image: '/images/maduro.png' },
    { value: 'connecticut', price: 0.5, image: '/images/connecticut.png' }
  ],
  flavor: [
    { value: 'light', price: 0, image: '/images/flavor-light.png' },
    { value: 'medium', price: 2, image: '/images/flavor-medium.png' },
    { value: 'strong', price: 2, image: '/images/flavor-strong.png' }
  ],
  bandStyle: [
    { value: 'beveled', price: 2, image: '/images/beveled.png' },
    { value: 'round', price: 2, image: '/images/round_square2.png' },
    { value: 'dome', price: 2, image: '/images/dome2.png' },
    { value: 'square', price: 2, image: '/images/square.png' }
  ],
  box: [
    { value: 'classic', price: 20, image: '/images/box-classic.png' },
    { value: 'rustic', price: 18, image: '/images/box-rustic.png' },
    { value: 'modern', price: 24, image: '/images/box-modern.png' }
  ]
};

const BASE_PRICE = 30;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Builder() {
  const getLanguageFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang');
    return (lang === 'sp' || lang === 'es') ? 'sp' : 'en';
  };

  const [language, setLanguage] = useState(getLanguageFromURL());
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState({
    size: null,
    binder: null,
    flavor: null,
    bandStyle: null,
    box: null,
    engraving: '',
    bandText: '',
    quantity: 1,
    age21: false
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const t = TRANSLATIONS[language];
  
  const translate = (key, replacements = {}) => {
    let text = key;
    Object.keys(replacements).forEach(placeholder => {
      text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    return text;
  };

  useEffect(() => {
    const handleURLChange = () => {
      const newLang = getLanguageFromURL();
      setLanguage(newLang);
    };
    window.addEventListener('popstate', handleURLChange);
    return () => window.removeEventListener('popstate', handleURLChange);
  }, []);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    const url = new URL(window.location);
    url.searchParams.set('lang', newLang);
    window.history.pushState({}, '', url);
  };

  const calculatePrice = () => {
    let total = BASE_PRICE;
    Object.keys(OPTIONS).forEach(key => {
      const selected = OPTIONS[key]?.find(opt => opt.value === selections[key]);
      if (selected) total += selected.price;
    });
    return total * selections.quantity;
  };

  const handleSelection = (key, value) => {
    setSelections(prev => ({ ...prev, [key]: value }));
    
    if (currentStep === 1) {
      setTimeout(() => {
        const sectionOrder = ['size', 'binder', 'flavor', 'bandStyle'];
        const currentIndex = sectionOrder.indexOf(key);
        
        if (currentIndex < sectionOrder.length - 1) {
          const nextSection = sectionOrder[currentIndex + 1];
          const nextElement = document.getElementById(`section-${nextSection}`);
          if (nextElement) {
            nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const generatePreview = async () => {
    setIsGeneratingPreview(true);
    
    const orderData = {
      quantity: selections.quantity,
      size: selections.size,
      box: selections.box,
      binder: selections.binder,
      flavor: selections.flavor,
      bandStyle: selections.bandStyle,
      engraving: selections.engraving,
      bandText: selections.bandText
    };

    try {
      const response = await fetch(`${API_URL}/api/render-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`Preview request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.url) {
        setPreviewUrl(data.url);
      } else {
        throw new Error(t.noPreviewUrl);
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      alert(translate(t.previewError, { error: error.message }));
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleCheckout = async () => {
    if (!selections.age21) {
      alert(t.confirmAge);
      return;
    }

    const orderData = {
      size: selections.size,
      box: selections.box,
      binder: selections.binder,
      flavor: selections.flavor,
      bandStyle: selections.bandStyle,
      engraving: selections.engraving,
      bandText: selections.bandText,
      quantity: selections.quantity,
      price: calculatePrice(),
      currency: 'USD'
    };

    try {
      const response = await fetch(`${API_URL}/api/anet/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(t.noCheckoutUrl);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(translate(t.checkoutError, { error: error.message }));
    }
  };

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

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
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'white' }}>
              <Package size={28} />
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{t.appName}</h1>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{t.tagline}</p>
              </div>
            </a>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => changeLanguage('en')}
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
              onClick={() => changeLanguage('sp')}
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
          </div>
        </div>
        
        {/* Progress Bar */}
        <div style={{ marginTop: '12px' }}>
          <div style={{
            height: '6px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #d4af37, #f4d03f)',
              transition: 'width 0.3s ease',
              borderRadius: '10px'
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px',
            fontSize: '12px'
          }}>
            <span>{translate(t.stepOf, { current: currentStep, total: STEPS.length })}</span>
            <span>{t.steps[STEPS[currentStep - 1].title]}</span>
          </div>
        </div>

        {/* Step Dots */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'center',
          marginTop: '12px',
          flexWrap: 'wrap'
        }}>
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: step.id === currentStep ? '2px solid #d4af37' : '2px solid rgba(255,255,255,0.3)',
                background: step.id === currentStep ? '#d4af37' : 'transparent',
                color: step.id === currentStep ? '#6a4f3a' : 'white',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              {step.id}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '16px', paddingBottom: '180px' }}>
        {/* Step 1: Build Your Cigar */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#1f1a17' }}>
              {t.buildYourCigar}
            </h2>
            <p style={{ color: '#8b7a6b', fontSize: '14px', margin: '0 0 20px 0' }}>
              {t.buildDescription}
            </p>
            
            {/* Size Section */}
            <div id="section-size" style={{ marginBottom: '28px', scrollMarginTop: '80px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#6a4f3a' }}>
                {t.cigarSize}
              </h3>
              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {OPTIONS.size.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelection('size', option.value)}
                    style={{
                      background: selections.size === option.value 
                        ? 'linear-gradient(135deg, #6a4f3a, #8a6a52)' 
                        : 'white',
                      border: selections.size === option.value 
                        ? '2px solid #d4af37' 
                        : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      color: selections.size === option.value ? 'white' : '#1f1a17'
                    }}
                  >
                    {option.image && (
                      <img 
                        src={option.image} 
                        alt={t.options.size[option.value].label}
                        style={{
                          width: '100%',
                          maxWidth: '120px',
                          height: 'auto',
                          margin: '0 auto 8px',
                          display: 'block',
                          borderRadius: '8px',
                          opacity: selections.size === option.value ? 0.9 : 1
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
                          {t.options.size[option.value].label}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '4px' }}>
                          {t.options.size[option.value].detail}
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '700',
                          color: selections.size === option.value ? '#d4af37' : '#6a4f3a'
                        }}>
                          +${option.price.toFixed(2)}
                        </div>
                      </div>
                      {selections.size === option.value && (
                        <Check size={20} color="#d4af37" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Binder Section */}
            <div id="section-binder" style={{ marginBottom: '28px', scrollMarginTop: '80px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#6a4f3a' }}>
                {t.binder}
              </h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {OPTIONS.binder.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelection('binder', option.value)}
                    style={{
                      background: selections.binder === option.value 
                        ? 'linear-gradient(135deg, #6a4f3a, #8a6a52)' 
                        : 'white',
                      border: selections.binder === option.value 
                        ? '2px solid #d4af37' 
                        : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      color: selections.binder === option.value ? 'white' : '#1f1a17'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      {option.image && (
                        <img 
                          src={option.image} 
                          alt={t.options.binder[option.value].label}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            opacity: selections.binder === option.value ? 0.9 : 1
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
                          {t.options.binder[option.value].label}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.85 }}>
                          {t.options.binder[option.value].detail}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '700',
                          color: selections.binder === option.value ? '#d4af37' : '#6a4f3a'
                        }}>
                          +${option.price.toFixed(2)}
                        </div>
                        {selections.binder === option.value && (
                          <Check size={20} color="#d4af37" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Flavor Section */}
            <div id="section-flavor" style={{ marginBottom: '28px', scrollMarginTop: '80px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#6a4f3a' }}>
                {t.flavorProfile}
              </h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {OPTIONS.flavor.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelection('flavor', option.value)}
                    style={{
                      background: selections.flavor === option.value 
                        ? 'linear-gradient(135deg, #6a4f3a, #8a6a52)' 
                        : 'white',
                      border: selections.flavor === option.value 
                        ? '2px solid #d4af37' 
                        : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      color: selections.flavor === option.value ? 'white' : '#1f1a17'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      {option.image && (
                        <img 
                          src={option.image} 
                          alt={t.options.flavor[option.value].label}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            opacity: selections.flavor === option.value ? 0.9 : 1
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
                          {t.options.flavor[option.value].label}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.85 }}>
                          {t.options.flavor[option.value].detail}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '700',
                          color: selections.flavor === option.value ? '#d4af37' : '#6a4f3a'
                        }}>
                          +${option.price.toFixed(2)}
                        </div>
                        {selections.flavor === option.value && (
                          <Check size={20} color="#d4af37" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Band Style Section */}
            <div id="section-bandStyle" style={{ marginBottom: '28px', scrollMarginTop: '80px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#6a4f3a' }}>
                {t.bandStyle}
              </h3>
              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {OPTIONS.bandStyle.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelection('bandStyle', option.value)}
                    style={{
                      background: selections.bandStyle === option.value 
                        ? 'linear-gradient(135deg, #6a4f3a, #8a6a52)' 
                        : 'white',
                      border: selections.bandStyle === option.value 
                        ? '2px solid #d4af37' 
                        : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      color: selections.bandStyle === option.value ? 'white' : '#1f1a17'
                    }}
                  >
                    {option.image && (
                      <img 
                        src={option.image} 
                        alt={t.options.bandStyle[option.value].label}
                        style={{
                          width: '100%',
                          maxWidth: '120px',
                          height: 'auto',
                          margin: '0 auto 8px',
                          display: 'block',
                          borderRadius: '8px',
                          opacity: selections.bandStyle === option.value ? 0.9 : 1
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>
                          {t.options.bandStyle[option.value].label}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '4px' }}>
                          {t.options.bandStyle[option.value].detail}
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '700',
                          color: selections.bandStyle === option.value ? '#d4af37' : '#6a4f3a'
                        }}>
                          +${option.price.toFixed(2)}
                        </div>
                      </div>
                      {selections.bandStyle === option.value && (
                        <Check size={20} color="#d4af37" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Choose Your Box */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#1f1a17' }}>
              {t.chooseYourBox}
            </h2>
            <p style={{ color: '#8b7a6b', fontSize: '14px', margin: '0 0 20px 0' }}>
              {t.boxDescription}
            </p>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              {OPTIONS.box.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelection('box', option.value)}
                  style={{
                    background: selections.box === option.value 
                      ? 'linear-gradient(135deg, #6a4f3a, #8a6a52)' 
                      : 'white',
                    border: selections.box === option.value 
                      ? '2px solid #d4af37' 
                      : '2px solid #e0e0e0',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    color: selections.box === option.value ? 'white' : '#1f1a17'
                  }}
                >
                  {option.image && (
                    <img 
                      src={option.image} 
                      alt={t.options.box[option.value].label}
                      style={{
                        width: '100%',
                        maxWidth: '200px',
                        height: 'auto',
                        margin: '0 auto 12px',
                        display: 'block',
                        borderRadius: '10px',
                        opacity: selections.box === option.value ? 0.9 : 1
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                        {t.options.box[option.value].label}
                      </div>
                      <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '8px' }}>
                        {t.options.box[option.value].detail}
                      </div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '700',
                        color: selections.box === option.value ? '#d4af37' : '#6a4f3a'
                      }}>
                        +${option.price.toFixed(2)}
                      </div>
                    </div>
                    {selections.box === option.value && (
                      <Check size={24} color="#d4af37" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Customize */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#1f1a17' }}>
              {t.customizeYourBox}
            </h2>
            <p style={{ color: '#8b7a6b', fontSize: '14px', margin: '0 0 20px 0' }}>
              {t.customizeDescription}
            </p>
            
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid #e0e0e0'
            }}>
              <label style={{ display: 'block', marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1f1a17' }}>
                  {t.boxEngraving}
                </div>
                <input
                  type="text"
                  value={selections.engraving}
                  onChange={(e) => handleSelection('engraving', e.target.value.slice(0, 20))}
                  placeholder={t.engravingPlaceholder}
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
                  {translate(t.charactersRemaining, { count: selections.engraving.length })}
                </div>
              </label>

              <label style={{ display: 'block' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1f1a17' }}>
                  {t.bandText}
                </div>
                <input
                  type="text"
                  value={selections.bandText}
                  onChange={(e) => handleSelection('bandText', e.target.value.slice(0, 18))}
                  placeholder={t.bandTextPlaceholder}
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
                  {translate(t.bandTextRemaining, { count: selections.bandText.length })}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: '24px', margin: '0 0 8px 0', color: '#1f1a17' }}>
              {t.previewYourOrder}
            </h2>
            <p style={{ color: '#8b7a6b', fontSize: '14px', margin: '0 0 20px 0' }}>
              {t.previewDescription}
            </p>
            
            {/* Order Summary */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid #e0e0e0',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px 0', color: '#6a4f3a' }}>
                {t.yourSelections}
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.summary.size}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {selections.size ? t.options.size[selections.size].label : '\u2014'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.summary.binder}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {selections.binder ? t.options.binder[selections.binder].label : '\u2014'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.summary.flavor}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {selections.flavor ? t.options.flavor[selections.flavor].label : '\u2014'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.summary.bandStyle}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {selections.bandStyle ? t.options.bandStyle[selections.bandStyle].label : '\u2014'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.summary.box}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {selections.box ? t.options.box[selections.box].label : '\u2014'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.summary.bandText}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {selections.bandText || '\u2014'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8b7a6b', fontSize: '14px' }}>{t.summary.engraving}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {selections.engraving || '\u2014'}
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Generator */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '20px',
              border: '2px solid #e0e0e0',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 12px 0', color: '#6a4f3a' }}>
                {t.boxPreview}
              </h3>
              {!previewUrl ? (
                <div>
                  <p style={{ color: '#8b7a6b', fontSize: '14px', margin: '0 0 16px 0' }}>
                    {t.generatePreviewDesc}
                  </p>
                  <button
                    onClick={generatePreview}
                    disabled={isGeneratingPreview}
                    style={{
                      background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isGeneratingPreview ? 'not-allowed' : 'pointer',
                      opacity: isGeneratingPreview ? 0.6 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Sparkles size={20} />
                    {isGeneratingPreview ? t.generating : t.generatePreview}
                  </button>
                </div>
              ) : (
                <div>
                  <img 
                    src={previewUrl} 
                    alt="Preview of your custom cigar box" 
                    style={{
                      maxWidth: '100%',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                  <button
                    onClick={() => setPreviewUrl(null)}
                    style={{
                      background: 'transparent',
                      color: '#6a4f3a',
                      border: '2px solid #6a4f3a',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {t.regeneratePreview}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e0e0e0',
        padding: '16px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Price & Quantity Summary */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '12px',
          background: '#f9f5f0',
          borderRadius: '12px'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: '#8b7a6b' }}>{t.totalPrice}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#6a4f3a' }}>
              ${calculatePrice().toFixed(2)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#8b7a6b' }}>{t.quantity}</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
              <button
                onClick={() => handleSelection('quantity', Math.max(1, selections.quantity - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid #6a4f3a',
                  background: 'white',
                  color: '#6a4f3a',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                -
              </button>
              <span style={{ fontSize: '18px', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>
                {selections.quantity}
              </span>
              <button
                onClick={() => handleSelection('quantity', selections.quantity + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid #6a4f3a',
                  background: 'white',
                  color: '#6a4f3a',
                  fontSize: '18px',
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
        </div>

        {/* Age Verification */}
        {currentStep === 4 && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            padding: '12px',
            background: '#fff3cd',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={selections.age21}
              onChange={(e) => handleSelection('age21', e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span>{t.ageConfirm}</span>
          </label>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: '2px solid #6a4f3a',
              background: 'white',
              color: '#6a4f3a',
              fontSize: '16px',
              fontWeight: '600',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 1 ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <ChevronLeft size={20} />
            {t.previous}
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #6a4f3a, #8a6a52)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              {t.next}
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={!selections.age21}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: selections.age21 
                  ? 'linear-gradient(135deg, #d4af37, #f4d03f)' 
                  : '#ccc',
                color: selections.age21 ? '#1f1a17' : '#666',
                fontSize: '16px',
                fontWeight: '700',
                cursor: selections.age21 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              {t.proceedToPayment}
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Builder;