import { Response } from 'express';
import { InsuranceCompany, IInsuranceCompany } from '../models/InsuranceCompany';
import { FinanceOption, IFinanceOption } from '../models/FinanceOption';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { IAuthRequest } from '../types';
import { cloudinaryUpload, cloudinaryDelete } from '../services/cloudinaryService';

// Insurance Company Controllers

// Get all insurance companies
export const getAllInsuranceCompanies = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      insuranceType,
      coverageType,
      search,
      isPremiumPartner
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (insuranceType) {
      filter.insuranceTypes = insuranceType;
    }

    if (coverageType) {
      filter.coverageTypes = coverageType;
    }

    if (isPremiumPartner !== undefined) {
      filter.isPremiumPartner = isPremiumPartner === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const companies = await InsuranceCompany.find(filter)
      .sort({ isPremiumPartner: -1, name: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await InsuranceCompany.countDocuments(filter);

    res.status(200).json(createSuccessResponse('Insurance companies retrieved successfully', {
      companies,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve insurance companies', error.message));
  }
};

// Get insurance company by ID
export const getInsuranceCompanyById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await InsuranceCompany.findById(id);

    if (!company) {
      res.status(404).json(createErrorResponse('Insurance company not found'));
      return;
    }

    res.status(200).json(createSuccessResponse('Insurance company retrieved successfully', company));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve insurance company', error.message));
  }
};

// Create insurance company
export const createInsuranceCompany = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      contactNumber,
      email,
      website,
      address,
      gstNumber,
      licenseNumber,
      coverageTypes,
      insuranceTypes,
      emiStartPrice,
      minCoverageAmount,
      maxCoverageAmount,
      status,
      isPremiumPartner,
      features
    } = req.body;

    // Handle image upload
    let logoData;
    if (req.file) {
      try {
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'insurance-logos');
        logoData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: `${name} logo` // Use company name as alt text
        };
      } catch (uploadError: any) {
        res.status(400).json(createErrorResponse('Failed to upload logo', uploadError.message));
        return;
      }
    }

    // Prepare company data
    const companyData: any = {
      name,
      description,
      contactNumber,
      email,
      website,
      address,
      gstNumber,
      licenseNumber,
      coverageTypes,
      insuranceTypes,
      emiStartPrice,
      minCoverageAmount,
      maxCoverageAmount,
      status: status || 'active',
      isPremiumPartner: isPremiumPartner || false,
      features
    };

    // Only add logo if it exists
    if (logoData) {
      companyData.logo = logoData;
    }

    const company = new InsuranceCompany(companyData);

    await company.save();

    res.status(201).json(createSuccessResponse('Insurance company created successfully', company));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to create insurance company', error.message));
  }
};

// Update insurance company
export const updateInsuranceCompany = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const company = await InsuranceCompany.findById(id);

    if (!company) {
      res.status(404).json(createErrorResponse('Insurance company not found'));
      return;
    }

    // Handle image upload
    if (req.file) {
      try {
        // Delete old logo if it exists
        if (company.logo && company.logo.publicId) {
          await cloudinaryDelete(company.logo.publicId);
        }
        
        // Upload new logo
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'insurance-logos');
        updates.logo = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: `${company.name} logo` // Use company name as alt text
        };
      } catch (uploadError: any) {
        res.status(400).json(createErrorResponse('Failed to upload logo', uploadError.message));
        return;
      }
    }

    const updatedCompany = await InsuranceCompany.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(createSuccessResponse('Insurance company updated successfully', updatedCompany));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to update insurance company', error.message));
  }
};

// Delete insurance company
export const deleteInsuranceCompany = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await InsuranceCompany.findById(id);

    if (!company) {
      res.status(404).json(createErrorResponse('Insurance company not found'));
      return;
    }

    // Delete logo from Cloudinary if it exists
    if (company.logo && company.logo.publicId) {
      await cloudinaryDelete(company.logo.publicId);
    }

    await InsuranceCompany.findByIdAndDelete(id);

    res.status(200).json(createSuccessResponse('Insurance company deleted successfully', company));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete insurance company', error.message));
  }
};

// Get insurance companies by coverage type
export const getInsuranceCompaniesByCoverage = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { coverageType } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const companies = await InsuranceCompany.find({ 
      coverageTypes: coverageType 
    })
      .sort({ isPremiumPartner: -1, name: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await InsuranceCompany.countDocuments({ 
      coverageTypes: coverageType 
    });

    res.status(200).json(createSuccessResponse('Insurance companies retrieved successfully', {
      companies,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve insurance companies', error.message));
  }
};

// Finance Option Controllers

// Get all finance options
export const getAllFinanceOptions = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      financeType,
      status,
      search,
      isPopular,
      minLoanAmount,
      maxInterestRate
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (financeType) {
      filter.financeType = financeType;
    }

    if (status) {
      filter.status = status;
    }

    if (isPopular !== undefined) {
      filter.isPopular = isPopular === 'true';
    }

    if (search) {
      filter.$or = [
        { bankName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (minLoanAmount) {
      filter.minLoanAmount = { $lte: parseInt(minLoanAmount as string) };
    }

    if (maxInterestRate) {
      filter.interestRate = { $lte: parseFloat(maxInterestRate as string) };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const options = await FinanceOption.find(filter)
      .sort({ isPopular: -1, interestRate: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await FinanceOption.countDocuments(filter);

    res.status(200).json(createSuccessResponse('Finance options retrieved successfully', {
      options,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve finance options', error.message));
  }
};

// Get finance option by ID
export const getFinanceOptionById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const option = await FinanceOption.findById(id);

    if (!option) {
      res.status(404).json(createErrorResponse('Finance option not found'));
      return;
    }

    res.status(200).json(createSuccessResponse('Finance option retrieved successfully', option));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve finance option', error.message));
  }
};

// Create finance option
export const createFinanceOption = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      bankName,
      description,
      financeType,
      interestRate,
      processingFee,
      minLoanAmount,
      maxLoanAmount,
      minTenure,
      maxTenure,
      emiStartPrice,
      eligibilityCriteria,
      documentsRequired,
      features,
      status,
      isPopular,
      contactNumber,
      email,
      website,
      preApprovalAvailable,
      instantDisbursement
    } = req.body;

    // Handle image upload
    let logoData;
    if (req.file) {
      try {
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'finance-logos');
        logoData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: `${bankName} logo` // Use bank name as alt text
        };
      } catch (uploadError: any) {
        res.status(400).json(createErrorResponse('Failed to upload logo', uploadError.message));
        return;
      }
    }

    // Prepare finance option data
    const optionData: any = {
      bankName,
      description,
      financeType,
      interestRate,
      processingFee,
      minLoanAmount,
      maxLoanAmount,
      minTenure,
      maxTenure,
      emiStartPrice,
      eligibilityCriteria,
      documentsRequired,
      features,
      status: status || 'active',
      isPopular: isPopular || false,
      contactNumber,
      email,
      website,
      preApprovalAvailable: preApprovalAvailable || false,
      instantDisbursement: instantDisbursement || false
    };

    // Only add logo if it exists
    if (logoData) {
      optionData.logo = logoData;
    }

    const option = new FinanceOption(optionData);

    await option.save();

    res.status(201).json(createSuccessResponse('Finance option created successfully', option));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to create finance option', error.message));
  }
};

// Update finance option
export const updateFinanceOption = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const option = await FinanceOption.findById(id);

    if (!option) {
      res.status(404).json(createErrorResponse('Finance option not found'));
      return;
    }

    // Handle image upload
    if (req.file) {
      try {
        // Delete old logo if it exists
        if (option.logo && option.logo.publicId) {
          await cloudinaryDelete(option.logo.publicId);
        }
        
        // Upload new logo
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'finance-logos');
        updates.logo = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: `${option.bankName} logo` // Use bank name as alt text
        };
      } catch (uploadError: any) {
        res.status(400).json(createErrorResponse('Failed to upload logo', uploadError.message));
        return;
      }
    }

    const updatedOption = await FinanceOption.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(createSuccessResponse('Finance option updated successfully', updatedOption));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to update finance option', error.message));
  }
};

// Delete finance option
export const deleteFinanceOption = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const option = await FinanceOption.findById(id);

    if (!option) {
      res.status(404).json(createErrorResponse('Finance option not found'));
      return;
    }

    // Delete logo from Cloudinary if it exists
    if (option.logo && option.logo.publicId) {
      await cloudinaryDelete(option.logo.publicId);
    }

    await FinanceOption.findByIdAndDelete(id);

    res.status(200).json(createSuccessResponse('Finance option deleted successfully', option));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete finance option', error.message));
  }
};

// Get finance options by type
export const getFinanceOptionsByType = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { financeType } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const options = await FinanceOption.find({ 
      financeType,
      status: 'active'
    })
      .sort({ isPopular: -1, interestRate: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await FinanceOption.countDocuments({ 
      financeType,
      status: 'active'
    });

    res.status(200).json(createSuccessResponse('Finance options retrieved successfully', {
      options,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve finance options', error.message));
  }
};
