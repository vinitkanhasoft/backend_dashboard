import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markNotificationsAsViewed,
  markNotificationAsViewed,
  deleteNotification,
  getUnreadNotificationCount,
  clearViewedNotifications,
  createCarPlateNotification,
  createNewsletterNotification,
  getNotificationsByType,
  markAllNotificationsAsViewed,
  getCarPlateNotifications
} from '../controllers/notificationController';
import { IAuthRequest } from '../types';
import { 
  NotificationType, 
  NotificationPriority 
} from '../models/Notification';
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

// Notification creation validation
const validateNotificationCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  body('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`),
  body('priority')
    .optional()
    .isIn(Object.values(NotificationPriority))
    .withMessage(`Priority must be one of: ${Object.values(NotificationPriority).join(', ')}`),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('actionUrl')
    .optional()
    .trim()
    .isURL({ require_protocol: false })
    .withMessage('Action URL must be a valid URL'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Notification IDs validation for bulk operations
const validateNotificationIds = [
  body('notificationIds')
    .isArray({ min: 1 })
    .withMessage('Notification IDs array is required'),
  body('notificationIds.*')
    .isMongoId()
    .withMessage('Invalid notification ID format')
];

// Query validation for get all notifications
const validateGetNotifications = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`),
  query('priority')
    .optional()
    .isIn(Object.values(NotificationPriority))
    .withMessage(`Priority must be one of: ${Object.values(NotificationPriority).join(', ')}`),
  query('isView')
    .optional()
    .isBoolean()
    .withMessage('isView must be a boolean'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

// ID validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID')
];

// Type validation
const validateType = [
  param('type')
    .isIn(Object.values(NotificationType))
    .withMessage(`Type must be one of: ${Object.values(NotificationType).join(', ')}`)
];

// Public routes (none - all notifications require authentication)

// Helper route handlers
const createCarPlateNotificationHandler = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { plateNumber } = req.params;
    const { userId } = req.body;
    
    const notification = await createCarPlateNotification(plateNumber, userId);
    
    if (!notification) {
      res.status(500).json(createErrorResponse('Failed to create car plate notification'));
      return;
    }
    
    res.status(201).json(createSuccessResponse('Car plate notification created', notification));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to create car plate notification', error.message));
  }
};

const createNewsletterNotificationHandler = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const { userId } = req.body;
    
    const notification = await createNewsletterNotification(email, userId);
    
    if (!notification) {
      res.status(500).json(createErrorResponse('Failed to create newsletter notification'));
      return;
    }
    
    res.status(201).json(createSuccessResponse('Newsletter notification created', notification));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to create newsletter notification', error.message));
  }
};

// Protected routes
router.use(authenticate);

// Notification CRUD routes
router.get('/', validateGetNotifications, handleValidationErrors, getAllNotifications);
router.get('/count', getUnreadNotificationCount);
router.get('/car-plates', getCarPlateNotifications);
router.get('/type/:type', validateType, handleValidationErrors, getNotificationsByType);
router.get('/:id', validateId, handleValidationErrors, getNotificationById);

// Create notification (admin only or for self)
router.post('/', validateNotificationCreation, handleValidationErrors, createNotification);

// Mark notifications as viewed
router.patch('/mark-viewed', validateNotificationIds, handleValidationErrors, markNotificationsAsViewed);
router.patch('/mark-all-viewed', markAllNotificationsAsViewed);
router.patch('/:id/mark-viewed', validateId, handleValidationErrors, markNotificationAsViewed);

// Delete notification
router.delete('/:id', validateId, handleValidationErrors, deleteNotification);

// Clear viewed notifications
router.delete('/clear-viewed', clearViewedNotifications);

// Helper routes for creating specific notifications (admin only)
router.post('/car-plate/:plateNumber', createCarPlateNotificationHandler);
router.post('/newsletter/:email', createNewsletterNotificationHandler);

export default router;
