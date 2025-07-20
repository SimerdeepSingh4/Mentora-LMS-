import { InstructorApplication } from "../models/InstructorApplication.js";
import { User } from "../models/user.model.js";

export const applyInstructor = async (req, res) => {
  try {
    const { phone, aadhaar, experience, qualification, expertise, reason, resumeUrl } = req.body;
    const userId = req.id;

    console.log("Received application data:", req.body);

    // Check if user already applied
    const existingApplication = await InstructorApplication.findOne({ user: userId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for an instructor role."
      });
    }

    // Save application in DB
    const application = new InstructorApplication({
      user: userId,
      phone,
      aadhaar,
      experience,
      qualification,
      expertise,
      reason,
      resumeUrl,
      status: "pending",
    });

    await application.save();
    res.status(201).json({ success: true, message: "Application submitted successfully!" });
  } catch (error) {
    console.error("Apply Instructor Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error, please try again later."
    });
  }
};

// Admin: Get all instructor applications
export const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const applications = await InstructorApplication.find(query)
      .populate('user', 'name email photoUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    console.error("Get Applications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications"
    });
  }
};

// Admin: Get application details
export const getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await InstructorApplication.findById(applicationId)
      .populate('user', 'name email photoUrl');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error("Get Application Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application details"
    });
  }
};

// Admin: Approve or reject application
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved', 'rejected', or 'pending'"
      });
    }

    const application = await InstructorApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Update application status
    application.status = status;
    await application.save();

    // If approved, update user role to instructor
    if (status === 'approved') {
      await User.findByIdAndUpdate(application.user, { role: 'instructor' });
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application status"
    });
  }
};

// Admin: Reset a single rejected application to pending
export const resetRejectedApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application and verify it's rejected
    const application = await InstructorApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (application.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: "Only rejected applications can be reset"
      });
    }

    // Update the application status to pending
    application.status = 'pending';
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application has been reset to pending status"
    });
  } catch (error) {
    console.error("Reset Rejected Application Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset application"
    });
  }
};
