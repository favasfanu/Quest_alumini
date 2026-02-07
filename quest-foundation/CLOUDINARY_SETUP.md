# Production File Upload Setup

## Problem
Profile photo uploads work in local development but fail in production because most hosting platforms (Vercel, Netlify, etc.) use **read-only file systems**. Files uploaded to the `/public` directory don't persist across deployments.

## Solution
The application now supports **Cloudinary** for cloud-based file storage in production, while still using the local file system for development.

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a **free account** (includes 25GB storage and 25GB bandwidth/month)
3. After signing up, you'll be redirected to the Dashboard

### 2. Get Your Credentials

From your Cloudinary Dashboard, copy these three values:
- **Cloud Name** (e.g., `dxxxxxxxxxxxx`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz12`)

### 3. Configure Your Production Environment

#### For Vercel:
1. Go to your project settings: https://vercel.com/[your-username]/[your-project]/settings
2. Navigate to **Environment Variables**
3. Add these three variables:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
4. **Important**: Make sure NEXTAUTH_URL is set to your production URL:
   ```
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```
5. Redeploy your application

#### For Other Platforms:
Add the same environment variables to your hosting platform's environment configuration.

### 4. Verify Setup

1. Deploy your application
2. Log in and go to My Profile
3. Try uploading a profile photo
4. Check your Cloudinary Dashboard → Media Library to see the uploaded image

## How It Works

- **Local Development**: When Cloudinary credentials are not set, uploads use the local file system at `/public/uploads/profile-photos/`
- **Production**: When Cloudinary credentials are configured, all uploads go to Cloudinary's cloud storage
- **Automatic**: The API route automatically detects which method to use based on environment variables

## Image Optimization

Cloudinary automatically:
- Resizes images to max 500x500px to save bandwidth
- Optimizes quality for faster loading
- Provides a CDN URL for global fast access
- Stores images permanently (survives deployments)

## Troubleshooting

### Upload still fails in production:
1. Double-check environment variables are set correctly (no typos)
2. Verify API Secret includes all characters (no trailing spaces)
3. Check Cloudinary Dashboard → Usage to ensure you haven't exceeded free tier limits
4. Look at deployment logs for detailed error messages

### Images not displaying:
- Cloudinary URLs are HTTPS by default - ensure your images are referenced with the full URL from the database
- Check browser console for CORS or mixed content errors

## Cost
- **Free Tier**: 25GB storage, 25GB bandwidth/month
- **Sufficient for**: ~50,000 profile photos or ~100,000 monthly views
- Upgrade options available if needed

## Alternative: AWS S3
If you prefer AWS S3, you can modify `/app/api/profile/photo/route.ts` to use the AWS SDK instead of Cloudinary. The pattern is similar.
