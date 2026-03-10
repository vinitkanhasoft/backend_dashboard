import mongoose, { Document, Schema } from 'mongoose';

// Testimonial Image Interface
export interface ITestimonialImage {
  url: string;
  publicId: string;
  alt?: string;
}

// User Type Enum
export enum UserType {
  BUYER = 'buyer',
  SELLER = 'seller',
  DEALER = 'dealer'
}

// Main Testimonial Interface
export interface ITestimonial extends Document {
  // User Information
  userName: string;
  userProfileImage?: ITestimonialImage;
  userType: UserType;
  location: string;
  
  // Testimonial Content
  description: string;
  rating: number; // 1-5 stars
  
  // Related Car Information
  carName?: string;
  carId?: mongoose.Types.ObjectId;
  
  // Status & Metadata
  isApproved: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  
  // Admin Notes
  adminNotes?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Testimonial Image Schema
const TestimonialImageSchema = new Schema<ITestimonialImage>({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    trim: true
  }
}, { _id: false });

// Main Testimonial Schema
const TestimonialSchema = new Schema<ITestimonial>({
  // User Information
  userName: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    maxlength: [100, 'User name cannot exceed 100 characters']
  },
  userProfileImage: TestimonialImageSchema,
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: Object.values(UserType),
    default: UserType.BUYER
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  
  // Testimonial Content
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  // Related Car Information
  carName: {
    type: String,
    trim: true,
    maxlength: [100, 'Car name cannot exceed 100 characters']
  },
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car'
  },
  
  // Status & Metadata
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
TestimonialSchema.index({ userType: 1, isApproved: 1 });
TestimonialSchema.index({ rating: -1 });
TestimonialSchema.index({ isFeatured: 1, isVisible: 1 });
TestimonialSchema.index({ createdAt: -1 });
TestimonialSchema.index({ carId: 1 });

// Text index for search
TestimonialSchema.index({
  userName: 'text',
  description: 'text',
  location: 'text',
  carName: 'text'
});

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
