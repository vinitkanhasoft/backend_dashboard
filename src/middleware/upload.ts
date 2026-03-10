import multer from 'multer';
import { Request, Response, NextFunction } from 'express';

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
  }
};

// Configure multer for different upload types
export const uploadCarImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files (1 primary + 9 additional)
  },
}).fields([
  { name: 'primaryImage', maxCount: 1 },
  { name: 'images', maxCount: 9 }
]);

// Configure multer for single image upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one file at a time
  },
});

// Export middleware for single image upload
export const uploadSingleImage = upload.single('profileImage');

// Export middleware for banner image upload
export const uploadBannerImage = upload.single('bannerImage');

// Export middleware for blog image upload
export const uploadBlogImage = upload.single('image');

// Export middleware for team member image upload
export const uploadTeamImage = upload.single('image');

// Export middleware for company logo upload
export const uploadCompanyLogo = upload.single('logo');

// Error handling middleware
export const handleUploadError = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
        error: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum allowed is 10.',
        error: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.',
        error: 'UNEXPECTED_FILE'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed (JPEG, PNG, GIF, WebP)') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed (JPEG, PNG, GIF, WebP)',
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  return next(error);
};

// Export multer instance for other uses
export { upload };
