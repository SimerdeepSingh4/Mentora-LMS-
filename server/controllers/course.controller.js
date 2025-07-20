import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";

export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;
        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Course title and category is required."
            })
        }

        let courseThumbnail;
        if (req.file) {
            try {
                const uploadResult = await uploadMedia(req.file.path, req.file.originalname);
                if (uploadResult && uploadResult.secure_url) {
                    courseThumbnail = uploadResult.secure_url;
                } else {
                    throw new Error("Failed to get secure URL from upload");
                }
            } catch (error) {
                console.error("Error uploading thumbnail:", error);
                return res.status(500).json({
                    message: "Failed to upload course thumbnail"
                });
            }
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id,
            courseThumbnail
        });

        return res.status(201).json({
            course,
            message: "Course created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}

export const searchCourse = async (req, res) => {
    try {
        const { query = "", categories = [], sortByPrice = "" } = req.query;
        console.log("Raw search params:", { query, categories, sortByPrice });

        // Log the type of categories to help with debugging
        console.log("Categories type:", typeof categories, Array.isArray(categories));

        // Initialize search criteria with published courses
        const searchCriteria = {
            isPublished: true
        };

        // Handle text search
        if (query && query.trim() !== '') {
            searchCriteria.$or = [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ];
        }

        // Handle category filter
        if (categories) {
            // Ensure categories is treated as an array
            const categoryArray = Array.isArray(categories) ? categories : [categories];
            const validCategories = categoryArray.filter(cat => cat && cat.trim() !== '');

            console.log("Valid categories:", validCategories);

            if (validCategories.length > 0) {
                // Create an array of case-insensitive regex patterns for each category
                const categoryRegexes = validCategories.map(cat =>
                    new RegExp('^' + cat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
                );
                searchCriteria.category = { $in: categoryRegexes };

                // Log the final search criteria for debugging
                console.log("Category search criteria:", JSON.stringify(searchCriteria.category));
            }
        }

        // Handle price sorting
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1;
        } else if (sortByPrice === "high") {
            sortOptions.coursePrice = -1;
        }

        console.log("Search criteria:", JSON.stringify(searchCriteria, null, 2));
        console.log("Sort options:", sortOptions);

        // First, let's see how many total published courses we have
        const totalPublished = await Course.countDocuments({ isPublished: true });
        console.log("Total published courses:", totalPublished);

        // Then, let's see how many match our criteria
        const matchingCount = await Course.countDocuments(searchCriteria);
        console.log("Matching courses count:", matchingCount);

        // Get the actual courses
        const courses = await Course.find(searchCriteria)
            .populate({ path: "creator", select: "name photoUrl" })
            .sort(sortOptions);

        console.log("Found courses:", courses.length);
        if (courses.length > 0) {
            console.log("Sample course categories:", courses[0].category);
        }

        // Format course prices
        const updatedCourses = courses.map(course => ({
            ...course.toObject(),
            coursePrice: formatCoursePrice(course.coursePrice)
        }));

        return res.status(200).json({
            success: true,
            courses: updatedCourses || []
        });

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({
            message: "Failed to search courses"
        });
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }

        // Ensure only the course creator can delete it
        if (course.creator.toString() !== req.id) {
            return res.status(403).json({ message: "You are not authorized to delete this course!" });
        }

        // Delete all associated lectures
        await Lecture.deleteMany({ _id: { $in: course.lectures } });

        // Delete the course thumbnail from Cloudinary (if exists)
        if (course.courseThumbnail) {
            const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId);
        }

        // Delete the course itself
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({ message: "Course deleted successfully!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to delete course" });
    }
};

// Helper function to format course price
const formatCoursePrice = (price) => {
    if (price === 0 || price === "0") {
        return "Free";
    }
    return price;
};

export const getPublishedCourse = async (_, res) => {
    try {
        console.log("Fetching published courses...");
        const courses = await Course.find({ isPublished: true })
            .populate({
                path: "creator",
                select: "name photoUrl"
            })
            .populate({
                path: "lectures",
                select: "lectureTitle videoUrl"
            });

        console.log("Found courses:", courses?.length || 0);

        if (!courses || courses.length === 0) {
            return res.status(200).json({
                success: true,
                courses: [],
                message: "No published courses found"
            });
        }

        // Format course prices consistently and add total lectures count
        const updatedCourses = courses.map(course => {
            const courseObj = course.toObject();
            return {
                ...courseObj,
                coursePrice: formatCoursePrice(courseObj.coursePrice),
                totalLectures: courseObj.lectures?.length || 0,
                creator: {
                    name: courseObj.creator?.name || "Unknown",
                    photoUrl: courseObj.creator?.photoUrl || null
                }
            };
        });

        console.log("Sending response with courses:", updatedCourses.length);
        return res.status(200).json({
            success: true,
            courses: updatedCourses,
            message: "Courses fetched successfully"
        });
    } catch (error) {
        console.error("Error in getPublishedCourse:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get published courses",
            error: error.message
        });
    }
};

export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({creator:userId});
        if(!courses){
            return res.status(404).json({
                success: false,
                courses:[],
                message:"Course not found"
            })
        };
        return res.status(200).json({
            success: true,
            courses: courses.map(course => ({
                ...course.toObject(),
                coursePrice: formatCoursePrice(course.coursePrice)
            }))
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message:"Failed to get creator courses"
        })
    }
}

export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }

        let courseThumbnail;
        if (thumbnail) {
            // Delete old thumbnail if it exists and has a valid URL
            if (course.courseThumbnail && typeof course.courseThumbnail === 'string') {
                try {
                    const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                    if (publicId) {
                        await deleteMediaFromCloudinary(publicId);
                    }
                } catch (error) {
                    console.error("Error deleting old thumbnail:", error);
                    // Continue with upload even if deletion fails
                }
            }

            // Upload new thumbnail to Cloudinary
            try {
                const uploadResult = await uploadMedia(thumbnail.path, thumbnail.originalname);
                if (uploadResult && uploadResult.secure_url) {
                    courseThumbnail = uploadResult.secure_url;
                } else {
                    throw new Error("Failed to get secure URL from upload");
                }
            } catch (error) {
                console.error("Error uploading new thumbnail:", error);
                return res.status(500).json({
                    message: "Failed to upload course thumbnail"
                });
            }
        }

        const updateData = {
            courseTitle: courseTitle || course.courseTitle,
            subTitle: subTitle || course.subTitle,
            description: description || course.description,
            category: category || course.category,
            courseLevel: courseLevel || course.courseLevel,
            coursePrice: coursePrice !== undefined ? coursePrice : course.coursePrice,
            courseThumbnail: courseThumbnail || course.courseThumbnail
        };

        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

        return res.status(200).json({
            course,
            message: "Course updated successfully."
        })

    } catch (error) {
        console.error("Edit course error:", error);
        return res.status(500).json({
            message: "Failed to update course"
        })
    }
}

export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }
        // Format course price consistently
        const formattedCourse = {
            ...course.toObject(),
            coursePrice: formatCoursePrice(course.coursePrice)
        };
        return res.status(200).json({
            course: formattedCourse
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get course by id"
        })
    }
}

export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!lectureTitle || !courseId) {
            return res.status(400).json({
                message: "Lecture title is required"
            })
        };

        // create lecture with course reference
        const lecture = await Lecture.create({
            lectureTitle,
            course: courseId
        });

        const course = await Course.findById(courseId);
        if (course) {
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message: "Lecture created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create lecture"
        })
    }
}

export const getCourseLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get lectures"
        })
    }
}

export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, docInfo, isPreviewFree } = req.body;
        const { courseId, lectureId } = req.params;

        // Find lecture and ensure it exists
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            })
        }

        // Ensure course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }

        // Update lecture fields while preserving course reference
        const updateData = {
            lectureTitle: lectureTitle || lecture.lectureTitle,
            isPreviewFree: isPreviewFree !== undefined ? isPreviewFree : lecture.isPreviewFree,
            course: courseId // Ensure course field is preserved
        };

        // Handle video update
        if (videoInfo?.videoUrl) {
            // Delete old video if exists
            if (lecture.publicId) {
                await deleteVideoFromCloudinary(lecture.publicId);
            }
            updateData.videoUrl = videoInfo.videoUrl;
            updateData.publicId = videoInfo.publicId;
        }

        // Handle document update
        if (docInfo) {
            // Delete old documents if they exist
            if (lecture.docInfo && lecture.docInfo.length > 0) {
                for (const doc of lecture.docInfo) {
                    if (doc.fileUrl) {
                        const publicId = doc.fileUrl.split("/").pop().split(".")[0];
                        await deleteMediaFromCloudinary(publicId);
                    }
                }
            }
            // Set new document info
            updateData.docInfo = Array.isArray(docInfo) ? docInfo : [docInfo];

            // Update materials array with the same document info
            updateData.materials = updateData.docInfo.map(doc => ({
                type: doc.fileName.split('.').pop().toUpperCase(),
                url: doc.fileUrl,
                publicId: doc.fileUrl.split("/").pop().split(".")[0]
            }));
        }

        // Update lecture with all changes
        const updatedLecture = await Lecture.findByIdAndUpdate(
            lectureId,
            updateData,
            { new: true, runValidators: true }
        );

        // Ensure the course has the lecture id if it was not already added
        if (!course.lectures.includes(lectureId)) {
            course.lectures.push(lectureId);
            await course.save();
        }

        return res.status(200).json({
            lecture: updatedLecture,
            message: "Lecture updated successfully."
        })
    } catch (error) {
        console.error("Edit lecture error:", error);
        return res.status(500).json({
            message: "Failed to edit lectures"
        })
    }
}

export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            });
        }
        if (lecture.publicId) {
            await deleteVideoFromCloudinary(lecture.publicId);
        }
        await Course.updateOne(
            { lectures: lectureId },
            { $pull: { lectures: lectureId } }
        );

        return res.status(200).json({
            message: "Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to remove lecture"
        })
    }
}

export const getLectureById = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get lecture by id"
        })
    }
}

// publich unpublish course logic

export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.query;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message: `Course is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update status"
        })
    }
}

export const getInstructorDashboardStats = async (req, res) => {
    try {
        const instructorId = req.id;

        // Get all courses created by the instructor
        const courses = await Course.find({ creator: instructorId });

        // Get all purchases for these courses
        const courseIds = courses.map(course => course._id);
        const purchases = await CoursePurchase.find({
            courseId: { $in: courseIds },
            status: "completed"
        });

        // Calculate total sales and revenue
        const totalSales = purchases.length;
        const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Get enrolled students count
        const enrolledStudents = new Set();
        purchases.forEach(purchase => {
            enrolledStudents.add(purchase.userId.toString());
        });

        // Get course-wise statistics
        const courseStats = courses.map(course => {
            const coursePurchases = purchases.filter(p => p.courseId.toString() === course._id.toString());
            return {
                courseId: course._id,
                title: course.courseTitle,
                totalSales: coursePurchases.length,
                revenue: coursePurchases.reduce((sum, p) => sum + p.amount, 0),
                enrolledStudents: coursePurchases.length,
                rating: course.rating || 0
            };
        });

        // Get recent purchases
        const recentPurchases = await CoursePurchase.find({
            courseId: { $in: courseIds },
            status: "completed"
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .populate('courseId', 'courseTitle');

        return res.status(200).json({
            success: true,
            stats: {
                totalCourses: courses.length,
                totalSales,
                totalRevenue,
                totalStudents: enrolledStudents.size,
                courseStats,
                recentPurchases
            }
        });
    } catch (error) {
        console.error("Error getting instructor dashboard stats:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get dashboard statistics"
        });
    }
};
