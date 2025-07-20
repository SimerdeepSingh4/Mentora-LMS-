import { User } from "../models/user.model.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = {};
    if (role && ['admin', 'instructor', 'student'].includes(role)) {
      query.role = role;
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

// Get user details
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get User Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details"
    });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['admin', 'instructor', 'student'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin', 'instructor', or 'student'"
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role"
    });
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    // Count users by role
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Get recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalInstructors,
        totalAdmins,
        totalUsers: totalStudents + totalInstructors + totalAdmins,
        recentUsers
      }
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin statistics"
    });
  }
};
