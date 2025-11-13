const { generateCompletion, generateImage, moderateContent } = require('../config/openai');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Generate custom cigar description
 * @param {Object} cigarSpecs - Cigar specifications
 * @returns {Promise<string>} AI-generated description
 */
const generateCigarDescription = async (cigarSpecs) => {
  const { size, binder, flavor, bandStyle, occasion } = cigarSpecs;

  const prompt = `Create an elegant and appealing description for a custom cigar with the following characteristics:
- Size: ${size}
- Wrapper/Binder: ${binder}
- Flavor Profile: ${flavor}
- Band Style: ${bandStyle}
${occasion ? `- Occasion: ${occasion}` : ''}

Write a 2-3 sentence description that highlights the unique qualities and appeal of this custom cigar. Make it sophisticated and enticing.`;

  try {
    const description = await generateCompletion(prompt, {
      temperature: 0.8,
      maxTokens: 150,
      systemMessage: 'You are an expert cigar sommelier and writer who creates elegant, sophisticated descriptions of premium cigars.'
    });

    logger.info('Cigar description generated');
    return description.trim();
  } catch (error) {
    logger.error('Generate cigar description error:', error);
    throw new AppError('Failed to generate cigar description', 500);
  }
};

/**
 * Generate cigar recommendations based on preferences
 * @param {Object} preferences - User preferences
 * @returns {Promise<Object>} Recommendations
 */
const generateRecommendations = async (preferences) => {
  const { 
    experienceLevel = 'beginner',
    favoriteTypes = [],
    flavorPreferences = [],
    occasion = 'casual'
  } = preferences;

  const prompt = `Based on the following preferences, recommend the best custom cigar combination from our options:

User Profile:
- Experience Level: ${experienceLevel}
- Favorite Types: ${favoriteTypes.join(', ') || 'none specified'}
- Flavor Preferences: ${flavorPreferences.join(', ') || 'none specified'}
- Occasion: ${occasion}

Available Options:
Sizes: Robusto (5"x50), Gordo (6"x60), Churchill (7"x47), Belicoso (5.5"x52)
Binders: Habano (spicy), Maduro (sweet), Connecticut (mild)
Flavors: Light, Medium, Strong
Band Styles: Beveled, Round, Dome, Square

Provide recommendations in JSON format:
{
  "primary": {
    "size": "size name",
    "binder": "binder name",
    "flavor": "flavor level",
    "bandStyle": "band style",
    "reason": "why this combination"
  },
  "alternatives": [
    {
      "size": "size name",
      "binder": "binder name",
      "flavor": "flavor level",
      "reason": "why this is a good alternative"
    }
  ],
  "tips": "smoking tips for this combination"
}`;

  try {
    const response = await generateCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 600,
      systemMessage: 'You are an expert cigar sommelier helping customers find their perfect custom cigar.'
    });

    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      logger.info('Recommendations generated');
      return recommendations;
    }

    throw new Error('Invalid recommendation format');
  } catch (error) {
    logger.error('Generate recommendations error:', error);
    throw new AppError('Failed to generate recommendations', 500);
  }
};

/**
 * Generate personalized engraving suggestions
 * @param {Object} context - Context for engraving
 * @returns {Promise<Array>} List of suggestions
 */
const generateEngravingSuggestions = async (context) => {
  const { occasion, recipientName, relationship, tone = 'elegant' } = context;

  const prompt = `Generate 5 personalized engraving suggestions for a custom cigar box with these details:
- Occasion: ${occasion || 'general'}
- Recipient: ${recipientName || 'not specified'}
- Relationship: ${relationship || 'not specified'}
- Tone: ${tone}

Requirements:
- Maximum 20 characters per suggestion
- Should be meaningful and appropriate
- Mix of different styles (formal, casual, humorous if appropriate)

Provide as a JSON array of strings.`;

  try {
    const response = await generateCompletion(prompt, {
      temperature: 0.9,
      maxTokens: 200,
      systemMessage: 'You are a creative writer specializing in personalized messages and engravings.'
    });

    // Extract JSON array
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      logger.info('Engraving suggestions generated');
      return suggestions;
    }

    // Fallback: split by newlines if JSON parsing fails
    return response
      .split('\n')
      .filter(line => line.trim() && line.length <= 20)
      .slice(0, 5);
  } catch (error) {
    logger.error('Generate engraving suggestions error:', error);
    throw new AppError('Failed to generate engraving suggestions', 500);
  }
};

/**
 * Generate band text suggestions
 * @param {Object} context - Context for band text
 * @returns {Promise<Array>} List of suggestions
 */
const generateBandTextSuggestions = async (context) => {
  const { name, style = 'classic', theme } = context;

  const prompt = `Generate 5 creative band text suggestions for a custom cigar with these details:
${name ? `- Name/Brand: ${name}` : ''}
- Style: ${style}
${theme ? `- Theme: ${theme}` : ''}

Requirements:
- Maximum 18 characters per suggestion
- Should look good on a cigar band
- Mix of different approaches (initials, phrases, names, etc.)

Provide as a JSON array of strings.`;

  try {
    const response = await generateCompletion(prompt, {
      temperature: 0.9,
      maxTokens: 150,
      systemMessage: 'You are a creative designer specializing in luxury branding and cigar band design.'
    });

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      logger.info('Band text suggestions generated');
      return suggestions;
    }

    return response
      .split('\n')
      .filter(line => line.trim() && line.length <= 18)
      .slice(0, 5);
  } catch (error) {
    logger.error('Generate band text suggestions error:', error);
    throw new AppError('Failed to generate band text suggestions', 500);
  }
};

/**
 * Generate custom box design visualization prompt
 * @param {Object} orderDetails - Order details
 * @returns {Promise<string>} DALL-E prompt for box visualization
 */
const generateBoxVisualizationPrompt = async (orderDetails) => {
  const { boxType, engraving, style, color } = orderDetails;

  const prompt = `Create a detailed, professional prompt for DALL-E to generate a visualization of a custom cigar box with these specifications:
- Box Type: ${boxType}
- Engraving Text: ${engraving || 'none'}
- Style: ${style || 'classic'}
- Color Theme: ${color || 'natural wood'}

The prompt should describe a high-quality, realistic product photo of the custom cigar box.`;

  try {
    const dallePrompt = await generateCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 200,
      systemMessage: 'You are an expert at creating detailed image generation prompts for product photography.'
    });

    logger.info('Box visualization prompt generated');
    return dallePrompt.trim();
  } catch (error) {
    logger.error('Generate visualization prompt error:', error);
    throw new AppError('Failed to generate visualization prompt', 500);
  }
};

/**
 * Generate custom box image using DALL-E
 * @param {Object} orderDetails - Order details
 * @returns {Promise<string>} Image URL
 */
const generateBoxImage = async (orderDetails) => {
  try {
    // First generate an optimized prompt
    const imagePrompt = await generateBoxVisualizationPrompt(orderDetails);
    
    // Generate the image
    const imageUrl = await generateImage(imagePrompt, {
      size: '1024x1024',
      quality: 'hd'
    });

    logger.info('Box image generated successfully');
    return imageUrl;
  } catch (error) {
    logger.error('Generate box image error:', error);
    throw new AppError('Failed to generate box image', 500);
  }
};

/**
 * Analyze and suggest pairing recommendations
 * @param {Object} cigarSpecs - Cigar specifications
 * @returns {Promise<Object>} Pairing suggestions
 */
const generatePairingSuggestions = async (cigarSpecs) => {
  const { size, binder, flavor } = cigarSpecs;

  const prompt = `Suggest the best drink pairings and occasions for a cigar with these characteristics:
- Size: ${size}
- Wrapper: ${binder}
- Strength: ${flavor}

Provide recommendations in JSON format:
{
  "drinks": ["drink 1", "drink 2", "drink 3"],
  "occasions": ["occasion 1", "occasion 2"],
  "timeOfDay": "best time to enjoy",
  "tips": "brief smoking tips"
}`;

  try {
    const response = await generateCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 300,
      systemMessage: 'You are a cigar and spirits expert specializing in pairing recommendations.'
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const pairings = JSON.parse(jsonMatch[0]);
      logger.info('Pairing suggestions generated');
      return pairings;
    }

    throw new Error('Invalid pairing format');
  } catch (error) {
    logger.error('Generate pairing suggestions error:', error);
    throw new AppError('Failed to generate pairing suggestions', 500);
  }
};

/**
 * Moderate user-generated content (engravings, messages, etc.)
 * @param {string} content - Content to moderate
 * @returns {Promise<Object>} Moderation results
 */
const moderateUserContent = async (content) => {
  try {
    const moderation = await moderateContent(content);
    
    const isFlagged = moderation.flagged;
    const categories = moderation.categories;

    logger.info('Content moderation completed', { flagged: isFlagged });

    return {
      approved: !isFlagged,
      flagged: isFlagged,
      categories,
      message: isFlagged 
        ? 'Content contains inappropriate material and cannot be used.' 
        : 'Content approved.'
    };
  } catch (error) {
    logger.error('Content moderation error:', error);
    // Default to manual review if AI moderation fails
    return {
      approved: false,
      flagged: true,
      requiresManualReview: true,
      message: 'Content requires manual review.'
    };
  }
};

/**
 * Generate SEO-optimized product description
 * @param {Object} productDetails - Product details
 * @returns {Promise<Object>} SEO content
 */
const generateSEOContent = async (productDetails) => {
  const { name, category, features } = productDetails;

  const prompt = `Create SEO-optimized content for a custom cigar product:
Product: ${name}
Category: ${category}
Features: ${features.join(', ')}

Generate:
1. Meta title (60 chars max)
2. Meta description (155 chars max)
3. Product description (100-150 words)
4. Keywords (5-8 relevant keywords)

Format as JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "description": "...",
  "keywords": ["keyword1", "keyword2", ...]
}`;

  try {
    const response = await generateCompletion(prompt, {
      temperature: 0.6,
      maxTokens: 400,
      systemMessage: 'You are an SEO expert specializing in luxury product descriptions.'
    });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid SEO content format');
  } catch (error) {
    logger.error('Generate SEO content error:', error);
    throw new AppError('Failed to generate SEO content', 500);
  }
};

module.exports = {
  generateCigarDescription,
  generateRecommendations,
  generateEngravingSuggestions,
  generateBandTextSuggestions,
  generateBoxVisualizationPrompt,
  generateBoxImage,
  generatePairingSuggestions,
  moderateUserContent,
  generateSEOContent
};
