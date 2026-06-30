import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { recordActivity } from "../utils/activityLogger.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }



    const user = await User.findOne({ email });
    if (user) {
      console.log("User already exists with this email.");
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }
    

  const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("Account Created Successfully");
    return res.status(201).json({
      success: true,
      message: "Account Created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Email or Password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Email or Password",
      });
    }

    await recordActivity(user._id, "LOGIN");
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

export const logout =async(req,res)=>{
  try{
    return res.status(200).cookie("token","",{maxAge:0}).json({
      success:true,
      message:"Logged out successfully."
    })
  } catch(error){
    console.log(error); {
      console.log(error);
      return res.status(500).json({
        success:false,
        message:"Failed to logout"
      })
    }
  }
}

export const getUserProfile =async(req,res)=>{
  try{
    const userId =req.id;
    const user=await User.findById(userId).select("-password").populate("enrolledCourses");
    if(!user){
      return res.status(404).json({
        success:false,
        message:"Profile not found"
      })
    }
    return res.status(200).json({
      success:true,
      user
    })
  } catch(error){
    console.log(error); {
      console.log(error);
      return res.status(500).json({
        success:false,
        message:"Failed to load user profile"
      })
    }
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let photoUrl = user.photoUrl;

    if (profilePhoto) {
      // extract public id of the old image from the url if it exists;
      if (user.photoUrl && typeof user.photoUrl === 'string') {
        try {
          const publicId = user.photoUrl.split("/").pop().split(".")[0];
          if (publicId) {
            await deleteMediaFromCloudinary(publicId);
          }
        } catch (err) {
          console.error("Error deleting old profile photo:", err);
        }
      }

      // upload new photo
      const cloudResponse = await uploadMedia(profilePhoto.path, profilePhoto.originalname);
      photoUrl = cloudResponse.secure_url;
    }

    const updatedData = {
      name: name || user.name,
      photoUrl
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password");

    return res.status(200).json({
      user: updatedUser,
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
}

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.id;
    const { ActivityLog } = await import("../models/activityLog.model.js");
    const mongoose = (await import("mongoose")).default;

    // Fetch activities for the last 140 days (20 weeks)
    const minDate = new Date(Date.now() - 140 * 24 * 60 * 60 * 1000);

    const activities = await ActivityLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          timestamp: { $gte: minDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load activity log"
    });
  }
};