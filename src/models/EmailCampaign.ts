import mongoose, { Document, Schema } from 'mongoose';
import { EmailCampaignStatus, EmailCampaignStatusLabels, EmailCampaignType, EmailCampaignTypeLabels } from '../enums/newsletterEnums';

// Email Campaign Interface
export interface IEmailCampaign extends Document {
  name: string;
  subject: string;
  content: string;
  recipients: string[]; // Array of email addresses
  status: EmailCampaignStatus;
  sentAt?: Date;
  scheduledAt?: Date;
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Email Campaign Schema
const EmailCampaignSchema = new Schema<IEmailCampaign>({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [200, 'Campaign name cannot exceed 200 characters']
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [200, 'Email subject cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Email content is required'],
    minlength: [10, 'Email content must be at least 10 characters']
  },
  recipients: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email address']
  }],
  status: {
    type: String,
    required: true,
    enum: Object.values(EmailCampaignStatus),
    default: EmailCampaignStatus.DRAFT
  },
  sentAt: {
    type: Date,
    comment: 'When the campaign was sent'
  },
  scheduledAt: {
    type: Date,
    comment: 'When the campaign is scheduled to be sent'
  },
  totalRecipients: {
    type: Number,
    default: 0,
    min: [0, 'Total recipients cannot be negative']
  },
  successfulSends: {
    type: Number,
    default: 0,
    min: [0, 'Successful sends cannot be negative']
  },
  failedSends: {
    type: Number,
    default: 0,
    min: [0, 'Failed sends cannot be negative']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Campaign creator is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
EmailCampaignSchema.index({ status: 1 });
EmailCampaignSchema.index({ createdBy: 1 });
EmailCampaignSchema.index({ createdAt: -1 });
EmailCampaignSchema.index({ scheduledAt: 1 });

// Pre-save middleware to update total recipients
EmailCampaignSchema.pre('save', function(next) {
  if (this.isModified('recipients')) {
    this.totalRecipients = this.recipients.length;
  }
  next();
});

// Virtual for status label
EmailCampaignSchema.virtual('statusLabel').get(function() {
  return EmailCampaignStatusLabels[this.status] || this.status;
});

// Virtual for success rate
EmailCampaignSchema.virtual('successRate').get(function() {
  if (this.totalRecipients === 0) return 0;
  return Math.round((this.successfulSends / this.totalRecipients) * 100);
});

// Virtual for formatted sent date
EmailCampaignSchema.virtual('formattedSentAt').get(function() {
  if (!this.sentAt) return null;
  return this.sentAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

export const EmailCampaign = mongoose.model<IEmailCampaign>('EmailCampaign', EmailCampaignSchema);
