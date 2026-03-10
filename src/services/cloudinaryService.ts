import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
}

export class CloudinaryService {
  /**
   * Initialize Cloudinary configuration
   */
  private static ensureConfigured() {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary is not properly configured. Please check environment variables.');
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }

  /**
   * Upload an image to Cloudinary with proper naming and optimization
   */
  static async cloudinaryUpload(
    file: Buffer,
    folder: string = 'cars'
  ): Promise<CloudinaryUploadResult> {
    // Ensure Cloudinary is configured before upload
    this.ensureConfigured();
    
    console.log('Cloudinary config before upload:', {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
      configured: cloudinary.config().cloud_name ? 'YES' : 'NO'
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'webp', // Convert to webp for better compression
          quality: 'auto:good',
          fetch_format: 'auto',
          transformation: [
            {
              width: 800,
              height: 600,
              crop: 'fill',
              gravity: 'auto'
            },
            {
              quality: 'auto:good'
            }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
            });
          } else {
            reject(new Error('Unknown error during upload'));
          }
        }
      );

      // Convert buffer to stream and pipe to upload stream
      const readable = new Readable();
      readable._read = () => {}; // _read is required but you can noop it
      readable.push(file);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Delete an image from Cloudinary using public ID
   */
  static async cloudinaryDelete(publicId: string): Promise<boolean> {
    try {
      this.ensureConfigured();
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Upload an image to Cloudinary with proper naming and optimization
   */
  static async uploadImage(
    file: Buffer,
    folder: string = 'profile-images',
    publicId?: string
  ): Promise<CloudinaryUploadResult> {
    // Ensure Cloudinary is configured before upload
    this.ensureConfigured();
    
    console.log('Cloudinary config before upload:', {
      cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
      api_key: !!process.env.CLOUDINARY_API_KEY,
      api_secret: !!process.env.CLOUDINARY_API_SECRET,
      configured: cloudinary.config().cloud_name ? 'YES' : 'NO'
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          format: 'webp', // Convert to webp for better compression
          quality: 'auto:good',
          fetch_format: 'auto',
          transformation: [
            {
              width: 500,
              height: 500,
              crop: 'fill',
              gravity: 'face'
            },
            {
              quality: 'auto:good'
            }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
            });
          } else {
            reject(new Error('Unknown error during upload'));
          }
        }
      );

      // Convert buffer to stream and pipe to upload stream
      const readable = new Readable();
      readable._read = () => {}; // _read is required but you can noop it
      readable.push(file);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  /**
   * Delete an image from Cloudinary using public ID
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      this.ensureConfigured();
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Delete multiple images from Cloudinary using public IDs
   */
  static async deleteMultipleImages(publicIds: string[]): Promise<{ success: number; failed: number }> {
    try {
      this.ensureConfigured();
      const results = await Promise.allSettled(
        publicIds.map(publicId => cloudinary.uploader.destroy(publicId))
      );

      const success = results.filter(result => 
        result.status === 'fulfilled' && result.value?.result === 'ok'
      ).length;
      
      const failed = results.length - success;

      return { success, failed };
    } catch (error) {
      console.error('Error deleting multiple images from Cloudinary:', error);
      return { success: 0, failed: publicIds.length };
    }
  }

  /**
   * Update user profile image with proper cleanup
   */
  static async updateProfileImage(
    userId: string,
    newImageBuffer: Buffer,
    oldPublicId?: string | null
  ): Promise<{ url: string; publicId: string }> {
    try {
      // Check if Cloudinary is configured
      if (!this.isConfigured()) {
        throw new Error('Cloudinary is not properly configured. Please check environment variables.');
      }

      // Delete old image if it exists
      if (oldPublicId) {
        await this.deleteImage(oldPublicId);
      }

      // Upload new image with user-specific public ID
      const publicId = `user_${userId}_${Date.now()}`;
      const result = await this.uploadImage(newImageBuffer, 'profile-images', publicId);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      throw new Error(`Failed to update profile image: ${error}`);
    }
  }

  /**
   * Update banner image with proper cleanup
   */
  static async updateBannerImage(
    bannerId: string,
    newImageBuffer: Buffer,
    oldPublicId?: string | null
  ): Promise<{ url: string; publicId: string }> {
    try {
      // Check if Cloudinary is configured
      if (!this.isConfigured()) {
        throw new Error('Cloudinary is not properly configured. Please check environment variables.');
      }

      // Delete old image if it exists
      if (oldPublicId) {
        await this.deleteImage(oldPublicId);
      }

      // Upload new image with banner-specific public ID
      const publicId = `banner_${bannerId}_${Date.now()}`;
      const result = await this.uploadImage(newImageBuffer, 'banners', publicId);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      throw new Error(`Failed to update banner image: ${error}`);
    }
  }

  /**
   * Generate a unique public ID for user images
   */
  static generateUserPublicId(userId: string, timestamp?: number): string {
    const ts = timestamp || Date.now();
    return `user_${userId}_${ts}`;
  }

  /**
   * Rename an image in Cloudinary
   */
  static async renameImage(oldPublicId: string, newPublicId: string): Promise<boolean> {
    try {
      this.ensureConfigured();
      const result = await cloudinary.uploader.rename(oldPublicId, newPublicId);
      return result ? true : false;
    } catch (error) {
      console.error('Error renaming image in Cloudinary:', error);
      return false;
    }
  }

  /**
   * Check if Cloudinary is properly configured
   */
  static isConfigured(): boolean {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && 
             process.env.CLOUDINARY_API_KEY && 
             process.env.CLOUDINARY_API_SECRET);
  }
}

// Export individual functions for easier importing
export const cloudinaryUpload = async (file: Buffer, folder: string = 'cars'): Promise<CloudinaryUploadResult> => {
  return CloudinaryService.cloudinaryUpload(file, folder);
};

export const cloudinaryDelete = async (publicId: string): Promise<boolean> => {
  return CloudinaryService.cloudinaryDelete(publicId);
};
