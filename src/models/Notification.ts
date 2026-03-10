import mongoose, { Document, Schema } from 'mongoose';

// Notification Types
export enum NotificationType {
  CAR_PLATE_DETECTED = 'car_plate_detected',
  NEWSLETTER_SUBSCRIPTION = 'newsletter_subscription',
  SYSTEM_UPDATE = 'system_update',
  USER_REGISTRATION = 'user_registration',
  CAR_SALE = 'car_sale',
  GENERAL = 'general'
}

// Notification Priority
export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Notification Interface
export interface INotification extends Document {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isView: boolean;
  userId?: mongoose.Types.ObjectId;
  metadata?: {
    plateNumber?: string;
    email?: string;
    carId?: mongoose.Types.ObjectId;
    [key: string]: any;
  };
  actionUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Schema
const NotificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: Object.values(NotificationType),
    default: NotificationType.GENERAL
  },
  priority: {
    type: String,
    required: [true, 'Notification priority is required'],
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM
  },
  isView: {
    type: Boolean,
    default: false,
    comment: 'Whether the notification has been viewed or not'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    comment: 'User ID for user-specific notifications (null for global notifications)'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
    comment: 'Additional metadata for the notification'
  },
  actionUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Action URL cannot exceed 500 characters'],
    comment: 'URL to redirect when notification is clicked'
  },
  expiresAt: {
    type: Date,
    comment: 'Notification expiration date'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
NotificationSchema.index({ userId: 1, isView: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
NotificationSchema.index({ isView: 1, createdAt: -1 });

// Virtual for formatted creation date
NotificationSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for time ago
NotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now.getTime() - this.createdAt.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to set expiration for non-urgent notifications
NotificationSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt && this.priority !== NotificationPriority.URGENT) {
    // Set expiration to 30 days for non-urgent notifications
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Static method to create notification for car plate detection
NotificationSchema.statics.createCarPlateNotification = function(
  plateNumber: string,
  userId?: mongoose.Types.ObjectId
) {
  return this.create({
    title: 'New Car Plate Detected',
    message: `A new car plate ${plateNumber} has been detected and added to the system.`,
    type: NotificationType.CAR_PLATE_DETECTED,
    priority: NotificationPriority.MEDIUM,
    userId,
    metadata: { plateNumber },
    actionUrl: `/admin/car-plates`
  });
};

// Static method to create notification for newsletter subscription
NotificationSchema.statics.createNewsletterNotification = function(
  email: string,
  userId?: mongoose.Types.ObjectId
) {
  return this.create({
    title: 'New Newsletter Subscription',
    message: `${email} has subscribed to the newsletter.`,
    type: NotificationType.NEWSLETTER_SUBSCRIPTION,
    priority: NotificationPriority.LOW,
    userId,
    metadata: { email },
    actionUrl: '/admin/newsletter'
  });
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = function(userId?: mongoose.Types.ObjectId) {
  const filter: any = { isView: false };
  if (userId) {
    filter.userId = userId;
  }
  return this.countDocuments(filter);
};

// Static method to mark notifications as viewed
NotificationSchema.statics.markAsViewed = function(notificationIds: string[]) {
  return this.updateMany(
    { _id: { $in: notificationIds } },
    { isView: true }
  );
};

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
