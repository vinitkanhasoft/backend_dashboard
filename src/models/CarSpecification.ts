import mongoose, { Document, Schema } from 'mongoose';

export interface ICarSpecification extends Document {
  carId: mongoose.Types.ObjectId;
  specifications: Record<string, boolean>; // Object with all specifications
  category?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarSpecificationSchema = new Schema<ICarSpecification>({
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car ID is required'],
    index: true
  },
  specifications: {
    type: Schema.Types.Mixed, // Store as object
    required: [true, 'Specifications object is required'],
    default: {}
  },
  category: {
    type: String,
    trim: true,
    enum: ['engine', 'transmission', 'safety', 'comfort', 'technology', 'performance', 'exterior', 'interior']
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
CarSpecificationSchema.index({ carId: 1 });
CarSpecificationSchema.index({ category: 1 });

export const CarSpecification = mongoose.model<ICarSpecification>('CarSpecification', CarSpecificationSchema);
