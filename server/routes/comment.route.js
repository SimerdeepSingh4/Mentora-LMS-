import express from "express";
import {
    getLectureComments,
    createComment,
    replyToComment,
    deleteComment,
    deleteReply
} from "../controllers/comment.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/:lectureId", isAuthenticated, getLectureComments);
router.post("/create", isAuthenticated, createComment);
router.post("/reply/:commentId", isAuthenticated, replyToComment);
router.delete("/:commentId", isAuthenticated, deleteComment);
router.delete("/:commentId/reply/:replyId", isAuthenticated, deleteReply);

export default router;
