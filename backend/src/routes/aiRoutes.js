const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const Joi = require('joi');

// Validation schemas
const cigarDescriptionSchema = Joi.object({
  size: Joi.string().required(),
  binder: Joi.string().required(),
  flavor: Joi.string().required(),
  bandStyle: Joi.string().required(),
  occasion: Joi.string().optional()
});

const recommendationsSchema = Joi.object({
  experienceLevel: Joi.string().valid('beginner', 'intermediate', 'expert').optional(),
  favoriteTypes: Joi.array().items(Joi.string()).optional(),
  flavorPreferences: Joi.array().items(Joi.string()).optional(),
  occasion: Joi.string().optional()
});

const engravingSchema = Joi.object({
  occasion: Joi.string().optional(),
  recipientName: Joi.string().optional(),
  relationship: Joi.string().optional(),
  tone: Joi.string().valid('elegant', 'casual', 'humorous', 'formal').optional()
});

const bandTextSchema = Joi.object({
  name: Joi.string().optional(),
  style: Joi.string().optional(),
  theme: Joi.string().optional()
});

const boxImageSchema = Joi.object({
  boxType: Joi.string().required(),
  engraving: Joi.string().optional(),
  style: Joi.string().optional(),
  color: Joi.string().optional()
});

const pairingSchema = Joi.object({
  size: Joi.string().required(),
  binder: Joi.string().required(),
  flavor: Joi.string().required()
});

const moderationSchema = Joi.object({
  content: Joi.string().required().max(1000)
});

const chatSchema = Joi.object({
  message: Joi.string().required().max(500),
  context: Joi.object().optional()
});

// Public routes (no authentication required)
router.post(
  '/chat',
  validate(chatSchema),
  aiController.chat
);

router.post(
  '/cigar-description',
  validate(cigarDescriptionSchema),
  aiController.generateCigarDescription
);

router.post(
  '/pairing-suggestions',
  validate(pairingSchema),
  aiController.getPairingSuggestions
);

// Authenticated routes (optional - works with or without auth)
router.post(
  '/recommendations',
  optionalAuth,
  validate(recommendationsSchema),
  aiController.getRecommendations
);

router.post(
  '/engraving-suggestions',
  optionalAuth,
  validate(engravingSchema),
  aiController.getEngravingSuggestions
);

router.post(
  '/band-text-suggestions',
  optionalAuth,
  validate(bandTextSchema),
  aiController.getBandTextSuggestions
);

// Authenticated routes (require login)
router.post(
  '/generate-box-image',
  authenticate,
  validate(boxImageSchema),
  aiController.generateBoxImage
);

router.post(
  '/moderate',
  authenticate,
  validate(moderationSchema),
  aiController.moderateContent
);

router.post(
  '/seo-content',
  authenticate,
  aiController.generateSEOContent
);

module.exports = router;
