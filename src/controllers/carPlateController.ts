import { Response } from 'express';
import { CarPlate, ICarPlate } from '../models/CarPlate';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { IAuthRequest } from '../types';
import { createCarPlateNotification } from './notificationController';

// Get all car plates
export const getAllCarPlates = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      state,
      district,
      rtoCode,
      vehicleType,
      search,
      isValid
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }

    if (district) {
      filter.district = { $regex: district, $options: 'i' };
    }

    if (rtoCode) {
      filter.rtoCode = rtoCode.toString().toUpperCase();
    }

    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    if (search) {
      filter.$or = [
        { plateNumber: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { rtoCode: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } }
      ];
    }

    if (isValid !== undefined) {
      filter.isValid = isValid === 'true';
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const carPlates = await CarPlate.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await CarPlate.countDocuments(filter);

    res.status(200).json(createSuccessResponse('Car plates retrieved successfully', {
      carPlates,
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
    res.status(500).json(createErrorResponse('Failed to retrieve car plates', error.message));
  }
};

// Get car plate by ID
export const getCarPlateById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const carPlate = await CarPlate.findById(id);

    if (!carPlate) {
      res.status(404).json(createErrorResponse('Car plate not found'));
      return;
    }

    res.status(200).json(createSuccessResponse('Car plate retrieved successfully', carPlate));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve car plate', error.message));
  }
};

// Create car plate
export const createCarPlate = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { plateNumber } = req.body;

    // Validate plate number format
    const plateNumberUpper = plateNumber.toUpperCase().trim();
    
    // Indian Vehicle Number Plate Formats
    const validPatterns = [
      /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, // GJ01NX1234
      /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$/, // GJ01N1234
      /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{3}$/, // GJ01N123 (older format)
      /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/, // GJ01AB123
      /^[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{4}$/, // GJ01ABC1234 (rare)
    ];

    const isValidFormat = validPatterns.some(pattern => pattern.test(plateNumberUpper));
    
    if (!isValidFormat) {
      res.status(400).json(createErrorResponse(
        'Invalid vehicle number plate format. Please use a valid Indian format like: GJ01NX1234, GJ01N1234, MH12AB1234'
      ));
      return;
    }

    // Check if plate number already exists
    const existingPlate = await CarPlate.findOne({ plateNumber: plateNumberUpper });
    if (existingPlate) {
      res.status(400).json(createErrorResponse('Plate number already exists'));
      return;
    }

    const carPlate = new CarPlate({
      plateNumber: plateNumberUpper
    });

    await carPlate.save();

    // Create notification for new car plate detection with full details
    try {
      await createCarPlateNotification(carPlate.plateNumber, req.user?._id, carPlate);
    } catch (notificationError) {
      console.error('Failed to create car plate notification:', notificationError);
      // Continue with the response even if notification fails
    }

    res.status(201).json(createSuccessResponse('Car plate created successfully', carPlate));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to create car plate', error.message));
  }
};

// Update car plate
export const updateCarPlate = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const carPlate = await CarPlate.findById(id);

    if (!carPlate) {
      res.status(404).json(createErrorResponse('Car plate not found'));
      return;
    }

    // If updating plate number, check for duplicates
    if (updates.plateNumber && updates.plateNumber !== carPlate.plateNumber) {
      const existingPlate = await CarPlate.findOne({ 
        plateNumber: updates.plateNumber.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingPlate) {
        res.status(400).json(createErrorResponse('Plate number already exists'));
        return;
      }
      updates.plateNumber = updates.plateNumber.toUpperCase();
    }

    // Update RTO code if plate number is updated
    if (updates.plateNumber) {
      const match = updates.plateNumber.match(/^([A-Z]{2})([0-9]{2})/);
      if (match) {
        updates.rtoCode = match[1] + match[2];
      }
    }

    const updatedCarPlate = await CarPlate.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json(createSuccessResponse('Car plate updated successfully', updatedCarPlate));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to update car plate', error.message));
  }
};

// Delete car plate
export const deleteCarPlate = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const carPlate = await CarPlate.findById(id);

    if (!carPlate) {
      res.status(404).json(createErrorResponse('Car plate not found'));
      return;
    }

    await CarPlate.findByIdAndDelete(id);

    res.status(200).json(createSuccessResponse('Car plate deleted successfully', carPlate));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete car plate', error.message));
  }
};

// Validate car plate number
export const validateCarPlate = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { plateNumber } = req.body;

    if (!plateNumber) {
      res.status(400).json(createErrorResponse('Plate number is required'));
      return;
    }

    const plateNumberUpper = plateNumber.toUpperCase().trim();

    // Indian Vehicle Number Plate Formats
    const validPatterns = [
      /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, // GJ01NX1234
      /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$/, // GJ01N1234
      /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{3}$/, // GJ01N123 (older format)
      /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/, // GJ01AB123
      /^[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{4}$/, // GJ01ABC1234 (rare)
    ];

    const isValidFormat = validPatterns.some(pattern => pattern.test(plateNumberUpper));
    
    // Detect format type
    let formatType = 'unknown';
    if (/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(plateNumberUpper)) {
      formatType = 'standard_private'; // GJ01NX1234
    } else if (/^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$/.test(plateNumberUpper)) {
      formatType = 'two_wheeler'; // GJ01E1234
    } else if (/^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{3}$/.test(plateNumberUpper)) {
      formatType = 'old_format'; // GJ01N123
    } else if (/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$/.test(plateNumberUpper)) {
      formatType = 'short_commercial'; // GJ01AB123
    } else if (/^[A-Z]{2}[0-9]{2}[A-Z]{3}[0-9]{4}$/.test(plateNumberUpper)) {
      formatType = 'extended'; // GJ01ABC1234
    }

    // Extract RTO code
    const match = plateNumberUpper.match(/^([A-Z]{2})([0-9]{2})/);
    const rtoCode = match ? match[1] + match[2] : null;

    // Check if already exists
    const existingPlate = await CarPlate.findOne({ 
      plateNumber: plateNumberUpper 
    });

    res.status(200).json(createSuccessResponse('Plate validation completed', {
      plateNumber: plateNumberUpper,
      isValidFormat,
      formatType,
      rtoCode,
      alreadyExists: !!existingPlate,
      existingPlate: existingPlate || null,
      supportedFormats: [
        'GJ01NX1234 (Standard Private)',
        'GJ01N1234 (Two Wheeler)',
        'GJ01N123 (Old Format)',
        'GJ01AB123 (Short Commercial)',
        'GJ01ABC1234 (Extended)'
      ]
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to validate plate number', error.message));
  }
};

// Get car plates by RTO code
export const getCarPlatesByRTO = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { rtoCode } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const carPlates = await CarPlate.find({ 
      rtoCode: rtoCode.toUpperCase() 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await CarPlate.countDocuments({ 
      rtoCode: rtoCode.toUpperCase() 
    });

    res.status(200).json(createSuccessResponse('Car plates retrieved successfully', {
      carPlates,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve car plates', error.message));
  }
};
