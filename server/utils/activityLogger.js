import { ActivityLog } from "../models/activityLog.model.js";

/**
 * Utility to log user activities (lecture complete, quiz submit, course complete, etc.)
 * @param {string} userId - ID of the user performing the action
 * @param {string} activityType - LECTURE_COMPLETE, QUIZ_SUBMIT, COURSE_COMPLETE, LOGIN
 * @param {object} details - optional metadata details
 */
export const recordActivity = async (userId, activityType, details = {}) => {
  try {
    const log = new ActivityLog({
      userId,
      activityType,
      details,
      timestamp: new Date()
    });
    await log.save();
    return log;
  } catch (error) {
    console.error(`Failed to record user activity for user ${userId}:`, error);
    return null;
  }
};
