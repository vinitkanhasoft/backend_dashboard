import { Response } from 'express';
import { Notification, INotification, NotificationType, NotificationPriority } from '../models/Notification';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { IAuthRequest } from '../types';
import { notificationService } from '../services/simpleNotificationService';

// Get all notifications with pagination and filtering
export const getAllNotifications = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      priority,
      isView,
      userId,
      search
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (isView !== undefined) {
      filter.isView = isView === 'true';
    }

    if (userId) {
      filter.userId = userId;
    } else if (req.user?.role !== 'admin') {
      // Non-admin users can only see their own notifications
      filter.userId = req.user?._id;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const notifications = await Notification.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email');

    const total = await Notification.countDocuments(filter);

    res.status(200).json(createSuccessResponse('Notifications retrieved successfully', {
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve notifications', error.message));
  }
};

// Get notification by ID
export const getNotificationById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id).populate('userId', 'name email');

    if (!notification) {
      res.status(404).json(createErrorResponse('Notification not found'));
      return;
    }

    // Check if user has permission to view this notification
    if (req.user?.role !== 'admin' && notification.userId?.toString() !== req.user?._id) {
      res.status(403).json(createErrorResponse('Access denied'));
      return;
    }

    res.status(200).json(createSuccessResponse('Notification retrieved successfully', notification));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve notification', error.message));
  }
};

// Create notification
export const createNotification = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      message,
      type,
      priority,
      userId,
      metadata,
      actionUrl,
      expiresAt
    } = req.body;

    // Only admins can create notifications for other users
    if (req.user?.role !== 'admin' && userId && userId !== req.user?._id) {
      res.status(403).json(createErrorResponse('Access denied'));
      return;
    }

    const notification = new Notification({
      title,
      message,
      type,
      priority,
      userId: userId || req.user?._id,
      metadata,
      actionUrl,
      expiresAt
    });

    await notification.save();

    const populatedNotification = await Notification.findById(notification._id)
      .populate('userId', 'name email');

    // Send real-time notification if user is specified
    if (notification.userId) {
      notificationService.sendToUser(notification.userId.toString(), populatedNotification);
    } else {
      // Send to all admins for system notifications
      notificationService.sendToAdmins(populatedNotification);
    }

    res.status(201).json(createSuccessResponse('Notification created successfully', populatedNotification));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to create notification', error.message));
  }
};

// Mark notification(s) as viewed
export const markNotificationsAsViewed = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      res.status(400).json(createErrorResponse('Notification IDs are required'));
      return;
    }

    // Build filter to only allow users to mark their own notifications as viewed
    const filter: any = { _id: { $in: notificationIds } };
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?._id;
    }

    const result = await Notification.updateMany(
      filter,
      { isView: true }
    );

    // Send updated unread count to user
    if (req.user?._id) {
      const unreadCount = await Notification.countDocuments({ 
        userId: req.user._id, 
        isView: false 
      });
      notificationService.sendUnreadCountUpdate(req.user._id, unreadCount);
    }

    res.status(200).json(createSuccessResponse('Notifications marked as viewed', {
      modifiedCount: result.modifiedCount
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to mark notifications as viewed', error.message));
  }
};

// Mark single notification as viewed
export const markNotificationAsViewed = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      res.status(404).json(createErrorResponse('Notification not found'));
      return;
    }

    // Check if user has permission to mark this notification as viewed
    if (req.user?.role !== 'admin' && notification.userId?.toString() !== req.user?._id) {
      res.status(403).json(createErrorResponse('Access denied'));
      return;
    }

    notification.isView = true;
    await notification.save();

    res.status(200).json(createSuccessResponse('Notification marked as viewed', notification));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to mark notification as viewed', error.message));
  }
};

// Delete notification
export const deleteNotification = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      res.status(404).json(createErrorResponse('Notification not found'));
      return;
    }

    // Check if user has permission to delete this notification
    if (req.user?.role !== 'admin' && notification.userId?.toString() !== req.user?._id) {
      res.status(403).json(createErrorResponse('Access denied'));
      return;
    }

    await Notification.findByIdAndDelete(id);

    res.status(200).json(createSuccessResponse('Notification deleted successfully', notification));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete notification', error.message));
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;

    let filter: any = { isView: false };

    // Non-admin users can only see their own count
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?._id;
    } else if (userId) {
      filter.userId = userId;
    }

    const count = await Notification.countDocuments(filter);

    res.status(200).json(createSuccessResponse('Unread notification count retrieved', { count }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to get unread notification count', error.message));
  }
};

// Clear all viewed notifications
export const clearViewedNotifications = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = { isView: true };

    // Non-admin users can only clear their own notifications
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?._id;
    }

    const result = await Notification.deleteMany(filter);

    res.status(200).json(createSuccessResponse('Viewed notifications cleared', {
      deletedCount: result.deletedCount
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to clear viewed notifications', error.message));
  }
};

// Create car plate notification (helper function)
export const createCarPlateNotification = async (
  plateNumber: string,
  userId?: string,
  carPlateDetails?: any
): Promise<INotification | null> => {
  try {
    const notification = await Notification.create({
      title: `🚗 New Car Plate Detected: ${plateNumber}`,
      message: `A new car plate ${plateNumber} has been detected and added to the system.${carPlateDetails?.state ? ` Location: ${carPlateDetails.state}` : ''}${carPlateDetails?.ownerName ? ` Owner: ${carPlateDetails.ownerName}` : ''}`,
      type: NotificationType.CAR_PLATE_DETECTED,
      priority: NotificationPriority.MEDIUM,
      userId,
      metadata: { 
        plateNumber,
        carId: carPlateDetails?._id,
        state: carPlateDetails?.state,
        district: carPlateDetails?.district,
        vehicleType: carPlateDetails?.vehicleType,
        ownerName: carPlateDetails?.ownerName
      },
      actionUrl: `/admin/car-plates/${carPlateDetails?._id || 'search'}?plate=${plateNumber}`
    });

    // Send real-time notification
    if (userId) {
      notificationService.sendToUser(userId, notification);
    } else {
      notificationService.sendToAdmins(notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create car plate notification:', error);
    return null;
  }
};

// Create newsletter subscription notification (helper function)
export const createNewsletterNotification = async (
  email: string,
  userId?: string
): Promise<INotification | null> => {
  try {
    const notification = await Notification.create({
      title: 'New Newsletter Subscription',
      message: `${email} has subscribed to the newsletter.`,
      type: NotificationType.NEWSLETTER_SUBSCRIPTION,
      priority: NotificationPriority.LOW,
      userId,
      metadata: { email },
      actionUrl: '/admin/newsletter'
    });

    // Send real-time notification
    if (userId) {
      notificationService.sendToUser(userId, notification);
    } else {
      notificationService.sendToAdmins(notification);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create newsletter notification:', error);
    return null;
  }
};

// Get notifications by type
export const getNotificationsByType = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!Object.values(NotificationType).includes(type as NotificationType)) {
      res.status(400).json(createErrorResponse('Invalid notification type'));
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { type };
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?._id;
    }

    const notifications = await Notification.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email');

    const total = await Notification.countDocuments(filter);

    res.status(200).json(createSuccessResponse('Notifications retrieved successfully', {
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve notifications', error.message));
  }
};

// Get car plate notifications specifically
export const getCarPlateNotifications = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      state,
      vehicleType
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter for car plate notifications
    const filter: any = { 
      type: NotificationType.CAR_PLATE_DETECTED 
    };

    // Non-admin users can only see their own notifications
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?._id;
    }

    // Add search filter for plate numbers or metadata
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { 'metadata.plateNumber': { $regex: search, $options: 'i' } },
        { 'metadata.state': { $regex: search, $options: 'i' } },
        { 'metadata.ownerName': { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by state if provided
    if (state) {
      filter['metadata.state'] = { $regex: state, $options: 'i' };
    }

    // Filter by vehicle type if provided
    if (vehicleType) {
      filter['metadata.vehicleType'] = vehicleType;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('userId', 'name email');

    const total = await Notification.countDocuments(filter);

    // Group notifications by state for statistics
    const stateStats = await Notification.aggregate([
      { $match: { type: NotificationType.CAR_PLATE_DETECTED } },
      { $group: { _id: '$metadata.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent plate numbers
    const recentPlates = await Notification.find({ 
      type: NotificationType.CAR_PLATE_DETECTED 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('metadata.plateNumber metadata.state createdAt');

    res.status(200).json(createSuccessResponse('Car plate notifications retrieved successfully', {
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      },
      statistics: {
        totalCarPlateNotifications: total,
        byState: stateStats,
        recentPlates: recentPlates.map(n => ({
          plateNumber: n.metadata?.plateNumber || '',
          state: n.metadata?.state || '',
          detectedAt: n.createdAt
        }))
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve car plate notifications', error.message));
  }
};
export const markAllNotificationsAsViewed = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const filter: any = { isView: false };

    // Non-admin users can only mark their own notifications as viewed
    if (req.user?.role !== 'admin') {
      filter.userId = req.user?._id;
    }

    const result = await Notification.updateMany(filter, { isView: true });

    res.status(200).json(createSuccessResponse('All notifications marked as viewed', {
      modifiedCount: result.modifiedCount
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to mark all notifications as viewed', error.message));
  }
};
