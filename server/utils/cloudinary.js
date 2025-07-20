import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import { emitUploadProgress } from './socketManager.js';
dotenv.config({});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

export const uploadMedia = async (file, originalName, socketId = null, uploadId = null) => {
    try {
        // Get the file extension from either the original name or the file path
        let fileExtension;
        if (originalName) {
            fileExtension = originalName.split('.').pop().toLowerCase();
        } else {
            // Extract extension from file path
            const fileName = file.split('/').pop();
            fileExtension = fileName.split('.').pop().toLowerCase();
        }

        let resourceType = "auto";

        // Determine resource type based on file extension
        if (['pdf', 'doc', 'docx'].includes(fileExtension)) {
            resourceType = "raw";
        } else if (['ppt', 'pptx'].includes(fileExtension)) {
            resourceType = "raw";
        } else if (['mp4', 'mov', 'avi', 'webm'].includes(fileExtension)) {
            resourceType = "video";
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            resourceType = "image";
        }

        // Clean up the file path to use forward slashes
        const cleanPath = file.replace(/\\/g, '/');

        console.log('Uploading to Cloudinary:', {
            path: cleanPath,
            extension: fileExtension,
            resourceType
        });

        // If we have a socket connection, emit initial progress
        try {
            if (socketId && uploadId) {
                emitUploadProgress(socketId, uploadId, 5); // Start at 5%
            }
        } catch (error) {
            console.log("Socket error (non-critical):", error.message);
            // Continue with upload even if socket fails
        }

        const uploadOptions = {
            resource_type: resourceType,
            chunk_size: 10000000, // Increased to 10MB chunks
            format: fileExtension,
            access_mode: "public",
            timeout: 120000, // Increased timeout to 2 minutes
            eager: false // Disable eager transformations for faster uploads
        };

        // For videos, add additional options
        if (resourceType === "video") {
            uploadOptions.resource_type = "video";
            uploadOptions.chunk_size = 10000000; // 10MB chunks for videos
            uploadOptions.timeout = 300000; // 5 minutes timeout for videos
        }

        // For documents, add specific options
        if (['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(fileExtension)) {
            uploadOptions.resource_type = "raw";
            uploadOptions.format = fileExtension;
            uploadOptions.chunk_size = 10000000; // 10MB chunks for documents
            uploadOptions.timeout = 180000; // 3 minutes timeout for documents
        }

        // For images, add specific options
        if (resourceType === "image") {
            uploadOptions.resource_type = "image";
            uploadOptions.format = fileExtension;
            uploadOptions.quality = "auto";
            uploadOptions.fetch_format = "auto";
            uploadOptions.timeout = 60000; // 1 minute timeout for images
        }

        // For videos, we'll use a custom approach to track progress
        if (resourceType === "video" && socketId && uploadId) {
            // Get file size for progress calculation
            const stats = fs.statSync(cleanPath);
            const fileSizeInBytes = stats.size;

            // We'll simulate progress since Cloudinary doesn't provide real-time progress
            // This is an approximation based on typical upload speeds
            let progress = 5; // Start at 5%
            const progressInterval = setInterval(() => {
                // Increment progress by small amounts
                progress += 1;
                if (progress <= 95) { // Cap at 95% until we get confirmation
                    try {
                        emitUploadProgress(socketId, uploadId, progress);
                    } catch (error) {
                        console.log("Socket progress error (non-critical):", error.message);
                    }
                } else {
                    clearInterval(progressInterval);
                }
            }, 1000); // Update every second

            try {
                const uploadResponse = await cloudinary.uploader.upload(cleanPath, uploadOptions);

                // Clear the interval if it's still running
                clearInterval(progressInterval);

                // Upload complete - set to 100%
                try {
                    emitUploadProgress(socketId, uploadId, 100);
                } catch (error) {
                    console.log("Socket completion error (non-critical):", error.message);
                }

                // For raw files (like PDFs, PPTs, DOCX), we need to modify the URL to ensure proper handling
                let secure_url = uploadResponse.secure_url;
                if (resourceType === "raw") {
                    secure_url = secure_url.replace('/upload/', '/upload/fl_attachment:attachment/');
                }

                console.log('Upload successful:', {
                    secure_url,
                    public_id: uploadResponse.public_id,
                    format: fileExtension
                });

                return {
                    secure_url,
                    public_id: uploadResponse.public_id
                };
            } catch (uploadError) {
                // Clear the interval if it's still running
                clearInterval(progressInterval);

                // Upload failed
                try {
                    emitUploadProgress(socketId, uploadId, -1); // Use -1 to indicate error
                } catch (error) {
                    console.log("Socket error notification error (non-critical):", error.message);
                }

                console.error("Cloudinary Upload Error:", uploadError);
                throw uploadError;
            }
        } else {
            // For non-video uploads or when no socket is available
            try {
                const uploadResponse = await cloudinary.uploader.upload(cleanPath, uploadOptions);

                // For raw files (like PDFs, PPTs, DOCX), we need to modify the URL to ensure proper handling
                let secure_url = uploadResponse.secure_url;
                if (resourceType === "raw") {
                    secure_url = secure_url.replace('/upload/', '/upload/fl_attachment:attachment/');
                }

                // If we have a socket connection, emit 100% progress
                if (socketId && uploadId) {
                    try {
                        emitUploadProgress(socketId, uploadId, 100);
                    } catch (error) {
                        console.log("Socket completion error (non-critical):", error.message);
                    }
                }

                console.log('Upload successful:', {
                    secure_url,
                    public_id: uploadResponse.public_id,
                    format: fileExtension
                });

                return {
                    secure_url,
                    public_id: uploadResponse.public_id
                };
            } catch (uploadError) {
                // If we have a socket connection, emit error
                if (socketId && uploadId) {
                    try {
                        emitUploadProgress(socketId, uploadId, -1); // Use -1 to indicate error
                    } catch (error) {
                        console.log("Socket error notification error (non-critical):", error.message);
                    }
                }

                console.error("Cloudinary Upload Error:", uploadError);
                throw uploadError;
            }
        }
    } catch (error) {
        console.error("Error in uploadMedia:", error);
        throw error;
    }
};

export const deleteMediaFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        return { success: true, message: "Media deleted successfully" };
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        return { success: false, message: "Failed to delete media", error };
    }
};

export const deleteVideoFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        return { success: true, message: "Video deleted successfully" };
    } catch (error) {
        console.error("Cloudinary Video Delete Error:", error);
        return { success: false, message: "Failed to delete video", error };
    }
};