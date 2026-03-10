import { Router } from 'express';
import {
  createCar,
  getAllCars,
  getCarsByStatus,
  searchCars,
  getCarById,
  getCarBySlug,
  updateCar,
  deleteCar,
  bulkDeleteCars,
  getFeaturedCars,
  getCarsBySeller
} from '../controllers/carController';
import { authenticate } from '../middleware/auth';
import { uploadCarImages, handleUploadError } from '../middleware/upload';
import { authRateLimit } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { body, param, query } from 'express-validator';

const router = Router();

/**
 * @route   POST /api/cars
 * @desc    Create a new car listing with images
 * @access  Private
 * @example POST /api/cars
 */
router.post(
  '/',
  authenticate,
  authRateLimit,
  uploadCarImages,
  handleUploadError,
  [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('brand')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Brand must be between 1 and 100 characters'),
    body('carModel')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Model must be between 1 and 100 characters'),
    body('year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Year must be valid'),
    body('variant')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Variant cannot exceed 100 characters'),
    body('bodyType')
      .isIn(['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'MPV', 'Pickup', 'Wagon', 'Electric'])
      .withMessage('Invalid body type'),
    body('color')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Color must be between 1 and 50 characters'),
    body('description')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Description must be between 1 and 2000 characters'),
    body('regularPrice')
      .isFloat({ min: 0 })
      .withMessage('Regular price must be a positive number'),
    body('salePrice')
      .isFloat({ min: 0 })
      .withMessage('Sale price must be a positive number'),
    body('onRoadPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('On-road price must be a positive number'),
    body('emiStartingFrom')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('EMI must be a positive number'),
    body('km')
      .isInt({ min: 0 })
      .withMessage('Kilometers must be a positive number'),
    body('fuelType')
      .isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG'])
      .withMessage('Invalid fuel type'),
    body('transmission')
      .isIn(['MANUAL', 'AUTOMATIC', 'CVT', 'DCT'])
      .withMessage('Invalid transmission type'),
    body('engine')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Engine description cannot exceed 100 characters'),
    body('mileage')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Mileage cannot exceed 50 characters'),
    body('seats')
      .isInt({ min: 1, max: 20 })
      .withMessage('Seats must be between 1 and 20'),
    body('ownership')
      .isInt({ min: 1, max: 10 })
      .withMessage('Ownership must be between 1 and 10'),
    body('driveType')
      .optional()
      .isIn(['FWD', 'RWD', 'AWD', '4WD'])
      .withMessage('Invalid drive type'),
    body('sellerType')
      .isIn(['INDIVIDUAL', 'DEALER', 'COMPANY'])
      .withMessage('Invalid seller type'),
    body('registrationCity')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Registration city must be between 1 and 100 characters'),
    body('registrationState')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Registration state must be between 1 and 100 characters'),
    body('insurance')
      .optional()
      .isIn(['COMPREHENSIVE', 'THIRD_PARTY', 'ZERO_DEP'])
      .withMessage('Invalid insurance type'),
    body('status')
      .optional()
      .isIn(['available', 'sold', 'reserved', 'maintenance'])
      .withMessage('Invalid status'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be a boolean'),
    body('features')
      .optional()
      .custom((value) => {
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Features must be an object');
          }
          return true;
        } catch (error) {
          throw new Error('Features must be valid JSON');
        }
      }),
    body('specifications')
      .optional()
      .custom((value) => {
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Specifications must be an object');
          }
          return true;
        } catch (error) {
          throw new Error('Specifications must be valid JSON');
        }
      })
  ],
  validateRequest,
  createCar
);

/**
 * @route   GET /api/cars
 * @desc    Get all cars with pagination and filters
 * @access  Public
 * @example GET /api/cars?page=1&limit=12&brand=Toyota&fuelType=Hybrid&minPrice=2000000&maxPrice=3000000&sortBy=price&sortOrder=asc
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
    query('brand')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Brand must be between 1 and 100 characters'),
    query('fuelType')
      .optional()
      .isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG'])
      .withMessage('Invalid fuel type'),
    query('transmission')
      .optional()
      .isIn(['MANUAL', 'AUTOMATIC', 'CVT', 'DCT'])
      .withMessage('Invalid transmission type'),
    query('bodyType')
      .optional()
      .isIn(['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'MPV', 'Pickup', 'Wagon', 'Electric'])
      .withMessage('Invalid body type'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    query('minYear')
      .optional()
      .isInt({ min: 1900 })
      .withMessage('Minimum year must be valid'),
    query('maxYear')
      .optional()
      .isInt({ max: new Date().getFullYear() + 1 })
      .withMessage('Maximum year must be valid'),
    query('minKm')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Minimum kilometers must be a positive number'),
    query('maxKm')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Maximum kilometers must be a positive number'),
    query('seats')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Seats must be between 1 and 20'),
    query('driveType')
      .optional()
      .isIn(['FWD', 'RWD', 'AWD', '4WD'])
      .withMessage('Invalid drive type'),
    query('sellerType')
      .optional()
      .isIn(['INDIVIDUAL', 'DEALER', 'COMPANY'])
      .withMessage('Invalid seller type'),
    query('registrationCity')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Registration city must be between 1 and 100 characters'),
    query('registrationState')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Registration state must be between 1 and 100 characters'),
    query('status')
      .optional()
      .isIn(['available', 'sold', 'reserved', 'maintenance'])
      .withMessage('Invalid status'),
    query('sortBy')
      .optional()
      .isIn(['price', 'year', 'km', 'createdAt', 'updatedAt', 'title', 'brand'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
  ],
  validateRequest,
  getAllCars
);

/**
 * @route   GET /api/cars/search-status
 * @desc    Search cars by status using query parameters
 * @access  Public
 * @example GET /api/cars/search-status?status=available&page=1&limit=12
 */
router.get(
  '/search-status',
  [
    query('status')
      .notEmpty()
      .withMessage('Status is required')
      .isIn(['available', 'sold', 'reserved'])
      .withMessage('Status must be available, sold, or reserved'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['price', 'year', 'km', 'createdAt', 'updatedAt', 'title', 'brand'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  validateRequest,
  getCarsByStatus
);

/**
 * @route   GET /api/cars/search
 * @desc    Advanced search cars with multiple filters
 * @access  Public
 * @example GET /api/cars/search?q=Toyota&fuelType=Hybrid&minPrice=2000000&maxPrice=3000000&page=1&limit=10
 */
router.get(
  '/search',
  [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .trim()
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
    query('brand')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Brand must be between 1 and 100 characters'),
    query('fuelType')
      .optional()
      .isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG'])
      .withMessage('Invalid fuel type'),
    query('transmission')
      .optional()
      .isIn(['MANUAL', 'AUTOMATIC', 'CVT', 'DCT'])
      .withMessage('Invalid transmission type'),
    query('bodyType')
      .optional()
      .isIn(['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'MPV', 'Pickup', 'Wagon', 'Electric'])
      .withMessage('Invalid body type'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    query('minYear')
      .optional()
      .isInt({ min: 1900 })
      .withMessage('Minimum year must be valid'),
    query('maxYear')
      .optional()
      .isInt({ max: new Date().getFullYear() + 1 })
      .withMessage('Maximum year must be valid'),
    query('minKm')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Minimum kilometers must be a positive number'),
    query('maxKm')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Maximum kilometers must be a positive number'),
    query('seats')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Seats must be between 1 and 20'),
    query('sortBy')
      .optional()
      .isIn(['relevance', 'price', 'year', 'km', 'createdAt'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc')
  ],
  validateRequest,
  searchCars
);

/**
 * @route   GET /api/cars/featured
 * @desc    Get featured cars
 * @access  Public
 * @example GET /api/cars/featured?limit=6
 */
router.get(
  '/featured',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50')
  ],
  validateRequest,
  getFeaturedCars
);

/**
 * @route   GET /api/cars/seller/:sellerId
 * @desc    Get cars by seller ID
 * @access  Public
 * @example GET /api/cars/seller/64f8a1b2c3d4e5f6a7b8c9d0?page=1&limit=10
 */
router.get(
  '/seller/:sellerId',
  [
    param('sellerId')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Invalid seller ID format'),
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
      .isIn(['available', 'sold', 'reserved', 'maintenance'])
      .withMessage('Invalid status')
  ],
  validateRequest,
  getCarsBySeller
);

/**
 * @route   GET /api/cars/:id
 * @desc    Get car by ID
 * @access  Public
 * @example GET /api/cars/64f8a1b2c3d4e5f6a7b8c9d0
 */
router.get(
  '/:id',
  [
    param('id')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Invalid car ID format')
  ],
  validateRequest,
  getCarById
);

/**
 * @route   GET /api/cars/slug/:slug
 * @desc    Get car by slug
 * @access  Public
 * @example GET /api/cars/slug/2022-toyota-camry-hybrid
 */
router.get(
  '/slug/:slug',
  [
    param('slug')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Slug must be between 1 and 200 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
  ],
  validateRequest,
  getCarBySlug
);

/**
 * @route   PUT /api/cars/:id
 * @desc    Update car details with optional image replacement
 * @access  Private (car owner only)
 * @example PUT /api/cars/64f8a1b2c3d4e5f6a7b8c9d0
 */
router.put(
  '/:id',
  authenticate,
  authRateLimit,
  uploadCarImages,
  handleUploadError,
  [
    param('id')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Invalid car ID format'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('brand')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Brand must be between 1 and 100 characters'),
    body('carModel')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Model must be between 1 and 100 characters'),
    body('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Year must be valid'),
    body('variant')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Variant cannot exceed 100 characters'),
    body('bodyType')
      .optional()
      .isIn(['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'MPV', 'Pickup', 'Wagon', 'Electric'])
      .withMessage('Invalid body type'),
    body('color')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Color must be between 1 and 50 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Description must be between 1 and 2000 characters'),
    body('regularPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Regular price must be a positive number'),
    body('salePrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Sale price must be a positive number'),
    body('onRoadPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('On-road price must be a positive number'),
    body('emiStartingFrom')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('EMI must be a positive number'),
    body('km')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Kilometers must be a positive number'),
    body('fuelType')
      .optional()
      .isIn(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG'])
      .withMessage('Invalid fuel type'),
    body('transmission')
      .optional()
      .isIn(['MANUAL', 'AUTOMATIC', 'CVT', 'DCT'])
      .withMessage('Invalid transmission type'),
    body('engine')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Engine description cannot exceed 100 characters'),
    body('mileage')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Mileage cannot exceed 50 characters'),
    body('seats')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Seats must be between 1 and 20'),
    body('ownership')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Ownership must be between 1 and 10'),
    body('driveType')
      .optional()
      .isIn(['FWD', 'RWD', 'AWD', '4WD'])
      .withMessage('Invalid drive type'),
    body('sellerType')
      .optional()
      .isIn(['INDIVIDUAL', 'DEALER', 'COMPANY'])
      .withMessage('Invalid seller type'),
    body('registrationCity')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Registration city must be between 1 and 100 characters'),
    body('registrationState')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Registration state must be between 1 and 100 characters'),
    body('insurance')
      .optional()
      .isIn(['COMPREHENSIVE', 'THIRD_PARTY', 'ZERO_DEP'])
      .withMessage('Invalid insurance type'),
    body('status')
      .optional()
      .isIn(['available', 'sold', 'reserved', 'maintenance'])
      .withMessage('Invalid status'),
    body('isFeatured')
      .optional()
      .isBoolean()
      .withMessage('isFeatured must be a boolean'),
    body('features')
      .optional()
      .custom((value) => {
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Features must be an object');
          }
          return true;
        } catch (error) {
          throw new Error('Features must be valid JSON');
        }
      }),
    body('specifications')
      .optional()
      .custom((value) => {
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : value;
          if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Specifications must be an object');
          }
          return true;
        } catch (error) {
          throw new Error('Specifications must be valid JSON');
        }
      })
  ],
  validateRequest,
  updateCar
);

/**
 * @route   DELETE /api/cars/:id
 * @desc    Delete car and related data
 * @access  Private (car owner only)
 * @example DELETE /api/cars/64f8a1b2c3d4e5f6a7b8c9d0
 */
router.delete(
  '/:id',
  authenticate,
  authRateLimit,
  [
    param('id')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Invalid car ID format')
  ],
  validateRequest,
  deleteCar
);

/**
 * @route   POST /api/cars/bulk-delete
 * @desc    Delete multiple cars and remove images from Cloudinary
 * @access  Private (Admin only)
 * @example POST /api/cars/bulk-delete
 * @body {
 *   "carIds": ["64f8a1b2c3d4e5f6a7b8c9d0", "64f8a1b2c3d4e5f6a7b8c9d1"]
 * }
 */
router.post(
  '/bulk-delete',
  authenticate,
  authRateLimit,
  [
    body('carIds')
      .isArray({ min: 1 })
      .withMessage('carIds must be a non-empty array'),
    body('carIds.*')
      .matches(/^[0-9a-fA-F]{24}$/)
      .withMessage('Each car ID must be a valid MongoDB ObjectId')
  ],
  validateRequest,
  bulkDeleteCars
);

export default router;
