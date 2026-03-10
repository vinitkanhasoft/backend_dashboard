import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadSingleImage } from '../middleware/upload';
import {
  validateCreateTestimonial,
  validateUpdateTestimonial,
  validateGetTestimonials,
  validateTestimonialId,
  validateBulkDelete,
  validateFeaturedTestimonials,
  handleValidationErrors
} from '../middleware/testimonialValidation';
import {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  bulkDeleteTestimonials,
  getFeaturedTestimonials,
  approveTestimonial
} from '../controllers/testimonialController';

const router = Router();

// Public routes
router.get('/featured', validateFeaturedTestimonials, handleValidationErrors, getFeaturedTestimonials);

// Protected routes
router.use(authenticate);

// CRUD routes with validation and form data support
router.post('/', uploadSingleImage, validateCreateTestimonial, handleValidationErrors, createTestimonial);
router.get('/', validateGetTestimonials, handleValidationErrors, getAllTestimonials);
router.get('/:id', validateTestimonialId, handleValidationErrors, getTestimonialById);
router.put('/:id', uploadSingleImage, validateUpdateTestimonial, handleValidationErrors, updateTestimonial);
router.delete('/:id', validateTestimonialId, handleValidationErrors, deleteTestimonial);
router.post('/bulk-delete', validateBulkDelete, handleValidationErrors, bulkDeleteTestimonials);

// Admin routes
router.patch('/:id/approve', validateTestimonialId, handleValidationErrors, approveTestimonial);

export default router;
