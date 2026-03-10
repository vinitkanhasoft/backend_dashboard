import mongoose, { Document, Schema } from 'mongoose';

// Car Plate Number Interface
export interface ICarPlate extends Document {
  plateNumber: string;
  state: string;
  district: string;
  rtoCode: string;
  vehicleType: string;
  registrationDate?: Date;
  ownerName?: string;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Car Plate Schema
const CarPlateSchema = new Schema<ICarPlate>({
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    trim: true,
    uppercase: true,
    unique: true,
    match: [/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, 'Please provide a valid Indian car plate number (e.g., GJ01NX1234)']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
    maxlength: [100, 'District name cannot exceed 100 characters']
  },
  rtoCode: {
    type: String,
    required: [true, 'RTO code is required'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2}[0-9]{2}$/, 'Please provide a valid RTO code (e.g., GJ01)']
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['car', 'motorcycle', 'scooter', 'truck', 'bus', 'auto-rickshaw', 'tempo', 'tractor'],
    default: 'car'
  },
  registrationDate: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return !value || value <= new Date();
      },
      message: 'Registration date cannot be in the future'
    }
  },
  ownerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Owner name cannot exceed 100 characters']
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
CarPlateSchema.index({ plateNumber: 1 }, { unique: true });
CarPlateSchema.index({ state: 1 });
CarPlateSchema.index({ district: 1 });
CarPlateSchema.index({ rtoCode: 1 });
CarPlateSchema.index({ vehicleType: 1 });
CarPlateSchema.index({ isValid: 1 });

// Virtual for formatted plate number
CarPlateSchema.virtual('formattedPlateNumber').get(function() {
  return this.plateNumber.replace(/([A-Z]{2})([0-9]{2})([A-Z]{2})([0-9]{4})/, '$1-$2 $3-$4');
});

// Virtual for age of vehicle
CarPlateSchema.virtual('vehicleAge').get(function() {
  if (!this.registrationDate) return null;
  const now = new Date();
  const regDate = new Date(this.registrationDate);
  const years = now.getFullYear() - regDate.getFullYear();
  const months = now.getMonth() - regDate.getMonth();
  return years + (months < 0 ? -1 : 0);
});

// Virtual for registration year
CarPlateSchema.virtual('registrationYear').get(function() {
  return this.registrationDate ? this.registrationDate.getFullYear() : null;
});

export const CarPlate = mongoose.model<ICarPlate>('CarPlate', CarPlateSchema);
