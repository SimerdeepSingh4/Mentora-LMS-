import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { updateUserGamification } from "../utils/gamification.js";
import { recordActivity } from "../utils/activityLogger.js";

export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseDetails = await Course.findById(courseId)
            .populate({ path: "creator" })
            .populate({
                path: "lectures",
                select: "lectureTitle videoUrl publicId isPreviewFree docInfo materials quiz",
                populate: {
                    path: "quiz",
                    select: "questions timeLimit passingScore"
                }
            });

        if (!courseDetails) {
            return res.status(404).json({
                message: "Course not found",
            });
        }

        // Ensure user is enrolled in the course or is the course creator
        let user = await User.findById(userId);
        const isCreator = courseDetails.creator._id.toString() === userId || courseDetails.creator.toString() === userId;
        const isAdmin = user?.role === "admin";
        const isInstructor = user?.role === "instructor";

        // Check if course creator is an admin
        const isCourseCreatedByAdmin = courseDetails.creator?.role === "admin";
        if (isCourseCreatedByAdmin && user?.role !== "instructor" && user?.role !== "admin") {
            return res.status(403).json({
                message: "This course is restricted to instructors only.",
                success: false
            });
        }

        let hasAccess = false;
        if (isAdmin) {
            hasAccess = true;
        } else if (isInstructor) {
            hasAccess = isCreator;
        } else {
            let isEnrolled = user?.enrolledCourses?.includes(courseId);
            if (!isCreator && !isEnrolled) {
                // Check for pending Stripe purchase record
                const { CoursePurchase } = await import("../models/coursePurchase.model.js");
                const purchase = await CoursePurchase.findOne({ userId, courseId });
                if (purchase && purchase.status === "pending" && purchase.paymentId) {
                    try {
                        console.log("Checking Stripe session from getCourseProgress:", purchase.paymentId);
                        const Stripe = (await import("stripe")).default;
                        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
                        const session = await stripe.checkout.sessions.retrieve(purchase.paymentId);
                        if (session && session.payment_status === "paid") {
                            console.log("Stripe payment confirmed in getCourseProgress! Enrolling student.");
                            purchase.status = "completed";
                            if (session.amount_total) {
                                purchase.amount = session.amount_total / 100;
                            }
                            await purchase.save();

                            // Enroll user
                            user = await User.findByIdAndUpdate(
                                userId,
                                { $addToSet: { enrolledCourses: courseId } },
                                { new: true }
                            );
                            await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: userId } });
                            isEnrolled = true;
                        }
                    } catch (stripeError) {
                        console.error("Failed to verify Stripe payment in getCourseProgress:", stripeError);
                    }
                }
            }
            hasAccess = isCreator || isEnrolled;
        }

        if (!hasAccess) {
            return res.status(403).json({
                message: "You must purchase this course to view its progress or contents.",
                success: false
            });
        }

        // fetch the user course progress
        let courseProgress = await CourseProgress.findOne({
            courseId,
            userId,
        }).populate("courseId");

        // Step-2 If no progress found, return course details with an empty progress
        if (!courseProgress) {
            return res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false,
                },
            });
        }

        // Step-3 Return the user's course progress along with course details
        return res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed,
            },
        });
    } catch (error) {
        console.error("Get course progress error:", error);
        return res.status(500).json({
            message: "Failed to get course progress"
        });
    }
};

export const updateLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params;
        const userId = req.id;

        // Ensure user is enrolled in the course or is the course creator
        const user = await User.findById(userId);
        const courseRef = await Course.findById(courseId);
        if (!courseRef) {
            return res.status(404).json({
                message: "Course not found",
                success: false
            });
        }

        const isCreator = courseRef.creator.toString() === userId;
        const isAdmin = user?.role === "admin";
        const isInstructor = user?.role === "instructor";

        let hasAccess = false;
        if (isAdmin) {
            hasAccess = true;
        } else if (isInstructor) {
            hasAccess = isCreator;
        } else {
            const isEnrolled = user?.enrolledCourses?.includes(courseId);
            hasAccess = isCreator || isEnrolled;
        }

        if (!hasAccess) {
            return res.status(403).json({
                message: "You must purchase this course to update lecture progress.",
                success: false
            });
        }

        // fetch or create course progress
        let courseProgress = await CourseProgress.findOne({ courseId, userId });

        if (!courseProgress) {
            // If no progress exist, create a new record
            courseProgress = new CourseProgress({
                userId,
                courseId,
                completed: false,
                lectureProgress: [],
            });
        }

        // find the lecture progress in the course progress
        const lectureIndex = courseProgress.lectureProgress.findIndex(
            (lecture) => lecture.lectureId === lectureId
        );

        let isNewCompletion = false;

        if (lectureIndex !== -1) {
            // if lecture already exists, check if it was not viewed yet
            if (!courseProgress.lectureProgress[lectureIndex].viewed) {
                courseProgress.lectureProgress[lectureIndex].viewed = true;
                isNewCompletion = true;
            }
        } else {
            // Add new lecture progress
            courseProgress.lectureProgress.push({
                lectureId,
                viewed: true,
            });
            isNewCompletion = true;
        }

        // if all lectures are complete
        const lectureProgressLength = courseProgress.lectureProgress.filter(
            (lectureProg) => lectureProg.viewed
        ).length;

        const course = await Course.findById(courseId);

        const wasCompletedBefore = courseProgress.completed;
        if (course.lectures.length === lectureProgressLength) {
            courseProgress.completed = true;
        }

        const isNewCourseCompletion = !wasCompletedBefore && courseProgress.completed;

        await courseProgress.save();

        let reward = null;
        if (isNewCourseCompletion) {
            reward = await updateUserGamification(userId, "COURSE_COMPLETE");
            await recordActivity(userId, "COURSE_COMPLETE", { courseId });
        } else if (isNewCompletion) {
            reward = await updateUserGamification(userId, "LECTURE_COMPLETE");
            await recordActivity(userId, "LECTURE_COMPLETE", { courseId, lectureId });
        }

        return res.status(200).json({
            message: "Lecture progress updated successfully.",
            reward
        });
    } catch (error) {
        console.log(error);
    }
};

export const markAsCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        // Ensure user is enrolled in the course or is the course creator
        const user = await User.findById(userId);
        const courseRef = await Course.findById(courseId);
        if (!courseRef) {
            return res.status(404).json({ message: "Course not found", success: false });
        }

        const isCreator = courseRef.creator.toString() === userId;
        const isAdmin = user?.role === "admin";
        const isInstructor = user?.role === "instructor";

        let hasAccess = false;
        if (isAdmin) {
            hasAccess = true;
        } else if (isInstructor) {
            hasAccess = isCreator;
        } else {
            const isEnrolled = user?.enrolledCourses?.includes(courseId);
            hasAccess = isCreator || isEnrolled;
        }

        if (!hasAccess) {
            return res.status(403).json({
                message: "You must purchase this course to modify progress.",
                success: false
            });
        }

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress)
            return res.status(404).json({ message: "Course progress not found" });

        // If course is already completed, return immediately without rewarding again to prevent duplicate XP/streaks
        if (courseProgress.completed) {
            return res.status(200).json({ 
                message: "Course is already marked as completed.",
                reward: null
            });
        }

        courseProgress.lectureProgress.map(
            (lectureProgress) => (lectureProgress.viewed = true)
        );
        courseProgress.completed = true;
        await courseProgress.save();

        const reward = await updateUserGamification(userId, "COURSE_COMPLETE");

        return res.status(200).json({ 
            message: "Course marked as completed.",
            reward
        });
    } catch (error) {
        console.log(error);
    }
};

export const markAsInCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        // Ensure user is enrolled in the course or is the course creator
        const user = await User.findById(userId);
        const courseRef = await Course.findById(courseId);
        if (!courseRef) {
            return res.status(404).json({ message: "Course not found", success: false });
        }

        const isCreator = courseRef.creator.toString() === userId;
        const isAdmin = user?.role === "admin";
        const isInstructor = user?.role === "instructor";

        let hasAccess = false;
        if (isAdmin) {
            hasAccess = true;
        } else if (isInstructor) {
            hasAccess = isCreator;
        } else {
            const isEnrolled = user?.enrolledCourses?.includes(courseId);
            hasAccess = isCreator || isEnrolled;
        }

        if (!hasAccess) {
            return res.status(403).json({
                message: "You must purchase this course to modify progress.",
                success: false
            });
        }

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress)
            return res.status(404).json({ message: "Course progress not found" });

        courseProgress.lectureProgress.map(
            (lectureProgress) => (lectureProgress.viewed = false)
        );
        courseProgress.completed = false;
        await courseProgress.save();
        return res.status(200).json({ message: "Course marked as incompleted." });
    } catch (error) {
        console.log(error);
    }
};