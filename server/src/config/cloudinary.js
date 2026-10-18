const cloudinary = require('cloudinary').v2;

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('☁️ Cloudinary is configured and ready for uploads.');
} else {
  console.log('⚠️ Cloudinary credentials not fully set in .env. Falling back to local data URI/placeholder upload preview mode.');
}

/**
 * Uploads a file buffer to Cloudinary (or returns data URL fallback if unconfigured)
 * @param {Buffer} buffer 
 * @param {string} originalName 
 * @param {string} mimeType
 * @returns {Promise<string>} Secure URL of uploaded image
 */
async function uploadToCloudinary(buffer, originalName, mimeType = 'image/jpeg') {
  if (!isConfigured) {
    // Generate inline base64 data URI so user sees the uploaded image immediately in demo
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'theeventstore/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

module.exports = {
  cloudinary,
  isConfigured,
  uploadToCloudinary,
};
