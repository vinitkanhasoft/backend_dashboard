import mongoose, { Document, Schema } from 'mongoose';

export interface ICarFeature extends Document {
  carId: mongoose.Types.ObjectId;
  features: Record<string, boolean>; // Object with all features
  category?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarFeatureSchema = new Schema<ICarFeature>({
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car ID is required'],
    index: true
  },
  features: {
    type: Schema.Types.Mixed, // Store as object
    required: [true, 'Features object is required'],
    default: {}
  },
  category: {
    type: String,
    trim: true,
    enum: ['safety', 'comfort', 'technology', 'entertainment', 'convenience', 'performance', 'exterior', 'interior']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient queries
CarFeatureSchema.index({ carId: 1 });
CarFeatureSchema.index({ category: 1 });

export const CarFeature = mongoose.model<ICarFeature>('CarFeature', CarFeatureSchema);
