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
  plateFormat: string;
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
    validate: {
      validator: function(plateNumber: string) {
        // Indian Vehicle Number Plate Formats:
        // 1. Standard Private: GJ01NX1234 (2 letters + 2 digits + 2 letters + 4 digits)
        // 2. Old Format: GJ-01-N-1234 (2 letters + 2 digits + 1 letter + 4 digits)
        // 3. Commercial: GJ01AB1234 (2 letters + 2 digits + 2 letters + 4 digits)
        // 4. Two Wheeler: GJ01E1234 (2 letters + 2 digits + 1 letter + 4 digits)
        // 5. New BS4 Format: GJ01AX1234 (2 letters + 2 digits + 2 letters + 4 digits)
        
        const patterns = [
          /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, // GJ01NX1234
          /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$/, // GJ01N1234
          /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{3}$/, // GJ01N123 (older format)
          /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/, // GJ01AB123
          /^[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{4}$/, // GJ01ABC1234 (rare)
        ];
        
        return patterns.some(pattern => pattern.test(plateNumber));
      },
      message: 'Please provide a valid Indian vehicle number plate format (e.g., GJ01NX1234, GJ01N1234, MH12AB1234)'
    }
  },
  state: {
    type: String,
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters'],
    default: null
  },
  district: {
    type: String,
    trim: true,
    maxlength: [100, 'District name cannot exceed 100 characters'],
    default: null
  },
  rtoCode: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2}[0-9]{2}$/, 'Please provide a valid RTO code (e.g., GJ01)'],
    default: null
  },
  vehicleType: {
    type: String,
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
    },
    default: null
  },
  ownerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Owner name cannot exceed 100 characters'],
    default: null
  },
  isValid: {
    type: Boolean,
    default: true
  },
  plateFormat: {
    type: String,
    required: true,
    default: 'standard'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
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

// Pre-save middleware to detect plate format
CarPlateSchema.pre('save', function(next) {
  if (this.plateNumber) {
    // Detect plate format
    if (/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(this.plateNumber)) {
      this.plateFormat = 'standard_private'; // GJ01NX1234
    } else if (/^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$/.test(this.plateNumber)) {
      this.plateFormat = 'two_wheeler'; // GJ01E1234
    } else if (/^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{3}$/.test(this.plateNumber)) {
      this.plateFormat = 'old_format'; // GJ01N123
    } else if (/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/.test(this.plateNumber)) {
      this.plateFormat = 'short_commercial'; // GJ01AB123
    } else if (/^[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{4}$/.test(this.plateNumber)) {
      this.plateFormat = 'extended'; // GJ01ABC1234
    } else {
      this.plateFormat = 'unknown';
    }
  }
  next();
});

export const CarPlate = mongoose.model<ICarPlate>('CarPlate', CarPlateSchema);
