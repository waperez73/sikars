const OpenAI = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Default model to use
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

/**
 * Generate chat completion
 * @param {string} prompt - User prompt
 * @param {Object} options - Additional options
 * @returns {Promise<string>} AI response
 */
const generateCompletion = async (prompt, options = {}) => {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 500,
    systemMessage = 'You are a helpful assistant for Sikars, a custom cigar company.'
  } = options;

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens
    });

    const response = completion.choices[0].message.content;
    logger.info('OpenAI completion generated successfully');
    
    return response;
  } catch (error) {
    logger.error('OpenAI completion error:', error);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Generate streaming completion
 * @param {string} prompt - User prompt
 * @param {Object} options - Additional options
 * @returns {Promise<AsyncIterable>} Stream of responses
 */
const generateStreamingCompletion = async (prompt, options = {}) => {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxTokens = 500,
    systemMessage = 'You are a helpful assistant for Sikars, a custom cigar company.'
  } = options;

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: maxTokens,
      stream: true
    });

    logger.info('OpenAI streaming completion started');
    return stream;
  } catch (error) {
    logger.error('OpenAI streaming error:', error);
    throw new Error('Failed to generate streaming response');
  }
};

/**
 * Generate image using DALL-E
 * @param {string} prompt - Image description
 * @param {Object} options - Image generation options
 * @returns {Promise<string>} Image URL
 */
const generateImage = async (prompt, options = {}) => {
  const {
    model = 'dall-e-3',
    size = '1024x1024',
    quality = 'standard',
    n = 1
  } = options;

  try {
    const response = await openai.images.generate({
      model,
      prompt,
      n,
      size,
      quality
    });

    const imageUrl = response.data[0].url;
    logger.info('OpenAI image generated successfully');
    
    return imageUrl;
  } catch (error) {
    logger.error('OpenAI image generation error:', error);
    throw new Error('Failed to generate image');
  }
};

/**
 * Generate embeddings for text
 * @param {string} text - Text to embed
 * @param {string} model - Embedding model
 * @returns {Promise<Array>} Embedding vector
 */
const generateEmbedding = async (text, model = 'text-embedding-ada-002') => {
  try {
    const response = await openai.embeddings.create({
      model,
      input: text
    });

    return response.data[0].embedding;
  } catch (error) {
    logger.error('OpenAI embedding error:', error);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Moderate content
 * @param {string} text - Text to moderate
 * @returns {Promise<Object>} Moderation results
 */
const moderateContent = async (text) => {
  try {
    const response = await openai.moderations.create({
      input: text
    });

    return response.results[0];
  } catch (error) {
    logger.error('OpenAI moderation error:', error);
    throw new Error('Failed to moderate content');
  }
};

module.exports = {
  openai,
  generateCompletion,
  generateStreamingCompletion,
  generateImage,
  generateEmbedding,
  moderateContent,
  DEFAULT_MODEL
};
