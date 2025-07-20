import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [
    {
      questionIndex: {
        type: Number,
        required: true,
      },
      selectedAnswer: {
        type: Number,
        required: true,
      },
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  totalQuestions: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    required: true,
  },
  incorrectAnswers: {
    type: Number,
    required: true,
  },
  unattempted: {
    type: Number,
    required: true,
  },
  timeTaken: {
    type: Number, // in minutes
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model("QuizAttempt", quizAttemptSchema); 