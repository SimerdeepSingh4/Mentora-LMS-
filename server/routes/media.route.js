import express from "express";
import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";

const router = express.Router();

// Upload Video
router.post("/upload-video", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        // Validate file type
        const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type. Only MP4, MOV, AVI, and WEBM are allowed."
            });
        }

        // Validate file size (max 500MB)
        const maxSize = 500 * 1024 * 1024; // 500MB in bytes
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size is 500MB."
            });
        }

        // Get socket ID and upload ID from headers if available
        const socketId = req.headers['x-socket-id'];
        const uploadId = req.headers['x-upload-id'] || Date.now().toString();

        const result = await uploadMedia(req.file.path, req.file.originalname, socketId, uploadId);

        res.status(200).json({
            success: true,
            message: "Video uploaded successfully.",
            data: {
                secure_url: result.secure_url,
                public_id: result.public_id,
                uploadId: uploadId // Return the upload ID for client reference
            }
        });
    } catch (error) {
        console.error("Video upload error:", error);
        res.status(500).json({
            success: false,
            message: "Error uploading video",
            error: error.message
        });
    }
});

// Upload Document (PDF, PPT, DOCX)
router.post("/upload-material", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const fileType = req.file.mimetype;
        console.log('Received file:', {
            originalName: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Validate file type
        const allowedTypes = [
            "application/pdf",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file format. Only PDF, PPT, and DOCX are allowed."
            });
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (req.file.size > maxSize) {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size is 50MB."
            });
        }

        // Upload to Cloudinary
        const result = await uploadMedia(req.file.path, req.file.originalname);
        console.log('Upload result:', result);

        // For PDF files, modify the URL to make it directly viewable
        let secureUrl = result.secure_url;
        if (req.file.mimetype === "application/pdf") {
            // Remove the fl_attachment:attachment parameter which causes download instead of view
            secureUrl = secureUrl.replace('/upload/fl_attachment:attachment/', '/upload/');
        }

        res.status(200).json({
            success: true,
            message: "Material uploaded successfully.",
            data: {
                ...result,
                secure_url: secureUrl
            },
        });
    } catch (error) {
        console.error("Material upload error:", error);
        res.status(500).json({
            success: false,
            message: "Error uploading material",
            error: error.message
        });
    }
});

export default router;
