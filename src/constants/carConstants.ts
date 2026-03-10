// Feature Keys Configuration
export const FEATURE_KEYS = [
  "Sunroof", "Panoramic Sunroof", "Leather Seats", "Heated Seats",
  "Ventilated Seats", "Memory Seats", "Premium Sound System", "Navigation System",
  "Apple CarPlay", "Android Auto", "Wireless Charging", "Keyless Entry",
  "Push Button Start", "Remote Start", "Dual Zone Climate Control", "Rear AC Vents",
  "Cruise Control", "360° Camera", "Parking Sensors", "Blind Spot Monitoring",
  "Lane Keep Assist", "Adaptive Cruise Control", "Heads-Up Display", "Ambient Lighting",
  "Power Tailgate", "Heated Steering Wheel", "Auto Dimming Mirrors", "Rain Sensing Wipers",
  "Automatic Headlights", "LED Headlights", "Fog Lights", "Alloy Wheels",
  "Run Flat Tires", "Spare Wheel",
];

// Specification Keys Configuration
export const SPECIFICATION_KEYS = [
  "Turbo Engine", "Automatic Transmission", "All-Wheel Drive", "Leather Seats",
  "Sunroof", "Panoramic Sunroof", "Heated Seats", "Ventilated Seats",
  "Memory Seats", "Premium Sound System", "Navigation System", "Apple CarPlay",
  "Android Auto", "Wireless Charging", "Keyless Entry", "Push Button Start",
  "Remote Start", "Dual Zone Climate Control", "Rear AC Vents", "Cruise Control",
  "Adaptive Cruise Control", "360° Camera", "Parking Sensors", "Blind Spot Monitoring",
  "Lane Departure Warning", "Heads-Up Display", "Ambient Lighting", "Power Tailgate",
];

// Default feature and specification objects
export const DEFAULT_FEATURES = Object.fromEntries(
  FEATURE_KEYS.map(key => [key, false])
);

export const DEFAULT_SPECIFICATIONS = Object.fromEntries(
  SPECIFICATION_KEYS.map(key => [key, false])
);

// Validation constants
export const CAR_VALIDATION_RULES = {
  title: {
    minLength: 1,
    maxLength: 200,
    required: true
  },
  brand: {
    minLength: 1,
    maxLength: 100,
    required: true
  },
  carModel: {
    minLength: 1,
    maxLength: 100,
    required: true
  },
  year: {
    min: 1900,
    max: new Date().getFullYear() + 1,
    required: true
  },
  variant: {
    maxLength: 100,
    required: false
  },
  bodyType: {
    allowed: ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'MPV', 'Pickup', 'Wagon', 'Electric'],
    required: true
  },
  color: {
    minLength: 1,
    maxLength: 50,
    required: true
  },
  description: {
    minLength: 1,
    maxLength: 2000,
    required: true
  },
  regularPrice: {
    min: 0,
    required: true
  },
  salePrice: {
    min: 0,
    required: true
  },
  onRoadPrice: {
    min: 0,
    required: false
  },
  emiStartingFrom: {
    min: 0,
    required: false
  },
  km: {
    min: 0,
    required: true
  },
  fuelType: {
    allowed: ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG', 'LPG'],
    required: true
  },
  transmission: {
    allowed: ['MANUAL', 'AUTOMATIC', 'CVT', 'DCT'],
    required: true
  },
  engine: {
    maxLength: 100,
    required: false
  },
  mileage: {
    maxLength: 50,
    required: false
  },
  seats: {
    min: 1,
    max: 20,
    required: true
  },
  ownership: {
    min: 1,
    max: 10,
    required: true
  },
  driveType: {
    allowed: ['FWD', 'RWD', 'AWD', '4WD'],
    required: false
  },
  sellerType: {
    allowed: ['INDIVIDUAL', 'DEALER', 'COMPANY'],
    required: true
  },
  registrationCity: {
    minLength: 1,
    maxLength: 100,
    required: true
  },
  registrationState: {
    minLength: 1,
    maxLength: 100,
    required: true
  },
  insurance: {
    allowed: ['COMPREHENSIVE', 'THIRD_PARTY', 'ZERO_DEP'],
    required: false
  },
  status: {
    allowed: ['available', 'sold', 'reserved', 'maintenance'],
    required: false
  },
  isFeatured: {
    required: false
  }
};
