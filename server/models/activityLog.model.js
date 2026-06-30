import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    activityType: {
      type: String,
      enum: ["LECTURE_COMPLETE", "QUIZ_SUBMIT", "COURSE_COMPLETE", "LOGIN"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexing for faster aggregation queries on user activity logs
activityLogSchema.index({ userId: 1, timestamp: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
