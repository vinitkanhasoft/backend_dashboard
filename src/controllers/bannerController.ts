import { Request, Response, NextFunction } from 'express';
import { Banner } from '../models/Banner';
import { CloudinaryService } from '../services/cloudinaryService';
import { logger } from '../utils/logger';
import { createSuccessResponse, createErrorResponse, API_RESPONSES } from '../constants/apiResponses';
import { IAuthRequest } from '../types';

export interface IBannerRequest extends IAuthRequest {
  file?: Express.Multer.File;
}

/**
 * Create a new banner with image upload
 */
export const createBanner = async (req: IBannerRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, altText, isActive, displayOrder } = req.body;

    // Validate required fields
    if (!title || !description || !altText) {
      res.status(400).json(
        createErrorResponse(
          'Title, description, and alt text are required',
          'MISSING_REQUIRED_FIELDS',
          400
        )
      );
      return;
    }

    // Check if image file is provided
    if (!req.file) {
      res.status(400).json(
        createErrorResponse(
          'Banner image is required',
          'MISSING_IMAGE_FILE',
          400
        )
      );
      return;
    }

    // Upload image to Cloudinary
    const publicId = `banner_${Date.now()}`;
    const result = await CloudinaryService.uploadImage(
      req.file.buffer,
      'banners',
      publicId
    );

    // Create banner
    const banner = new Banner({
      title,
      description,
      altText,
      bannerImage: result.secure_url,
      bannerImagePublicId: result.public_id,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0
    });

    await banner.save();

    logger.info('Banner created successfully', {
      bannerId: banner._id,
      title: banner.title,
      publicId: banner.bannerImagePublicId
    });

    res.status(201).json(
      createSuccessResponse('Banner created successfully', banner)
    );
  } catch (error) {
    logger.error('Error creating banner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json(
      createErrorResponse(
        `Failed to create banner: ${errorMessage}`,
        'BANNER_CREATION_FAILED',
        500
      )
    );
  }
};

/**
 * Get all banners with pagination, filtering, and search
 */
export const getAllBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
      search,
      searchIn = 'title,description'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Build search filter
    if (search && search.toString().trim()) {
      const searchTerm = search.toString().trim();
      const searchFields = searchIn.toString().split(',').map(field => field.trim());
      
      const searchConditions = [];
      
      for (const field of searchFields) {
        if (field === 'title' || field === 'description' || field === 'altText') {
          searchConditions.push({
            [field]: {
              $regex: searchTerm,
              $options: 'i' // Case insensitive
            }
          });
        }
      }
      
      if (searchConditions.length > 0) {
        filter.$or = searchConditions;
      }
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const banners = await Banner.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Banner.countDocuments(filter);

    // Get banner statistics
    const [activeCount, inactiveCount] = await Promise.all([
      Banner.countDocuments({ isActive: true }),
      Banner.countDocuments({ isActive: false })
    ]);

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
      nextPage: pageNum < Math.ceil(total / limitNum) ? pageNum + 1 : null,
      prevPage: pageNum > 1 ? pageNum - 1 : null
    };

    const response = {
      success: true,
      message: 'Banners retrieved successfully',
      data: {
        banners,
        pagination,
        statistics: {
          totalBanners: await Banner.countDocuments(),
          activeBanners: activeCount,
          inactiveBanners: inactiveCount
        },
        filters: {
          search: search || null,
          searchIn: searchIn || 'title,description',
          isActive: isActive !== undefined ? isActive === 'true' : null,
          sortBy,
          sortOrder
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0'
      }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching banners:', error);
    next(error);
  }
};

/**
 * Get banner by ID
 */
export const getBannerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      res.status(404).json(
        createErrorResponse(
          API_RESPONSES.ERROR.NOT_FOUND,
          API_RESPONSES.ERROR_CODES.NOT_FOUND,
          404
        )
      );
      return;
    }

    res.status(200).json(
      createSuccessResponse('Banner retrieved successfully', banner)
    );
  } catch (error) {
    logger.error('Error fetching banner:', error);
    next(error);
  }
};

/**
 * Update banner with optional image replacement
 */
export const updateBanner = async (req: IBannerRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, altText, isActive, displayOrder } = req.body;

    const banner = await Banner.findById(id);

    if (!banner) {
      res.status(404).json(
        createErrorResponse(
          API_RESPONSES.ERROR.NOT_FOUND,
          API_RESPONSES.ERROR_CODES.NOT_FOUND,
          404
        )
      );
      return;
    }

    // Handle image update if new image is provided
    if (req.file) {
      try {
        // Delete old image from Cloudinary and upload new one
        const result = await CloudinaryService.updateBannerImage(
          banner._id.toString(),
          req.file.buffer,
          banner.bannerImagePublicId
        );

        banner.bannerImage = result.url;
        banner.bannerImagePublicId = result.publicId;

        logger.info('Banner image updated', {
          bannerId: banner._id,
          oldPublicId: banner.bannerImagePublicId,
          newPublicId: result.publicId
        });
      } catch (uploadError) {
        logger.error('Error updating banner image:', uploadError);
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
        res.status(500).json(
          createErrorResponse(
            `Failed to update banner image: ${errorMessage}`,
            'BANNER_IMAGE_UPDATE_FAILED',
            500
          )
        );
        return;
      }
    }

    // Update text fields
    if (title !== undefined) banner.title = title;
    if (description !== undefined) banner.description = description;
    if (altText !== undefined) banner.altText = altText;
    if (isActive !== undefined) banner.isActive = isActive;
    if (displayOrder !== undefined) banner.displayOrder = displayOrder;

    await banner.save();

    logger.info('Banner updated successfully', {
      bannerId: banner._id,
      title: banner.title
    });

    res.status(200).json(
      createSuccessResponse('Banner updated successfully', banner)
    );
  } catch (error) {
    logger.error('Error updating banner:', error);
    next(error);
  }
};

/**
 * Delete banner and remove image from Cloudinary
 */
export const deleteBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      res.status(404).json(
        createErrorResponse(
          API_RESPONSES.ERROR.NOT_FOUND,
          API_RESPONSES.ERROR_CODES.NOT_FOUND,
          404
        )
      );
      return;
    }

    // Delete image from Cloudinary
    if (banner.bannerImagePublicId) {
      try {
        await CloudinaryService.deleteImage(banner.bannerImagePublicId);
        logger.info('Banner image deleted from Cloudinary', {
          bannerId: banner._id,
          publicId: banner.bannerImagePublicId
        });
      } catch (deleteError) {
        logger.error('Error deleting banner image from Cloudinary:', deleteError);
        // Continue with banner deletion even if image deletion fails
      }
    }

    await Banner.findByIdAndDelete(id);

    logger.info('Banner deleted successfully', {
      bannerId: banner._id,
      title: banner.title
    });

    res.status(200).json(
      createSuccessResponse('Banner deleted successfully')
    );
  } catch (error) {
    logger.error('Error deleting banner:', error);
    next(error);
  }
};

/**
 * Bulk delete banners and remove images from Cloudinary
 */
/**
 * Search banners with advanced text search and pagination
 */
export const searchBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 10,
      searchIn = 'title,description,altText',
      isActive,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    if (!query || query.toString().trim() === '') {
      res.status(400).json(
        createErrorResponse(
          'Search query is required',
          'MISSING_SEARCH_QUERY',
          400
        )
      );
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const searchTerm = query.toString().trim();

    // Build base filter
    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Build text search filter
    const searchFields = searchIn.toString().split(',').map(field => field.trim());
    const searchConditions = [];
    
    for (const field of searchFields) {
      if (['title', 'description', 'altText'].includes(field)) {
        searchConditions.push({
          [field]: {
            $regex: searchTerm,
            $options: 'i'
          }
        });
      }
    }

    if (searchConditions.length > 0) {
      filter.$or = searchConditions;
    }

    // Build sort with relevance scoring
    let sort: any = {};
    if (sortBy === 'relevance') {
      // Custom relevance: exact title matches first, then partial matches
      sort = {
        title: sortOrder === 'desc' ? -1 : 1,
        displayOrder: 1
      };
    } else {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute search
    const banners = await Banner.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Banner.countDocuments(filter);

    // Get banner statistics
    const [activeCount, inactiveCount] = await Promise.all([
      Banner.countDocuments({ isActive: true }),
      Banner.countDocuments({ isActive: false })
    ]);

    // Calculate relevance scores for results
    const bannersWithScores = banners.map(banner => {
      const titleScore = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ? 2 : 0;
      const descScore = banner.description.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
      const altScore = banner.altText.toLowerCase().includes(searchTerm.toLowerCase()) ? 1 : 0;
      
      return {
        ...banner.toObject(),
        relevanceScore: titleScore + descScore + altScore
      };
    });

    // Sort by relevance if requested
    if (sortBy === 'relevance') {
      bannersWithScores.sort((a, b) => {
        const scoreDiff = b.relevanceScore - a.relevanceScore;
        return sortOrder === 'desc' ? scoreDiff : -scoreDiff;
      });
    }

    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
      nextPage: pageNum < Math.ceil(total / limitNum) ? pageNum + 1 : null,
      prevPage: pageNum > 1 ? pageNum - 1 : null
    };

    const response = {
      success: true,
      message: `Found ${total} banners matching "${searchTerm}"`,
      data: {
        banners: bannersWithScores,
        pagination,
        statistics: {
          totalBanners: await Banner.countDocuments(),
          activeBanners: activeCount,
          inactiveBanners: inactiveCount
        },
        search: {
          query: searchTerm,
          searchIn: searchFields,
          sortBy,
          sortOrder,
          filters: {
            isActive: isActive !== undefined ? isActive === 'true' : null
          }
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
        version: '1.0.0',
        searchTime: Date.now()
      }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error searching banners:', error);
    next(error);
  }
};

export const bulkDeleteBanners = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('=== BULK DELETE CONTROLLER ===');
    console.log('Request body:', req.body);
    console.log('Banner IDs:', req.body.bannerIds);
    
    const { bannerIds } = req.body;

    if (!bannerIds || !Array.isArray(bannerIds) || bannerIds.length === 0) {
      console.log('VALIDATION FAILED: Invalid banner IDs array');
      res.status(400).json(
        createErrorResponse(
          'Banner IDs array is required',
          'MISSING_BANNER_IDS',
          400
        )
      );
      return;
    }

    console.log('VALIDATION PASSED: Proceeding with bulk delete');

    // Find all banners to get their public IDs
    const banners = await Banner.find({ _id: { $in: bannerIds } });

    if (banners.length === 0) {
      res.status(404).json(
        createErrorResponse(
          'No banners found with provided IDs',
          'NO_BANNERS_FOUND',
          404
        )
      );
      return;
    }

    // Delete images from Cloudinary
    const deletePromises = banners.map(async (banner) => {
      if (banner.bannerImagePublicId) {
        try {
          await CloudinaryService.deleteImage(banner.bannerImagePublicId);
          return { success: true, bannerId: banner._id, publicId: banner.bannerImagePublicId };
        } catch (error) {
          logger.error(`Failed to delete image for banner ${banner._id}:`, error);
          return { success: false, bannerId: banner._id, error };
        }
      }
      return { success: true, bannerId: banner._id, publicId: null };
    });

    const deleteResults = await Promise.all(deletePromises);

    // Delete banners from database
    const deleteResult = await Banner.deleteMany({ _id: { $in: bannerIds } });

    const successfulDeletes = deleteResults.filter(r => r.success).length;
    const failedDeletes = deleteResults.filter(r => !r.success).length;

    logger.info('Bulk delete banners completed', {
      requestedIds: bannerIds.length,
      successfulDeletes,
      failedDeletes,
      deletedFromDB: deleteResult.deletedCount
    });

    res.status(200).json(
      createSuccessResponse('Bulk delete completed', {
        requested: bannerIds.length,
        deleted: deleteResult.deletedCount,
        imagesDeleted: successfulDeletes,
        imagesFailed: failedDeletes
      })
    );
  } catch (error) {
    logger.error('Error in bulk delete banners:', error);
    next(error);
  }
};
