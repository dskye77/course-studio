// lib/cloudinaryImages.js
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary once (safe in server-side code)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper: build the public ID path for user uploads
const buildPublicId = (userId, imageName) => {
  return `course_studio/users/${userId}/uploads/${imageName}`;
};

/**
 * Upload an image to Cloudinary
 * @param {Object} options
 * @param {string} options.userId
 * @param {Buffer | ArrayBuffer} options.fileBuffer
 * @param {string} options.imageName
 * @returns {Promise<Object>} uploaded image info
 */
export const uploadImage = ({ userId, fileBuffer, imageName }) => {
  if (!userId || !fileBuffer || !imageName) {
    throw new Error("Missing required parameters");
  }

  const publicId = buildPublicId(userId, imageName);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        unique_filename: false,
        use_filename: false,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        if (!result) return reject(new Error("No result from Cloudinary"));

        resolve({
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          createdAt: result.created_at,
        });
      }
    );

    const buffer = Buffer.isBuffer(fileBuffer) ? fileBuffer : Buffer.from(fileBuffer);
    uploadStream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary
 * @param {string} userId
 * @param {string} imageName
 */
export const deleteImage = async (userId, imageName) => {
  const publicId = buildPublicId(userId, imageName);

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true, // removes from CDN immediately
  });

  if (result.result === "not found") {
    console.warn(`Image already deleted or not found: ${publicId}`);
  }

  return result;
};

/**
 * Fetch all images for a user
 * @param {string} userId
 * @returns {Promise<Array>} Array of images
 */
export const fetchAllImages = async (userId) => {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: `course_studio/users/${userId}/uploads/`,
    max_results: 100,
  });

  return result.resources.map((r) => ({
    publicId: r.public_id,
    url: r.secure_url,
    name: r.filename || r.public_id.split("/").pop(),
    format: r.format,
    width: r.width,
    height: r.height,
    size: r.bytes,
    createdAt: r.created_at,
  }));
};
