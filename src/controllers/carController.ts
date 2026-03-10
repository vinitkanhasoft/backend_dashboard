import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import { CarStatus } from '../enums/carEnums';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}
import { Car, ICar } from '../models/Car';
import { CarFeature } from '../models/CarFeature';
import { CarSpecification } from '../models/CarSpecification';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { cloudinaryUpload, cloudinaryDelete } from '../services/cloudinaryService';
import { FEATURE_KEYS, SPECIFICATION_KEYS, DEFAULT_FEATURES, DEFAULT_SPECIFICATIONS } from '../constants/carConstants';

// Define interfaces for better type safety
interface ICarFeature {
  name: string;
  available: boolean;
  category: string;
}

interface ICarSpecification {
  name: string;
  available: boolean;
  category: string;
}

interface ICarImage {
  url: string;
  publicId: string;
  alt: string;
}

// Create Car
export const createCar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      brand,
      carModel,
      year,
      variant,
      bodyType,
      color,
      description,
      regularPrice,
      salePrice,
      onRoadPrice,
      emiStartingFrom,
      km,
      fuelType,
      transmission,
      engine,
      mileage,
      seats,
      ownership,
      driveType,
      sellerType,
      registrationCity,
      registrationState,
      insurance,
      status = 'available',
      isFeatured = false,
      features,
      specifications
    } = req.body;

    // Validate required primary image
    if (!req.files || !(req.files as any).primaryImage) {
      res.status(400).json(createErrorResponse('Primary image is required'));
      return;
    }

    // Handle image uploads
    let primaryImage: ICarImage | undefined;
    let images: ICarImage[] = [];

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Handle primary image (required)
    if (files.primaryImage && files.primaryImage[0]) {
      try {
        const result = await cloudinaryUpload(files.primaryImage[0].buffer, 'cars');
        primaryImage = {
          url: result.secure_url,
          publicId: result.public_id,
          alt: `${title} - Primary Image`
        };
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload error:', cloudinaryError);
        if (cloudinaryError.message.includes('Cloudinary is not properly configured')) {
          res.status(500).json(createErrorResponse('Image upload service is not configured. Please contact administrator.'));
          return;
        }
        res.status(500).json(createErrorResponse('Failed to upload primary image', cloudinaryError.message));
        return;
      }
    }

    // Handle additional images (optional)
    if (files.images && files.images.length > 0) {
      try {
        images = await Promise.all(
          files.images.map(async (file) => {
            const result = await cloudinaryUpload(file.buffer, 'cars');
            return {
              url: result.secure_url,
              publicId: result.public_id,
              alt: `${title} - Image`
            };
          })
        );
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload error for additional images:', cloudinaryError);
        if (cloudinaryError.message.includes('Cloudinary is not properly configured')) {
          res.status(500).json(createErrorResponse('Image upload service is not configured. Please contact administrator.'));
          return;
        }
        res.status(500).json(createErrorResponse('Failed to upload additional images', cloudinaryError.message));
        return;
      }
    }

    // Parse features and specifications with proper boolean values
    let parsedFeatures: ICarFeature[] = [];
    let parsedSpecifications: ICarSpecification[] = [];

    if (features) {
      try {
        const featuresObj = typeof features === 'string' ? JSON.parse(features) : features;
        
        // Create feature object with all keys and boolean values
        const featureObject = { ...DEFAULT_FEATURES };
        Object.entries(featuresObj).forEach(([key, value]) => {
          if (FEATURE_KEYS.includes(key)) {
            featureObject[key] = Boolean(value);
          }
        });

        // Convert to array format for database
        parsedFeatures = Object.entries(featureObject)
          .filter(([_, available]) => available)
          .map(([name, available]) => ({
            name,
            available: Boolean(available),
            category: getFeatureCategory(name)
          }));
      } catch (error: any) {
        res.status(400).json(createErrorResponse('Invalid features format', error?.message));
        return;
      }
    }

    if (specifications) {
      try {
        const specsObj = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
        
        // Create specification object with all keys and boolean values
        const specObject = { ...DEFAULT_SPECIFICATIONS };
        Object.entries(specsObj).forEach(([key, value]) => {
          if (SPECIFICATION_KEYS.includes(key)) {
            specObject[key] = Boolean(value);
          }
        });

        // Convert to array format for database
        parsedSpecifications = Object.entries(specObject)
          .filter(([_, available]) => available)
          .map(([name, available]) => ({
            name,
            available: Boolean(available),
            category: getSpecificationCategory(name)
          }));
      } catch (error: any) {
        res.status(400).json(createErrorResponse('Invalid specifications format', error?.message));
        return;
      }
    }

    // Create car without features and specifications first
    const car = new Car({
      title,
      brand,
      carModel,
      year,
      variant,
      bodyType,
      color,
      description,
      regularPrice,
      salePrice,
      onRoadPrice,
      emiStartingFrom,
      km,
      fuelType,
      transmission,
      engine,
      mileage,
      seats,
      ownership,
      driveType,
      sellerType,
      registrationCity,
      registrationState,
      insurance,
      status,
      isFeatured,
      primaryImage,
      images
    });

    await car.save();

    // Create separate feature documents and collect their IDs
    const featureIds: Types.ObjectId[] = [];
    if (parsedFeatures.length > 0) {
      const featuresObject: Record<string, boolean> = {};
      parsedFeatures.forEach(feature => {
        featuresObject[feature.name] = feature.available;
      });
      
      const featureDoc = await CarFeature.create({
        carId: car._id,
        features: featuresObject
      });
      featureIds.push(featureDoc._id);
    }

    // Create separate specification documents and collect their IDs
    const specificationIds: Types.ObjectId[] = [];
    if (parsedSpecifications.length > 0) {
      const specificationsObject: Record<string, boolean> = {};
      parsedSpecifications.forEach(spec => {
        specificationsObject[spec.name] = spec.available;
      });
      
      const specificationDoc = await CarSpecification.create({
        carId: car._id,
        specifications: specificationsObject
      });
      specificationIds.push(specificationDoc._id);
    }

    // Update car with feature and specification IDs
    car.features = featureIds;
    car.specifications = specificationIds;
    await car.save();

    const populatedCar = await Car.findById(car._id)
      .populate('features')
      .populate('specifications');

    res.status(201).json(createSuccessResponse('Car created successfully', { car: populatedCar }));
  } catch (error: any) {
    console.error('Create car error:', error);
    res.status(500).json(createErrorResponse('Failed to create car', error.message));
  }
};

// Get All Cars with Advanced Filtering and Pagination
export const getAllCars = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      brand,
      fuelType,
      transmission,
      bodyType,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      minKm,
      maxKm,
      seats,
      driveType,
      sellerType,
      registrationCity,
      registrationState,
      status, // Remove default to fetch all statuses
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) filter.status = status;
    if (brand) filter.brand = new RegExp(brand as string, 'i');
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (bodyType) filter.bodyType = bodyType;
    if (seats) filter.seats = parseInt(seats as string);
    if (driveType) filter.driveType = driveType;
    if (sellerType) filter.sellerType = sellerType;
    if (registrationCity) filter.registrationCity = new RegExp(registrationCity as string, 'i');
    if (registrationState) filter.registrationState = new RegExp(registrationState as string, 'i');

    // Price range filtering
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = parseInt(minPrice as string);
      if (maxPrice) filter.salePrice.$lte = parseInt(maxPrice as string);
    }

    // Year range filtering
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = parseInt(minYear as string);
      if (maxYear) filter.year.$lte = parseInt(maxYear as string);
    }

    // Kilometer range filtering
    if (minKm || maxKm) {
      filter.km = {};
      if (minKm) filter.km.$gte = parseInt(minKm as string);
      if (maxKm) filter.km.$lte = parseInt(maxKm as string);
    }

    // Search in title, brand, model, description
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      filter.$or = [
        { title: searchRegex },
        { brand: searchRegex },
        { carModel: searchRegex },
        { description: searchRegex }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination with validation
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination (essential data only for list view)
    const [cars, total] = await Promise.all([
      Car.find(filter)
        .select('title brand carModel year regularPrice salePrice onRoadPrice km fuelType transmission bodyType color primaryImage status isFeatured slug createdAt updatedAt') // Select only essential fields
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Car.countDocuments(filter)
    ]);

    // Get status counts (count all cars regardless of other filters)
    const [availableCount, soldCount, reservedCount] = await Promise.all([
      Car.countDocuments({ status: CarStatus.AVAILABLE }),
      Car.countDocuments({ status: CarStatus.SOLD }),
      Car.countDocuments({ status: CarStatus.RESERVED })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json(createSuccessResponse('Cars retrieved successfully', {
      cars,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCars: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1
      },
      counts: {
        total,
        available: availableCount,
        sold: soldCount,
        reserved: reservedCount
      }
    }));
  } catch (error: any) {
    console.error('Get all cars error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve cars', error.message));
  }
};

// Get Cars by Status
export const getCarsByStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 12,
      status = 'available',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Validate status
    const validStatuses = Object.values(CarStatus) as string[];
    if (!status || !validStatuses.includes(status as string)) {
      res.status(400).json(createErrorResponse('Invalid status', `Status must be one of: ${validStatuses.join(', ')}`));
      return;
    }

    // Build filter object
    const filter: any = { status };

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination with validation
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [cars, total, allCarsCount] = await Promise.all([
      Car.find(filter)
        .select('title brand carModel year regularPrice salePrice onRoadPrice km fuelType transmission bodyType color primaryImage status isFeatured slug createdAt updatedAt')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Car.countDocuments(filter),
      Car.countDocuments() // Get total count of all cars
    ]);

    // Get status counts
    const [availableCount, soldCount, reservedCount] = await Promise.all([
      Car.countDocuments({ status: CarStatus.AVAILABLE }),
      Car.countDocuments({ status: CarStatus.SOLD }),
      Car.countDocuments({ status: CarStatus.RESERVED })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json(createSuccessResponse('Cars retrieved successfully', {
      cars,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCars: total, // This should be filtered count for pagination
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1
      },
      counts: {
        total: allCarsCount, // This should be total of all cars
        available: availableCount,
        sold: soldCount,
        reserved: reservedCount
      }
    }));
  } catch (error: any) {
    console.error('Get cars by status error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve cars', error.message));
  }
};

// Advanced Search Cars
export const searchCars = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      brand,
      fuelType,
      transmission,
      bodyType,
      minPrice,
      maxPrice,
      maxYear,
      minYear,
      maxKm,
      minKm,
      seats,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    if (!q) {
      res.status(400).json(createErrorResponse('Search query is required'));
    return;
    }

    // Build advanced filter
    const filter: any = {
      status: 'available',
      $or: [
        { title: new RegExp(q as string, 'i') },
        { brand: new RegExp(q as string, 'i') },
        { carModel: new RegExp(q as string, 'i') },
        { description: new RegExp(q as string, 'i') },
        { variant: new RegExp(q as string, 'i') }
      ]
    };

    // Add additional filters
    if (brand) filter.brand = new RegExp(brand as string, 'i');
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (bodyType) filter.bodyType = bodyType;
    if (seats) filter.seats = parseInt(seats as string);

    // Price range
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = parseInt(minPrice as string);
      if (maxPrice) filter.salePrice.$lte = parseInt(maxPrice as string);
    }

    // Year range
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = parseInt(minYear as string);
      if (maxYear) filter.year.$lte = parseInt(maxYear as string);
    }

    // Kilometer range
    if (minKm || maxKm) {
      filter.km = {};
      if (minKm) filter.km.$gte = parseInt(minKm as string);
      if (maxKm) filter.km.$lte = parseInt(maxKm as string);
    }

    // Sorting
    let sort: any = {};
    if (sortBy === 'relevance') {
      // For relevance, sort by exact title matches first, then brand matches
      sort = { 
        // Prioritize exact title matches
        title: 1,
        // Then brand matches
        brand: 1,
        // Finally by creation date (newer first)
        createdAt: -1 
      };
    } else {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [cars, total] = await Promise.all([
      Car.find(filter)
        .populate('features')
        .populate('specifications')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Car.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json(createSuccessResponse('Search results retrieved successfully', {
      cars,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCars: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum,
        query: q
      }
    }));
  } catch (error: any) {
    console.error('Search cars error:', error);
    res.status(500).json(createErrorResponse('Failed to search cars', error.message));
  }
};

// Get Car by ID
export const getCarById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json(createErrorResponse('Invalid car ID format'));
      return;
    }

    const car = await Car.findById(id)
      .populate('features')
      .populate('specifications')
      .exec();

    if (!car) {
      res.status(404).json(createErrorResponse('Car not found'));
      return;
    }

    res.json(createSuccessResponse('Car retrieved successfully', { car }));
  } catch (error: any) {
    console.error('Get car by ID error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve car', error.message));
  }
};

// Get Car by Slug
export const getCarBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const car = await Car.findOne({ slug })
      .populate('features')
      .populate('specifications')
      .exec();

    if (!car) {
      res.status(404).json(createErrorResponse('Car not found'));
      return;
    }

    res.json(createSuccessResponse('Car retrieved successfully', { car }));
  } catch (error: any) {
    console.error('Get car by slug error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve car', error.message));
  }
};

// Update Car
export const updateCar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json(createErrorResponse('Invalid car ID format'));
      return;
    }

    const car = await Car.findById(id);
    if (!car) {
      res.status(404).json(createErrorResponse('Car not found'));
      return;
    }

    // Handle image updates
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      // Update primary image
      if (files.primaryImage && files.primaryImage[0]) {
        const result = await cloudinaryUpload(files.primaryImage[0].buffer, 'cars');
        updateData.primaryImage = {
          url: result.secure_url,
          publicId: result.public_id,
          alt: `${updateData.title || car.title} - Primary Image`
        };
      }

      // Update additional images
      if (files.images && files.images.length > 0) {
        const newImages = await Promise.all(
          files.images.map(async (file) => {
            const result = await cloudinaryUpload(file.buffer, 'cars');
            return {
              url: result.secure_url,
              publicId: result.public_id,
              alt: `${updateData.title || car.title} - Image`
            };
          })
        );
        updateData.images = [...(car.images || []), ...newImages];
      }
    }

    // Parse features and specifications if provided
    if (updateData.features) {
      try {
        const featuresObj = typeof updateData.features === 'string' ? JSON.parse(updateData.features) : updateData.features;
        
        // Create feature object with all keys and boolean values
        const featureObject = { ...DEFAULT_FEATURES };
        Object.entries(featuresObj).forEach(([key, value]) => {
          if (FEATURE_KEYS.includes(key)) {
            featureObject[key] = Boolean(value);
          }
        });

        // Update or create CarFeature document
        const featureDoc = await CarFeature.findOneAndUpdate(
          { carId: id },
          { features: featureObject },
          { new: true, upsert: true }
        );

        // Update car's features array with the feature document ID
        updateData.features = [featureDoc._id];
      } catch (error: any) {
        res.status(400).json(createErrorResponse('Invalid features format', error?.message));
        return;
      }
    }

    if (updateData.specifications) {
      try {
        const specsObj = typeof updateData.specifications === 'string' ? JSON.parse(updateData.specifications) : updateData.specifications;
        
        // Create specification object with all keys and boolean values
        const specObject = { ...DEFAULT_SPECIFICATIONS };
        Object.entries(specsObj).forEach(([key, value]) => {
          if (SPECIFICATION_KEYS.includes(key)) {
            specObject[key] = Boolean(value);
          }
        });

        // Update or create CarSpecification document
        const specificationDoc = await CarSpecification.findOneAndUpdate(
          { carId: id },
          { specifications: specObject },
          { new: true, upsert: true }
        );

        // Update car's specifications array with the specification document ID
        updateData.specifications = [specificationDoc._id];
      } catch (error: any) {
        res.status(400).json(createErrorResponse('Invalid specifications format', error?.message));
        return;
      }
    }

    // Update car
    const updatedCar = await Car.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('features')
      .populate('specifications')
      .exec();

    res.json(createSuccessResponse('Car updated successfully', { car: updatedCar }));
  } catch (error: any) {
    console.error('Update car error:', error);
    res.status(500).json(createErrorResponse('Failed to update car', error.message));
  }
};

// Delete Car
export const deleteCar = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json(createErrorResponse('Invalid car ID format'));
      return;
    }

    const car = await Car.findById(id);
    if (!car) {
      res.status(404).json(createErrorResponse('Car not found'));
      return;
    }

    // Delete images from Cloudinary
    const deletePromises = [];
    
    if (car.primaryImage?.publicId) {
      deletePromises.push(cloudinaryDelete(car.primaryImage.publicId));
    }
    
    if (car.images && car.images.length > 0) {
      car.images.forEach(img => {
        if (img.publicId) {
          deletePromises.push(cloudinaryDelete(img.publicId));
        }
      });
    }

    // Wait for all images to be deleted from Cloudinary
    await Promise.all(deletePromises);

    // Delete related features and specifications from database
    await Promise.all([
      CarFeature.deleteMany({ carId: id }),
      CarSpecification.deleteMany({ carId: id }),
      Car.findByIdAndDelete(id)
    ]);

    res.json(createSuccessResponse('Car deleted successfully'));
  } catch (error: any) {
    console.error('Delete car error:', error);
    res.status(500).json(createErrorResponse('Failed to delete car', error.message));
  }
};

// Get Featured Cars
export const getFeaturedCars = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { limit = 6 } = req.query;
    const limitNum = parseInt(limit as string);

    const cars = await Car.find({ status: 'available', isFeatured: true })
      .populate('features')
      .populate('specifications')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .exec();

    res.json(createSuccessResponse('Featured cars retrieved successfully', { cars }));
  } catch (error: any) {
    console.error('Get featured cars error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve featured cars', error.message));
  }
};

// Get Cars by Seller (now just gets all cars with optional filters)
export const getCarsBySeller = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 10, status = 'available' } = req.query;

    // Removed sellerId validation since it's no longer required
    const filter = { status };
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [cars, total] = await Promise.all([
      Car.find(filter)
        .populate('features')
        .populate('specifications')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Car.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json(createSuccessResponse('Seller cars retrieved successfully', {
      cars,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCars: total,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    }));
  } catch (error: any) {
    console.error('Get cars by seller error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve seller cars', error.message));
  }
};

// Bulk Delete Cars
export const bulkDeleteCars = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { carIds } = req.body;

    if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
      res.status(400).json(createErrorResponse('Car IDs array is required', 'MISSING_CAR_IDS', 400));
      return;
    }

    // Validate each car ID format
    for (const id of carIds) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json(createErrorResponse(`Invalid car ID format: ${id}`, 'INVALID_CAR_ID', 400));
        return;
      }
    }

    // Find all cars to get their image public IDs
    const cars = await Car.find({ _id: { $in: carIds } });

    if (cars.length === 0) {
      res.status(404).json(createErrorResponse('No cars found with provided IDs', 'NO_CARS_FOUND', 404));
      return;
    }

    // Collect all image public IDs for deletion from Cloudinary
    const imagePublicIds: string[] = [];
    
    cars.forEach(car => {
      // Add primary image public ID
      if (car.primaryImage?.publicId) {
        imagePublicIds.push(car.primaryImage.publicId);
      }
      
      // Add additional images public IDs
      if (car.images && car.images.length > 0) {
        car.images.forEach(img => {
          if (img.publicId) {
            imagePublicIds.push(img.publicId);
          }
        });
      }
    });

    // Delete images from Cloudinary in parallel
    const cloudinaryDeletePromises = imagePublicIds.map(publicId => 
      cloudinaryDelete(publicId)
        .then(() => ({ success: true, publicId, error: null }))
        .catch(error => {
          console.error(`Failed to delete image ${publicId} from Cloudinary:`, error);
          return { success: false, publicId, error };
        })
    );

    const cloudinaryResults = await Promise.all(cloudinaryDeletePromises);
    const successfulImageDeletes = cloudinaryResults.filter(result => result && !result.error).length;
    const failedImageDeletes = cloudinaryResults.length - successfulImageDeletes;

    // Delete related data from database in parallel
    const carObjectIds = cars.map(car => car._id);
    
    const [carDeleteResult, featureDeleteResult, specificationDeleteResult] = await Promise.all([
      Car.deleteMany({ _id: { $in: carObjectIds } }),
      CarFeature.deleteMany({ carId: { $in: carObjectIds } }),
      CarSpecification.deleteMany({ carId: { $in: carObjectIds } })
    ]);

    console.log('Bulk delete cars completed:', {
      requestedCars: carIds.length,
      foundCars: cars.length,
      deletedCars: carDeleteResult.deletedCount,
      deletedFeatures: featureDeleteResult.deletedCount,
      deletedSpecifications: specificationDeleteResult.deletedCount,
      imagesDeleted: successfulImageDeletes,
      imagesFailed: failedImageDeletes
    });

    res.status(200).json(createSuccessResponse('Bulk delete completed successfully', {
      requested: carIds.length,
      found: cars.length,
      deleted: carDeleteResult.deletedCount,
      featuresDeleted: featureDeleteResult.deletedCount,
      specificationsDeleted: specificationDeleteResult.deletedCount,
      imagesDeleted: successfulImageDeletes,
      imagesFailed: failedImageDeletes
    }));

  } catch (error: any) {
    console.error('Bulk delete cars error:', error);
    res.status(500).json(createErrorResponse('Failed to bulk delete cars', error.message));
  }
};

// Helper functions
function getFeatureCategory(featureName: string): string {
  const safety = ['360° Camera', 'Parking Sensors', 'Blind Spot Monitoring', 'Lane Keep Assist', 'Adaptive Cruise Control', 'Airbags', 'ABS', 'ESP'];
  const comfort = ['Leather Seats', 'Heated Seats', 'Ventilated Seats', 'Memory Seats', 'Dual Zone Climate Control', 'Rear AC Vents', 'Cruise Control', 'Heated Steering Wheel'];
  const technology = ['Navigation System', 'Apple CarPlay', 'Android Auto', 'Wireless Charging', 'Keyless Entry', 'Push Button Start', 'Remote Start', 'Heads-Up Display'];
  const convenience = ['Power Tailgate', 'Auto Dimming Mirrors', 'Rain Sensing Wipers', 'Automatic Headlights'];
  const exterior = ['Sunroof', 'Panoramic Sunroof', 'Alloy Wheels', 'LED Headlights', 'Fog Lights', 'Run Flat Tires', 'Spare Wheel'];
  const interior = ['Premium Sound System', 'Ambient Lighting'];

  const name = featureName.toLowerCase();
  
  if (safety.some(f => f.toLowerCase() === name)) return 'safety';
  if (comfort.some(f => f.toLowerCase() === name)) return 'comfort';
  if (technology.some(f => f.toLowerCase() === name)) return 'technology';
  if (convenience.some(f => f.toLowerCase() === name)) return 'convenience';
  if (exterior.some(f => f.toLowerCase() === name)) return 'exterior';
  if (interior.some(f => f.toLowerCase() === name)) return 'interior';
  
  return 'other';
}

function getSpecificationCategory(specName: string): string {
  const performance = ['Turbo Engine', 'Automatic Transmission', 'All-Wheel Drive'];
  const safety = ['360° Camera', 'Parking Sensors', 'Blind Spot Monitoring', 'Lane Departure Warning'];
  const comfort = ['Leather Seats', 'Heated Seats', 'Ventilated Seats', 'Memory Seats', 'Dual Zone Climate Control', 'Rear AC Vents', 'Cruise Control'];
  const technology = ['Navigation System', 'Apple CarPlay', 'Android Auto', 'Wireless Charging', 'Keyless Entry', 'Push Button Start', 'Remote Start', 'Heads-Up Display'];
  const exterior = ['Sunroof', 'Panoramic Sunroof', 'Alloy Wheels'];
  const interior = ['Premium Sound System', 'Ambient Lighting', 'Power Tailgate'];

  const name = specName.toLowerCase();
  
  if (performance.some(f => f.toLowerCase() === name)) return 'performance';
  if (safety.some(f => f.toLowerCase() === name)) return 'safety';
  if (comfort.some(f => f.toLowerCase() === name)) return 'comfort';
  if (technology.some(f => f.toLowerCase() === name)) return 'technology';
  if (exterior.some(f => f.toLowerCase() === name)) return 'exterior';
  if (interior.some(f => f.toLowerCase() === name)) return 'interior';
  
  return 'other';
}
