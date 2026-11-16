
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "cgms/grievance-attachments",
                resource_type: "auto",
                ...options,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });
};

// Delete uploaded file from Cloudinary
export const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {
    if (!publicId) return;

    return cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
    });
};
