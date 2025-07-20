import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Get Supabase credentials for client-side uploads
router.get("/credentials", isAuthenticated, async (req, res) => {
    try {
        // Get credentials from environment variables
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

        // Log the credentials (without the full key for security)
        console.log('Providing Supabase credentials:', {
            supabaseUrl,
            supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : undefined
        });

        // Validate credentials before sending
        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase credentials in environment variables');
            return res.status(500).json({
                success: false,
                message: "Server configuration error: Supabase credentials not properly configured"
            });
        }

        // Return the Supabase credentials
        // This allows the client to upload directly to Supabase
        res.status(200).json({
            success: true,
            data: {
                supabaseUrl: supabaseUrl,
                supabaseAnonKey: supabaseAnonKey,
                bucket: "mentora"
            }
        });
    } catch (error) {
        console.error("Supabase credentials error:", error);
        res.status(500).json({
            success: false,
            message: "Error getting Supabase credentials",
            error: error.message
        });
    }
});

export default router;
