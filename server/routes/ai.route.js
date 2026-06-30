import express from "express";
import { chatWithTutor, generateQuiz } from "../controllers/ai.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/chat", isAuthenticated, chatWithTutor);
router.post("/generate-quiz", isAuthenticated, generateQuiz);

export default router;
