import Quiz from "../models/quiz.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { Lecture } from "../models/lecture.model.js";
import mongoose from "mongoose";

export const createQuiz = async (req, res) => {
  try {
    const { lectureId, questions, timeLimit } = req.body;

    // Check if lecture exists
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found",
      });
    }

    // Validate questions array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions are required and must be an array",
      });
    }

    // Validate each question
    for (const question of questions) {
      if (!question.question || !question.options || !Array.isArray(question.options) || question.options.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Each question must have a question text and options array",
        });
      }
      if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: "Each question must have a valid correctAnswer index",
        });
      }
    }

    // Create new quiz
    const quiz = await Quiz.create({
      lectureId,
      questions,
      timeLimit: timeLimit || 30,
    });

    // Update lecture with quiz reference while preserving course
    const updateData = {
      $set: {
        quiz: quiz._id
      }
    };

    // Use findByIdAndUpdate with $set to only update quiz field
    await Lecture.findByIdAndUpdate(lectureId, updateData, {
      new: true,
      runValidators: false // Disable validation since we're only updating quiz
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: quiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create quiz",
    });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;

    // Validate quizId is a valid ObjectId
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    // Check if user has already attempted this quiz
    const existingAttempt = await QuizAttempt.findOne({ quizId, userId });
    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this quiz",
        data: {
          hasAttempted: true,
          attempt: existingAttempt
        }
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        quiz,
        hasAttempted: false
      }
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz",
      error: error.message,
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;
    const { answers, timeTaken } = req.body;

    console.log("Quiz submission received:", {
      quizId,
      userId,
      answers,
      timeTaken
    });

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check if user has already attempted this quiz
    const existingAttempt = await QuizAttempt.findOne({ quizId, userId });
    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: "You have already attempted this quiz",
        data: {
          hasAttempted: true,
          attempt: existingAttempt
        }
      });
    }

    // ⭐⭐ CRITICAL FIX: Validate answers array
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      console.error("Invalid answers array:", answers);
      return res.status(400).json({
        success: false,
        message: "Invalid answers format. Please try again."
      });
    }

    // ⭐⭐ CRITICAL FIX: Ensure we have answers for all questions
    const totalQuestions = quiz.questions.length;
    const processedAnswers = [];

    // Create a map of existing answers by questionIndex
    const answerMap = {};
    answers.forEach(answer => {
      if (answer && typeof answer.questionIndex === 'number') {
        answerMap[answer.questionIndex] = answer;
      }
    });

    // Process each question to ensure we have an answer for it
    for (let i = 0; i < totalQuestions; i++) {
      if (answerMap[i]) {
        // Use the provided answer
        processedAnswers.push({
          questionIndex: i,
          selectedAnswer: Number(answerMap[i].selectedAnswer)
        });
      } else {
        // Create a default unattempted answer
        processedAnswers.push({
          questionIndex: i,
          selectedAnswer: -1 // -1 means unattempted
        });
      }
    }

    console.log("Processed answers:", processedAnswers);

    // Calculate score and other statistics
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;

    processedAnswers.forEach(answer => {
      // Convert to numbers to ensure proper comparison
      const selectedAnswer = Number(answer.selectedAnswer);
      const correctAnswer = Number(quiz.questions[answer.questionIndex].correctAnswer);

      console.log(`Question ${answer.questionIndex}:`, {
        selectedAnswer,
        correctAnswer,
        isCorrect: selectedAnswer === correctAnswer
      });

      if (selectedAnswer === -1) {
        unattempted++;
      } else if (selectedAnswer === correctAnswer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    console.log("Quiz score calculation:", {
      correctAnswers,
      incorrectAnswers,
      unattempted,
      totalQuestions,
      score
    });

    // Create new quiz attempt with processed answers
    const quizAttempt = new QuizAttempt({
      quizId,
      userId,
      answers: processedAnswers, // Use the processed answers
      score,
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unattempted,
      timeTaken
    });

    await quizAttempt.save();

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        score,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        unattempted,
        timeTaken
      }
    });

  } catch (error) {
    console.error("Quiz submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz"
    });
  }
};

export const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;

    // Validate quizId
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID"
      });
    }

    const attempts = await QuizAttempt.find({ quizId, userId })
      .sort({ createdAt: -1 })
      .populate('quizId');

    if (!attempts || attempts.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // Transform attempts to include all required fields
    const transformedAttempts = attempts.map(attempt => ({
      _id: attempt._id,
      quizId: attempt.quizId,
      userId: attempt.userId,
      answers: attempt.answers || [],
      score: attempt.score || 0,
      totalQuestions: attempt.totalQuestions || 0,
      correctAnswers: attempt.correctAnswers || 0,
      incorrectAnswers: attempt.incorrectAnswers || 0,
      unattempted: attempt.unattempted || 0,
      timeTaken: attempt.timeTaken || 0,
      submittedAt: attempt.submittedAt,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt
    }));

    return res.status(200).json({
      success: true,
      data: transformedAttempts
    });

  } catch (error) {
    console.error("Get quiz attempts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get quiz attempts"
    });
  }
};