import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { uploadCompanyLogo } from '../middleware/upload';
import {
  getAllCarPlates,
  getCarPlateById,
  createCarPlate,
  updateCarPlate,
  deleteCarPlate,
  validateCarPlate,
  getCarPlatesByRTO
} from '../controllers/carPlateController';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';

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

// Car plate validation
const validateCarPlateInput = [
  body('plateNumber')
    .trim()
    .notEmpty()
    .withMessage('Plate number is required')
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/i)
    .withMessage('Please provide a valid Indian plate number (e.g., GJ01NX1234)'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('district')
    .trim()
    .notEmpty()
    .withMessage('District is required')
    .isLength({ max: 100 })
    .withMessage('District name cannot exceed 100 characters'),
  body('rtoCode')
    .trim()
    .notEmpty()
    .withMessage('RTO code is required')
    .matches(/^[A-Z]{2}[0-9]{2}$/i)
    .withMessage('Please provide a valid RTO code (e.g., GJ01)'),
  body('vehicleType')
    .optional()
    .isIn(['car', 'motorcycle', 'scooter', 'truck', 'bus', 'auto-rickshaw', 'tempo', 'tractor'])
    .withMessage('Vehicle type must be one of: car, motorcycle, scooter, truck, bus, auto-rickshaw, tempo, tractor'),
  body('registrationDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid registration date')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Registration date cannot be in the future');
      }
      return true;
    }),
  body('ownerName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Owner name cannot exceed 100 characters'),
  body('isValid')
    .optional()
    .isBoolean()
    .withMessage('isValid must be a boolean')
];

// Update validation
const validateCarPlateUpdate = [
  body('plateNumber')
    .optional()
    .trim()
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/i)
    .withMessage('Please provide a valid Indian plate number (e.g., GJ01NX1234)'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  body('district')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('District name cannot exceed 100 characters'),
  body('rtoCode')
    .optional()
    .trim()
    .matches(/^[A-Z]{2}[0-9]{2}$/i)
    .withMessage('Please provide a valid RTO code (e.g., GJ01)'),
  body('vehicleType')
    .optional()
    .isIn(['car', 'motorcycle', 'scooter', 'truck', 'bus', 'auto-rickshaw', 'tempo', 'tractor'])
    .withMessage('Vehicle type must be one of: car, motorcycle, scooter, truck, bus, auto-rickshaw, tempo, tractor'),
  body('registrationDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid registration date')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Registration date cannot be in the future');
      }
      return true;
    }),
  body('ownerName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Owner name cannot exceed 100 characters'),
  body('isValid')
    .optional()
    .isBoolean()
    .withMessage('isValid must be a boolean')
];

// Query validation for get all
const validateGetCarPlates = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State name cannot exceed 50 characters'),
  query('district')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('District name cannot exceed 100 characters'),
  query('rtoCode')
    .optional()
    .trim()
    .matches(/^[A-Z]{2}[0-9]{2}$/i)
    .withMessage('Please provide a valid RTO code (e.g., GJ01)'),
  query('vehicleType')
    .optional()
    .isIn(['car', 'motorcycle', 'scooter', 'truck', 'bus', 'auto-rickshaw', 'tempo', 'tractor'])
    .withMessage('Vehicle type must be one of: car, motorcycle, scooter, truck, bus, auto-rickshaw, tempo, tractor'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('isValid')
    .optional()
    .isBoolean()
    .withMessage('isValid must be a boolean')
];

// ID validation
const validateCarPlateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid car plate ID')
];

// RTO code validation
const validateRTOCode = [
  param('rtoCode')
    .matches(/^[A-Z]{2}[0-9]{2}$/i)
    .withMessage('Please provide a valid RTO code (e.g., GJ01)')
];

// Validation for plate number validation endpoint
const validatePlateNumberValidation = [
  body('plateNumber')
    .trim()
    .notEmpty()
    .withMessage('Plate number is required')
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/i)
    .withMessage('Please provide a valid Indian plate number (e.g., GJ01NX1234)')
];

// Public routes
router.post('/validate', validatePlateNumberValidation, handleValidationErrors, validateCarPlate);

// Protected routes
router.use(authenticate);

// CRUD routes
router.get('/', validateGetCarPlates, handleValidationErrors, getAllCarPlates);
router.get('/:id', validateCarPlateId, handleValidationErrors, getCarPlateById);
router.post('/', validateCarPlateInput, handleValidationErrors, createCarPlate);
router.put('/:id', validateCarPlateUpdate, handleValidationErrors, updateCarPlate);
router.delete('/:id', validateCarPlateId, handleValidationErrors, deleteCarPlate);

// Additional routes
router.get('/rto/:rtoCode', validateRTOCode, handleValidationErrors, getCarPlatesByRTO);

export default router;
