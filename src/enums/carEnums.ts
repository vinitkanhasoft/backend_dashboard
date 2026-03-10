export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
  CNG = 'CNG',
  LPG = 'LPG',
  PLUGIN_HYBRID = 'PLUGIN_HYBRID',
  FUEL_CELL = 'FUEL_CELL'
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
  SEMI_AUTOMATIC = 'SEMI_AUTOMATIC',
  CVT = 'CVT',
  DUAL_CLUTCH = 'DUAL_CLUTCH',
  DIRECT_DRIVE = 'DIRECT_DRIVE'
}

export enum BodyType {
  SUV = 'SUV',
  SEDAN = 'SEDAN',
  HATCHBACK = 'HATCHBACK',
  COUPE = 'COUPE',
  CONVERTIBLE = 'CONVERTIBLE',
  MPV = 'MPV',
  PICKUP = 'PICKUP',
  WAGON = 'WAGON',
  ELECTRIC = 'ELECTRIC',
  CROSSOVER = 'CROSSOVER',
  ROADSTER = 'ROADSTER',
  MICROCAR = 'MICROCAR'
}

export enum CarStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  RESERVED = 'reserved',
}

export enum SellerType {
  INDIVIDUAL = 'INDIVIDUAL',
  DEALER = 'DEALER',
  COMPANY = 'COMPANY',
  BROKER = 'BROKER'
}

export enum InsuranceType {
  COMPREHENSIVE = 'COMPREHENSIVE',
  THIRD_PARTY = 'THIRD_PARTY',
  ZERO_DEPRECIATION = 'ZERO_DEPRECIATION',
  COLLISION = 'COLLISION',
  LIABILITY_ONLY = 'LIABILITY_ONLY'
}

export enum DriveType {
  FWD = 'FWD', // Front Wheel Drive
  RWD = 'RWD', // Rear Wheel Drive
  AWD = 'AWD', // All Wheel Drive
  FOUR_WD = '4WD', // Four Wheel Drive
  RWD_BASED_AWD = 'RWD_BASED_AWD', // Rear Wheel Based All Wheel Drive
}

export enum OwnershipType {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
  FIFTH_OR_MORE = 5
}

export enum FeatureCategory {
  SAFETY = 'safety',
  COMFORT = 'comfort',
  TECHNOLOGY = 'technology',
  ENTERTAINMENT = 'entertainment',
  CONVENIENCE = 'convenience',
  PERFORMANCE = 'performance',
  EXTERIOR = 'exterior',
  INTERIOR = 'interior'
}

export enum SpecificationCategory {
  ENGINE = 'engine',
  TRANSMISSION = 'transmission',
  SAFETY = 'safety',
  COMFORT = 'comfort',
  TECHNOLOGY = 'technology',
  PERFORMANCE = 'performance',
  EXTERIOR = 'exterior',
  INTERIOR = 'interior'
}

export enum SortBy {
  PRICE = 'price',
  DATE = 'date',
  MILEAGE = 'mileage',
  YEAR = 'year',
  BRAND = 'brand',
  MODEL = 'model',
  RELEVANCE = 'relevance',
  POPULARITY = 'popularity',
  DISCOUNT = 'discount'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export enum SearchIn {
  TITLE = 'title',
  BRAND = 'brand',
  MODEL = 'model',
  DESCRIPTION = 'description',
  ALL = 'all'
}

// Common car brands enum
export enum CarBrand {
  TOYOTA = 'Toyota',
  HONDA = 'Honda',
  MARUTI_SUZUKI = 'Maruti Suzuki',
  HYUNDAI = 'Hyundai',
  TATA = 'Tata',
  MAHINDRA = 'Mahindra',
  FORD = 'Ford',
  VOLKSWAGEN = 'Volkswagen',
  SKODA = 'Skoda',
  RENAULT = 'Renault',
  NISSAN = 'Nissan',
  KIA = 'Kia',
  MG = 'MG',
  JEEP = 'Jeep',
  MERCEDES_BENZ = 'Mercedes-Benz',
  BMW = 'BMW',
  AUDI = 'Audi',
  VOLVO = 'Volvo',
  JAGUAR = 'Jaguar',
  LAND_ROVER = 'Land Rover',
  PORSCHE = 'Porsche',
  LEXUS = 'Lexus',
  INFINITI = 'Infiniti',
  ACURA = 'Acura',
  CADILLAC = 'Cadillac',
  TESLA = 'Tesla',
  BYD = 'BYD',
  MAZDA = 'Mazda',
  MITSUBISHI = 'Mitsubishi',
  SUBARU = 'Subaru',
  MINI = 'Mini',
  FIAT = 'Fiat',
  ALFA_ROMEO = 'Alfa Romeo',
  MASERATI = 'Maserati',
  BENTLEY = 'Bentley',
  ROLLS_ROYCE = 'Rolls-Royce',
  FERRARI = 'Ferrari',
  LAMBORGHINI = 'Lamborghini',
  BUGATTI = 'Bugatti',
  ASTON_MARTIN = 'Aston Martin'
}

// Popular car models by brand
export enum CarModel {
  // Toyota
  CAMRY = 'Camry',
  COROLLA = 'Corolla',
  HIGHLANDER = 'Highlander',
  RAV4 = 'RAV4',
  PRIUS = 'Prius',
  INNOVA = 'Innova',
  FORTUNER = 'Fortuner',
  
  // Honda
  CITY = 'City',
  CIVIC = 'Civic',
  ACCORD = 'Accord',
  CR_V = 'CR-V',
  HR_V = 'HR-V',
  
  // Maruti Suzuki
  SWIFT = 'Swift',
  DZIRE = 'Dzire',
  BALENO = 'Baleno',
  VITARA_BREZZA = 'Vitara Brezza',
  ERTIGA = 'Ertiga',
  
  // Hyundai
  CRETA = 'Creta',
  VERNA = 'Verna',
  ELANTRA = 'Elantra',
  TUCSON = 'Tucson',
  SANTRO = 'Santro',
  I20 = 'i20',
  I10 = 'i10',
  
  // Tata
  NEXON = 'Nexon',
  HARRIER = 'Harrier',
  SAFARI = 'Safari',
  TIAGO = 'Tiago',
  PUNCH = 'Punch',
  
  // Mahindra
  SCORPIO = 'Scorpio',
  XUV700 = 'XUV700',
  THAR = 'Thar',
  BOLERO = 'Bolero',
  
  // Kia
  SELTOS = 'Seltos',
  SONET = 'Sonet',
  CARENS = 'Carnival',
  
  // Ford
  MUSTANG = 'Mustang',
  F_150 = 'F-150',
  ECOSPORT = 'EcoSport',
  
  // Volkswagen
  POLO = 'Polo',
  VENTO = 'Vento',
  JETTA = 'Jetta',
  PASSAT = 'Passat',
  TIGUAN = 'Tiguan',
  
  // Mercedes-Benz
  C_CLASS = 'C-Class',
  E_CLASS = 'E-Class',
  S_CLASS = 'S-Class',
  GLA = 'GLA',
  GLC = 'GLC',
  GLE = 'GLE',
  
  // BMW
  SERIES_3 = '3 Series',
  SERIES_5 = '5 Series',
  SERIES_7 = '7 Series',
  X1 = 'X1',
  X3 = 'X3',
  X5 = 'X5',
  
  // Tesla
  MODEL_3 = 'Model 3',
  MODEL_Y = 'Model Y',
  MODEL_S = 'Model S',
  MODEL_X = 'Model X'
}

// Color options
export enum CarColor {
  WHITE = 'White',
  BLACK = 'Black',
  SILVER = 'Silver',
  GREY = 'Grey',
  RED = 'Red',
  BLUE = 'Blue',
  GREEN = 'Green',
  YELLOW = 'Yellow',
  ORANGE = 'Orange',
  BROWN = 'Brown',
  BEIGE = 'Beige',
  GOLD = 'Gold',
  PEARL_WHITE = 'Pearl White',
  METALLIC_SILVER = 'Metallic Silver',
  MIDNIGHT_BLACK = 'Midnight Black',
  NAVY_BLUE = 'Navy Blue',
  BURGUNDY = 'Burgundy',
  CHAMPAGNE = 'Champagne',
  BRONZE = 'Bronze'
}

// Engine types
export enum EngineType {
  PETROL_NATURAL = 'Petrol (Natural)',
  PETROL_TURBO = 'Petrol (Turbo)',
  DIESEL_NATURAL = 'Diesel (Natural)',
  DIESEL_TURBO = 'Diesel (Turbo)',
  ELECTRIC_MOTOR = 'Electric Motor',
  HYBRID_SERIES = 'Hybrid (Series)',
  HYBRID_PARALLEL = 'Hybrid (Parallel)',
  HYBRID_PLUGIN = 'Hybrid (Plug-in)',
  HYDROGEN = 'Hydrogen',
  ROTARY = 'Rotary',
  WANKEL = 'Wankel'
}

// Seat capacity
export enum SeatCapacity {
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN_PLUS = 10
}

// Price ranges (in INR)
export enum PriceRange {
  UNDER_5_LAKH = 500000,
  UNDER_10_LAKH = 1000000,
  UNDER_15_LAKH = 1500000,
  UNDER_20_LAKH = 2000000,
  UNDER_25_LAKH = 2500000,
  UNDER_30_LAKH = 3000000,
  UNDER_40_LAKH = 4000000,
  UNDER_50_LAKH = 5000000,
  UNDER_75_LAKH = 7500000,
  UNDER_1_CRORE = 10000000,
  UNDER_2_CRORE = 20000000,
  ABOVE_2_CRORE = 20000001
}

// Mileage ranges (in km/l)
export enum MileageRange {
  UNDER_10 = 10,
  UNDER_15 = 15,
  UNDER_20 = 20,
  UNDER_25 = 25,
  UNDER_30 = 30,
  ABOVE_30 = 31
}

// Common features list
export const COMMON_FEATURES = {
  [FeatureCategory.SAFETY]: [
    'Airbags',
    'ABS',
    'EBD',
    'ESP',
    'Traction Control',
    'Hill Hold Assist',
    'Hill Descent Control',
    'Lane Keep Assist',
    'Lane Departure Warning',
    'Adaptive Cruise Control',
    'Blind Spot Monitoring',
    'Rear Cross Traffic Alert',
    'Forward Collision Warning',
    'Automatic Emergency Braking',
    'Parking Sensors',
    '360° Camera',
    'Tyre Pressure Monitoring',
    'ISOFIX Child Seat Mounts',
    'Seat Belt Pretensioners',
    'Whiplash Protection'
  ],
  [FeatureCategory.COMFORT]: [
    'Leather Seats',
    'Heated Seats',
    'Ventilated Seats',
    'Memory Seats',
    'Power Seats',
    'Lumbar Support',
    'Sunroof',
    'Moonroof',
    'Panoramic Sunroof',
    'Dual Zone Climate Control',
    'Tri Zone Climate Control',
    'Rear AC Vents',
    'Heated Steering Wheel',
    'Cooled Glove Box',
    'Auto Dimming Mirrors',
    'Rain Sensing Wipers',
    'Automatic Headlights',
    'Headlight Washers'
  ],
  [FeatureCategory.TECHNOLOGY]: [
    'Navigation System',
    'GPS',
    'Apple CarPlay',
    'Android Auto',
    'Wireless Charging',
    'USB Ports',
    'Bluetooth',
    'Wi-Fi Hotspot',
    'Voice Commands',
    'Touch Screen Display',
    'Digital Instrument Cluster',
    'Heads-Up Display',
    'Smartphone Integration',
    'Remote Start',
    'Keyless Entry',
    'Push Button Start',
    'Wireless Apple CarPlay',
    'Wireless Android Auto'
  ],
  [FeatureCategory.ENTERTAINMENT]: [
    'Premium Sound System',
    'Surround Sound',
    'Subwoofer',
    'Amplifier',
    'DVD Player',
    'Rear Entertainment System',
    'FM Radio',
    'AM Radio',
    'Satellite Radio',
    'Music Streaming',
    'Voice Recognition',
    'Audio Controls on Steering'
  ],
  [FeatureCategory.CONVENIENCE]: [
    'Cruise Control',
    'Adaptive Cruise Control',
    'Power Windows',
    'Power Door Locks',
    'Power Tailgate',
    'Power Mirrors',
    'Auto Folding Mirrors',
    'Parking Assist',
    'Auto Parking',
    'Remote Parking',
    'Gesture Control',
    'Ambient Lighting',
    'Mood Lighting',
    'Fridge',
    'Cool Box',
    'Cup Holders',
    'Bottle Holders'
  ],
  [FeatureCategory.PERFORMANCE]: [
    'Turbo Engine',
    'Supercharger',
    'Sport Mode',
    'Eco Mode',
    'Comfort Mode',
    'Snow Mode',
    'Off-Road Mode',
    'Launch Control',
    'Paddle Shifters',
    'Sport Suspension',
    'Adaptive Suspension',
    'Air Suspension',
    'Performance Exhaust',
    'Sport Exhaust',
    'Launch Control'
  ],
  [FeatureCategory.EXTERIOR]: [
    'Alloy Wheels',
    'Steel Wheels',
    'Chrome Grille',
    'Body Colored Bumpers',
    'Roof Rails',
    'Side Steps',
    'Running Boards',
    'Tinted Windows',
    'Sunroof',
    'Moonroof',
    'Panoramic Roof',
    'Spare Wheel',
    'Full Size Spare',
    'Space Saver Spare',
    'Tire Repair Kit'
  ],
  [FeatureCategory.INTERIOR]: [
    'Leather Upholstery',
    'Fabric Upholstery',
    'Synthetic Leather',
    'Wood Trim',
    'Carbon Fiber Trim',
    'Aluminum Trim',
    'Chrome Accents',
    'Ambient Lighting',
    'Mood Lighting',
    'Reading Lights',
    'Map Lights',
    'Vanity Mirrors',
    'Sun Visors',
    'Cargo Cover',
    'Cargo Net'
  ]
} as const;

// Common specifications list
export const COMMON_SPECIFICATIONS = {
  [SpecificationCategory.ENGINE]: [
    'Turbo Engine',
    'Supercharger',
    'Variable Valve Timing',
    'Direct Injection',
    'Multi-Point Injection',
    'Start-Stop System',
    'Cylinder Deactivation',
    'Hybrid System',
    'Electric Motor',
    'Battery Pack',
    'Range Extender'
  ],
  [SpecificationCategory.TRANSMISSION]: [
    'Automatic Transmission',
    'Manual Transmission',
    'CVT',
    'Dual Clutch',
    'Tiptronic',
    'Paddle Shifters',
    'Sport Mode',
    'Eco Mode',
    'Winter Mode'
  ],
  [SpecificationCategory.SAFETY]: [
    'Anti-Lock Braking System',
    'Electronic Brakeforce Distribution',
    'Electronic Stability Program',
    'Traction Control System',
    'Hill Start Assist',
    'Hill Descent Control',
    'Emergency Brake Assist',
    'Brake Override System'
  ],
  [SpecificationCategory.COMFORT]: [
    'Climate Control',
    'Automatic Climate Control',
    'Dual Zone Climate',
    'Tri Zone Climate',
    'Quad Zone Climate',
    'Air Purifier',
    'Air Quality Sensor',
    'Humidity Control'
  ],
  [SpecificationCategory.TECHNOLOGY]: [
    'Digital Display',
    'Touch Screen',
    'Voice Control',
    'Gesture Control',
    'Wireless Charging',
    'Fast Charging',
    'Over-The-Air Updates',
    'Remote Diagnostics'
  ],
  [SpecificationCategory.PERFORMANCE]: [
    'All-Wheel Drive',
    'Four-Wheel Drive',
    'Rear-Wheel Drive',
    'Front-Wheel Drive',
    'Limited Slip Differential',
    'Locking Differential',
    'Torque Vectoring',
    'Active Differential'
  ],
  [SpecificationCategory.EXTERIOR]: [
    'LED Headlights',
    'Xenon Headlights',
    'Halogen Headlights',
    'Laser Headlights',
    'Matrix Headlights',
    'Adaptive Headlights',
    'Cornering Lights',
    'LED Tail Lights',
    'LED Daytime Running Lights'
  ],
  [SpecificationCategory.INTERIOR]: [
    'Leather Seats',
    'Fabric Seats',
    'Synthetic Leather Seats',
    'Heated Seats',
    'Cooled Seats',
    'Massaging Seats',
    'Ventilated Seats',
    'Memory Seats',
    'Power Seats',
    'Manual Seats'
  ]
} as const;
