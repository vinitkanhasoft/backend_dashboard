import { Response } from 'express';
import { NewsletterSubscription, INewsletterSubscription } from '../models/NewsletterSubscription';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { IAuthRequest } from '../types';

// Subscribe to Newsletter
export const subscribeNewsletter = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingSubscription = await NewsletterSubscription.findOne({ email: email.toLowerCase().trim() });
    
    if (existingSubscription) {
      if (existingSubscription.isActive) {
        res.status(400).json(createErrorResponse('Email is already subscribed to the newsletter'));
        return;
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        await existingSubscription.save();
        
        res.status(200).json(createSuccessResponse('Newsletter subscription reactivated successfully', {
          email: existingSubscription.email,
          isActive: existingSubscription.isActive,
          subscribedAt: existingSubscription.subscribedAt
        }));
        return;
      }
    }

    // Create new subscription
    const subscription = new NewsletterSubscription({
      email: email.toLowerCase().trim(),
      isActive: true,
      subscribedAt: new Date()
    });

    await subscription.save();

    res.status(201).json(createSuccessResponse('Successfully subscribed to newsletter', {
      email: subscription.email,
      isActive: subscription.isActive,
      subscribedAt: subscription.subscribedAt
    }));
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json(createErrorResponse('Email is already subscribed to the newsletter'));
      return;
    }
    res.status(500).json(createErrorResponse('Failed to subscribe to newsletter', error.message));
  }
};

// Get All Newsletter Subscriptions (Dashboard)
export const getAllNewsletterSubscriptions = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search
    } = req.query;

    // Build query
    const query: any = {};

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const subscriptions = await NewsletterSubscription.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await NewsletterSubscription.countDocuments(query);
    const activeCount = await NewsletterSubscription.countDocuments({ isActive: true });
    const inactiveCount = await NewsletterSubscription.countDocuments({ isActive: false });

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    res.status(200).json(createSuccessResponse('Newsletter subscriptions retrieved successfully', {
      subscriptions,
      pagination,
      stats: {
        total,
        active: activeCount,
        inactive: inactiveCount
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve newsletter subscriptions', error.message));
  }
};

// Unsubscribe from Newsletter
export const unsubscribeNewsletter = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const subscription = await NewsletterSubscription.findOne({ email: email.toLowerCase().trim() });

    if (!subscription) {
      res.status(404).json(createErrorResponse('Email not found in newsletter subscriptions'));
      return;
    }

    if (!subscription.isActive) {
      res.status(400).json(createErrorResponse('Email is already unsubscribed from the newsletter'));
      return;
    }

    subscription.isActive = false;
    await subscription.save();

    res.status(200).json(createSuccessResponse('Successfully unsubscribed from newsletter', {
      email: subscription.email,
      isActive: subscription.isActive
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to unsubscribe from newsletter', error.message));
  }
};

// Get Newsletter Subscription Stats
export const getNewsletterStats = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const total = await NewsletterSubscription.countDocuments();
    const active = await NewsletterSubscription.countDocuments({ isActive: true });
    const inactive = await NewsletterSubscription.countDocuments({ isActive: false });
    
    // Get recent subscriptions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSubscriptions = await NewsletterSubscription.countDocuments({
      subscribedAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json(createSuccessResponse('Newsletter statistics retrieved successfully', {
      total,
      active,
      inactive,
      recentSubscriptions,
      activeRate: total > 0 ? Math.round((active / total) * 100) : 0
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve newsletter statistics', error.message));
  }
};

// Delete Newsletter Subscription
export const deleteNewsletterSubscription = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const subscription = await NewsletterSubscription.findById(id);

    if (!subscription) {
      res.status(404).json(createErrorResponse('Newsletter subscription not found'));
      return;
    }

    await NewsletterSubscription.findByIdAndDelete(id);

    res.status(200).json(createSuccessResponse('Newsletter subscription deleted successfully', {
      email: subscription.email
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete newsletter subscription', error.message));
  }
};

// Bulk Delete Newsletter Subscriptions
export const bulkDeleteNewsletterSubscriptions = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json(createErrorResponse('Valid subscription IDs array is required'));
      return;
    }

    const result = await NewsletterSubscription.deleteMany({ _id: { $in: ids } });

    res.status(200).json(createSuccessResponse('Newsletter subscriptions deleted successfully', {
      deletedCount: result.deletedCount
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete newsletter subscriptions', error.message));
  }
};
