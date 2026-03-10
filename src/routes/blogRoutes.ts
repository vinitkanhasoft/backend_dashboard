import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadBlogImage } from '../middleware/upload';
import {
  body,
  param,
  query,
  validationResult
} from 'express-validator';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  bulkDeleteBlogs,
  searchBlogs,
  getFeaturedBlogs,
  getRecentBlogs,
  getBlogCategories,
  getBlogTags
} from '../controllers/blogController';
import { 
  BlogStatus, 
  BlogSortOptions, 
  BlogSortOrder,
  BlogPaginationConstants,
  BlogValidationConstants,
  BlogCategory 
} from '../enums/blogEnums';

const router = Router();

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

// Custom middleware to handle multiple form-data fields for arrays
const handleFormDataArrays = (req: Request, res: Response, next: NextFunction) => {
  // Convert multiple 'tags' fields from form-data into an array
  if (req.body && typeof req.body === 'object') {
    const keys = Object.keys(req.body);
    const tags: string[] = [];
    
    console.log('Raw req.body keys:', keys);
    console.log('Raw req.body:', req.body);
    
    keys.forEach(key => {
      if (key.startsWith('tags') && req.body[key]) {
        let tagValue = req.body[key];
        
        // Convert to string if it's not already
        if (typeof tagValue !== 'string') {
          tagValue = String(tagValue);
        }
        
        // Handle if tagValue is a JSON string array
        if (tagValue.startsWith('[')) {
          try {
            const parsedTags = JSON.parse(tagValue);
            if (Array.isArray(parsedTags)) {
              tags.push(...parsedTags.filter(tag => typeof tag === 'string').map(tag => tag.trim()));
            }
          } catch (e) {
            console.log('Failed to parse tags JSON:', tagValue);
          }
        } else {
          // Handle regular string tag
          tags.push(tagValue.trim());
        }
      }
    });
    
    if (tags.length > 0) {
      console.log('Final tags array:', tags);
      req.body.tags = tags;
    }
  }
  
  next();
};

// Blog creation validation
const validateCreateBlog = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Blog title is required')
    .isLength({ max: BlogValidationConstants.TITLE_MAX_LENGTH })
    .withMessage(`Title cannot exceed ${BlogValidationConstants.TITLE_MAX_LENGTH} characters`),
  body('tagline')
    .trim()
    .notEmpty()
    .withMessage('Blog tagline is required')
    .isLength({ max: BlogValidationConstants.TAGLINE_MAX_LENGTH })
    .withMessage(`Tagline cannot exceed ${BlogValidationConstants.TAGLINE_MAX_LENGTH} characters`),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Blog content is required')
    .isLength({ min: BlogValidationConstants.CONTENT_MIN_LENGTH })
    .withMessage(`Content must be at least ${BlogValidationConstants.CONTENT_MIN_LENGTH} characters`),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.EXCERPT_MAX_LENGTH })
    .withMessage(`Excerpt cannot exceed ${BlogValidationConstants.EXCERPT_MAX_LENGTH} characters`),
  body('postDate')
    .optional()
    .isISO8601()
    .withMessage('Post date must be a valid date'),
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.META_TITLE_MAX_LENGTH })
    .withMessage(`Meta title cannot exceed ${BlogValidationConstants.META_TITLE_MAX_LENGTH} characters`),
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.META_DESCRIPTION_MAX_LENGTH })
    .withMessage(`Meta description cannot exceed ${BlogValidationConstants.META_DESCRIPTION_MAX_LENGTH} characters`),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  body('keywords.*')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.KEYWORD_MAX_LENGTH })
    .withMessage(`Keyword cannot exceed ${BlogValidationConstants.KEYWORD_MAX_LENGTH} characters`),
  body('status')
    .optional()
    .isIn(Object.values(BlogStatus))
    .withMessage(`Status must be one of: ${Object.values(BlogStatus).join(', ')}`),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean'),
  body('category')
    .optional()
    .trim()
    .isIn(Object.values(BlogCategory))
    .withMessage(`Category must be one of: ${Object.values(BlogCategory).join(', ')}`),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.TAG_MAX_LENGTH })
    .withMessage(`Tag cannot exceed ${BlogValidationConstants.TAG_MAX_LENGTH} characters`)
];

// Blog update validation
const validateUpdateBlog = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Blog title cannot be empty')
    .isLength({ max: BlogValidationConstants.TITLE_MAX_LENGTH })
    .withMessage(`Title cannot exceed ${BlogValidationConstants.TITLE_MAX_LENGTH} characters`),
  body('tagline')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Blog tagline cannot be empty')
    .isLength({ max: BlogValidationConstants.TAGLINE_MAX_LENGTH })
    .withMessage(`Tagline cannot exceed ${BlogValidationConstants.TAGLINE_MAX_LENGTH} characters`),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Blog content cannot be empty')
    .isLength({ min: BlogValidationConstants.CONTENT_MIN_LENGTH })
    .withMessage(`Content must be at least ${BlogValidationConstants.CONTENT_MIN_LENGTH} characters`),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.EXCERPT_MAX_LENGTH })
    .withMessage(`Excerpt cannot exceed ${BlogValidationConstants.EXCERPT_MAX_LENGTH} characters`),
  body('postDate')
    .optional()
    .isISO8601()
    .withMessage('Post date must be a valid date'),
  body('metaTitle')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.META_TITLE_MAX_LENGTH })
    .withMessage(`Meta title cannot exceed ${BlogValidationConstants.META_TITLE_MAX_LENGTH} characters`),
  body('metaDescription')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.META_DESCRIPTION_MAX_LENGTH })
    .withMessage(`Meta description cannot exceed ${BlogValidationConstants.META_DESCRIPTION_MAX_LENGTH} characters`),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array'),
  body('keywords.*')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.KEYWORD_MAX_LENGTH })
    .withMessage(`Keyword cannot exceed ${BlogValidationConstants.KEYWORD_MAX_LENGTH} characters`),
  body('status')
    .optional()
    .isIn(Object.values(BlogStatus))
    .withMessage(`Status must be one of: ${Object.values(BlogStatus).join(', ')}`),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  body('isVisible')
    .optional()
    .isBoolean()
    .withMessage('isVisible must be a boolean'),
  body('category')
    .optional()
    .trim()
    .isIn(Object.values(BlogCategory))
    .withMessage(`Category must be one of: ${Object.values(BlogCategory).join(', ')}`),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: BlogValidationConstants.TAG_MAX_LENGTH })
    .withMessage(`Tag cannot exceed ${BlogValidationConstants.TAG_MAX_LENGTH} characters`)
];

// Blog ID validation
const validateBlogId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid blog ID')
];

// Blog slug validation
const validateBlogSlug = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Blog slug is required')
    .isLength({ max: BlogValidationConstants.SLUG_MAX_LENGTH })
    .withMessage(`Slug cannot exceed ${BlogValidationConstants.SLUG_MAX_LENGTH} characters`)
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
];

// Get blogs query validation
const validateGetBlogs = [
  query('page')
    .optional()
    .isInt({ min: BlogPaginationConstants.DEFAULT_PAGE })
    .withMessage(`Page must be a positive integer`),
  query('limit')
    .optional()
    .isInt({ min: BlogPaginationConstants.MIN_LIMIT, max: BlogPaginationConstants.MAX_LIMIT })
    .withMessage(`Limit must be between ${BlogPaginationConstants.MIN_LIMIT} and ${BlogPaginationConstants.MAX_LIMIT}`),
  query('status')
    .optional()
    .isIn(Object.values(BlogStatus))
    .withMessage(`Status must be one of: ${Object.values(BlogStatus).join(', ')}`),
  query('category')
    .optional()
    .trim()
    .isIn(Object.values(BlogCategory))
    .withMessage(`Category must be one of: ${Object.values(BlogCategory).join(', ')}`),
  query('tags')
    .optional()
    .trim(),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: BlogValidationConstants.SEARCH_QUERY_MIN_LENGTH, max: BlogValidationConstants.SEARCH_QUERY_MAX_LENGTH })
    .withMessage(`Search query must be between ${BlogValidationConstants.SEARCH_QUERY_MIN_LENGTH} and ${BlogValidationConstants.SEARCH_QUERY_MAX_LENGTH} characters`),
  query('sortBy')
    .optional()
    .isIn(Object.values(BlogSortOptions))
    .withMessage(`Invalid sort field. Must be one of: ${Object.values(BlogSortOptions).join(', ')}`),
  query('sortOrder')
    .optional()
    .isIn(Object.values(BlogSortOrder))
    .withMessage(`Sort order must be one of: ${Object.values(BlogSortOrder).join(', ')}`)
];

// Search validation
const validateSearchBlogs = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: BlogValidationConstants.SEARCH_QUERY_MIN_LENGTH, max: BlogValidationConstants.SEARCH_QUERY_MAX_LENGTH })
    .withMessage(`Search query must be between ${BlogValidationConstants.SEARCH_QUERY_MIN_LENGTH} and ${BlogValidationConstants.SEARCH_QUERY_MAX_LENGTH} characters`),
  query('page')
    .optional()
    .isInt({ min: BlogPaginationConstants.DEFAULT_PAGE })
    .withMessage(`Page must be a positive integer`),
  query('limit')
    .optional()
    .isInt({ min: BlogPaginationConstants.MIN_LIMIT, max: BlogPaginationConstants.MAX_LIMIT })
    .withMessage(`Limit must be between ${BlogPaginationConstants.MIN_LIMIT} and ${BlogPaginationConstants.MAX_LIMIT}`),
  query('category')
    .optional()
    .trim()
    .isIn(Object.values(BlogCategory))
    .withMessage(`Category must be one of: ${Object.values(BlogCategory).join(', ')}`),
  query('tags')
    .optional()
    .trim(),
  query('status')
    .optional()
    .isIn(Object.values(BlogStatus))
    .withMessage(`Status must be one of: ${Object.values(BlogStatus).join(', ')}`)
];

// Bulk delete validation
const validateBulkDelete = [
  body('ids')
    .isArray({ min: 1 })
    .withMessage('IDs array is required and must not be empty'),
  body('ids.*')
    .isMongoId()
    .withMessage('Invalid blog ID in the array')
];

// Public routes
router.get('/featured', getFeaturedBlogs);
router.get('/recent', getRecentBlogs);
router.get('/search', validateSearchBlogs, handleValidationErrors, searchBlogs);
router.get('/categories', getBlogCategories);
router.get('/tags', getBlogTags);
router.get('/slug/:slug', validateBlogSlug, handleValidationErrors, getBlogBySlug);

// Protected routes
router.use(authenticate);

// CRUD routes with validation and form data support
router.post('/', uploadBlogImage, handleFormDataArrays, validateCreateBlog, handleValidationErrors, createBlog);
router.get('/', validateGetBlogs, handleValidationErrors, getAllBlogs);
router.get('/:id', validateBlogId, handleValidationErrors, getBlogById);
router.put('/:id', uploadBlogImage, handleFormDataArrays, validateUpdateBlog, handleValidationErrors, updateBlog);
router.delete('/:id', validateBlogId, handleValidationErrors, deleteBlog);
router.post('/bulk-delete', validateBulkDelete, handleValidationErrors, bulkDeleteBlogs);

export default router;
