import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import {
  body,
  param,
  query,
  validationResult
} from 'express-validator';
import {
  subscribeNewsletter,
  getAllNewsletterSubscriptions,
  unsubscribeNewsletter,
  getNewsletterStats,
  deleteNewsletterSubscription,
  bulkDeleteNewsletterSubscriptions
} from '../controllers/newsletterController';
import {
  createEmailCampaign,
  sendEmailCampaign,
  getAllEmailCampaigns,
  getEmailCampaignById,
  sendQuickEmail,
  sendTestEmail,
  getEmailMarketingStats,
  deleteEmailCampaign,
  diagnoseEmailServiceEndpoint
} from '../controllers/emailMarketingController';

const router = Router();

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Newsletter subscription validation
const validateNewsletterSubscription = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters')
];

// Newsletter ID validation
const validateNewsletterId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid newsletter subscription ID')
];

// Get newsletters query validation
const validateGetNewsletters = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Search query must be between 1 and 255 characters')
];

// Bulk delete validation
const validateBulkDelete = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required and must not be empty'),
  body('ids.*')
    .isMongoId()
    .withMessage('Invalid newsletter subscription ID in the array')
];

// Email campaign validation
const validateEmailCampaign = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Campaign name is required')
    .isLength({ max: 200 })
    .withMessage('Campaign name cannot exceed 200 characters'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Email subject is required')
    .isLength({ max: 200 })
    .withMessage('Email subject cannot exceed 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Email content is required')
    .isLength({ min: 10 })
    .withMessage('Email content must be at least 10 characters'),
  body('recipients')
    .isArray({ min: 1 })
    .withMessage('Recipients array is required and must not be empty'),
  body('recipients.*')
    .isEmail()
    .withMessage('Invalid email address in recipients'),
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date')
];

// Quick email validation
const validateQuickEmail = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Email subject is required')
    .isLength({ max: 200 })
    .withMessage('Email subject cannot exceed 200 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email content is required')
    .isLength({ min: 10 })
    .withMessage('Email content must be at least 10 characters'),
  body('selectedEmails')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Selected emails array is required and must not be empty'),
  body('selectedEmails.*')
    .optional()
    .isEmail()
    .withMessage('Invalid email address in selected emails'),
  body('personalizedEmails')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Personalized emails array is required and must not be empty'),
  body('personalizedEmails.*.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address in personalized emails'),
  body('personalizedEmails.*.content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Email content is required in personalized emails')
    .isLength({ min: 10 })
    .withMessage('Email content must be at least 10 characters in personalized emails')
];

// Test email validation
const validateTestEmail = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
];

// Public routes
router.post('/subscribe', validateNewsletterSubscription, handleValidationErrors, subscribeNewsletter);
router.post('/unsubscribe', validateNewsletterSubscription, handleValidationErrors, unsubscribeNewsletter);

// Protected routes
router.use(authenticate);

// Dashboard routes
router.get('/', validateGetNewsletters, handleValidationErrors, getAllNewsletterSubscriptions);
router.get('/stats', getNewsletterStats);
router.delete('/:id', validateNewsletterId, handleValidationErrors, deleteNewsletterSubscription);
router.post('/bulk-delete', validateBulkDelete, handleValidationErrors, bulkDeleteNewsletterSubscriptions);

// Email Marketing routes
router.post('/campaigns', validateEmailCampaign, handleValidationErrors, createEmailCampaign);
router.post('/campaigns/:id/send', validateNewsletterId, handleValidationErrors, sendEmailCampaign);
router.get('/campaigns', getAllEmailCampaigns);
router.get('/campaigns/:id', validateNewsletterId, handleValidationErrors, getEmailCampaignById);
router.delete('/campaigns/:id', validateNewsletterId, handleValidationErrors, deleteEmailCampaign);
router.post('/quick-email', validateQuickEmail, handleValidationErrors, sendQuickEmail);
router.post('/test-email', validateTestEmail, handleValidationErrors, sendTestEmail);
router.get('/marketing-stats', getEmailMarketingStats);
router.get('/diagnose-email-service', diagnoseEmailServiceEndpoint);

export default router;
