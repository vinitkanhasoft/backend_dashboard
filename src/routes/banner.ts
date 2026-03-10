import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  searchBanners,
  bulkDeleteBanners
} from '../controllers/bannerController';
import { authenticate } from '../middleware/auth';
import { uploadBannerImage } from '../middleware/upload';
import { authRateLimit } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

/**
 * @route   POST /api/banners
 * @desc    Create a new banner with image upload
 * @access  Private (Admin only)
 * @example POST /api/banners
 */
router.post(
  '/',
  authenticate,
  authRateLimit,
  uploadBannerImage,
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1 and 500 characters'),
    body('altText')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Alt text must be between 1 and 100 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('displayOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Display order must be a non-negative integer')
  ],
  validateRequest,
  createBanner
);

/**
 * @route   GET /api/banners
 * @desc    Get all banners with pagination, filtering, and search
 * @access  Public
 * @example GET /api/banners?page=1&limit=10&isActive=true&sortBy=displayOrder&sortOrder=asc&search=sale&searchIn=title,description
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    query('search')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('searchIn')
      .optional()
      .isIn(['title', 'description', 'altText', 'title,description', 'title,description,altText'])
      .withMessage('searchIn must be valid field combination'),
    query('sortBy')
      .optional()
      .isIn(['title', 'displayOrder', 'createdAt', 'updatedAt'])
      .withMessage('Sort by must be one of: title, displayOrder, createdAt, updatedAt'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  validateRequest,
  getAllBanners
);

/**
 * @route   GET /api/banners/search
 * @desc    Search banners with advanced text search and pagination
 * @access  Public
 * @example GET /api/banners/search?q=sale&page=1&limit=10&searchIn=title,description&sortBy=relevance&sortOrder=desc
 */
router.get(
  '/search',
  [
    query('q')
      .notEmpty()
      .withMessage('Search query (q) is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('searchIn')
      .optional()
      .isIn(['title', 'description', 'altText', 'title,description', 'title,description,altText'])
      .withMessage('searchIn must be valid field combination'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    query('sortBy')
      .optional()
      .isIn(['relevance', 'title', 'displayOrder', 'createdAt', 'updatedAt'])
      .withMessage('Sort by must be one of: relevance, title, displayOrder, createdAt, updatedAt'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  validateRequest,
  searchBanners
);

/**
 * @route   GET /api/banners/:id
 * @desc    Get banner by ID
 * @access  Public
 * @example GET /api/banners/507f1f77bcf86cd799439011
 */
router.get(
  '/:id',
  [
    param('id')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Invalid banner ID format')
  ],
  validateRequest,
  getBannerById
);

/**
 * @route   PUT /api/banners/:id
 * @desc    Update banner with optional image replacement
 * @access  Private (Admin only)
 * @example PUT /api/banners/507f1f77bcf86cd799439011
 */
router.put(
  '/:id',
  authenticate,
  authRateLimit,
  uploadBannerImage,
  [
    param('id')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Invalid banner ID format'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Description must be between 1 and 500 characters'),
    body('altText')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Alt text must be between 1 and 100 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    body('displayOrder')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Display order must be a non-negative integer')
  ],
  validateRequest,
  updateBanner
);

/**
 * @route   DELETE /api/banners/:id
 * @desc    Delete banner and remove image from Cloudinary
 * @access  Private (Admin only)
 * @example DELETE /api/banners/507f1f77bcf86cd799439011
 */
router.delete(
  '/:id',
  authenticate,
  authRateLimit,
  [
    param('id')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Invalid banner ID format')
  ],
  validateRequest,
  deleteBanner
);

/**
 * @route   POST /api/banners/bulk-delete
 * @desc    Delete multiple banners and remove images from Cloudinary
 * @access  Private (Admin only)
 * @example POST /api/banners/bulk-delete
 * @body {
 *   "bannerIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 * }
 */
router.post(
  '/bulk-delete',
  authenticate,
  authRateLimit,
  [
    body('bannerIds')
      .isArray({ min: 1 })
      .withMessage('bannerIds must be a non-empty array'),
    body('bannerIds.*')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Each banner ID must be a valid MongoDB ObjectId')
  ],
  validateRequest,
  bulkDeleteBanners
);

export default router;
