import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadTeamImage } from '../middleware/upload';
import {
  body,
  param,
  query,
  validationResult
} from 'express-validator';
import {
  createTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
  bulkDeleteTeamMembers,
  getFeaturedTeamMembers,
  getTeamMembersByPosition,
  getTeamStatistics,
  toggleTeamMemberStatus
} from '../controllers/teamController';
import { TeamPosition, TeamMemberTag } from '../enums/teamEnums';

const router = Router();

// Middleware to handle form-data arrays and JSON parsing
const handleFormDataArrays = (req: any, res: any, next: any) => {
  // Convert tags from form-data or JSON string to array
  if (req.body && req.body.tags) {
    let tags = req.body.tags;
    
    // Handle if tags is a JSON string array
    if (typeof tags === 'string') {
      if (tags.startsWith('[')) {
        try {
          tags = JSON.parse(tags);
        } catch (e) {
          console.log('Failed to parse tags JSON:', tags);
          tags = [];
        }
      } else {
        // Handle comma-separated string
        tags = tags.split(',').map((tag: string) => tag.trim());
      }
    }
    
    req.body.tags = tags;
  }
  
  // Generate full phone numbers before validation
  if (req.body) {
    if (req.body.contactNumber && req.body.contactNumber.countryCode && req.body.contactNumber.number) {
      req.body.contactNumber.fullNumber = req.body.contactNumber.countryCode + req.body.contactNumber.number;
    }
    
    if (req.body.whatsappNumber && req.body.whatsappNumber.countryCode && req.body.whatsappNumber.number) {
      req.body.whatsappNumber.fullNumber = req.body.whatsappNumber.countryCode + req.body.whatsappNumber.number;
    }
  }
  
  next();
};

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

// Team member validation
const validateTeamMember = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Team member name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('position')
    .trim()
    .notEmpty()
    .withMessage('Position is required')
    .isIn(Object.values(TeamPosition))
    .withMessage(`Position must be one of: ${Object.values(TeamPosition).join(', ')}`),
  body('tagline')
    .trim()
    .notEmpty()
    .withMessage('Tagline is required')
    .isLength({ max: 200 })
    .withMessage('Tagline cannot exceed 200 characters'),
  body('yearsOfExperience')
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email cannot exceed 255 characters'),
  body('contactNumber.countryCode')
    .trim()
    .notEmpty()
    .withMessage('Contact number country code is required')
    .matches(/^\+\d{1,4}$/)
    .withMessage('Country code must start with + followed by 1-4 digits'),
  body('contactNumber.number')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^\d{6,15}$/)
    .withMessage('Contact number must be 6-15 digits'),
  body('contactNumber.fullNumber')
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Full contact number must be between 8 and 20 characters'),
  body('whatsappNumber.countryCode')
    .trim()
    .notEmpty()
    .withMessage('WhatsApp country code is required')
    .matches(/^\+\d{1,4}$/)
    .withMessage('Country code must start with + followed by 1-4 digits'),
  body('whatsappNumber.number')
    .trim()
    .notEmpty()
    .withMessage('WhatsApp number is required')
    .matches(/^\d{6,15}$/)
    .withMessage('WhatsApp number must be 6-15 digits'),
  body('whatsappNumber.fullNumber')
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Full WhatsApp number must be between 8 and 20 characters'),
  body('tags')
    .custom((value) => {
      // Accept array, JSON string, or comma-separated string
      if (Array.isArray(value)) {
        return value.length >= 1;
      }
      if (typeof value === 'string') {
        if (value.startsWith('[')) {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) && parsed.length >= 1;
          } catch (e) {
            return false;
          }
        } else {
          // Handle comma-separated string
          const tags = value.split(',').map(tag => tag.trim());
          return tags.length >= 1;
        }
      }
      return false;
    })
    .withMessage('At least one tag is required'),
  body('tags.*')
    .optional()
    .isIn(Object.values(TeamMemberTag))
    .withMessage(`Tag must be one of: ${Object.values(TeamMemberTag).join(', ')}`),
  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),
  body('specializations.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Specialization cannot exceed 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Bio cannot exceed 2000 characters'),
  body('linkedinUrl')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)
    .withMessage('Please provide a valid LinkedIn URL'),
  body('twitterUrl')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?twitter\.com\/.*$/)
    .withMessage('Please provide a valid Twitter URL'),
  body('facebookUrl')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?facebook\.com\/.*$/)
    .withMessage('Please provide a valid Facebook URL'),
  body('instagramUrl')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?instagram\.com\/.*$/)
    .withMessage('Please provide a valid Instagram URL'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];

// Team member ID validation
const validateTeamMemberId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid team member ID')
];

// Get team members query validation
const validateGetTeamMembers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('position')
    .optional()
    .isIn(Object.values(TeamPosition))
    .withMessage(`Position must be one of: ${Object.values(TeamPosition).join(', ')}`),
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return Object.values(TeamMemberTag).includes(value as TeamMemberTag);
      }
      if (Array.isArray(value)) {
        return value.every(tag => Object.values(TeamMemberTag).includes(tag));
      }
      return false;
    })
    .withMessage(`Tags must be one of: ${Object.values(TeamMemberTag).join(', ')}`),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

// Position validation
const validatePosition = [
  param('position')
    .isIn(Object.values(TeamPosition))
    .withMessage(`Position must be one of: ${Object.values(TeamPosition).join(', ')}`)
];

// Bulk delete validation
const validateBulkDelete = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required and must not be empty'),
  body('ids.*')
    .isMongoId()
    .withMessage('Invalid team member ID in the array')
];

// Public routes
router.get('/featured', getFeaturedTeamMembers);
router.get('/position/:position', validatePosition, handleValidationErrors, getTeamMembersByPosition);

// Protected routes
router.use(authenticate);

// CRUD routes with validation and image upload
router.post('/', uploadTeamImage, handleFormDataArrays, validateTeamMember, handleValidationErrors, createTeamMember);
router.get('/', validateGetTeamMembers, handleValidationErrors, getAllTeamMembers);
router.get('/stats', getTeamStatistics);
router.get('/:id', validateTeamMemberId, handleValidationErrors, getTeamMemberById);
router.put('/:id', uploadTeamImage, handleFormDataArrays, validateTeamMember, handleValidationErrors, updateTeamMember);
router.delete('/:id', validateTeamMemberId, handleValidationErrors, deleteTeamMember);
router.post('/bulk-delete', validateBulkDelete, handleValidationErrors, bulkDeleteTeamMembers);
router.patch('/:id/toggle-status', validateTeamMemberId, handleValidationErrors, toggleTeamMemberStatus);

export default router;
