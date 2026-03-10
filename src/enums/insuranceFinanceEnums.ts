/**
 * Car plate number information
 */
export interface ICarPlateInfo {
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

/**
 * Insurance coverage types enumeration
 */
export enum InsuranceCoverageType {
  LIABILITY = 'liability',
  COLLISION = 'collision',
  COMPREHENSIVE = 'comprehensive',
  PERSONAL_INJURY = 'personal-injury',
  PROPERTY_DAMAGE = 'property-damage',
  UNINSURED_MOTORIST = 'uninsured-motorist',
  MEDICAL_PAYMENTS = 'medical-payments',
  GAP_COVERAGE = 'gap-coverage',
  ROADSIDE_ASSISTANCE = 'roadside-assistance',
  RENTAL_REIMBURSEMENT = 'rental-reimbursement',
  CUSTOM_EQUIPMENT = 'custom-equipment',
  NEW_CAR_REPLACEMENT = 'new-car-replacement'
}

/**
 * Insurance coverage type labels for display
 */
export const InsuranceCoverageTypeLabels: Record<InsuranceCoverageType, string> = {
  [InsuranceCoverageType.LIABILITY]: 'Liability Coverage',
  [InsuranceCoverageType.COLLISION]: 'Collision Coverage',
  [InsuranceCoverageType.COMPREHENSIVE]: 'Comprehensive Coverage',
  [InsuranceCoverageType.PERSONAL_INJURY]: 'Personal Injury Protection',
  [InsuranceCoverageType.PROPERTY_DAMAGE]: 'Property Damage Liability',
  [InsuranceCoverageType.UNINSURED_MOTORIST]: 'Uninsured Motorist Coverage',
  [InsuranceCoverageType.MEDICAL_PAYMENTS]: 'Medical Payments Coverage',
  [InsuranceCoverageType.GAP_COVERAGE]: 'Gap Coverage',
  [InsuranceCoverageType.ROADSIDE_ASSISTANCE]: 'Roadside Assistance',
  [InsuranceCoverageType.RENTAL_REIMBURSEMENT]: 'Rental Reimbursement',
  [InsuranceCoverageType.CUSTOM_EQUIPMENT]: 'Custom Equipment Coverage',
  [InsuranceCoverageType.NEW_CAR_REPLACEMENT]: 'New Car Replacement'
};

/**
 * Insurance type enumeration
 */
export enum InsuranceType {
  THIRD_PARTY = 'third-party',
  COMPREHENSIVE = 'comprehensive',
  COLLISION_ONLY = 'collision-only',
  LIABILITY_ONLY = 'liability-only',
  FULL_COVERAGE = 'full-coverage'
}

/**
 * Insurance type labels for display
 */
export const InsuranceTypeLabels: Record<InsuranceType, string> = {
  [InsuranceType.THIRD_PARTY]: 'Third Party Insurance',
  [InsuranceType.COMPREHENSIVE]: 'Comprehensive Insurance',
  [InsuranceType.COLLISION_ONLY]: 'Collision Only',
  [InsuranceType.LIABILITY_ONLY]: 'Liability Only',
  [InsuranceType.FULL_COVERAGE]: 'Full Coverage'
};

/**
 * Finance type enumeration
 */
export enum FinanceType {
  CAR_LOAN = 'car-loan',
  PERSONAL_LOAN = 'personal-loan',
  BUSINESS_LOAN = 'business-loan',
  LEASE_FINANCING = 'lease-financing',
  REFINANCING = 'refinancing',
  BALLOON_FINANCING = 'balloon-financing',
  NO_COST_EMI = 'no-cost-emi',
  ZERO_DOWN_PAYMENT = 'zero-down-payment'
}

/**
 * Finance type labels for display
 */
export const FinanceTypeLabels: Record<FinanceType, string> = {
  [FinanceType.CAR_LOAN]: 'Car Loan',
  [FinanceType.PERSONAL_LOAN]: 'Personal Loan',
  [FinanceType.BUSINESS_LOAN]: 'Business Loan',
  [FinanceType.LEASE_FINANCING]: 'Lease Financing',
  [FinanceType.REFINANCING]: 'Refinancing',
  [FinanceType.BALLOON_FINANCING]: 'Balloon Financing',
  [FinanceType.NO_COST_EMI]: 'No Cost EMI',
  [FinanceType.ZERO_DOWN_PAYMENT]: 'Zero Down Payment'
};

/**
 * Insurance company status enumeration
 */
export enum InsuranceCompanyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PARTNER = 'partner',
  PREMIUM = 'premium'
}

/**
 * Insurance company status labels for display
 */
export const InsuranceCompanyStatusLabels: Record<InsuranceCompanyStatus, string> = {
  [InsuranceCompanyStatus.ACTIVE]: 'Active',
  [InsuranceCompanyStatus.INACTIVE]: 'Inactive',
  [InsuranceCompanyStatus.PARTNER]: 'Partner',
  [InsuranceCompanyStatus.PREMIUM]: 'Premium'
};

/**
 * Finance status enumeration
 */
export enum FinanceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  PRE_APPROVED = 'pre-approved'
}

/**
 * Finance status labels for display
 */
export const FinanceStatusLabels: Record<FinanceStatus, string> = {
  [FinanceStatus.PENDING]: 'Pending',
  [FinanceStatus.APPROVED]: 'Approved',
  [FinanceStatus.REJECTED]: 'Rejected',
  [FinanceStatus.ACTIVE]: 'Active',
  [FinanceStatus.COMPLETED]: 'Completed',
  [FinanceStatus.DEFAULTED]: 'Defaulted',
  [FinanceStatus.PRE_APPROVED]: 'Pre-Approved'
};
