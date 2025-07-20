import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, deleteCourse, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorCourses, getInstructorDashboardStats, getLectureById, getPublishedCourse, removeLecture, searchCourse, togglePublishCourse } from "../controllers/course.controller.js";
import upload from "../utils/multer.js";
const router = express.Router();

// Public routes
router.route("/published-courses").get(getPublishedCourse);
router.route("/search").get(searchCourse);

// Protected routes
router.route("/").post(isAuthenticated, upload.single("courseThumbnail"), createCourse);
router.route("/").get(isAuthenticated, getCreatorCourses);
router.route("/:courseId").delete(isAuthenticated, deleteCourse);
router.route("/:courseId").put(isAuthenticated, upload.single("courseThumbnail"), editCourse);
router.route("/:courseId").get(isAuthenticated, getCourseById);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);
router.route("/:courseId").patch(isAuthenticated, togglePublishCourse);
router.route("/instructor/stats").get(isAuthenticated, getInstructorDashboardStats);

export default router;