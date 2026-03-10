/**
 * Team member position enumeration
 */
export enum TeamPosition {
  FOUNDER = 'founder',
  CO_FOUNDER = 'co-founder',
  HEAD_OF_OPERATIONS = 'head-of-operations',
  SENIOR_CAR_EXPERT = 'senior-car-expert',
  CUSTOMER_RELATIONS = 'customer-relations',
  FI_SPECIALIST = 'fi-specialist',
  MARKETING_HEAD = 'marketing-head',
  SALES_MANAGER = 'sales-manager',
  TECHNICAL_DIRECTOR = 'technical-director',
  BUSINESS_DEVELOPMENT = 'business-development',
  HR_MANAGER = 'hr-manager',
  FINANCE_MANAGER = 'finance-manager'
}

/**
 * Team member position labels for display
 */
export const TeamPositionLabels: Record<TeamPosition, string> = {
  [TeamPosition.FOUNDER]: 'Founder',
  [TeamPosition.CO_FOUNDER]: 'Co-Founder',
  [TeamPosition.HEAD_OF_OPERATIONS]: 'Head of Operations',
  [TeamPosition.SENIOR_CAR_EXPERT]: 'Senior Car Expert',
  [TeamPosition.CUSTOMER_RELATIONS]: 'Customer Relations',
  [TeamPosition.FI_SPECIALIST]: 'FI Specialist',
  [TeamPosition.MARKETING_HEAD]: 'Marketing Head',
  [TeamPosition.SALES_MANAGER]: 'Sales Manager',
  [TeamPosition.TECHNICAL_DIRECTOR]: 'Technical Director',
  [TeamPosition.BUSINESS_DEVELOPMENT]: 'Business Development',
  [TeamPosition.HR_MANAGER]: 'HR Manager',
  [TeamPosition.FINANCE_MANAGER]: 'Finance Manager'
};

/**
 * Team member tags enumeration
 */
export enum TeamMemberTag {
  CAR_VALUATION = 'car-valuation',
  CUSTOMER_TRUST = 'customer-trust',
  QUALITY_CHECK = 'quality-check',
  LOGISTICS = 'logistics',
  TECHNICAL = 'technical',
  CERTIFICATION = 'certification',
  SUPPORT = 'support',
  TEST_DRIVE = 'test-drive',
  LOANS = 'loans',
  INSURANCE = 'insurance',
  DIGITAL = 'digital',
  SALES = 'sales',
  MARKETING = 'marketing',
  FINANCE = 'finance',
  OPERATIONS = 'operations'
}

/**
 * Team member tag labels for display
 */
export const TeamMemberTagLabels: Record<TeamMemberTag, string> = {
  [TeamMemberTag.CAR_VALUATION]: 'Car Valuation',
  [TeamMemberTag.CUSTOMER_TRUST]: 'Customer Trust',
  [TeamMemberTag.QUALITY_CHECK]: 'Quality Check',
  [TeamMemberTag.LOGISTICS]: 'Logistics',
  [TeamMemberTag.TECHNICAL]: 'Technical',
  [TeamMemberTag.CERTIFICATION]: 'Certification',
  [TeamMemberTag.SUPPORT]: 'Support',
  [TeamMemberTag.TEST_DRIVE]: 'Test Drive',
  [TeamMemberTag.LOANS]: 'Loans',
  [TeamMemberTag.INSURANCE]: 'Insurance',
  [TeamMemberTag.DIGITAL]: 'Digital',
  [TeamMemberTag.SALES]: 'Sales',
  [TeamMemberTag.MARKETING]: 'Marketing',
  [TeamMemberTag.FINANCE]: 'Finance',
  [TeamMemberTag.OPERATIONS]: 'Operations'
};

/**
 * Team member status enumeration
 */
export enum TeamMemberStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on-leave',
  PENDING = 'pending'
}

/**
 * Team member status labels for display
 */
export const TeamMemberStatusLabels: Record<TeamMemberStatus, string> = {
  [TeamMemberStatus.ACTIVE]: 'Active',
  [TeamMemberStatus.INACTIVE]: 'Inactive',
  [TeamMemberStatus.ON_LEAVE]: 'On Leave',
  [TeamMemberStatus.PENDING]: 'Pending'
};
