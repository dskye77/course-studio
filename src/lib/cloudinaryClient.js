// lib/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Configure once – safe in server-side code (API routes, server actions, etc.)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY, // secret
  api_secret: process.env.CLOUDINARY_API_SECRET, // secret
  secure: true,
});

const buildPublicId = (userId, courseId, type) => {
  return `course_studio/users/${userId}/courses/${courseId}/${type}`;
};

export const uploadCourseImage = ({
  userId,
  courseId,
  fileBuffer,
  filename = "image",
  type = "main",
}) => {
  if (!userId || !courseId || !fileBuffer) {
    throw new Error("Missing required parameters");
  }

  const publicId = buildPublicId(userId, courseId, type);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId, // full path including folders
        overwrite: true,
        resource_type: "image",
        // Optional: keep it clean
        filename_override: type,
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
        });
      }
    );

    // Accept Buffer or ArrayBuffer
    const buffer = Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer);

    uploadStream.end(buffer);
  });
};

export const deleteCourseImage = async (userId, courseId, type = "main") => {
  const publicId = buildPublicId(userId, courseId, type);

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true, // removes from CDN immediately
  });

  if (result.result === "not found") {
    console.warn(`Image already deleted or not found: ${publicId}`);
  }

  return result;
};
