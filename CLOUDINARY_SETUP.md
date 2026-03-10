# Cloudinary Setup Guide

## The Error
You're getting this error because Cloudinary environment variables are not configured:
```
TypeError: Cannot read properties of undefined (reading 'ensureConfigured')
```

## Quick Fix

### Option 1: Get Cloudinary Credentials (Recommended)
1. Sign up for free at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings → API Keys
3. Copy your credentials:
   - Cloud name
   - API Key  
   - API Secret

### Option 2: Add to .env file
Add these lines to your `.env` file:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Option 3: Temporary Development Fix
If you want to test without Cloudinary, add placeholder values to `.env`:
```env
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo_key  
CLOUDINARY_API_SECRET=demo_secret
```

## After Configuration
1. Restart your server
2. Try creating a car again

## Current Error Handling
The controller now provides clear error messages:
- If Cloudinary is not configured: "Image upload service is not configured. Please contact administrator."
- If upload fails: "Failed to upload primary/additional images"

## Testing Without Real Images
You can also test the API by:
1. Commenting out image upload code temporarily
2. Using placeholder image URLs
3. Setting up Cloudinary demo account
