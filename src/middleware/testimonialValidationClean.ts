import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { UserType } from '../models/Testimonial';
import { createValidationErrorResponse } from '../constants/apiResponses';

// Validation rules for creating testimonials
export const validateCreateTestimonial = [
  body('userName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('User name must be between 2 and 100 characters')
    .isAlpha('en-US', {ignore: ' -\''})
    .withMessage('User name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('userType')
    .trim()
    .isIn(Object.values(UserType))
    .withMessage('User type must be buyer, seller, or dealer'),
  
  body('location')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('carName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Car name cannot exceed 100 characters'),
  
  body('isApproved')
    .optional()
    .isBoolean()
    .withMessage('isApproved must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters'),
];

// Validation rules for updating testimonials
export const validateUpdateTestimonial = [
  param('id')
    .isMongoId()
    .withMessage('Invalid testimonial ID format'),
  
  body('userName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('User name must be between 2 and 100 characters')
    .isAlpha('en-US', {ignore: ' -\''})
    .withMessage('User name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('userType')
    .optional()
    .trim()
    .isIn(Object.values(UserType))
    .withMessage('User type must be buyer, seller, or dealer'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Location must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  body('carName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Car name cannot exceed 100 characters'),
  
  body('isApproved')
    .optional()
    .isBoolean()
    .withMessage('isApproved must be a boolean'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters'),
];

// Validation rules for getting testimonials (query parameters)
export const validateGetTestimonials = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  
  query('userType')
    .optional()
    .trim()
    .isIn(Object.values(UserType))
    .withMessage('User type must be buyer, seller, or dealer'),
  
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  
  query('isApproved')
    .optional()
    .isBoolean()
    .withMessage('isApproved must be a boolean'),
  
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  
  query('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('sortBy')
    .optional()
    .trim()
    .isIn(['createdAt', 'updatedAt', 'userName', 'rating', 'location'])
    .withMessage('Sort by must be one of: createdAt, updatedAt, userName, rating, location'),
  
  query('sortOrder')
    .optional()
    .trim()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// Validation for testimonial ID parameter
export const validateTestimonialId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid testimonial ID format'),
];

// Validation for bulk delete
export const validateBulkDelete = [
  body('testimonialIds')
    .isArray({ min: 1 })
    .withMessage('testimonialIds must be an array with at least one ID'),
  
  body('testimonialIds.*')
    .isMongoId()
    .withMessage('All testimonial IDs must be valid MongoDB ObjectIds'),
];

// Validation for featured testimonials
export const validateFeaturedTestimonials = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be an integer between 1 and 50'),
];

// Validation error handler middleware
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: (error as any).param || (error as any).type,
      message: (error as any).msg,
      value: (error as any).value
    }));
    
    res.status(400).json(createValidationErrorResponse(formattedErrors));
    return;
  }
  
  next();
};
