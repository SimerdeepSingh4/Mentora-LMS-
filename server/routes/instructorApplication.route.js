import express from "express";
import {
  applyInstructor,
  getAllApplications,
  getApplicationDetails,
  updateApplicationStatus,
  resetRejectedApplication
} from "../controllers/instructorApplication.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

// Student routes
router.post("/apply", isAuthenticated, applyInstructor);

// Admin routes
router.get("/", isAuthenticated, isAdmin, getAllApplications);
router.get("/:applicationId", isAuthenticated, isAdmin, getApplicationDetails);
router.put("/:applicationId/status", isAuthenticated, isAdmin, updateApplicationStatus);
router.post("/:applicationId/reset", isAuthenticated, isAdmin, resetRejectedApplication);

export default router;
