import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureTitle: {
      type: String,
      required: true,
    },
    videoUrl: String,
    publicId: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    isPreviewFree: {
      type: Boolean,
      default: false,
    },
    docInfo: [
      {
        fileUrl: String,
        fileName: String,
        publicId: String,
      },
    ],
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },
    materials: [
      {
        type: {
          type: String,
          enum: ["PDF", "PPT", "PPTX", "DOCX"],
        },
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", lectureSchema);
