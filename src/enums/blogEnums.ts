/**
 * Blog status enumeration
 */
export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * Blog sort options for API queries
 */
export enum BlogSortOptions {
  TITLE = 'title',
  POST_DATE = 'postDate',
  VIEWS = 'views',
  LIKES = 'likes',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

/**
 * Blog sort order options
 */
export enum BlogSortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Blog category enumeration - 6 main categories
 */
export enum BlogCategory {
  CAR_BUYING_GUIDE = 'car-buying-guide',
  CAR_REVIEWS = 'car-reviews',
  MAINTENANCE_TIPS = 'maintenance-tips',
  AUTOMOTIVE_NEWS = 'automotive-news',
  DRIVING_SAFETY = 'driving-safety',
  VEHICLE_TECHNOLOGY = 'vehicle-technology'
}

/**
 * Blog category labels for display
 */
export const BlogCategoryLabels: Record<BlogCategory, string> = {
  [BlogCategory.CAR_BUYING_GUIDE]: 'Car Buying Guide',
  [BlogCategory.CAR_REVIEWS]: 'Car Reviews',
  [BlogCategory.MAINTENANCE_TIPS]: 'Maintenance Tips',
  [BlogCategory.AUTOMOTIVE_NEWS]: 'Automotive News',
  [BlogCategory.DRIVING_SAFETY]: 'Driving Safety',
  [BlogCategory.VEHICLE_TECHNOLOGY]: 'Vehicle Technology'
};

/**
 * Default blog categories (legacy - kept for backward compatibility)
 */
export enum DefaultBlogCategories {
  CAR_BUYING_GUIDE = 'Car Buying Guide',
  CAR_REVIEWS = 'Car Reviews',
  MAINTENANCE_TIPS = 'Maintenance Tips',
  ELECTRIC_VEHICLES = 'Electric Vehicles',
  AUTOMOTIVE_NEWS = 'Automotive News',
  DRIVING_TIPS = 'Driving Tips',
  CAR_INSURANCE = 'Car Insurance',
  CAR_FINANCE = 'Car Finance',
  VEHICLE_HISTORY = 'Vehicle History',
  CAR_TECHNOLOGY = 'Car Technology'
}

/**
 * Default blog tags
 */
export enum DefaultBlogTags {
  CAR_BUYING = 'car-buying',
  FIRST_CAR = 'first-car',
  CAR_REVIEWS = 'car-reviews',
  MAINTENANCE = 'maintenance',
  ELECTRIC = 'electric',
  EV = 'ev',
  HYBRID = 'hybrid',
  LUXURY = 'luxury',
  SUV = 'suv',
  SEDAN = 'sedan',
  HATCHBACK = 'hatchback',
  SPORTS_CAR = 'sports-car',
  FAMILY_CAR = 'family-car',
  FUEL_EFFICIENCY = 'fuel-efficiency',
  SAFETY = 'safety',
  TECHNOLOGY = 'technology',
  AUTONOMOUS = 'autonomous',
  SUSTAINABILITY = 'sustainability',
  DRIVING_TIPS = 'driving-tips',
  CAR_INSURANCE = 'car-insurance',
  CAR_LOAN = 'car-loan',
  LEASING = 'leasing',
  TRADE_IN = 'trade-in',
  VEHICLE_INSPECTION = 'vehicle-inspection',
  CAR_HISTORY = 'car-history',
  DEALERSHIP = 'dealership',
  ONLINE_CAR_SHOPPING = 'online-car-shopping'
}

/**
 * Blog content validation constants
 */
export const BlogValidationConstants = {
  TITLE_MAX_LENGTH: 200,
  TAGLINE_MAX_LENGTH: 300,
  CONTENT_MIN_LENGTH: 50,
  EXCERPT_MAX_LENGTH: 500,
  META_TITLE_MAX_LENGTH: 60,
  META_DESCRIPTION_MAX_LENGTH: 160,
  KEYWORD_MAX_LENGTH: 50,
  CATEGORY_MAX_LENGTH: 50,
  TAG_MAX_LENGTH: 50,
  SLUG_MAX_LENGTH: 250,
  SEARCH_QUERY_MAX_LENGTH: 100,
  SEARCH_QUERY_MIN_LENGTH: 1,
  MAX_TAGS_PER_BLOG: 10,
  MAX_KEYWORDS_PER_BLOG: 10
} as const;

/**
 * Blog pagination constants
 */
export const BlogPaginationConstants = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const;

/**
 * Blog reading time calculation constants
 */
export const BlogReadingTimeConstants = {
  WORDS_PER_MINUTE: 200,
  MIN_READING_TIME: 1
} as const;

/**
 * Blog image constants
 */
export const BlogImageConstants = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
  CLOUDINARY_FOLDER: 'blogs',
  DEFAULT_ALT_TEXT: 'Blog featured image',
  MAX_ALT_LENGTH: 200,
  MAX_CAPTION_LENGTH: 500,
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  COMPRESSION_QUALITY: 'auto:good'
} as const;

/**
 * Blog SEO constants
 */
export const BlogSEOConstants = {
  DEFAULT_META_TITLE_SUFFIX: ' | Sell Cars Blog',
  DEFAULT_META_DESCRIPTION: 'Discover the latest car buying tips, reviews, and automotive news on the Sell Cars blog.',
  DEFAULT_KEYWORDS: ['cars', 'car buying', 'automotive', 'car reviews', 'car tips']
} as const;

/**
 * Blog status hierarchy for permissions
 * Higher number = higher privilege level
 */
export const BlogStatusHierarchy: Record<BlogStatus, number> = {
  [BlogStatus.DRAFT]: 1,
  [BlogStatus.PUBLISHED]: 2,
  [BlogStatus.ARCHIVED]: 3
};

/**
 * Default blog status for new blogs
 */
export const DEFAULT_BLOG_STATUS = BlogStatus.DRAFT;

/**
 * Blog status labels for display
 */
export const BlogStatusLabels: Record<BlogStatus, string> = {
  [BlogStatus.DRAFT]: 'Draft',
  [BlogStatus.PUBLISHED]: 'Published',
  [BlogStatus.ARCHIVED]: 'Archived'
};

/**
 * Blog status colors for UI
 */
export const BlogStatusColors: Record<BlogStatus, string> = {
  [BlogStatus.DRAFT]: '#6B7280', // Gray
  [BlogStatus.PUBLISHED]: '#10B981', // Green
  [BlogStatus.ARCHIVED]: '#F59E0B'  // Amber
};

/**
 * Blog sort option labels
 */
export const BlogSortOptionLabels: Record<BlogSortOptions, string> = {
  [BlogSortOptions.TITLE]: 'Title',
  [BlogSortOptions.POST_DATE]: 'Post Date',
  [BlogSortOptions.VIEWS]: 'Views',
  [BlogSortOptions.LIKES]: 'Likes',
  [BlogSortOptions.CREATED_AT]: 'Created Date',
  [BlogSortOptions.UPDATED_AT]: 'Updated Date'
};

/**
 * Array of all default categories for dropdowns
 */
export const ALL_DEFAULT_CATEGORIES = Object.values(DefaultBlogCategories);

/**
 * Array of all default tags for dropdowns
 */
export const ALL_DEFAULT_TAGS = Object.values(DefaultBlogTags);

/**
 * Array of all blog statuses for dropdowns
 */
export const ALL_BLOG_STATUSES = Object.values(BlogStatus);

/**
 * Array of all sort options for dropdowns
 */
export const ALL_SORT_OPTIONS = Object.values(BlogSortOptions);

/**
 * Array of all sort orders for dropdowns
 */
export const ALL_SORT_ORDERS = Object.values(BlogSortOrder);
