import { Response } from 'express';
import { Testimonial, UserType, ITestimonial } from '../models/Testimonial';
import { IAuthRequest } from '../types';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { cloudinaryUpload } from '../services/cloudinaryService';

// Create Testimonial
export const createTestimonial = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      userName,
      userType,
      location,
      description,
      rating,
      carName,
      carId,
      isApproved = false,
      isFeatured = false,
      isVisible = true,
      adminNotes
    } = req.body;

    // carId is optional and independent - no car validation needed

    // Handle profile image upload
    let userProfileImage;
    if (req.file) {
      try {
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'testimonials');
        userProfileImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: `${userName} profile image`
        };
      } catch (error: any) {
        res.status(500).json(createErrorResponse('Failed to upload profile image', error.message));
        return;
      }
    }

    const testimonial = new Testimonial({
      userName,
      userProfileImage,
      userType,
      location,
      description,
      rating,
      carName,
      carId,
      isApproved,
      isFeatured,
      isVisible,
      adminNotes
    });

    await testimonial.save();

    res.status(201).json(createSuccessResponse('Testimonial created successfully', testimonial));

  } catch (error: any) {
    console.error('Create testimonial error:', error);
    res.status(500).json(createErrorResponse('Failed to create testimonial', error.message));
  }
};

// Get All Testimonials with Pagination and Filters
export const getAllTestimonials = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      userType,
      rating,
      isApproved,
      isFeatured,
      isVisible,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter: any = {};

    if (userType) filter.userType = userType;
    if (rating) filter.rating = parseInt(rating as string);
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    if (isVisible !== undefined) filter.isVisible = isVisible === 'true';

    // Text search
    if (search) {
      filter.$text = { $search: search as string };
    }

    // Sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [testimonials, total] = await Promise.all([
      Testimonial.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Testimonial.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json(createSuccessResponse('Testimonials retrieved successfully', {
      testimonials,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalTestimonials: total,
        testimonialsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      filters: {
        userType,
        rating,
        isApproved,
        isFeatured,
        isVisible,
        search,
        sortBy,
        sortOrder
      }
    }));

  } catch (error: any) {
    console.error('Get all testimonials error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve testimonials', error.message));
  }
};

// Get Testimonial by ID
export const getTestimonialById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id).exec();

    if (!testimonial) {
      res.status(404).json(createErrorResponse('Testimonial not found'));
      return;
    }

    res.json(createSuccessResponse('Testimonial retrieved successfully', testimonial));

  } catch (error: any) {
    console.error('Get testimonial by ID error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve testimonial', error.message));
  }
};

// Update Testimonial
export const updateTestimonial = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if testimonial exists
    const existingTestimonial = await Testimonial.findById(id);
    if (!existingTestimonial) {
      res.status(404).json(createErrorResponse('Testimonial not found'));
      return;
    }

    // carId is optional and independent - no car validation needed

    // Handle profile image upload
    if (req.file) {
      try {
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'testimonials');
        updateData.userProfileImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: `${updateData.userName || existingTestimonial.userName} profile image`
        };
      } catch (error: any) {
        res.status(500).json(createErrorResponse('Failed to upload profile image', error.message));
        return;
      }
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(createSuccessResponse('Testimonial updated successfully', updatedTestimonial));

  } catch (error: any) {
    console.error('Update testimonial error:', error);
    res.status(500).json(createErrorResponse('Failed to update testimonial', error.message));
  }
};

// Delete Testimonial
export const deleteTestimonial = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      res.status(404).json(createErrorResponse('Testimonial not found'));
      return;
    }

    // Delete profile image from Cloudinary if exists
    if (testimonial.userProfileImage?.publicId) {
      try {
        const { cloudinaryDelete } = await import('../services/cloudinaryService');
        await cloudinaryDelete(testimonial.userProfileImage.publicId);
      } catch (error) {
        console.error('Failed to delete profile image from Cloudinary:', error);
        // Continue with testimonial deletion even if image deletion fails
      }
    }

    await Testimonial.findByIdAndDelete(id);

    res.json(createSuccessResponse('Testimonial deleted successfully'));

  } catch (error: any) {
    console.error('Delete testimonial error:', error);
    res.status(500).json(createErrorResponse('Failed to delete testimonial', error.message));
  }
};

// Bulk Delete Testimonials
export const bulkDeleteTestimonials = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { testimonialIds } = req.body;

    if (!testimonialIds || !Array.isArray(testimonialIds) || testimonialIds.length === 0) {
      res.status(400).json(createErrorResponse('Testimonial IDs array is required'));
      return;
    }

    // Find testimonials to get their profile images
    const testimonials = await Testimonial.find({ _id: { $in: testimonialIds } });

    // Delete profile images from Cloudinary
    const imageDeletePromises = testimonials
      .filter(testimonial => testimonial.userProfileImage?.publicId)
      .map(async (testimonial) => {
        try {
          const { cloudinaryDelete } = await import('../services/cloudinaryService');
          return await cloudinaryDelete(testimonial.userProfileImage!.publicId);
        } catch (error) {
          console.error(`Failed to delete image for testimonial ${testimonial._id}:`, error);
          return { success: false, publicId: testimonial.userProfileImage!.publicId, error };
        }
      });

    const cloudinaryResults = await Promise.all(imageDeletePromises);
    const successfulImageDeletes = cloudinaryResults.filter(result => result !== false).length;
    const failedImageDeletes = cloudinaryResults.length - successfulImageDeletes;

    // Delete testimonials from database
    const deleteResult = await Testimonial.deleteMany({ _id: { $in: testimonialIds } });

    res.json(createSuccessResponse('Bulk delete completed successfully', {
      deletedCount: deleteResult.deletedCount,
      successfulImageDeletes,
      failedImageDeletes,
      requestedCount: testimonialIds.length
    }));

  } catch (error: any) {
    console.error('Bulk delete testimonials error:', error);
    res.status(500).json(createErrorResponse('Failed to bulk delete testimonials', error.message));
  }
};

// Get Featured Testimonials
export const getFeaturedTestimonials = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const testimonials = await Testimonial.find({ 
      isFeatured: true, 
      isVisible: true,
      isApproved: true 
    })
    .sort({ rating: -1, createdAt: -1 })
    .limit(parseInt(limit as string))
    .exec();

    res.json(createSuccessResponse('Featured testimonials retrieved successfully', testimonials));

  } catch (error: any) {
    console.error('Get featured testimonials error:', error);
    res.status(500).json(createErrorResponse('Failed to retrieve featured testimonials', error.message));
  }
};

// Approve Testimonial
export const approveTestimonial = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    ).populate('carId', 'title brand carModel year');

    if (!testimonial) {
      res.status(404).json(createErrorResponse('Testimonial not found'));
      return;
    }

    res.json(createSuccessResponse('Testimonial approved successfully', testimonial));

  } catch (error: any) {
    console.error('Approve testimonial error:', error);
    res.status(500).json(createErrorResponse('Failed to approve testimonial', error.message));
  }
};
