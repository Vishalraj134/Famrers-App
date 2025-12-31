const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} filename - Original filename
 * @param {string} folder - Folder path in Cloudinary (optional)
 * @returns {Promise<string>} - Public URL of uploaded image
 */
const uploadToCloudinary = async (fileBuffer, filename, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 800, crop: 'limit' }, // Resize if needed
          { quality: 'auto' } // Auto quality optimization
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url); // Use secure_url for HTTPS
        }
      }
    );

    // Convert buffer to stream
    const bufferStream = new Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Full URL of the image
 * @returns {Promise<void>}
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{ext}
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return;

    const pathParts = urlParts.slice(uploadIndex + 1);
    const publicId = pathParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Log error but don't throw - deletion failures shouldn't break the flow
    console.error('Error deleting from Cloudinary:', error.message);
  }
};

/**
 * Check if URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
const isCloudinaryUrl = (url) => {
  return url && typeof url === 'string' && url.includes('cloudinary.com');
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryUrl
};

