// sp.js - Spanish translations
export default {
  appName: 'Sikars',
  tagline: 'Construye Tu Puro Personalizado',
  stepOf: 'Paso {current} de {total}',
  
  steps: {
    cigar: 'Construye Tu Puro',
    box: 'Caja',
    customize: 'Personalizar',
    preview: 'Vista Previa'
  },
  
  buildYourCigar: 'Construye Tu Puro',
  buildDescription: 'Personaliza cada aspecto de tu puro perfecto',
  
  cigarSize: 'Tamaño del Puro',
  binder: 'Capote',
  flavorProfile: 'Perfil de Sabor',
  bandStyle: 'Estilo de Anillo',
  
  options: {
    size: {
      robusto: { label: 'Robusto', detail: '54x5 - Clásico equilibrado' },
      gordo: { label: 'Gordo', detail: '60x6 - Tiro más fresco, sabor más largo' },
      churchill: { label: 'Churchill', detail: '54x7 - Sesión larga y elegante' },
      belicoso: { label: 'Belicoso', detail: '50x7 - Cuero, pimienta, chocolate' }
    },
    binder: {
      habano: { label: 'Habano', detail: 'Fuerza y especias clásicas' },
      maduro: { label: 'Maduro', detail: 'Cuerpo más rico, tono más oscuro' },
      connecticut: { label: 'Connecticut', detail: 'Perfil suave y cremoso' }
    },
    flavor: {
      light: { label: 'Suave', detail: 'Clásico, equilibrado' },
      medium: { label: 'Medio', detail: 'Cacao, melaza' },
      strong: { label: 'Fuerte', detail: 'Especias, cuero' }
    },
    bandStyle: {
      beveled: { label: 'Biselado', detail: 'Toque elegante' },
      round: { label: 'Redondo', detail: 'Acento audaz' },
      dome: { label: 'Cúpula', detail: 'Forma de corona' },
      square: { label: 'Recto', detail: 'Aspecto limpio' }
    },
    box: {
      classic: { label: 'Clásica', detail: 'Madera natural, bisagras doradas' },
      rustic: { label: 'Rústica', detail: 'Textura vintage con cedro' },
      modern: { label: 'Moderna', detail: 'Alto brillo, cierre magnético' }
    }
  },
  
  chooseYourBox: 'Elige Tu Caja',
  boxDescription: 'Selecciona la caja perfecta para tus puros personalizados',
  
  customizeYourBox: 'Personaliza Tu Caja',
  customizeDescription: 'Agrega toques personales (opcional)',
  boxEngraving: 'Grabado de Caja',
  engravingPlaceholder: 'Iniciales o frase (máx 20)',
  charactersRemaining: '{count}/20 caracteres',
  bandText: 'Texto del Anillo',
  bandTextPlaceholder: 'Tu marca o iniciales',
  bandTextRemaining: '{count}/18 caracteres',
  
  previewYourOrder: 'Vista Previa de Tu Pedido',
  previewDescription: 'Revisa tus selecciones y genera una vista previa',
  yourSelections: 'Tus Selecciones',
  boxPreview: 'Vista Previa de la Caja',
  generatePreviewDesc: 'Genera una vista previa de tu caja de puros personalizada',
  generatePreview: 'Generar Vista Previa',
  generating: 'Generando...',
  regeneratePreview: 'Regenerar Vista Previa',
  
  summary: {
    size: 'Tamaño:',
    binder: 'Capote:',
    flavor: 'Sabor:',
    bandStyle: 'Estilo de Anillo:',
    box: 'Caja:',
    bandText: 'Texto del Anillo:',
    engraving: 'Grabado:'
  },
  
  totalPrice: 'Precio Total',
  quantity: 'Cantidad',
  ageConfirm: 'Confirmo que tengo más de 21 años',
  previous: 'Anterior',
  next: 'Siguiente',
  proceedToPayment: 'Proceder al Pago',
  
  confirmAge: 'Por favor confirma que tienes más de 21 años',
  previewError: 'Error al generar vista previa: {error}',
  checkoutError: 'Error al inicializar el pago: {error}',
  noPreviewUrl: 'No se recibió URL de vista previa del servidor',
  noCheckoutUrl: 'No se recibió URL de pago del servidor'
};