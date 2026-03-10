import mongoose, { Document, Schema } from 'mongoose';
import { BlogStatus, BlogReadingTimeConstants, BlogValidationConstants, BlogImageConstants, BlogCategory } from '../enums/blogEnums';

// Blog Image Interface
export interface IBlogImage {
  url: string;
  publicId: string;
  alt?: string;
  caption?: string;
}

// Main Blog Interface
export interface IBlog extends Document {
  // Basic Information
  title: string;
  tagline: string;
  slug: string;
  
  // Content
  content: string;
  excerpt?: string;
  
  // Media
  featuredImage?: IBlogImage;
  
  // Metadata
  postDate: Date;
  timeToRead: number; // in minutes
  
  // SEO & Analytics
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  
  // Status & Visibility
  status: BlogStatus;
  isFeatured: boolean;
  isVisible: boolean;
  
  // Categories & Tags
  category?: BlogCategory;
  tags?: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Blog Image Schema
const BlogImageSchema = new Schema<IBlogImage>({
  url: {
    type: String,
    required: [true, 'Image URL is required']
  },
  publicId: {
    type: String,
    required: [true, 'Public ID is required']
  },
  alt: {
    type: String,
    trim: true,
    maxlength: [BlogImageConstants.MAX_ALT_LENGTH, `Alt text cannot exceed ${BlogImageConstants.MAX_ALT_LENGTH} characters`]
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [BlogImageConstants.MAX_CAPTION_LENGTH, `Caption cannot exceed ${BlogImageConstants.MAX_CAPTION_LENGTH} characters`]
  }
}, { _id: false });

// Function to calculate reading time
const calculateReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / BlogReadingTimeConstants.WORDS_PER_MINUTE) || BlogReadingTimeConstants.MIN_READING_TIME;
};

// Function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Main Blog Schema
const BlogSchema = new Schema<IBlog>({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [BlogValidationConstants.TITLE_MAX_LENGTH, `Title cannot exceed ${BlogValidationConstants.TITLE_MAX_LENGTH} characters`]
  },
  tagline: {
    type: String,
    required: [true, 'Blog tagline is required'],
    trim: true,
    maxlength: [BlogValidationConstants.TAGLINE_MAX_LENGTH, `Tagline cannot exceed ${BlogValidationConstants.TAGLINE_MAX_LENGTH} characters`]
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [BlogValidationConstants.SLUG_MAX_LENGTH, `Slug cannot exceed ${BlogValidationConstants.SLUG_MAX_LENGTH} characters`]
  },
  
  // Content
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [BlogValidationConstants.CONTENT_MIN_LENGTH, `Content must be at least ${BlogValidationConstants.CONTENT_MIN_LENGTH} characters`]
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [BlogValidationConstants.EXCERPT_MAX_LENGTH, `Excerpt cannot exceed ${BlogValidationConstants.EXCERPT_MAX_LENGTH} characters`]
  },
  
  // Media
  featuredImage: BlogImageSchema,
  
  // Metadata
  postDate: {
    type: Date,
    required: [true, 'Post date is required'],
    default: Date.now
  },
  timeToRead: {
    type: Number,
    min: [BlogReadingTimeConstants.MIN_READING_TIME, `Time to read must be at least ${BlogReadingTimeConstants.MIN_READING_TIME} minute`]
  },
  
  // SEO & Analytics
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [BlogValidationConstants.META_TITLE_MAX_LENGTH, `Meta title cannot exceed ${BlogValidationConstants.META_TITLE_MAX_LENGTH} characters`]
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [BlogValidationConstants.META_DESCRIPTION_MAX_LENGTH, `Meta description cannot exceed ${BlogValidationConstants.META_DESCRIPTION_MAX_LENGTH} characters`]
  },
  keywords: [{
    type: String,
    trim: true,
    maxlength: [BlogValidationConstants.KEYWORD_MAX_LENGTH, `Keyword cannot exceed ${BlogValidationConstants.KEYWORD_MAX_LENGTH} characters`]
  }],
  
  // Status & Visibility
  status: {
    type: String,
    required: [true, 'Blog status is required'],
    enum: Object.values(BlogStatus),
    default: BlogStatus.DRAFT
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  
  // Categories & Tags
  category: {
    type: String,
    enum: Object.values(BlogCategory),
    trim: true,
    maxlength: [BlogValidationConstants.CATEGORY_MAX_LENGTH, `Category cannot exceed ${BlogValidationConstants.CATEGORY_MAX_LENGTH} characters`]
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [BlogValidationConstants.TAG_MAX_LENGTH, `Tag cannot exceed ${BlogValidationConstants.TAG_MAX_LENGTH} characters`]
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate slug and calculate reading time
BlogSchema.pre('save', function(next) {
  console.log('Pre-save middleware triggered');
  console.log('Document state:', {
    isModified: this.isModified,
    slug: this.slug,
    title: this.title,
    content: this.content ? this.content.substring(0, 50) + '...' : 'NO CONTENT',
    timeToRead: this.timeToRead,
    excerpt: this.excerpt ? this.excerpt.substring(0, 50) + '...' : 'NO EXCERPT'
  });
  
  // Always generate slug if not provided
  if (!this.slug || this.isModified('title')) {
    console.log('Generating slug from title:', this.title);
    this.slug = generateSlug(this.title);
    console.log('Generated slug:', this.slug);
  }
  
  // Always calculate reading time if content is modified or not set
  if (!this.timeToRead || this.isModified('content')) {
    console.log('Calculating reading time from content length:', this.content ? this.content.length : 0);
    this.timeToRead = calculateReadingTime(this.content || '');
    console.log('Calculated timeToRead:', this.timeToRead);
  }
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    console.log('Generating excerpt from content');
    this.excerpt = this.content.substring(0, 150) + (this.content.length > 150 ? '...' : '');
    console.log('Generated excerpt:', this.excerpt);
  }
  
  console.log('Final document state before save:', {
    slug: this.slug,
    timeToRead: this.timeToRead,
    excerpt: this.excerpt
  });
  
  next();
});

// Pre-save middleware to ensure slug uniqueness
BlogSchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const originalSlug = this.slug;
    let slugExists = true;
    let counter = 1;
    
    while (slugExists) {
      const existingBlog = await Blog.findOne({ slug: this.slug });
      if (!existingBlog || existingBlog._id.toString() === this._id.toString()) {
        slugExists = false;
      } else {
        this.slug = `${originalSlug}-${counter}`;
        counter++;
      }
    }
  }
  
  next();
});

// Indexes for better performance
BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1, isVisible: 1 });
BlogSchema.index({ isFeatured: 1, status: 1 });
BlogSchema.index({ postDate: -1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ tags: 1 });

// Text index for search
BlogSchema.index({
  title: 'text',
  tagline: 'text',
  content: 'text',
  excerpt: 'text',
  keywords: 'text',
  tags: 'text',
  category: 'text'
});

// Virtual for formatted post date
BlogSchema.virtual('formattedPostDate').get(function() {
  return this.postDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for URL
BlogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
