import mongoose, { Document, Schema } from 'mongoose';
import { CarStatus } from '../enums/carEnums';

// Car Feature Interface
export interface ICarFeature {
  name: string;
  available: boolean;
}

// Car Specification Interface
export interface ICarSpecification {
  name: string;
  available: boolean;
}

// Car Image Interface
export interface ICarImage {
  url: string;
  publicId: string;
  alt?: string;
}

// Main Car Interface
export interface ICar extends Document {
  // Basic Information
  title: string;
  brand: string;
  carModel: string;
  year: number;
  variant?: string;
  bodyType: string;
  color: string;
  description: string;

  // Pricing
  regularPrice: number;
  salePrice: number;
  onRoadPrice?: number;
  emiStartingFrom?: number;

  // Technical Specifications
  km: number;
  fuelType: string;
  transmission: string;
  engine?: string;
  mileage?: string;
  seats: number;
  ownership: number;
  driveType?: string;
  sellerType: string;

  // Location & Insurance
  registrationCity: string;
  registrationState: string;
  insurance?: string;

  // Status & Metadata
  status: CarStatus;
  isFeatured: boolean;
  slug?: string;

  // Images
  primaryImage?: ICarImage;
  images?: ICarImage[];

  // Relations (populated)
  features?: ICarFeature[];
  specifications?: ICarSpecification[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Car Feature Schema
const CarFeatureSchema = new Schema<ICarFeature>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  available: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Car Specification Schema
const CarSpecificationSchema = new Schema<ICarSpecification>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  available: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// Car Image Schema
const CarImageSchema = new Schema<ICarImage>({
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

// Main Car Schema
const CarSchema = new Schema<ICar>({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Car title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  brand: {
    type: String,
    required: [true, 'Car brand is required'],
    trim: true,
    maxlength: [100, 'Brand cannot exceed 100 characters']
  },
  carModel: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the distant future']
  },
  variant: {
    type: String,
    trim: true,
    maxlength: [100, 'Variant cannot exceed 100 characters']
  },
  bodyType: {
    type: String,
    required: [true, 'Body type is required'],
    enum: ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'MPV', 'Pickup', 'Wagon', 'Electric']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true,
    maxlength: [50, 'Color cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Pricing
  regularPrice: {
    type: Number,
    required: [true, 'Regular price is required'],
    min: [0, 'Price must be positive']
  },
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Price must be positive']
  },
  onRoadPrice: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  emiStartingFrom: {
    type: Number,
    min: [0, 'EMI must be positive']
  },

  // Technical Specifications
  km: {
    type: Number,
    required: [true, 'Kilometers driven is required'],
    min: [0, 'Kilometers must be positive']
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG']
  },
  transmission: {
    type: String,
    required: [true, 'Transmission is required'],
    enum: ['MANUAL', 'AUTOMATIC', 'CVT', 'DCT']
  },
  engine: {
    type: String,
    trim: true,
    maxlength: [100, 'Engine description cannot exceed 100 characters']
  },
  mileage: {
    type: String,
    trim: true,
    maxlength: [50, 'Mileage cannot exceed 50 characters']
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'Must have at least 1 seat'],
    max: [20, 'Cannot exceed 20 seats']
  },
  ownership: {
    type: Number,
    required: [true, 'Ownership is required'],
    min: [1, 'Ownership must be at least 1'],
    max: [10, 'Ownership cannot exceed 10']
  },
  driveType: {
    type: String,
    enum: ['FWD', 'RWD', 'AWD', '4WD']
  },
  sellerType: {
    type: String,
    required: [true, 'Seller type is required'],
    enum: ['INDIVIDUAL', 'DEALER', 'COMPANY']
  },

  // Location & Insurance
  registrationCity: {
    type: String,
    required: [true, 'Registration city is required'],
    trim: true,
    maxlength: [100, 'City cannot exceed 100 characters']
  },
  registrationState: {
    type: String,
    required: [true, 'Registration state is required'],
    trim: true,
    maxlength: [100, 'State cannot exceed 100 characters']
  },
  insurance: {
    type: String,
    enum: ['COMPREHENSIVE', 'THIRD_PARTY', 'ZERO_DEP']
  },

  // Status & Metadata
  status: {
    type: String,
    required: true,
    enum: Object.values(CarStatus),
    default: CarStatus.AVAILABLE
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  // Images
  primaryImage: CarImageSchema,
  images: [CarImageSchema],

  // Relations
  features: [CarFeatureSchema],
  specifications: [CarSpecificationSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
CarSchema.index({ brand: 1, carModel: 1 });
CarSchema.index({ status: 1, isFeatured: 1 });
CarSchema.index({ slug: 1 });
CarSchema.index({ fuelType: 1, transmission: 1, bodyType: 1 });
CarSchema.index({ regularPrice: 1, salePrice: 1 });
CarSchema.index({ year: 1, km: 1 });
CarSchema.index({ createdAt: -1 });

// Virtual for discount calculation
CarSchema.virtual('discountPercentage').get(function(this: any) {
  if (this.regularPrice && this.salePrice) {
    return Math.round(((this.regularPrice - this.salePrice) / this.regularPrice) * 100);
  }
  return 0;
});

// Pre-save middleware for slug generation
CarSchema.pre('save', function(this: any, next: any) {
  // Generate slug if it doesn't exist or if title is modified
  if (!this.slug || this.isModified('title')) {
    // Generate slug from title only
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim(); // Remove leading/trailing hyphens
    
    // Add random suffix for uniqueness
    const random = Math.random().toString(36).substring(2, 8);
    this.slug = `${base}-${random}`;
  }
  next();
});

export const Car = mongoose.model<ICar>('Car', CarSchema);
