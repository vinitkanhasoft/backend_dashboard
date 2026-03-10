import mongoose, { Document, Schema } from 'mongoose';

// Newsletter Subscription Interface
export interface INewsletterSubscription extends Document {
  email: string;
  isActive: boolean;
  subscribedAt: Date;
}

// Newsletter Subscription Schema
const NewsletterSubscriptionSchema = new Schema<INewsletterSubscription>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [255, 'Email cannot exceed 255 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  isActive: {
    type: Boolean,
    default: true,
    comment: 'Whether the subscription is active or not'
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
    comment: 'When the user subscribed to the newsletter'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
NewsletterSubscriptionSchema.index({ email: 1 });
NewsletterSubscriptionSchema.index({ isActive: 1 });
NewsletterSubscriptionSchema.index({ subscribedAt: -1 });

// Pre-save middleware to ensure email uniqueness and proper formatting
NewsletterSubscriptionSchema.pre('save', function(next) {
  // Convert email to lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Virtual for formatted subscription date
NewsletterSubscriptionSchema.virtual('formattedSubscribedAt').get(function() {
  return this.subscribedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

export const NewsletterSubscription = mongoose.model<INewsletterSubscription>('NewsletterSubscription', NewsletterSubscriptionSchema);
