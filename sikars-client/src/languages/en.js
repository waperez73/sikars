// en.js - English translations
export default {
  appName: 'Sikars',
  tagline: 'Build Your Custom Cigar',
  stepOf: 'Step {current} of {total}',
  
  steps: {
    cigar: 'Build Your Cigar',
    box: 'Box',
    customize: 'Customize',
    preview: 'Preview'
  },
  
  buildYourCigar: 'Build Your Cigar',
  buildDescription: 'Customize every aspect of your perfect cigar',
  
  cigarSize: 'Cigar Size',
  binder: 'Binder',
  flavorProfile: 'Flavor Profile',
  bandStyle: 'Band Style',
  
  options: {
    size: {
      robusto: { label: 'Robusto', detail: '54x5 - Balanced classic' },
      gordo: { label: 'Gordo', detail: '60x6 - Cooler draw, longer flavor' },
      churchill: { label: 'Churchill', detail: '54x7 - Long, elegant session' },
      belicoso: { label: 'Belicoso', detail: '50x7 - Leather, pepper, chocolate' }
    },
    binder: {
      habano: { label: 'Habano', detail: 'Classic strength & spice' },
      maduro: { label: 'Maduro', detail: 'Richer body, darker hue' },
      connecticut: { label: 'Connecticut', detail: 'Smooth, creamy profile' }
    },
    flavor: {
      light: { label: 'Light', detail: 'Classic, balanced' },
      medium: { label: 'Medium', detail: 'Cocoa, molasses' },
      strong: { label: 'Strong', detail: 'Spice, leather' }
    },
    bandStyle: {
      beveled: { label: 'Beveled', detail: 'Elegant flair' },
      round: { label: 'Round', detail: 'Bold accent' },
      dome: { label: 'Dome', detail: 'Crown form' },
      square: { label: 'Straight', detail: 'Clean look' }
    },
    box: {
      classic: { label: 'Classic', detail: 'Natural wood, gold hinges' },
      rustic: { label: 'Rustic', detail: 'Vintage texture with cedar' },
      modern: { label: 'Modern', detail: 'High-gloss, magnetic latch' }
    }
  },
  
  chooseYourBox: 'Choose Your Box',
  boxDescription: 'Select the perfect box for your custom cigars',
  
  customizeYourBox: 'Customize Your Box',
  customizeDescription: 'Add personal touches (optional)',
  boxEngraving: 'Box Engraving',
  engravingPlaceholder: 'Initials or phrase (max 20)',
  charactersRemaining: '{count}/20 characters',
  bandText: 'Band Text',
  bandTextPlaceholder: 'Your brand or initials',
  bandTextRemaining: '{count}/18 characters',
  
  previewYourOrder: 'Preview Your Order',
  previewDescription: 'Review your selections and generate a preview',
  yourSelections: 'Your Selections',
  boxPreview: 'Box Preview',
  generatePreviewDesc: 'Generate a preview of your custom cigar box',
  generatePreview: 'Generate Preview',
  generating: 'Generating...',
  regeneratePreview: 'Regenerate Preview',
  
  summary: {
    size: 'Size:',
    binder: 'Binder:',
    flavor: 'Flavor:',
    bandStyle: 'Band Style:',
    box: 'Box:',
    bandText: 'Band Text:',
    engraving: 'Engraving:'
  },
  
  totalPrice: 'Total Price',
  quantity: 'Quantity',
  ageConfirm: 'I confirm I am 21+ years old',
  previous: 'Previous',
  next: 'Next',
  proceedToPayment: 'Proceed to Payment',
  
  confirmAge: 'Please confirm you are 21+ years old',
  previewError: 'Failed to generate preview: {error}',
  checkoutError: 'Payment initialization failed: {error}',
  noPreviewUrl: 'No preview URL returned from server',
  noCheckoutUrl: 'No checkout URL returned from server'
};