const openaiService = require('../services/openaiService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Generate cigar description
 * POST /api/ai/cigar-description
 */
exports.generateCigarDescription = asyncHandler(async (req, res) => {
  const description = await openaiService.generateCigarDescription(req.body);
  
  res.status(200).json({
    status: 'success',
    data: { description }
  });
});

/**
 * Get personalized recommendations
 * POST /api/ai/recommendations
 */
exports.getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await openaiService.generateRecommendations(req.body);
  
  res.status(200).json({
    status: 'success',
    data: recommendations
  });
});

/**
 * Generate engraving suggestions
 * POST /api/ai/engraving-suggestions
 */
exports.getEngravingSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await openaiService.generateEngravingSuggestions(req.body);
  
  res.status(200).json({
    status: 'success',
    data: { suggestions }
  });
});

/**
 * Generate band text suggestions
 * POST /api/ai/band-text-suggestions
 */
exports.getBandTextSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await openaiService.generateBandTextSuggestions(req.body);
  
  res.status(200).json({
    status: 'success',
    data: { suggestions }
  });
});

/**
 * Generate box visualization
 * POST /api/ai/generate-box-image
 */
exports.generateBoxImage = asyncHandler(async (req, res) => {
  const imageUrl = await openaiService.generateBoxImage(req.body);
  
  res.status(200).json({
    status: 'success',
    data: { imageUrl }
  });
});

/**
 * Get pairing suggestions
 * POST /api/ai/pairing-suggestions
 */
exports.getPairingSuggestions = asyncHandler(async (req, res) => {
  const pairings = await openaiService.generatePairingSuggestions(req.body);
  
  res.status(200).json({
    status: 'success',
    data: pairings
  });
});

/**
 * Moderate content
 * POST /api/ai/moderate
 */
exports.moderateContent = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const result = await openaiService.moderateUserContent(content);
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

/**
 * Generate SEO content
 * POST /api/ai/seo-content
 */
exports.generateSEOContent = asyncHandler(async (req, res) => {
  const seoContent = await openaiService.generateSEOContent(req.body);
  
  res.status(200).json({
    status: 'success',
    data: seoContent
  });
});

/**
 * Chat with AI assistant
 * POST /api/ai/chat
 */
exports.chat = asyncHandler(async (req, res) => {
  const { generateCompletion } = require('../config/openai');
  const { message, context } = req.body;

  const systemMessage = `You are a helpful AI assistant for Sikars, a custom cigar company. 
Help customers with their questions about cigars, customization options, orders, and recommendations.
Be friendly, knowledgeable, and professional.`;

  const prompt = context 
    ? `Context: ${JSON.stringify(context)}\n\nUser question: ${message}`
    : message;

  const response = await generateCompletion(prompt, {
    systemMessage,
    temperature: 0.7,
    maxTokens: 300
  });

  res.status(200).json({
    status: 'success',
    data: { message: response }
  });
});

module.exports = exports;
