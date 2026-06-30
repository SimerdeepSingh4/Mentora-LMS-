import express from "express";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getLeaderboard);

export default router;
