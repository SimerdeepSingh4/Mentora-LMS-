import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import mediaRoute from "./routes/media.route.js";
import quizRoute from "./routes/quiz.route.js";
import instructorApplicationRoute from "./routes/instructorApplication.route.js";
import adminRoute from "./routes/admin.route.js";
import supabaseRoute from "./routes/supabase.route.js";
import aiRoute from "./routes/ai.route.js";
import leaderboardRoute from "./routes/leaderboard.route.js";
import commentRoute from "./routes/comment.route.js";
import { initializeSocket } from "./utils/socketManager.js";


dotenv.config({});

// call database connection here
connectDB();
const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = initializeSocket(server);

const PORT = process.env.PORT || 3000;

// default middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id", "x-socket-id", "x-upload-id"]
}));

// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/instructor-applications", instructorApplicationRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/supabase", supabaseRoute);
app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/leaderboard", leaderboardRoute);
app.use("/api/v1/comment", commentRoute);

// Wildcard fallback to serve index.html for Single Page Application (SPA) client routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


server.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
})

