import mongoose from "mongoose";

const instructorApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: { type: String, required: true },
    aadhaar: { type: String, required: true, unique: true },
    experience: { type: Number, required: true },
    qualification: { type: String, required: true },
    expertise: { type: String, required: true },
    reason: { type: String, required: true },
    resumeUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const InstructorApplication = mongoose.model(
  "InstructorApplication",
  instructorApplicationSchema
);
