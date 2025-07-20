import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lecture",
    required: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      options: [
        {
          type: String,
          required: true,
        },
      ],
      correctAnswer: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  timeLimit: {
    type: Number, // in minutes
    default: 30,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Quiz", quizSchema); 