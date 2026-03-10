import mongoose, { Document, Schema } from 'mongoose';
import { FinanceType, FinanceStatus } from '../enums/insuranceFinanceEnums';

// Finance Option Interface
export interface IFinanceOption extends Document {
  bankName: string;
  logo?: {
    url: string;
    publicId: string;
    alt?: string;
  };
  description: string;
  financeType: FinanceType;
  interestRate: number;
  processingFee?: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  minTenure: number; // in months
  maxTenure: number; // in months
  emiStartPrice: number;
  eligibilityCriteria?: {
    minAge?: number;
    maxAge?: number;
    minIncome?: number;
    minCreditScore?: number;
    employmentType?: string[];
  };
  documentsRequired?: string[];
  features?: string[];
  status: FinanceStatus;
  isPopular: boolean;
  contactNumber: string;
  email: string;
  website?: string;
  preApprovalAvailable: boolean;
  instantDisbursement: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Finance Option Schema
const FinanceOptionSchema = new Schema<IFinanceOption>({
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
    maxlength: [200, 'Bank name cannot exceed 200 characters']
  },
  logo: {
    url: {
      type: String,
      required: false
    },
    publicId: {
      type: String,
      required: false
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [100, 'Alt text cannot exceed 100 characters']
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  financeType: {
    type: String,
    enum: Object.values(FinanceType),
    required: [true, 'Finance type is required']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate must be a positive number'],
    max: [100, 'Interest rate cannot exceed 100%']
  },
  processingFee: {
    type: Number,
    min: [0, 'Processing fee must be a positive number']
  },
  minLoanAmount: {
    type: Number,
    required: [true, 'Minimum loan amount is required'],
    min: [0, 'Minimum loan amount must be a positive number']
  },
  maxLoanAmount: {
    type: Number,
    required: [true, 'Maximum loan amount is required'],
    min: [0, 'Maximum loan amount must be a positive number']
  },
  minTenure: {
    type: Number,
    required: [true, 'Minimum tenure is required'],
    min: [1, 'Minimum tenure must be at least 1 month'],
    max: [360, 'Minimum tenure cannot exceed 360 months']
  },
  maxTenure: {
    type: Number,
    required: [true, 'Maximum tenure is required'],
    min: [1, 'Maximum tenure must be at least 1 month'],
    max: [360, 'Maximum tenure cannot exceed 360 months']
  },
  emiStartPrice: {
    type: Number,
    required: [true, 'EMI start price is required'],
    min: [0, 'EMI start price must be a positive number']
  },
  eligibilityCriteria: {
    minAge: {
      type: Number,
      min: [18, 'Minimum age must be at least 18'],
      max: [100, 'Minimum age cannot exceed 100']
    },
    maxAge: {
      type: Number,
      min: [18, 'Maximum age must be at least 18'],
      max: [100, 'Maximum age cannot exceed 100']
    },
    minIncome: {
      type: Number,
      min: [0, 'Minimum income must be a positive number']
    },
    minCreditScore: {
      type: Number,
      min: [300, 'Minimum credit score must be at least 300'],
      max: [900, 'Minimum credit score cannot exceed 900']
    },
    employmentType: [{
      type: String,
      trim: true,
      maxlength: [50, 'Employment type cannot exceed 50 characters']
    }]
  },
  documentsRequired: [{
    type: String,
    trim: true,
    maxlength: [100, 'Document name cannot exceed 100 characters']
  }],
  features: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature cannot exceed 200 characters']
  }],
  status: {
    type: String,
    enum: Object.values(FinanceStatus),
    default: FinanceStatus.ACTIVE
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid contact number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, 'Please provide a valid website URL']
  },
  preApprovalAvailable: {
    type: Boolean,
    default: false
  },
  instantDisbursement: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
FinanceOptionSchema.index({ bankName: 1 });
FinanceOptionSchema.index({ financeType: 1 });
FinanceOptionSchema.index({ status: 1 });
FinanceOptionSchema.index({ isPopular: 1 });
FinanceOptionSchema.index({ interestRate: 1 });
FinanceOptionSchema.index({ emiStartPrice: 1 });

// Virtual for loan range
FinanceOptionSchema.virtual('loanRange').get(function() {
  return `₹${this.minLoanAmount.toLocaleString('en-IN')} - ₹${this.maxLoanAmount.toLocaleString('en-IN')}`;
});

// Virtual for tenure range
FinanceOptionSchema.virtual('tenureRange').get(function() {
  return `${this.minTenure} - ${this.maxTenure} months`;
});

// Virtual for interest rate display
FinanceOptionSchema.virtual('interestRateDisplay').get(function() {
  return `${this.interestRate}% p.a.`;
});

export const FinanceOption = mongoose.model<IFinanceOption>('FinanceOption', FinanceOptionSchema);
