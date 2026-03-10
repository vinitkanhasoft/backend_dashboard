import mongoose, { Document, Schema } from 'mongoose';
import { InsuranceType, InsuranceCoverageType, InsuranceCompanyStatus } from '../enums/insuranceFinanceEnums';

// Insurance Company Interface
export interface IInsuranceCompany extends Document {
  name: string;
  logo?: {
    url: string;
    publicId: string;
    alt?: string;
  };
  description: string;
  contactNumber: string;
  email: string;
  website?: string;
  address?: string;
  gstNumber?: string;
  licenseNumber?: string;
  coverageTypes: InsuranceCoverageType[];
  insuranceTypes: InsuranceType[];
  emiStartPrice: number;
  minCoverageAmount: number;
  maxCoverageAmount: number;
  status: InsuranceCompanyStatus;
  isPremiumPartner: boolean;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Insurance Company Schema
const InsuranceCompanySchema = new Schema<IInsuranceCompany>({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
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
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  gstNumber: {
    type: String,
    trim: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/, 'Please provide a valid GST number']
  },
  licenseNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'License number cannot exceed 50 characters']
  },
  coverageTypes: [{
    type: String,
    enum: Object.values(InsuranceCoverageType),
    required: true
  }],
  insuranceTypes: [{
    type: String,
    enum: Object.values(InsuranceType),
    required: true
  }],
  emiStartPrice: {
    type: Number,
    required: [true, 'EMI start price is required'],
    min: [0, 'EMI start price must be a positive number']
  },
  minCoverageAmount: {
    type: Number,
    required: [true, 'Minimum coverage amount is required'],
    min: [0, 'Minimum coverage amount must be a positive number']
  },
  maxCoverageAmount: {
    type: Number,
    required: [true, 'Maximum coverage amount is required'],
    min: [0, 'Maximum coverage amount must be a positive number']
  },
  status: {
    type: String,
    enum: Object.values(InsuranceCompanyStatus),
    default: InsuranceCompanyStatus.ACTIVE
  },
  isPremiumPartner: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [100, 'Feature cannot exceed 100 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
InsuranceCompanySchema.index({ name: 1 });
InsuranceCompanySchema.index({ status: 1 });
InsuranceCompanySchema.index({ isPremiumPartner: 1 });
InsuranceCompanySchema.index({ emiStartPrice: 1 });

// Virtual for average coverage
InsuranceCompanySchema.virtual('averageCoverage').get(function() {
  return (this.minCoverageAmount + this.maxCoverageAmount) / 2;
});

// Virtual for coverage range
InsuranceCompanySchema.virtual('coverageRange').get(function() {
  return `₹${this.minCoverageAmount.toLocaleString('en-IN')} - ₹${this.maxCoverageAmount.toLocaleString('en-IN')}`;
});

export const InsuranceCompany = mongoose.model<IInsuranceCompany>('InsuranceCompany', InsuranceCompanySchema);
