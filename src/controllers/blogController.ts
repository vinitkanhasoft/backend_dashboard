import { Response } from 'express';
import { Blog, IBlog } from '../models/Blog';
import { BlogStatus, BlogSortOptions, BlogPaginationConstants, BlogImageConstants, BlogCategory } from '../enums/blogEnums';
import { IAuthRequest } from '../types';
import { createSuccessResponse, createErrorResponse } from '../constants/apiResponses';
import { cloudinaryUpload, cloudinaryDelete } from '../services/cloudinaryService';

// Create Blog
export const createBlog = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      tagline,
      content,
      excerpt,
      postDate,
      metaTitle,
      metaDescription,
      keywords,
      status = BlogStatus.DRAFT,
      isFeatured = false,
      isVisible = true,
      category,
      tags
    } = req.body;

    // Handle featured image upload
    let featuredImage;
    if (req.file) {
      try {
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'blogs');
        featuredImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: title || BlogImageConstants.DEFAULT_ALT_TEXT
        };
      } catch (error: any) {
        res.status(500).json(createErrorResponse('Failed to upload featured image', error.message));
        return;
      }
    }

    const blog = new Blog({
      title,
      tagline,
      content,
      excerpt,
      featuredImage,
      postDate: postDate ? new Date(postDate) : new Date(),
      metaTitle,
      metaDescription,
      keywords,
      status,
      isFeatured,
      isVisible,
      category,
      tags
    });

    await blog.save();

    res.status(201).json(createSuccessResponse('Blog created successfully', blog));
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json(createErrorResponse('Blog with this slug already exists'));
      return;
    }
    res.status(500).json(createErrorResponse('Failed to create blog', error.message));
  }
};

// Get All Blogs (with pagination, filtering, and search)
export const getAllBlogs = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      tags,
      featured,
      search,
      sortBy = 'postDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Sort options
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const blogs = await Blog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Blog.countDocuments(query);

    // Get blog statistics
    const [draftCount, publishedCount] = await Promise.all([
      Blog.countDocuments({ status: BlogStatus.DRAFT }),
      Blog.countDocuments({ status: BlogStatus.PUBLISHED })
    ]);

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    res.status(200).json(createSuccessResponse('Blogs retrieved successfully', {
      blogs,
      pagination,
      statistics: {
        totalBlogs: await Blog.countDocuments(),
        draftBlogs: draftCount,
        publishedBlogs: publishedCount
      }
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve blogs', error.message));
  }
};

// Get Blog by ID
export const getBlogById = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json(createErrorResponse('Blog not found'));
      return;
    }

    res.status(200).json(createSuccessResponse('Blog retrieved successfully', blog));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve blog', error.message));
  }
};

// Get Blog by Slug
export const getBlogBySlug = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      res.status(404).json(createErrorResponse('Blog not found'));
      return;
    }

    res.status(200).json(createSuccessResponse('Blog retrieved successfully', blog));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve blog', error.message));
  }
};

// Update Blog
export const updateBlog = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      tagline,
      content,
      excerpt,
      postDate,
      metaTitle,
      metaDescription,
      keywords,
      status,
      isFeatured,
      isVisible,
      category,
      tags
    } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json(createErrorResponse('Blog not found'));
      return;
    }

    // Handle featured image update
    let featuredImage = blog.featuredImage;
    if (req.file) {
      try {
        // Delete old image if exists
        if (blog.featuredImage?.publicId) {
          await cloudinaryDelete(blog.featuredImage.publicId);
        }

        // Upload new image
        const uploadResult = await cloudinaryUpload(req.file.buffer, 'blogs');
        featuredImage = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          alt: title || BlogImageConstants.DEFAULT_ALT_TEXT
        };
      } catch (error: any) {
        res.status(500).json(createErrorResponse('Failed to upload featured image', error.message));
        return;
      }
    }

    // Update blog fields
    const updateData: any = {
      title,
      tagline,
      content,
      excerpt,
      featuredImage,
      metaTitle,
      metaDescription,
      keywords,
      status,
      isFeatured,
      isVisible,
      category,
      tags
    };

    if (postDate) {
      updateData.postDate = new Date(postDate);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json(createSuccessResponse('Blog updated successfully', updatedBlog));
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json(createErrorResponse('Blog with this slug already exists'));
      return;
    }
    res.status(500).json(createErrorResponse('Failed to update blog', error.message));
  }
};

// Delete Blog
export const deleteBlog = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      res.status(404).json(createErrorResponse('Blog not found'));
      return;
    }

    // Delete featured image from cloudinary if exists
    if (blog.featuredImage?.publicId) {
      try {
        await cloudinaryDelete(blog.featuredImage.publicId);
      } catch (error: any) {
        console.error('Failed to delete image from cloudinary:', error.message);
      }
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json(createSuccessResponse('Blog deleted successfully'));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete blog', error.message));
  }
};

// Bulk Delete Blogs
export const bulkDeleteBlogs = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json(createErrorResponse('Valid blog IDs array is required'));
      return;
    }

    // Find all blogs to get their image public IDs
    const blogs = await Blog.find({ _id: { $in: ids } });

    // Delete images from cloudinary
    for (const blog of blogs) {
      if (blog.featuredImage?.publicId) {
        try {
          await cloudinaryDelete(blog.featuredImage.publicId);
        } catch (error: any) {
          console.error(`Failed to delete image for blog ${blog._id}:`, error.message);
        }
      }
    }

    // Delete blogs from database
    const result = await Blog.deleteMany({ _id: { $in: ids } });

    res.status(200).json(createSuccessResponse('Blogs deleted successfully', {
      deletedCount: result.deletedCount
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to delete blogs', error.message));
  }
};

// Search Blogs
export const searchBlogs = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const {
      q,
      page = 1,
      limit = 10,
      category,
      tags,
      status = BlogStatus.PUBLISHED
    } = req.query;

    if (!q) {
      res.status(400).json(createErrorResponse('Search query is required'));
      return;
    }

    // Build search query
    const query: any = {
      $text: { $search: q as string },
      status
    };

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const blogs = await Blog.find(query)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limitNum);

    const total = await Blog.countDocuments(query);

    // Get blog statistics
    const [draftCount, publishedCount] = await Promise.all([
      Blog.countDocuments({ status: BlogStatus.DRAFT }),
      Blog.countDocuments({ status: BlogStatus.PUBLISHED })
    ]);

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    };

    res.status(200).json(createSuccessResponse('Blogs search completed', {
      blogs,
      pagination,
      statistics: {
        totalBlogs: await Blog.countDocuments(),
        draftBlogs: draftCount,
        publishedBlogs: publishedCount
      },
      query: q
    }));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to search blogs', error.message));
  }
};

// Get Featured Blogs
export const getFeaturedBlogs = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({
      isFeatured: true,
      status: BlogStatus.PUBLISHED,
      isVisible: true
    })
      .sort({ postDate: -1 })
      .limit(parseInt(limit as string));

    res.status(200).json(createSuccessResponse('Featured blogs retrieved successfully', blogs));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve featured blogs', error.message));
  }
};

// Get Recent Blogs
export const getRecentBlogs = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;

    const blogs = await Blog.find({
      status: BlogStatus.PUBLISHED,
      isVisible: true
    })
      .sort({ postDate: -1 })
      .limit(parseInt(limit as string));

    res.status(200).json(createSuccessResponse('Recent blogs retrieved successfully', blogs));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve recent blogs', error.message));
  }
};

// Get Blog Categories
export const getBlogCategories = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Blog.distinct('category', {
      category: { $exists: true, $ne: '' },
      status: BlogStatus.PUBLISHED,
      isVisible: true
    });

    res.status(200).json(createSuccessResponse('Blog categories retrieved successfully', categories));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve blog categories', error.message));
  }
};

// Get Blog Tags
export const getBlogTags = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const tags = await Blog.distinct('tags', {
      tags: { $exists: true, $ne: '' },
      status: BlogStatus.PUBLISHED,
      isVisible: true
    });

    // Flatten array of arrays and remove duplicates
    const allTags = tags.flat().filter((tag: any) => tag && tag.trim() !== '');

    res.status(200).json(createSuccessResponse('Blog tags retrieved successfully', allTags));
  } catch (error: any) {
    res.status(500).json(createErrorResponse('Failed to retrieve blog tags', error.message));
  }
};
