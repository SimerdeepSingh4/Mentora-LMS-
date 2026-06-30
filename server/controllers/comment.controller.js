import { Comment } from "../models/comment.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";

// Get all comments for a specific lecture
export const getLectureComments = async (req, res) => {
    try {
        const { lectureId } = req.params;

        if (!lectureId) {
            return res.status(400).json({
                success: false,
                message: "Lecture ID is required"
            });
        }

        const comments = await Comment.find({ lectureId })
            .populate("user", "name email role photoUrl")
            .populate("replies.user", "name email role photoUrl")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error("Get comments error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch discussion comments"
        });
    }
};

// Create a new comment/doubt in a lecture
export const createComment = async (req, res) => {
    try {
        const { courseId, lectureId, text } = req.body;
        const userId = req.id;

        if (!courseId || !lectureId || !text) {
            return res.status(400).json({
                success: false,
                message: "Course ID, Lecture ID, and Comment text are required"
            });
        }

        const newComment = new Comment({
            courseId,
            lectureId,
            user: userId,
            text,
            replies: []
        });

        await newComment.save();

        // Populate user info for returning
        const populatedComment = await Comment.findById(newComment._id)
            .populate("user", "name email role photoUrl");

        return res.status(201).json({
            success: true,
            message: "Comment posted successfully",
            data: populatedComment
        });
    } catch (error) {
        console.error("Create comment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to post comment"
        });
    }
};

// Reply to an existing comment
export const replyToComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        const userId = req.id;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Reply text is required"
            });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        comment.replies.push({
            user: userId,
            text
        });

        await comment.save();

        // Populate user details in replies before returning
        const populatedComment = await Comment.findById(commentId)
            .populate("user", "name email role photoUrl")
            .populate("replies.user", "name email role photoUrl");

        return res.status(200).json({
            success: true,
            message: "Reply added successfully",
            data: populatedComment
        });
    } catch (error) {
        console.error("Reply to comment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add reply"
        });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Fetch requesting user to check role
        const requestingUser = await User.findById(userId);
        if (!requestingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isSender = comment.user.toString() === userId;
        const isAdmin = requestingUser.role === "admin";
        
        let isCourseCreator = false;
        if (requestingUser.role === "instructor") {
            const course = await Course.findById(comment.courseId);
            if (course && course.creator.toString() === userId) {
                isCourseCreator = true;
            }
        }

        const isAuthorized = isSender || isAdmin || isCourseCreator;

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        await Comment.findByIdAndDelete(commentId);

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("Delete comment error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete comment"
        });
    }
};

// Delete a reply from a comment
export const deleteReply = async (req, res) => {
    try {
        const { commentId, replyId } = req.params;
        const userId = req.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                message: "Reply not found"
            });
        }

        // Fetch requesting user to check role
        const requestingUser = await User.findById(userId);
        if (!requestingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isSender = reply.user.toString() === userId;
        const isAdmin = requestingUser.role === "admin";
        
        let isCourseCreator = false;
        if (requestingUser.role === "instructor") {
            const course = await Course.findById(comment.courseId);
            if (course && course.creator.toString() === userId) {
                isCourseCreator = true;
            }
        }

        const isAuthorized = isSender || isAdmin || isCourseCreator;

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this reply"
            });
        }

        // Remove sub-document
        comment.replies.pull(replyId);
        await comment.save();

        return res.status(200).json({
            success: true,
            message: "Reply deleted successfully"
        });
    } catch (error) {
        console.error("Delete reply error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete reply"
        });
    }
};
