import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { uploadCompanyLogo } from '../middleware/upload';
import {
  // Insurance Company Controllers
  getAllInsuranceCompanies,
  getInsuranceCompanyById,
  createInsuranceCompany,
  updateInsuranceCompany,
  deleteInsuranceCompany,
  getInsuranceCompaniesByCoverage,
  // Finance Option Controllers
  getAllFinanceOptions,
  getFinanceOptionById,
  createFinanceOption,
  updateFinanceOption,
  deleteFinanceOption,
  getFinanceOptionsByType
} from '../controllers/insuranceFinanceController';
import { 
  InsuranceType, 
  InsuranceCoverageType, 
  FinanceType,
  InsuranceCompanyStatus,
  FinanceStatus 
} from '../enums/insuranceFinanceEnums';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';

const router = Router();

// Middleware to parse form-data arrays and JSON strings
const parseFormDataArrays = (req: any, res: any, next: any) => {
  if (req.is('multipart/form-data')) {
    // Parse coverageTypes if it's a string
    if (typeof req.body.coverageTypes === 'string') {
      try {
        req.body.coverageTypes = JSON.parse(req.body.coverageTypes);
      } catch (e) {
        req.body.coverageTypes = [];
      }
    }
    
    // Parse insuranceTypes if it's a string
    if (typeof req.body.insuranceTypes === 'string') {
      try {
        req.body.insuranceTypes = JSON.parse(req.body.insuranceTypes);
      } catch (e) {
        req.body.insuranceTypes = [];
      }
    }
    
    // Parse features if it's a string
    if (typeof req.body.features === 'string') {
      try {
        req.body.features = JSON.parse(req.body.features);
      } catch (e) {
        req.body.features = [];
      }
    }
    
    // Parse documentRequirements if it's a string
    if (typeof req.body.documentRequirements === 'string') {
      try {
        req.body.documentRequirements = JSON.parse(req.body.documentRequirements);
      } catch (e) {
        req.body.documentRequirements = [];
      }
    }
    
    // Parse specialFeatures if it's a string
    if (typeof req.body.specialFeatures === 'string') {
      try {
        req.body.specialFeatures = JSON.parse(req.body.specialFeatures);
      } catch (e) {
        req.body.specialFeatures = [];
      }
    }
    
    // Parse boolean fields
    if (typeof req.body.isPremiumPartner === 'string') {
      req.body.isPremiumPartner = req.body.isPremiumPartner === 'true';
    }
    if (typeof req.body.isPopular === 'string') {
      req.body.isPopular = req.body.isPopular === 'true';
    }
    if (typeof req.body.preApprovalAvailable === 'string') {
      req.body.preApprovalAvailable = req.body.preApprovalAvailable === 'true';
    }
    if (typeof req.body.instantDisbursement === 'string') {
      req.body.instantDisbursement = req.body.instantDisbursement === 'true';
    }
  }
  next();
};

// Validation middleware
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Insurance Company Validation
const validateInsuranceCompany = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('contactNumber')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid contact number'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('website')
    .optional()
    .trim()
    .custom((value: string) => {
      // Allow URLs with or without protocol
      const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
      if (!value) return true; // Optional field
      return urlPattern.test(value);
    })
    .withMessage('Please provide a valid website URL'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('gstNumber')
    .optional()
    .trim()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)
    .withMessage('Please provide a valid GST number'),
  body('licenseNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('License number cannot exceed 50 characters'),
  body('coverageTypes')
    .isArray({ min: 1 })
    .withMessage('At least one coverage type is required'),
  body('coverageTypes.*')
    .isIn(Object.values(InsuranceCoverageType))
    .withMessage(`Coverage type must be one of: ${Object.values(InsuranceCoverageType).join(', ')}`),
  body('insuranceTypes')
    .isArray({ min: 1 })
    .withMessage('At least one insurance type is required'),
  body('insuranceTypes.*')
    .isIn(Object.values(InsuranceType))
    .withMessage(`Insurance type must be one of: ${Object.values(InsuranceType).join(', ')}`),
  body('emiStartPrice')
    .isNumeric()
    .withMessage('EMI start price must be a number')
    .isFloat({ min: 0 })
    .withMessage('EMI start price must be a positive number'),
  body('minCoverageAmount')
    .isNumeric()
    .withMessage('Minimum coverage amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum coverage amount must be a positive number'),
  body('maxCoverageAmount')
    .isNumeric()
    .withMessage('Maximum coverage amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum coverage amount must be a positive number'),
  body('status')
    .optional()
    .isIn(Object.values(InsuranceCompanyStatus))
    .withMessage(`Status must be one of: ${Object.values(InsuranceCompanyStatus).join(', ')}`),
  body('isPremiumPartner')
    .optional()
    .isBoolean()
    .withMessage('isPremiumPartner must be a boolean'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('features.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Feature cannot exceed 100 characters')
];

// Finance Option Validation
const validateFinanceOption = [
  body('bankName')
    .trim()
    .notEmpty()
    .withMessage('Bank name is required')
    .isLength({ max: 200 })
    .withMessage('Bank name cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('financeType')
    .trim()
    .notEmpty()
    .withMessage('Finance type is required')
    .isIn(Object.values(FinanceType))
    .withMessage(`Finance type must be one of: ${Object.values(FinanceType).join(', ')}`),
  body('interestRate')
    .isNumeric()
    .withMessage('Interest rate must be a number')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Interest rate must be between 0 and 100'),
  body('processingFee')
    .optional()
    .isNumeric()
    .withMessage('Processing fee must be a number')
    .isFloat({ min: 0 })
    .withMessage('Processing fee must be a positive number'),
  body('minLoanAmount')
    .isNumeric()
    .withMessage('Minimum loan amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum loan amount must be a positive number'),
  body('maxLoanAmount')
    .isNumeric()
    .withMessage('Maximum loan amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum loan amount must be a positive number'),
  body('minTenure')
    .isNumeric()
    .withMessage('Minimum tenure must be a number')
    .isInt({ min: 1, max: 360 })
    .withMessage('Minimum tenure must be between 1 and 360 months'),
  body('maxTenure')
    .isNumeric()
    .withMessage('Maximum tenure must be a number')
    .isInt({ min: 1, max: 360 })
    .withMessage('Maximum tenure must be between 1 and 360 months'),
  body('emiStartPrice')
    .isNumeric()
    .withMessage('EMI start price must be a number')
    .isFloat({ min: 0 })
    .withMessage('EMI start price must be a positive number'),
  body('status')
    .optional()
    .isIn(Object.values(FinanceStatus))
    .withMessage(`Status must be one of: ${Object.values(FinanceStatus).join(', ')}`),
  body('isPopular')
    .optional()
    .isBoolean()
    .withMessage('isPopular must be a boolean'),
  body('contactNumber')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid contact number'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('website')
    .optional()
    .trim()
    .custom((value: string) => {
      // Allow URLs with or without protocol
      const urlPattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
      if (!value) return true; // Optional field
      return urlPattern.test(value);
    })
    .withMessage('Please provide a valid website URL'),
  body('preApprovalAvailable')
    .optional()
    .isBoolean()
    .withMessage('preApprovalAvailable must be a boolean'),
  body('instantDisbursement')
    .optional()
    .isBoolean()
    .withMessage('instantDisbursement must be a boolean'),
  body('documentsRequired')
    .optional()
    .isArray()
    .withMessage('Documents required must be an array'),
  body('documentsRequired.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Document name cannot exceed 100 characters'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('features.*')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Feature cannot exceed 200 characters')
];

// Query validation for get all
const validateGetInsuranceCompanies = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(Object.values(InsuranceCompanyStatus))
    .withMessage(`Status must be one of: ${Object.values(InsuranceCompanyStatus).join(', ')}`),
  query('insuranceType')
    .optional()
    .isIn(Object.values(InsuranceType))
    .withMessage(`Insurance type must be one of: ${Object.values(InsuranceType).join(', ')}`),
  query('coverageType')
    .optional()
    .isIn(Object.values(InsuranceCoverageType))
    .withMessage(`Coverage type must be one of: ${Object.values(InsuranceCoverageType).join(', ')}`),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('isPremiumPartner')
    .optional()
    .isBoolean()
    .withMessage('isPremiumPartner must be a boolean')
];

const validateGetFinanceOptions = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('financeType')
    .optional()
    .isIn(Object.values(FinanceType))
    .withMessage(`Finance type must be one of: ${Object.values(FinanceType).join(', ')}`),
  query('status')
    .optional()
    .isIn(Object.values(FinanceStatus))
    .withMessage(`Status must be one of: ${Object.values(FinanceStatus).join(', ')}`),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('isPopular')
    .optional()
    .isBoolean()
    .withMessage('isPopular must be a boolean'),
  query('minLoanAmount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum loan amount must be a positive integer'),
  query('maxInterestRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Maximum interest rate must be between 0 and 100')
];

// ID validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID')
];

// Coverage type validation
const validateCoverageType = [
  param('coverageType')
    .isIn(Object.values(InsuranceCoverageType))
    .withMessage(`Coverage type must be one of: ${Object.values(InsuranceCoverageType).join(', ')}`)
];

// Finance type validation
const validateFinanceTypeParam = [
  param('financeType')
    .isIn(Object.values(FinanceType))
    .withMessage(`Finance type must be one of: ${Object.values(FinanceType).join(', ')}`)
];

// Public routes
router.get('/insurance', validateGetInsuranceCompanies, handleValidationErrors, getAllInsuranceCompanies);
router.get('/insurance/coverage/:coverageType', validateCoverageType, handleValidationErrors, getInsuranceCompaniesByCoverage);
router.get('/finance', validateGetFinanceOptions, handleValidationErrors, getAllFinanceOptions);
router.get('/finance/type/:financeType', validateFinanceTypeParam, handleValidationErrors, getFinanceOptionsByType);

// Protected routes
router.use(authenticate);

// Insurance Company CRUD routes
router.get('/insurance/:id', validateId, handleValidationErrors, getInsuranceCompanyById);
router.post('/insurance', uploadCompanyLogo, parseFormDataArrays, validateInsuranceCompany, handleValidationErrors, createInsuranceCompany);
router.put('/insurance/:id', uploadCompanyLogo, parseFormDataArrays, validateInsuranceCompany, handleValidationErrors, updateInsuranceCompany);
router.delete('/insurance/:id', validateId, handleValidationErrors, deleteInsuranceCompany);

// Finance Option CRUD routes
router.get('/finance/:id', validateId, handleValidationErrors, getFinanceOptionById);
router.post('/finance', uploadCompanyLogo, parseFormDataArrays, validateFinanceOption, handleValidationErrors, createFinanceOption);
router.put('/finance/:id', uploadCompanyLogo, parseFormDataArrays, validateFinanceOption, handleValidationErrors, updateFinanceOption);
router.delete('/finance/:id', validateId, handleValidationErrors, deleteFinanceOption);

export default router;
