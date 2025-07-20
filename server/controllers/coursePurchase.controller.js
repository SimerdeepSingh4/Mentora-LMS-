import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { CourseProgress } from "../models/courseProgress.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    console.log("Creating checkout session for:", {
      userId,
      courseId
    });

    const course = await Course.findById(courseId);
    if (!course) {
      console.error("Course not found:", courseId);
      return res.status(404).json({ message: "Course not found!" });
    }

    console.log("Found course:", {
      id: course._id,
      title: course.courseTitle,
      price: course.coursePrice
    });

    // Create a new course purchase record with completed status
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "completed", // Set status to completed immediately
    });

    console.log("Created new purchase record:", {
      id: newPurchase._id,
      courseId: newPurchase.courseId,
      userId: newPurchase.userId,
      status: newPurchase.status
    });

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/course-progress/${courseId}`,
      cancel_url: `http://localhost:5173/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
      },
    });

    console.log("Created Stripe session:", {
      id: session.id,
      url: session.url,
      metadata: session.metadata
    });

    if (!session.url) {
      console.error("Failed to create Stripe session");
      return res.status(400).json({ success: false, message: "Error while creating session" });
    }

    // Save the purchase record
    newPurchase.paymentId = session.id;
    await newPurchase.save();
    console.log("Saved purchase record with payment ID:", newPurchase._id);

    // Update user's enrolledCourses
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: courseId } },
      { new: true }
    );
    console.log("User enrolled courses updated:", {
      userId: updatedUser._id,
      enrolledCourses: updatedUser.enrolledCourses
    });

    // Update course's enrolledStudents
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { enrolledStudents: userId } },
      { new: true }
    );
    console.log("Course enrolled students updated:", {
      courseId: updatedCourse._id,
      enrolledStudents: updatedCourse.enrolledStudents
    });

    // Make all lectures visible
    if (course.lectures && course.lectures.length > 0) {
      await Lecture.updateMany(
        { _id: { $in: course.lectures } },
        { $set: { isPreviewFree: true } }
      );
      console.log("Updated lectures to be visible");
    }

    return res.status(200).json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Error in createCheckoutSession:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const sig = req.headers['stripe-signature'];
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    console.log("Received webhook with signature:", sig);
    console.log("Using webhook secret:", secret);
    console.log("Raw webhook body:", req.body);

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      secret
    );

    console.log("Webhook event type:", event.type);
    console.log("Webhook event data:", event.data.object);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("Checkout session completed event received");
    console.log("Session metadata:", event.data.object.metadata);
    console.log("Payment status:", event.data.object.payment_status);

    try {
      const session = event.data.object;
      console.log("Session data:", {
        id: session.id,
        customer: session.customer,
        payment_status: session.payment_status,
        metadata: session.metadata
      });

      // Find the purchase record
      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        console.error("Purchase not found for session:", session.id);
        return res.status(404).json({ message: "Purchase not found" });
      }

      console.log("Found purchase:", {
        id: purchase._id,
        courseId: purchase.courseId._id,
        userId: purchase.userId,
        status: purchase.status
      });

      // Update purchase amount if available
      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all lectures visible
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
        console.log("Updated lectures to be visible");
      }

      // Save the updated purchase
      await purchase.save();
      console.log("Purchase updated:", purchase._id);

      // Update user's enrolledCourses
      const updatedUser = await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } },
        { new: true }
      );
      console.log("User enrolled courses updated:", {
        userId: updatedUser._id,
        enrolledCourses: updatedUser.enrolledCourses
      });

      // Update course's enrolledStudents
      const updatedCourse = await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } },
        { new: true }
      );
      console.log("Course enrolled students updated:", {
        courseId: updatedCourse._id,
        enrolledStudents: updatedCourse.enrolledStudents
      });

      return res.status(200).json({
        success: true,
        message: "Purchase completed successfully",
        purchaseId: purchase._id,
        courseId: purchase.courseId._id,
        userId: purchase.userId
      });
    } catch (error) {
      console.error("Error handling checkout session:", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message
      });
    }
  }

  res.status(200).send();
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    console.log("Getting course detail with status:", {
      courseId,
      userId
    });

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    if (!course) {
      console.error("Course not found:", courseId);
      return res.status(404).json({ message: "course not found!" });
    }

    // Check both purchase record and enrolled courses
    const [purchase, user] = await Promise.all([
      CoursePurchase.findOne({ userId, courseId }),
      User.findById(userId)
    ]);

    console.log("Purchase status:", {
      exists: !!purchase,
      status: purchase?.status,
      isEnrolled: user?.enrolledCourses?.includes(courseId)
    });

    // If there's a completed purchase but the course isn't in enrolledCourses, add it
    if (purchase?.status === "completed" && !user.enrolledCourses.includes(courseId)) {
      console.log("Adding course to user's enrolled courses");
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { enrolledCourses: courseId } }
      );
      return res.status(200).json({
        course,
        purchased: true
      });
    }

    // Course is considered purchased if either:
    // 1. There's a completed purchase record, or
    // 2. The course is in the user's enrolledCourses array
    const isPurchased = purchase?.status === "completed" || user?.enrolledCourses?.includes(courseId);

    return res.status(200).json({
      course,
      purchased: isPurchased
    });
  } catch (error) {
    console.error("Get course detail error:", error);
    return res.status(500).json({
      message: "Failed to get course details",
      error: error.message
    });
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const userId = req.id;
    console.log("Getting purchased courses for user:", userId);

    // Get user's enrolled courses first
    const user = await User.findById(userId).populate({
      path: "enrolledCourses",
      populate: {
        path: "creator",
        select: "name photoUrl"
      }
    });
    console.log("User enrolled courses:", user.enrolledCourses.length);

    // Find all completed purchases for the current user
    const purchases = await CoursePurchase.find({
      userId,
      status: "completed"
    }).populate({
      path: "courseId",
      populate: {
        path: "creator",
        select: "name photoUrl"
      }
    });
    console.log("Found purchases:", purchases.length);

    // If we have completed purchases but no enrolled courses, update the user's enrolledCourses
    if (purchases.length > 0 && user.enrolledCourses.length === 0) {
      console.log("Updating user's enrolled courses with completed purchases");
      const courseIds = purchases.map(purchase => purchase.courseId._id);
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { enrolledCourses: { $each: courseIds } } }
      );

      // Refetch the user with updated enrolled courses
      const updatedUser = await User.findById(userId).populate({
        path: "enrolledCourses",
        populate: {
          path: "creator",
          select: "name photoUrl"
        }
      });
      user.enrolledCourses = updatedUser.enrolledCourses;
      console.log("Updated user enrolled courses:", user.enrolledCourses.length);
    }

    // Combine courses from purchases and enrolledCourses
    const purchasedCourses = purchases.map(purchase => purchase.courseId);
    const enrolledCourses = user.enrolledCourses || [];

    // Create a map to track unique courses by their IDs
    const uniqueCourses = new Map();

    // Add enrolled courses first
    enrolledCourses.forEach(course => {
      if (course) {
        uniqueCourses.set(course._id.toString(), course);
      }
    });

    // Add purchased courses (they will overwrite enrolled courses if they exist)
    purchasedCourses.forEach(course => {
      if (course) {
        uniqueCourses.set(course._id.toString(), course);
      }
    });

    // Convert the map back to an array
    const allCourses = Array.from(uniqueCourses.values());
    console.log("Total unique courses to return:", allCourses.length);

    // Get course progress data for all courses
    const courseProgressData = new Map();

    // Fetch progress data for all courses
    const courseIds = allCourses.map(course => course._id);
    const progressRecords = await CourseProgress.find({
      userId,
      courseId: { $in: courseIds }
    }).lean();

    // Create a map of course progress by courseId
    progressRecords.forEach(record => {
      const courseId = record.courseId.toString();

      // Get the course to determine total lectures
      const course = allCourses.find(c => c._id.toString() === courseId);
      const totalLectures = course?.lectures?.length || 0;

      // Get viewed lectures from lectureProgress
      const viewedLectures = record.lectureProgress?.filter(p => p.viewed)?.length || 0;

      // Calculate progress percentage
      let progressPercentage = 0;
      if (totalLectures > 0) {
        progressPercentage = Math.round((viewedLectures / totalLectures) * 100);
      }

      courseProgressData.set(courseId, {
        progress: progressPercentage,
        lastAccessed: record.updatedAt || record.createdAt,
        completed: record.completed || false
      });
    });

    // Ensure we're returning a proper array with the correct structure and progress data
    const responseData = {
      success: true,
      courses: allCourses.map(course => {
        const courseId = course._id.toString();
        const progressInfo = courseProgressData.get(courseId) || {
          progress: 0,
          lastAccessed: null,
          completed: false
        };

        return {
          _id: course._id,
          courseTitle: course.courseTitle,
          category: course.category,
          coursePrice: course.coursePrice,
          courseThumbnail: course.courseThumbnail,
          creator: course.creator,
          enrolledStudents: course.enrolledStudents,
          lectures: course.lectures,
          courseLevel: course.courseLevel || 'Beginner',
          // Add progress information
          progress: progressInfo.progress,
          lastAccessed: progressInfo.lastAccessed,
          completed: progressInfo.completed
        };
      })
    };

    console.log("Sending response with progress data:", responseData);
    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Get purchased courses error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get purchased courses",
      error: error.message,
      courses: []
    });
  }
};