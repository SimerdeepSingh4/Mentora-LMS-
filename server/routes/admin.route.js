import express from "express";
import { 
  getAllUsers, 
  getUserDetails, 
  updateUserRole,
  getAdminStats
} from "../controllers/admin.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";

const router = express.Router();

// Admin routes
router.get("/stats", isAuthenticated, isAdmin, getAdminStats);
router.get("/users", isAuthenticated, isAdmin, getAllUsers);
router.get("/users/:userId", isAuthenticated, isAdmin, getUserDetails);
router.put("/users/:userId/role", isAuthenticated, isAdmin, updateUserRole);

export default router;
