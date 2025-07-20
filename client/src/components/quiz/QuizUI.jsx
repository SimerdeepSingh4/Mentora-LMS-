import React, { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useQuizTimer } from '@/hooks/useQuizTimer';
import { useQuizAttempt } from '@/hooks/useQuizAttempt';
import { toast } from "sonner";

export const QuizUI = ({
    quiz,
    isQuizStarted,
    isQuizSubmitted,
    onQuizSubmit,
    onCloseQuiz,
    timeLeft
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const { formatTime } = useQuizTimer(
        quiz.timeLimit,
        isQuizStarted,
        isQuizSubmitted,
        () => onQuizSubmit(quiz._id, timeLeft, quiz.timeLimit)
    );
    const { quizAnswers, updateAnswer, clearAnswers } = useQuizAttempt(quiz._id);

    // Warn before unload and handle quiz state
    useEffect(() => {
        // Check if this quiz has been attempted before
        const hasAttempted = localStorage.getItem(`quiz_${quiz._id}_attempted`) === 'true';

        // If the quiz is marked as submitted in props but not in localStorage, update localStorage
        if (isQuizSubmitted && !hasAttempted && quiz._id) {
            localStorage.setItem(`quiz_${quiz._id}_attempted`, 'true');
        }

        const handleBeforeUnload = (e) => {
            if (isQuizStarted && !isQuizSubmitted) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isQuizStarted, isQuizSubmitted, quiz._id]);

    const handleAnswerSelect = (questionIndex, selectedAnswer) => {
        console.log(`handleAnswerSelect called for question ${questionIndex}:`, {
            selectedAnswer,
            parsedAnswer: parseInt(selectedAnswer),
            type: typeof selectedAnswer
        });

        // Ensure we're passing a number to updateAnswer
        updateAnswer(questionIndex, parseInt(selectedAnswer));
    };

    const handleSubmit = async () => {
        if (!quiz?._id) {
            toast.error("Quiz ID is missing");
            return;
        }

        // ⭐⭐ CRITICAL FIX: Log the current state of answers before submission
        console.log("Quiz answers before submission:", quizAnswers);
        console.log("Quiz questions:", quiz.questions);

        // Count answered questions
        const answeredCount = Object.keys(quizAnswers).length;
        const totalQuestions = quiz.questions.length;

        // If no questions are answered, show a warning and ask for confirmation
        if (answeredCount === 0) {
            const confirmed = window.confirm(
                "You haven't answered any questions. Are you sure you want to submit the quiz? All questions will be marked as unanswered."
            );
            if (!confirmed) return;
        }
        // Warn if many questions are unanswered but some are answered
        else if (answeredCount < totalQuestions / 2) {
            const confirmed = window.confirm(
                `You've only answered ${answeredCount} out of ${totalQuestions} questions. Are you sure you want to submit?`
            );
            if (!confirmed) return;
        }

        // Show loading toast
        const loadingToast = toast.loading("Submitting quiz...");

        try {
            // ⭐⭐ CRITICAL FIX: Make sure we're passing the quiz object with questions
            // This ensures the submission process has access to all questions
            console.log("Submitting quiz with ID:", quiz._id);
            console.log("Time left:", timeLeft);
            console.log("Time limit:", quiz.timeLimit);

            // Pass the quiz object to ensure we have access to all questions
            const success = await onQuizSubmit(quiz._id, timeLeft, quiz.timeLimit, quiz);

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            if (success) {
                // Success toast is shown in the onQuizSubmit function
                console.log("Quiz submitted successfully");
            } else {
                console.error("Quiz submission failed");
                toast.error("Failed to submit quiz. Please try again.");
            }
        } catch (error) {
            // Dismiss loading toast and show error
            toast.dismiss(loadingToast);
            console.error("Quiz submission error:", error);
            toast.error("Failed to submit quiz: " + (error.message || "Unknown error"));
        }
    };

    const handleClose = () => {
        // If quiz is in progress (started but not submitted), show confirmation dialog
        if (isQuizStarted && !isQuizSubmitted) {
            setShowCloseDialog(true);
            return;
        }

        // If quiz is submitted, just close without clearing answers
        if (isQuizSubmitted) {
            if (onCloseQuiz) {
                onCloseQuiz();
            }
            return;
        }

        // Otherwise, clear answers and close
        clearAnswers();
        if (onCloseQuiz) {
            onCloseQuiz();
        }
    };

    const confirmClose = () => {
        clearAnswers();
        setShowCloseDialog(false);
        if (onCloseQuiz) {
            onCloseQuiz();
        }
    };

    const progress = (Object.keys(quizAnswers).length / quiz.questions.length) * 100;

    if (!quiz || !quiz.questions) {
        return <div>No quiz available</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">Quiz Questions</h2>
                    {isQuizStarted && !isQuizSubmitted && (
                        <Badge variant="outline" className="px-4 py-2 text-red-600">
                            Time Left: {formatTime(timeLeft)}
                        </Badge>
                    )}
                    {isQuizSubmitted && (
                        <Badge variant="outline" className="px-4 py-2 text-green-600 bg-green-50">
                            Quiz is already attempted - View Only Mode
                        </Badge>
                    )}
                </div>
                <Button variant="outline" onClick={handleClose}>
                    {isQuizSubmitted ? "Back to Results" : "Close Quiz"}
                </Button>
            </div>

            {isQuizSubmitted && (
                <div className="p-4 my-4 text-center border-2 border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-800">
                    <p className="text-yellow-800 dark:text-yellow-300">
                        You have already attempted this quiz. This is a view-only mode and you cannot change your answers.
                    </p>
                </div>
            )}

            <div className="space-y-8">
                {quiz.questions.map((question, qIndex) => (
                    <div key={qIndex} className="p-6 border rounded-lg">
                        <p className="mb-4 text-lg font-medium">
                            Q{qIndex + 1}. {question.question}
                        </p>
                        <RadioGroup
                            value={quizAnswers[qIndex] !== undefined ? quizAnswers[qIndex].toString() : undefined}
                            onValueChange={(value) => {
                                console.log(`Selected answer for question ${qIndex}:`, {
                                    value,
                                    parsedValue: parseInt(value),
                                    type: typeof value
                                });
                                handleAnswerSelect(qIndex, value);
                            }}
                            className="space-y-3"
                            disabled={isQuizSubmitted} // Disable inputs if quiz is submitted
                        >
                            {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value={oIndex.toString()}
                                        id={`q${qIndex}-o${oIndex}`}
                                        disabled={isQuizSubmitted} // Disable each radio button if quiz is submitted
                                    />
                                    <Label
                                        htmlFor={`q${qIndex}-o${oIndex}`}
                                        className={isQuizSubmitted ? "text-muted-foreground" : ""}
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <Progress value={progress} className="w-full" />
                {isQuizSubmitted ? (
                    <Button disabled className="bg-gray-400 cursor-not-allowed">
                        Already Attempted
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isQuizSubmitted}>
                        Submit Quiz
                    </Button>
                )}
            </div>

            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Close Quiz</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to close the quiz? Your progress will be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmClose}>
                            Close Quiz
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};