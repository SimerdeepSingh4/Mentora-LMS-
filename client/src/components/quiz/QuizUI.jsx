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
import { toast } from "sonner";
import { Clock, HelpCircle, ArrowRight, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export const QuizUI = ({
    quiz,
    isQuizStarted,
    isQuizSubmitted,
    onQuizSubmit,
    onCloseQuiz,
    timeLeft,
    quizAnswers = {},
    updateAnswer,
    clearAnswers
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    
    const { formatTime } = useQuizTimer(
        quiz.timeLimit,
        isQuizStarted,
        isQuizSubmitted,
        () => onQuizSubmit(quiz._id, timeLeft, quiz.timeLimit)
    );

    // Warn before unload
    useEffect(() => {
        const hasAttempted = localStorage.getItem(`quiz_${quiz._id}_attempted`) === 'true';

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
        updateAnswer(questionIndex, parseInt(selectedAnswer));
    };

    const handleSubmit = async () => {
        if (!quiz?._id) {
            toast.error("Quiz ID is missing");
            return;
        }

        const answeredCount = Object.keys(quizAnswers).length;
        const totalQuestions = quiz.questions.length;

        if (answeredCount === 0) {
            const confirmed = window.confirm(
                "You haven't answered any questions. Are you sure you want to submit the quiz?"
            );
            if (!confirmed) return;
        } else if (answeredCount < totalQuestions) {
            const confirmed = window.confirm(
                `You've only answered ${answeredCount} out of ${totalQuestions} questions. Submit anyway?`
            );
            if (!confirmed) return;
        }

        const loadingToast = toast.loading("Submitting your answers...");

        try {
            const success = await onQuizSubmit(quiz._id, timeLeft, quiz.timeLimit, quiz);
            toast.dismiss(loadingToast);

            if (success) {
                toast.success("Quiz submitted successfully!");
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Quiz submission error:", error);
            toast.error("Failed to submit quiz: " + (error.message || "Unknown error"));
        }
    };

    const handleClose = () => {
        if (isQuizStarted && !isQuizSubmitted) {
            setShowCloseDialog(true);
            return;
        }

        if (isQuizSubmitted) {
            if (onCloseQuiz) onCloseQuiz();
            return;
        }

        clearAnswers();
        if (onCloseQuiz) onCloseQuiz();
    };

    const confirmClose = () => {
        clearAnswers();
        setShowCloseDialog(false);
        if (onCloseQuiz) onCloseQuiz();
    };

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[#0a0a0a] rounded-2xl border border-white/[0.05]">
                <HelpCircle className="w-8 h-8 text-[#555] mb-2" />
                <p className="text-sm text-[#888]">No quiz details available for this lecture.</p>
            </div>
        );
    }

    const totalQuestions = quiz.questions.length;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const answeredCount = Object.keys(quizAnswers).length;
    const progressPercent = (answeredCount / totalQuestions) * 100;
    
    // Check if current question is answered
    const currentSelectedValue = quizAnswers[currentQuestionIndex] !== undefined 
        ? quizAnswers[currentQuestionIndex].toString() 
        : undefined;

    // Check if time is running out (less than 1 minute)
    const isTimeUrgent = timeLeft < 60;

    return (
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.05] shadow-xl text-white space-y-6">
            
            {/* Header: Title & Close Button */}
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-[#E8602E]" />
                        Lecture Quiz
                    </h3>
                    <p className="text-xs text-[#555] font-medium uppercase tracking-wider">
                        {quiz.questions.length} Questions • {quiz.timeLimit} Minutes
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isQuizStarted && !isQuizSubmitted && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-300 ${
                            isTimeUrgent 
                                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' 
                                : 'bg-[#E8602E]/5 border-[#E8602E]/20 text-[#E8602E]'
                        }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Time Remaining: {formatTime(timeLeft)}</span>
                        </div>
                    )}
                    <Button 
                        variant="outline" 
                        onClick={handleClose}
                        className="text-xs border-white/[0.05] bg-transparent text-[#888] hover:text-white hover:bg-white/[0.05] h-8 rounded-lg"
                    >
                        {isQuizSubmitted ? "Back to Results" : "Close"}
                    </Button>
                </div>
            </div>

            {/* Quiz Info Status for View Mode */}
            {isQuizSubmitted && (
                <div className="p-3.5 rounded-xl border border-green-500/20 bg-green-500/5 text-xs text-green-400 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">Review Mode:</span> You have completed this quiz. You can review your selected options below.
                    </div>
                </div>
            )}

            {/* Progress Gauge */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#555] uppercase tracking-wider">
                    <span>Quiz Progress</span>
                    <span className="text-[#E8602E]">{answeredCount} of {totalQuestions} Answered</span>
                </div>
                <Progress value={progressPercent} className="h-1.5 bg-[#141414]" indicatorColor="bg-[#E8602E]" />
            </div>

            {/* Question Screen */}
            <div className="p-5 rounded-2xl bg-[#0c0c0c] border border-white/[0.05] space-y-5">
                {/* Question index tracker */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E8602E] uppercase tracking-widest bg-[#E8602E]/8 border border-[#E8602E]/20 px-2.5 py-0.5 rounded-full">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                </div>

                {/* The Question Text */}
                <p className="text-base font-bold leading-relaxed text-white">
                    {currentQuestion.question}
                </p>

                {/* Option Choices */}
                <RadioGroup
                    value={currentSelectedValue}
                    onValueChange={(val) => handleAnswerSelect(currentQuestionIndex, val)}
                    className="space-y-3"
                    disabled={isQuizSubmitted}
                >
                    {currentQuestion.options?.map((option, idx) => {
                        const isSelected = currentSelectedValue === idx.toString();
                        return (
                            <div 
                                key={idx}
                                onClick={() => !isQuizSubmitted && handleAnswerSelect(currentQuestionIndex, idx)}
                                className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                                    isSelected 
                                        ? 'bg-[#E8602E]/5 border-[#E8602E]/40 text-white shadow-lg shadow-[#E8602E]/3' 
                                        : 'bg-[#111] border-white/[0.04] text-[#888] hover:border-white/[0.1] hover:text-white'
                                } ${isQuizSubmitted ? 'cursor-default opacity-85' : ''}`}
                            >
                                <RadioGroupItem
                                    value={idx.toString()}
                                    id={`opt-${idx}`}
                                    className={`shrink-0 border-white/20 text-[#E8602E] focus:ring-[#E8602E] ${
                                        isSelected ? 'border-[#E8602E]' : ''
                                    }`}
                                    disabled={isQuizSubmitted}
                                />
                                <Label
                                    htmlFor={`opt-${idx}`}
                                    className="text-sm font-medium leading-none cursor-pointer flex-1 py-1"
                                >
                                    {option}
                                </Label>
                            </div>
                        );
                    })}
                </RadioGroup>
            </div>

            {/* Navigation & Submit controls */}
            <div className="flex items-center justify-between pt-2">
                <Button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="border-white/[0.05] bg-transparent text-[#888] hover:text-white hover:bg-white/[0.05] disabled:opacity-30 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                    <Button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                        className="bg-[#1a1a1a] hover:bg-[#252525] border border-white/[0.05] text-white rounded-xl"
                    >
                        Next Question <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    !isQuizSubmitted ? (
                        <Button
                            onClick={handleSubmit}
                            className="bg-[#E8602E] hover:bg-[#d4561f] text-white font-bold px-6 shadow-lg shadow-[#E8602E]/15 hover:shadow-[#E8602E]/25 rounded-xl transition-all"
                        >
                            <Send className="w-4 h-4 mr-2" /> Submit Quiz
                        </Button>
                    ) : (
                        <Button
                            onClick={handleClose}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 rounded-xl"
                        >
                            View Final Results
                        </Button>
                    )
                )}
            </div>

            {/* Exit/Close Dialog Modal */}
            <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <DialogContent className="bg-[#0c0c0c] border border-white/[0.08] text-white rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-black text-lg text-white">Leave Quiz?</DialogTitle>
                        <DialogDescription className="text-sm text-[#666]">
                            Your progress on this attempt will be reset. Are you sure you want to exit?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowCloseDialog(false)}
                            className="border-white/[0.05] bg-transparent text-[#888] hover:text-white hover:bg-white/[0.05] rounded-xl"
                        >
                            Resume Quiz
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={confirmClose}
                            className="bg-red-650 hover:bg-red-700 text-white rounded-xl"
                        >
                            Yes, Leave Quiz
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};