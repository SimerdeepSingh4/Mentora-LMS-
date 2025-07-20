import express from "express";
import {
    createQuiz,
    getQuiz,
    submitQuiz,
    getQuizAttempts,
} from "../controllers/quiz.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/create", isAuthenticated, createQuiz);
router.get("/:quizId", isAuthenticated, getQuiz);
router.post("/:quizId/submit", isAuthenticated, submitQuiz);
router.get("/:quizId/attempts", isAuthenticated, getQuizAttempts);

export default router;
