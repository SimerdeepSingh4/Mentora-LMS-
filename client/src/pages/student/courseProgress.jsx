import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
    useCompleteCourseMutation,
    useGetCourseProgressQuery,
    useInCompleteCourseMutation,
    useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, FileText, Sparkles, ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Box, Megaphone, Award } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { userRewardsUpdated } from "@/features/authSlice";
import { toast } from "sonner";
import { useGetQuizQuery } from "@/features/api/quizApi";
import { QuizUI } from "@/components/quiz/QuizUI";
import QuizSummary from "@/components/quiz/QuizSummary";
import { useQuizAttempt } from "@/hooks/useQuizAttempt";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import DocumentViewer from "@/components/document-viewer/DocumentViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AITutor } from "@/components/student/AITutor";
import { showGamificationToast } from "@/utils/gamification";
import VideoPlayer from "@/components/VideoPlayer";
import { LectureChat } from "@/components/student/LectureChat";
import { useGetAnnouncementsQuery } from "@/features/api/courseApi";
import { motion } from "framer-motion";
import { Sandbox } from "@/components/student/Sandbox";
import logoDark from "../../assets/logo_dark.png";

// Simple ObjectId validation function
const isValidObjectId = (id) => {
    if (!id) return false;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(id);
};

const CourseProgress = () => {
    const params = useParams();
    const courseId = params.courseId;
    const { user } = useSelector((store) => store.auth);
    const dispatch = useDispatch();
    const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);

    // Use the custom hook to refetch data when the component comes into focus
    useRefetchOnFocus(refetch);

    const [updateLectureProgress] = useUpdateLectureProgressMutation();
    const [completeCourse, { data: markCompleteData, isSuccess: completedSuccess }] = useCompleteCourseMutation();
    const [inCompleteCourse, { data: markInCompleteData, isSuccess: inCompletedSuccess }] = useInCompleteCourseMutation();

    useEffect(() => {
        if (completedSuccess) {
            refetch();
            toast.success(markCompleteData.message);
        }
        if (inCompletedSuccess) {
            refetch();
            toast.success(markInCompleteData.message);
        }
    }, [completedSuccess, inCompletedSuccess]);

    const [currentLecture, setCurrentLecture] = useState(null);
    const [isQuizStarted, setIsQuizStarted] = useState(false);
    const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showStartConfirmation, setShowStartConfirmation] = useState(false);
    const [manualAttemptData, setManualAttemptData] = useState(null);
    const [activeProgressTab, setActiveProgressTab] = useState('modules'); // 'modules', 'announcements'
    const [videoActiveTab, setVideoActiveTab] = useState("materials"); // 'materials', 'chat'
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [expandedModules, setExpandedModules] = useState({ "Before We Start": true }); // default expand first module
    const toggleModule = (name) => {
        setExpandedModules(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    // Set the initial lecture when data is loaded
    useEffect(() => {
        if (data?.data?.courseDetails?.lectures?.length > 0 && !currentLecture) {
            setCurrentLecture(data.data.courseDetails.lectures[0]);
        }
    }, [data, currentLecture]);

    // Get the current quiz from the current lecture or initial lecture
    const currentQuiz = React.useMemo(() => {
        if (!data?.data?.courseDetails?.lectures) return null;
        const lecture = currentLecture || data.data.courseDetails.lectures[0];
        return lecture?.quiz;
    }, [data, currentLecture]);

    const { data: quizData, error: quizError, isLoading: isQuizLoading, refetch: refetchQuiz } = useGetQuizQuery(
        currentQuiz?._id,
        {
            skip: !currentQuiz?._id || !isValidObjectId(currentQuiz._id),
            refetchOnMountOrArgChange: true
        }
    );

    const {
        handleQuizSubmit: originalHandleQuizSubmit,
        attemptsData,
        latestAttempt,
        refetchAttempts,
        clearAnswers,
        resetAttempt,
        quizAnswers,
        updateAnswer
    } = useQuizAttempt(currentQuiz?._id);

    // Wrap the quiz submit handler to handle UI state updates
    const handleQuizSubmit = async (quizId, timeLeft, timeLimit, quizObject) => {
        try {
            // ⭐⭐ CRITICAL FIX: Pass the quiz object to ensure we have access to all questions
            console.log("Handling quiz submit in CourseProgress:", {
                quizId,
                timeLeft,
                timeLimit,
                quizObject: quizObject || currentQuiz
            });

            // Use the provided quiz object or fall back to currentQuiz
            const quizToUse = quizObject || currentQuiz;

            const success = await originalHandleQuizSubmit(quizId, timeLeft, timeLimit, quizToUse);

            if (success) {
                // Update UI state
                setIsQuizSubmitted(true);
                setIsQuizStarted(false);

                // Refetch attempts to get the latest data
                await refetchAttempts();

                // Store the quiz completion status in localStorage
                if (quizId) {
                    localStorage.setItem(`quiz_${quizId}_attempted`, 'true');
                }
            }

            return success;
        } catch (error) {
            console.error("Quiz submission error in CourseProgress:", error);
            toast.error("Failed to submit quiz: " + (error.message || "Unknown error"));
            return false;
        }
    };

    const handleResetQuiz = async () => {
        const success = await resetAttempt();
        if (success) {
            setIsQuizSubmitted(false);
            setIsQuizStarted(false);
            setShowQuiz(false);
            setManualAttemptData(null);
            refetchQuiz();
        }
        return success;
    };

    // Calculate if the quiz has been attempted - more robust check
    const hasValidAttempt = !!(latestAttempt &&
        typeof latestAttempt.score === 'number' &&
        typeof latestAttempt.correctAnswers === 'number' &&
        Array.isArray(latestAttempt.answers) &&
        latestAttempt.answers.length > 0);

    const hasAttemptedInQuizData = !!(quizData?.data?.hasAttempted === true &&
        quizData?.data?.attempt);

    // Store quiz submission state in localStorage to prevent issues on refresh
    useEffect(() => {
        if (hasValidAttempt) {
            // If we have a valid attempt, store it in localStorage
            localStorage.setItem(`quiz_${currentQuiz?._id}_attempted`, 'true');
        }
    }, [hasValidAttempt, currentQuiz?._id]);

    // Check localStorage for quiz attempt status
    const hasAttemptedInLocalStorage = !!(currentQuiz?._id &&
        localStorage.getItem(`quiz_${currentQuiz._id}_attempted`) === 'true');

    // ⭐⭐ CRITICAL FIX: Use manualAttemptData if available
    const effectiveLatestAttempt = latestAttempt || manualAttemptData;

    // Combine all conditions
    const hasAttemptedQuiz = hasValidAttempt || hasAttemptedInQuizData || hasAttemptedInLocalStorage;

    // Add error handling for quiz fetch
    useEffect(() => {
        if (quizError) {
            // If the quiz has already been attempted, this is not an error
            if (quizError.status === 400 && quizError.data?.message === "You have already attempted this quiz") {
                // Only set as submitted if we don't already have attempts data
                if (!attemptsData?.data?.length) {
                    setIsQuizSubmitted(true);
                    setShowQuiz(false); // Don't show quiz automatically
                    setIsQuizStarted(false);

                    // Force a refetch of attempts to ensure we have the latest data
                    refetchAttempts();
                }
                return;
            }

            // For other errors, show a toast message
            toast.error(quizError.data?.message || 'Failed to load quiz details');
        }
    }, [quizError, refetchAttempts, attemptsData?.data?.length]);

    // Update the quiz data handling effect
    useEffect(() => {
        if (quizData?.data?.hasAttempted === true) {
            // Only set as submitted if we don't already have attempts data
            // This prevents overriding the attempts data with potentially incomplete data
            if (!attemptsData?.data?.length) {
                setIsQuizSubmitted(true);
                setShowQuiz(false); // Don't show quiz automatically
                setIsQuizStarted(false);

                // Force a refetch of attempts to ensure we have the latest data
                refetchAttempts();
            }
        }
    }, [quizData?.data?.hasAttempted, refetchAttempts, attemptsData?.data?.length]);

    // Add a new effect to handle quiz attempts data
    useEffect(() => {
        console.log("Attempts data changed:", attemptsData);

        if (attemptsData?.data?.length > 0) {
            const attempt = attemptsData.data[0];
            console.log("Latest attempt:", attempt);

            // ⭐⭐ CRITICAL FIX: Check if we have a valid attempt with correctAnswers
            if (attempt &&
                typeof attempt.correctAnswers === 'number' &&
                typeof attempt.totalQuestions === 'number') {

                console.log("Valid attempt found, setting quiz as submitted");
                // Set quiz as submitted if we have a valid attempt
                setIsQuizSubmitted(true);

                // Store the attempt status in localStorage to persist across refreshes
                if (currentQuiz?._id) {
                    localStorage.setItem(`quiz_${currentQuiz._id}_attempted`, 'true');

                    // ⭐⭐ CRITICAL FIX: Also store the attempt data in localStorage
                    try {
                        localStorage.setItem(`quiz_${currentQuiz._id}_attempt_data`, JSON.stringify({
                            correctAnswers: attempt.correctAnswers,
                            incorrectAnswers: attempt.incorrectAnswers,
                            totalQuestions: attempt.totalQuestions,
                            timeTaken: attempt.timeTaken
                        }));
                    } catch (e) {
                        console.error("Failed to store attempt data in localStorage:", e);
                    }
                }

                // Don't automatically show the quiz results - let the user click to see them
                setShowQuiz(false);
                setIsQuizStarted(false);
            }
            // ⭐⭐ CRITICAL FIX: Check if we have a valid attempt with answers but no correctAnswers
            else if (attempt && Array.isArray(attempt.answers) && attempt.answers.length > 0) {
                console.log("Attempt with answers found but no correctAnswers, calculating manually");

                // Calculate correctAnswers manually if not present
                let correctAnswers = 0;
                let incorrectAnswers = 0;

                if (currentQuiz?.questions) {
                    attempt.answers.forEach(answer => {
                        const question = currentQuiz.questions[answer.questionIndex];
                        if (question && answer.selectedAnswer !== undefined && answer.selectedAnswer !== null) {
                            if (Number(answer.selectedAnswer) === Number(question.correctAnswer)) {
                                correctAnswers++;
                            } else if (Number(answer.selectedAnswer) !== -1) {
                                incorrectAnswers++;
                            }
                        }
                    });

                    // Update the attempt object with calculated values
                    attempt.correctAnswers = correctAnswers;
                    attempt.incorrectAnswers = incorrectAnswers;
                    attempt.totalQuestions = currentQuiz.questions.length;

                    console.log("Calculated values:", {
                        correctAnswers,
                        incorrectAnswers,
                        totalQuestions: currentQuiz.questions.length
                    });

                    // Store the calculated values in localStorage
                    if (currentQuiz?._id) {
                        try {
                            localStorage.setItem(`quiz_${currentQuiz._id}_attempt_data`, JSON.stringify({
                                correctAnswers,
                                incorrectAnswers,
                                totalQuestions: currentQuiz.questions.length,
                                timeTaken: attempt.timeTaken
                            }));
                        } catch (e) {
                            console.error("Failed to store calculated attempt data in localStorage:", e);
                        }
                    }
                }

                setIsQuizSubmitted(true);
                setShowQuiz(false);
                setIsQuizStarted(false);
            }
            else {
                console.log("Invalid attempt found, checking localStorage");

                // Check if we have a record in localStorage before setting as not submitted
                const hasLocalRecord = currentQuiz?._id &&
                    localStorage.getItem(`quiz_${currentQuiz._id}_attempted`) === 'true';

                if (hasLocalRecord) {
                    console.log("Found attempt record in localStorage, keeping as submitted");
                    setIsQuizSubmitted(true);

                    // ⭐⭐ CRITICAL FIX: Try to get attempt data from localStorage
                    try {
                        const storedAttemptData = localStorage.getItem(`quiz_${currentQuiz._id}_attempt_data`);
                        if (storedAttemptData) {
                            const parsedData = JSON.parse(storedAttemptData);
                            console.log("Retrieved attempt data from localStorage:", parsedData);

                            // Update the attempt object with stored values
                            attempt.correctAnswers = parsedData.correctAnswers;
                            attempt.incorrectAnswers = parsedData.incorrectAnswers;
                            attempt.totalQuestions = parsedData.totalQuestions;
                            attempt.timeTaken = parsedData.timeTaken;
                        }
                    } catch (e) {
                        console.error("Failed to retrieve attempt data from localStorage:", e);
                    }
                } else {
                    console.log("No valid attempt found in data or localStorage");
                    setIsQuizSubmitted(false);
                }
            }
        } else {
            console.log("No attempts data, checking quizData:", quizData?.data);

            // Check localStorage first
            const hasLocalRecord = currentQuiz?._id &&
                localStorage.getItem(`quiz_${currentQuiz._id}_attempted`) === 'true';

            if (hasLocalRecord) {
                console.log("Found attempt record in localStorage, setting as submitted");
                setIsQuizSubmitted(true);

                // ⭐⭐ CRITICAL FIX: Try to get attempt data from localStorage
                if (currentQuiz?._id) {
                    try {
                        const storedAttemptData = localStorage.getItem(`quiz_${currentQuiz._id}_attempt_data`);
                        if (storedAttemptData) {
                            const parsedData = JSON.parse(storedAttemptData);
                            console.log("Retrieved attempt data from localStorage:", parsedData);

                            // Create a temporary attempt object with stored values
                            const tempAttempt = {
                                correctAnswers: parsedData.correctAnswers,
                                incorrectAnswers: parsedData.incorrectAnswers,
                                totalQuestions: parsedData.totalQuestions,
                                timeTaken: parsedData.timeTaken
                            };

                            // Set the manual attempt data to this temporary object
                            setManualAttemptData(tempAttempt);
                        }
                    } catch (e) {
                        console.error("Failed to retrieve attempt data from localStorage:", e);
                    }
                }

                // Try to fetch the attempt data again
                refetchAttempts();
            }
            // If no localStorage record, check quizData
            else if (quizData?.data?.hasAttempted === true) {
                console.log("Quiz data indicates quiz has been attempted");
                setIsQuizSubmitted(true);

                // Force a refetch of attempts to get the attempt data
                refetchAttempts();
            } else {
                console.log("Quiz not attempted according to any source");
                setIsQuizSubmitted(false);
            }
        }
    }, [attemptsData?.data, quizData?.data?.hasAttempted, refetchAttempts, currentQuiz?._id, currentQuiz?.questions]);

    // Add this effect to check quiz attempts when lecture changes
    useEffect(() => {
        // Only run this effect if we have a valid quiz ID
        if (!currentQuiz?._id) {
            setIsQuizSubmitted(false);
            return;
        }

        // Reset the quiz UI state
        setShowQuiz(false);
        setIsQuizStarted(false);
        setShowStartConfirmation(false);

        // Only fetch attempts if we have a valid quiz ID
        if (isValidObjectId(currentQuiz._id)) {
            // We'll set the correct quiz state after fetching attempts
            refetchAttempts();
        } else {
            // If there's no valid quiz ID, reset the submission state
            setIsQuizSubmitted(false);
        }

        // Clear localStorage items only once when the quiz ID changes
        localStorage.removeItem('quizTimer');
        localStorage.removeItem('quizAnswers');

        // Use a ref to track if we've already cleared answers for this quiz
        const quizIdRef = currentQuiz._id;

        // Run this only once per quiz ID change, not on every render
        return () => {
            // Only clear answers when changing to a different quiz
            if (quizIdRef !== currentQuiz?._id) {
                clearAnswers();
            }
        };
    }, [currentQuiz?._id, refetchAttempts]);

    const { timeLeft } = useQuizTimer(
        currentQuiz?.timeLimit || 0,
        isQuizStarted,
        isQuizSubmitted,
        () => handleQuizSubmit(currentQuiz?._id, timeLeft, currentQuiz?.timeLimit, currentQuiz)
    );

    const moduleGroups = React.useMemo(() => {
        const lectures = data?.data?.courseDetails?.lectures;
        if (!lectures) return [];
        const totalLecs = lectures.length;
        const numGroups = totalLecs <= 4 ? 1 : totalLecs <= 8 ? 2 : 3;
        const groups = [];
        const sectionTitles = [
            "Section 1: Course Fundamentals",
            "Section 2: Core Concepts & Practice",
            "Section 3: Advanced Applications"
        ];
        
        for (let i = 0; i < numGroups; i++) {
            groups.push({
                name: sectionTitles[i] || `Section ${i + 1}: Continuation`,
                lectures: []
            });
        }
        
        const countPerGroup = Math.ceil(totalLecs / numGroups);
        lectures.forEach((lecture, index) => {
            const groupIdx = Math.min(Math.floor(index / countPerGroup), numGroups - 1);
            groups[groupIdx].lectures.push(lecture);
        });
        return groups.filter(g => g.lectures.length > 0);
    }, [data?.data?.courseDetails?.lectures]);

    const handleStartQuiz = () => {
        if (hasAttemptedQuiz) {
            // If quiz has been attempted, just show the results
            console.log("Quiz already attempted, showing results");
            setShowQuiz(true);
            // Make sure we're not in quiz-taking mode
            setIsQuizStarted(false);
            return;
        }
        // If quiz has not been attempted, show confirmation dialog
        console.log("Showing quiz start confirmation");
        setShowStartConfirmation(true);
    };

    const confirmStartQuiz = () => {
        if (hasAttemptedQuiz) {
            // If quiz has been attempted, just show the results
            console.log("Quiz already attempted, showing results from confirmation");
            setShowQuiz(true);
            return;
        }
        // If quiz has not been attempted, start the quiz
        console.log("Starting quiz after confirmation");
        setShowStartConfirmation(false);
        setIsQuizStarted(true);
        setShowQuiz(true);
    };

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Failed to load course details</p>;
    if (!data?.data?.courseDetails) return <p>No course details found</p>;

    const { courseDetails, progress, completed } = data.data;
    const { courseTitle } = courseDetails;

    const isLectureCompleted = (lectureId) => {
        return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
    };

    const handleLectureProgress = async (lectureId) => {
        try {
            const res = await updateLectureProgress({ courseId, lectureId }).unwrap();
            if (res?.reward) {
                showGamificationToast(res.reward);
                dispatch(userRewardsUpdated(res.reward));
            }
        } catch (err) {
            console.error("Failed to update lecture progress:", err);
        }
        refetch();
    };



    const handleSelectLecture = (lecture) => {
        // First update the current lecture
        setCurrentLecture(lecture);

        // Mark the lecture as viewed
        handleLectureProgress(lecture._id);

        // Reset quiz states when selecting a new lecture
        // Note: We don't need to do this here because the effect that watches currentQuiz
        // will handle resetting the quiz state when the lecture changes
    };

    const handleCompleteCourse = async () => {
        await completeCourse(courseId);
    };

    const handleInCompleteCourse = async () => {
        await inCompleteCourse(courseId);
    };

    const handleCloseQuiz = () => {
        // Only hide the quiz UI, don't reset submission state
        setShowQuiz(false);

        // If the quiz is in progress (started but not submitted), reset it completely
        if (isQuizStarted && !isQuizSubmitted) {
            // Reset all quiz-related states
            setIsQuizStarted(false);
            setIsQuizSubmitted(false);
            setShowStartConfirmation(false);

            // Clear any saved quiz state from localStorage
            localStorage.removeItem('quizTimer');
            localStorage.removeItem('quizAnswers');

            // Only clear answers if there are answers to clear
            // This prevents unnecessary state updates
            if (Object.keys(effectiveLatestAttempt?.answers || {}).length > 0) {
                clearAnswers();
            }
        }

        // Refetch attempts to ensure we have the latest data
        // Only if we have a valid quiz ID
        if (currentQuiz?._id && isValidObjectId(currentQuiz._id)) {
            refetchAttempts();
        }
    };

    // Add a separate function for closing results
    const handleCloseResults = () => {
        // Just hide the quiz UI, don't reset submission state
        setShowQuiz(false);

        // We don't need to refetch attempts here as it might cause state issues
        // The attempts data should already be loaded
    };

    // Calculate progress stats for sidebar
    const totalLectures = courseDetails?.lectures?.length || 0;
    const completedLectures = progress?.filter(p => p.viewed)?.length || 0;
    const progressPercent = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
    const totalQuizzes = courseDetails?.lectures?.filter(l => l.quiz)?.length || 0;
    const currentLectureIndex = currentLecture ? courseDetails.lectures.findIndex(l => l._id === currentLecture._id) : 0;
    const totalModules = moduleGroups.length;
    const completedModules = moduleGroups.filter(g => g.lectures.every(l => isLectureCompleted(l._id))).length;

    const goToPrevLecture = () => {
        if (currentLectureIndex > 0) {
            handleSelectLecture(courseDetails.lectures[currentLectureIndex - 1]);
        }
    };
    const goToNextLecture = () => {
        if (currentLectureIndex < totalLectures - 1) {
            handleSelectLecture(courseDetails.lectures[currentLectureIndex + 1]);
        }
    };

    return (
        <div className="w-full bg-background text-foreground pt-16">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">

                {/* ===== LEFT SIDEBAR ===== */}
                <div className="w-full md:w-80 lg:w-[350px] shrink-0 bg-card text-card-foreground flex flex-col p-4 border-r border-border md:h-[calc(100vh-64px)] md:sticky md:top-16 overflow-y-auto">
                    
                    {/* Header: Go Back + Title */}
                    <div className="pb-4 flex items-center shrink-0">
                        <button 
                            onClick={() => window.history.back()} 
                            className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                        >
                            <ArrowLeft className="w-5 h-5 text-foreground shrink-0" />
                            <h1 className="text-base font-bold text-foreground tracking-tight line-clamp-1">{courseTitle}</h1>
                        </button>
                    </div>

                    {/* Progress Card */}
                    <div className="border border-border bg-muted/40 rounded-xl p-5 space-y-4 mb-5 shrink-0 shadow-sm">
                        <p className="text-xs font-semibold text-primary">{progressPercent.toFixed(2)}% Complete</p>
                        
                        {/* Thin Brand Progress Bar */}
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {/* Stats Row */}
                        <div className="flex justify-between items-center text-xs pt-1">
                            <div>
                                <span className="text-muted-foreground font-medium">Modules: </span>
                                <span className="font-bold text-foreground">{completedModules}/{totalModules}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground font-medium">Sub-Modules: </span>
                                <span className="font-bold text-foreground">{completedLectures}/{totalLectures}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground font-medium">XP: </span>
                                <span className="font-bold text-primary">{user?.xp || 0}</span>
                            </div>
                        </div>

                        {/* Course Completion & Certificate Trigger */}
                        <div className="h-px bg-border/40 my-3" />
                        <div className="pt-1">
                            {completed ? (
                                <div className="space-y-2">
                                    <Button
                                        onClick={() => setShowCertificate(true)}
                                        className="w-full bg-[#E8602E] hover:bg-[#d4561f] text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-[#E8602E]/10"
                                    >
                                        <Award className="w-4 h-4" />
                                        Claim Certificate
                                    </Button>
                                    <button
                                        onClick={handleInCompleteCourse}
                                        className="w-full text-[10px] text-zinc-500 hover:text-zinc-300 font-semibold transition-colors text-center"
                                    >
                                        Reset Course Progress
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleCompleteCourse}
                                    disabled={progressPercent < 100}
                                    className="w-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/25 disabled:opacity-40 disabled:hover:bg-primary/10 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Course Completed
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-4 border-b border-border mb-4 px-1 shrink-0">
                        <button 
                            onClick={() => setActiveProgressTab('modules')} 
                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors pb-3 border-b-2 -mb-[2px] ${
                                activeProgressTab === 'modules' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
                            }`}
                        >
                            <Box className="w-3.5 h-3.5" />
                            All Modules
                        </button>
                        <button 
                            onClick={() => setActiveProgressTab('announcements')} 
                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors pb-3 border-b-2 -mb-[2px] ${
                                activeProgressTab === 'announcements' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'
                            }`}
                        >
                            <Megaphone className="w-3.5 h-3.5" />
                            Announcements
                        </button>
                    </div>

                    {/* Tab Contents */}
                    <div className="flex-1 overflow-y-auto min-h-0 focus-visible:outline-none pr-1">
                        
                        {/* Modules Tab Content */}
                        {activeProgressTab === 'modules' && (
                            <div className="space-y-1">
                                
                                {/* Live Discussion Row */}
                                <div className="flex items-center justify-between p-4 py-3.5 bg-muted/30 border border-border rounded-xl mb-4">
                                    <span className="text-sm font-bold text-foreground">Live Discussion</span>
                                    <button 
                                        onClick={() => setIsAIOpen(true)}
                                        className="bg-[#E8602E] hover:bg-[#d4561f] text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors"
                                    >
                                        Ask AI
                                    </button>
                                </div>

                                {/* Accordion Modules List */}
                                <div className="space-y-1">
                                    {moduleGroups.map((module) => {
                                        const isExpanded = expandedModules[module.name];
                                        const isDone = module.lectures.every(l => isLectureCompleted(l._id));
                                        return (
                                            <div key={module.name} className="border-b border-border/60 pb-1 last:border-0">
                                                
                                                {/* Module Header */}
                                                <button 
                                                    onClick={() => toggleModule(module.name)}
                                                    className="w-full flex items-center justify-between py-3 px-3 hover:bg-muted/50 rounded-lg transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[13px] font-semibold text-foreground tracking-wide">{module.name}</span>
                                                        {isDone && (
                                                            <span className="border border-green-500/20 bg-green-500/10 text-green-500 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                                                                Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    )}
                                                </button>

                                                {/* Module Sub-modules (Lectures) */}
                                                {isExpanded && (
                                                    <div className="bg-muted/5 p-1 rounded-lg mt-1 mb-2 space-y-1">
                                                        {module.lectures.map((lecture) => {
                                                            const isActive = lecture._id === currentLecture?._id;
                                                            const lectureDone = isLectureCompleted(lecture._id);
                                                            return (
                                                                <button
                                                                    key={lecture._id}
                                                                    onClick={() => handleSelectLecture(lecture)}
                                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                                                        isActive ? 'bg-primary/10 border-l-2 border-l-primary text-primary font-medium' : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                                                                    }`}
                                                                >
                                                                    <div className="shrink-0">
                                                                        {lectureDone ? (
                                                                            <CheckCircle2 className="w-4.5 h-4.5 text-green-500" />
                                                                        ) : isActive ? (
                                                                            <CirclePlay className="w-4.5 h-4.5 text-primary" />
                                                                        ) : (
                                                                            <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-[12px] truncate ${
                                                                        isActive ? 'text-primary font-semibold' : lectureDone ? 'text-muted-foreground' : 'text-foreground/85'
                                                                    }`}>
                                                                        {lecture.lectureTitle}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Announcements Tab Content */}
                        {activeProgressTab === 'announcements' && (
                            <div className="p-4 bg-muted/20 border border-border rounded-xl text-center text-muted-foreground space-y-2">
                                <Megaphone className="w-8 h-8 text-primary mx-auto mb-2 opacity-80" />
                                <p className="text-xs font-bold text-foreground">No Announcements yet</p>
                                <p className="text-[10px]">Updates, live class reschedules, and notes will show up here.</p>
                            </div>
                        )}


                    </div>
                </div>

                {/* ===== MAIN CONTENT AREA ===== */}
                <div className="flex-1 flex flex-col">
                    {/* Video Label Bar */}
                    <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-card">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            Video Lecture <span className="text-[#E8602E]">▶</span>
                        </span>
                    </div>

                    {/* Video Player */}
                    <div className="bg-black">
                        {currentLecture ? (
                            currentLecture.videoUrl ? (
                                <VideoPlayer
                                    src={currentLecture.videoUrl}
                                    onPlay={() => handleLectureProgress(currentLecture._id)}
                                    onError={() => toast.error('Failed to load video.')}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-80 text-[#444] bg-[#0a0a0a] text-sm">
                                    No video available for this lecture
                                </div>
                            )
                        ) : (
                            courseDetails.lectures[0]?.videoUrl ? (
                                <VideoPlayer
                                    src={courseDetails.lectures[0].videoUrl}
                                    onPlay={() => handleLectureProgress(courseDetails.lectures[0]._id)}
                                    onError={() => toast.error('Failed to load video.')}
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-80 text-[#444] bg-[#0a0a0a] text-sm">
                                    No video available
                                </div>
                            )
                        )}
                    </div>

                    {/* Lesson Navigation Bar */}
                    <div className="flex items-center justify-center gap-4 py-3 border-b border-border bg-card">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToPrevLecture}
                            disabled={currentLectureIndex <= 0}
                            className="text-[#E8602E] disabled:text-muted-foreground"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-4 py-1.5 rounded-full">
                            Lesson {currentLectureIndex + 1}/{totalLectures}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToNextLecture}
                            disabled={currentLectureIndex >= totalLectures - 1}
                            className="text-[#E8602E] disabled:text-muted-foreground"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Video Tabs Selection */}
                    <div className="flex-1 flex flex-col min-h-0 mt-4">
                        <div className="bg-[#0a0a0a] border border-white/[0.05] p-1 rounded-xl mx-5 flex gap-2 shrink-0 relative z-0">
                            {/* Materials Tab Button */}
                            <button
                                onClick={() => setVideoActiveTab("materials")}
                                className="relative flex-grow flex-shrink-0 flex-1 rounded-lg text-xs font-bold py-2 text-center transition-colors focus:outline-none z-10"
                                style={{ color: videoActiveTab === "materials" ? "#ffffff" : "#888888" }}
                            >
                                {videoActiveTab === "materials" && (
                                    <motion.span
                                        layoutId="activeVideoTabPill"
                                        className="absolute inset-0 bg-[#E8602E] rounded-lg -z-10"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                Lecture Files & Quiz
                            </button>

                            {/* Q&A Chat Tab Button */}
                            <button
                                onClick={() => setVideoActiveTab("chat")}
                                className="relative flex-grow flex-shrink-0 flex-1 rounded-lg text-xs font-bold py-2 text-center transition-colors focus:outline-none z-10"
                                style={{ color: videoActiveTab === "chat" ? "#ffffff" : "#888888" }}
                            >
                                {videoActiveTab === "chat" && (
                                    <motion.span
                                        layoutId="activeVideoTabPill"
                                        className="absolute inset-0 bg-[#E8602E] rounded-lg -z-10"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                Class Q&A Chat
                            </button>

                            {/* Code Sandbox Tab Button */}
                            <button
                                onClick={() => setVideoActiveTab("sandbox")}
                                className="relative flex-grow flex-shrink-0 flex-1 rounded-lg text-xs font-bold py-2 text-center transition-colors focus:outline-none z-10"
                                style={{ color: videoActiveTab === "sandbox" ? "#ffffff" : "#888888" }}
                            >
                                {videoActiveTab === "sandbox" && (
                                    <motion.span
                                        layoutId="activeVideoTabPill"
                                        className="absolute inset-0 bg-[#E8602E] rounded-lg -z-10"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                                Code Sandbox
                            </button>
                        </div>

                        {/* Tab 1: Materials & Quiz */}
                        {videoActiveTab === "materials" && (
                            <div className="flex-1 overflow-y-auto min-h-0 focus-visible:outline-none focus-visible:ring-0 p-5 space-y-6">
                                {/* Lecture Title + Files */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-foreground">
                                        {currentLecture
                                            ? `Lecture ${currentLectureIndex + 1}: ${currentLecture.lectureTitle}`
                                            : `Lecture 1: ${courseDetails.lectures[0]?.lectureTitle || "Introduction"}`
                                        }
                                    </h3>

                                    {/* File Attachments */}
                                    {currentLecture ? (
                                        currentLecture.docInfo?.length > 0 ? (
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground mb-2">Lecture Files:</h3>
                                                <div className="space-y-3">
                                                    {currentLecture.docInfo.map((doc, index) => (
                                                        <div key={index}>
                                                            <DocumentViewer fileUrl={doc.fileUrl} fileName={doc.fileName} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No files available for this lecture.</p>
                                        )
                                    ) : (
                                        courseDetails.lectures[0]?.docInfo?.length > 0 ? (
                                            <div>
                                                <h3 className="text-sm font-semibold text-foreground mb-2">Lecture Files:</h3>
                                                <div className="space-y-3">
                                                    {courseDetails.lectures[0].docInfo.map((doc, index) => (
                                                        <div key={index}>
                                                            <DocumentViewer fileUrl={doc.fileUrl} fileName={doc.fileName} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No files available for this lecture.</p>
                                        )
                                    )}
                                </div>

                                {/* Quiz Section */}
                                {currentQuiz && (
                                    <div className="p-6 border border-border bg-card rounded-xl shadow-sm">
                                        <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xl font-bold text-foreground">Lecture Quiz</h3>
                                                {hasAttemptedQuiz && (effectiveLatestAttempt || currentQuiz) && (
                                                    <div className="px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-100 rounded-full bg-blue-50 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
                                                        <span className="mr-2">Questions: {currentQuiz.questions.length}</span>
                                                        <span className="text-blue-800 dark:text-blue-300">•</span>
                                                        <span className="ml-2">Score: {effectiveLatestAttempt?.correctAnswers || 0}/{currentQuiz.questions.length}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {(() => {
                                            // If quiz is being shown and has been attempted, show results
                                            if (showQuiz && hasAttemptedQuiz) {
                                                return (
                                                    <div className="space-y-6">
                                                        <QuizSummary
                                                            quiz={currentQuiz}
                                                            attempt={effectiveLatestAttempt}
                                                            onClose={handleCloseResults}
                                                            onReset={handleResetQuiz}
                                                        />
                                                    </div>
                                                );
                                            }
                                            // If quiz has been attempted but not being shown, show completion summary
                                            else if (!showQuiz && hasAttemptedQuiz) {
                                                return (
                                                    <div className="max-w-2xl mx-auto text-center">
                                                        <div className="p-6 border border-green-500/20 bg-green-500/5 rounded-xl">
                                                            <h4 className="mb-3 text-lg font-bold text-green-600">Quiz Attempted</h4>
                                                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                                                <p>• You have already attempted this quiz</p>
                                                                <p>• Your score: {effectiveLatestAttempt?.correctAnswers || 0}/{currentQuiz.questions.length}</p>
                                                                <p>• Time taken: {effectiveLatestAttempt?.timeTaken < 0.1 ?
                                                                    "less than 5 seconds" :
                                                                    effectiveLatestAttempt?.timeTaken < 1 ?
                                                                        `${Math.round((effectiveLatestAttempt?.timeTaken || 0) * 60)} seconds` :
                                                                        `${Math.round(effectiveLatestAttempt?.timeTaken || 0)} minutes`}</p>
                                                            </div>
                                                            <Button
                                                                onClick={() => {
                                                                    // Make sure we have the latest attempt data before showing results
                                                                    if (effectiveLatestAttempt) {
                                                                        setShowQuiz(true);
                                                                    } else {
                                                                        // If we don't have attempt data, try to fetch it first
                                                                        refetchAttempts().then(() => {
                                                                            setShowQuiz(true);
                                                                        });
                                                                    }
                                                                }}
                                                                className="px-6 py-2 text-sm bg-green-650 hover:bg-green-700"
                                                            >
                                                                See Quiz Results
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            // If quiz is being shown and not attempted, show quiz UI
                                            else if (showQuiz && !hasAttemptedQuiz) {
                                                return (
                                                    <div className="space-y-6">
                                                        <QuizUI
                                                            quiz={currentQuiz}
                                                            isQuizStarted={isQuizStarted}
                                                            isQuizSubmitted={isQuizSubmitted}
                                                            onQuizSubmit={handleQuizSubmit}
                                                            onCloseQuiz={handleCloseQuiz}
                                                            timeLeft={timeLeft}
                                                            quizAnswers={quizAnswers}
                                                            updateAnswer={updateAnswer}
                                                            clearAnswers={clearAnswers}
                                                        />
                                                    </div>
                                                );
                                            }
                                            // Default case: show quiz instructions or "already attempted" message
                                            else {
                                                return (
                                                    <div className="max-w-2xl mx-auto text-center">
                                                        <div className="p-6 border border-border bg-muted/30 rounded-xl">
                                                            <h4 className="mb-3 text-lg font-bold text-foreground">
                                                                Quiz Instructions
                                                            </h4>

                                                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                                                <p>• This quiz contains {currentQuiz.questions.length} questions</p>
                                                                <p>• Time limit: {currentQuiz.timeLimit} minutes</p>
                                                                <p>• You can attempt this quiz only once</p>
                                                                <p>• Make sure you have a stable internet connection</p>
                                                            </div>

                                                            <Button
                                                                onClick={handleStartQuiz}
                                                                className="px-6 py-2 text-sm"
                                                            >
                                                                Start Quiz
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab 2: Q&A Chat Board */}
                        {videoActiveTab === "chat" && (
                            <div className="flex-1 overflow-y-auto min-h-0 focus-visible:outline-none focus-visible:ring-0 p-5">
                                <LectureChat 
                                    courseId={courseId} 
                                    lectureId={currentLecture?._id || courseDetails.lectures[0]?._id} 
                                    currentUser={user} 
                                    courseCreatorId={courseDetails?.creator}
                                />
                            </div>
                        )}

                        {/* Tab 3: Code Sandbox */}
                        {videoActiveTab === "sandbox" && (
                            <div className="flex-1 flex flex-col min-h-0 p-5">
                                <Sandbox />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Start Quiz Confirmation Modal */}
            {showStartConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md p-6 mx-4 rounded-lg shadow-xl bg-background">
                        <h3 className="mb-4 text-xl font-semibold text-foreground">Important Notice</h3>
                        <div className="space-y-4">
                            <p className="font-medium text-destructive">Please read carefully before starting the quiz:</p>
                            <ul className="pl-5 space-y-2 list-disc text-foreground">
                                <li>You can only attempt this quiz once.</li>
                                <li>Once started, you cannot pause or close the quiz.</li>
                                <li>The timer will continue running until you submit or time runs out.</li>
                                <li>Make sure you have a stable internet connection.</li>
                                <li>Ensure you have enough time to complete the quiz.</li>
                            </ul>
                            <div className="flex gap-4 mt-6">
                                <Button
                                    onClick={confirmStartQuiz}
                                    className="flex-1"
                                    variant="default"
                                >
                                    I Understand, Start Quiz
                                </Button>
                                <Button
                                    onClick={() => setShowStartConfirmation(false)}
                                    className="flex-1"
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating AI Tutor Toggle button & Chat Panel */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                {/* Floating AI Tutor chat panel */}
                {isAIOpen && (
                    <div className="w-[380px] h-[550px] bg-card border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden flex flex-col mb-4 animate-in slide-in-from-bottom-5 duration-200">
                        <AITutor 
                            courseId={courseId} 
                            currentLecture={currentLecture} 
                            onClose={() => setIsAIOpen(false)} 
                        />
                    </div>
                )}

                {/* Floating chat toggle bubble */}
                <button
                    onClick={() => setIsAIOpen((prev) => !prev)}
                    className="w-12 h-12 rounded-full bg-[#E8602E] hover:bg-[#d4561f] shadow-lg shadow-[#E8602E]/20 flex items-center justify-center hover:scale-105 transition-all text-white border border-[#E8602E]/10 cursor-pointer"
                >
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </button>
            </div>

            {/* Certificate Modal */}
            {showCertificate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
                    {/* CSS print override */}
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media print {
                            @page {
                                size: landscape;
                                margin: 0;
                            }
                            html, body {
                                height: 100vh !important;
                                overflow: hidden !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                background-color: #070707 !important;
                            }
                            body * {
                                visibility: hidden !important;
                            }
                            #certificate-print-area, #certificate-print-area * {
                                visibility: visible !important;
                            }
                            #certificate-print-area {
                                position: fixed !important;
                                left: 1.5cm !important;
                                top: 1.5cm !important;
                                width: calc(100vw - 3cm) !important;
                                height: calc(100vh - 3cm) !important;
                                border: 6px double #E8602E !important;
                                background-color: #070707 !important;
                                padding: 40px !important;
                                box-sizing: border-box !important;
                                display: flex !important;
                                flex-direction: column !important;
                                justify-content: space-between !important;
                                align-items: center !important;
                                border-radius: 8px !important;
                                margin: 0 !important;
                                overflow: hidden !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            #certificate-print-area * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                    ` }} />

                    <div className="relative w-full max-w-3xl bg-[#0c0c0c] border border-white/[0.08] rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col space-y-6 overflow-hidden">
                        
                        {/* Golden/Orange glowing aura inside */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#E8602E]/[0.03] blur-[100px] pointer-events-none" />

                        {/* Top controls: print and close */}
                        <div className="flex justify-between items-center relative z-10">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Course Credential</span>
                            <button 
                                onClick={() => setShowCertificate(false)}
                                className="text-zinc-500 hover:text-white transition-colors font-bold text-xs"
                            >
                                Close
                            </button>
                        </div>

                        {/* Printable Certificate Frame */}
                        <div 
                            id="certificate-print-area"
                            className="relative border-2 border-dashed border-[#E8602E]/20 bg-[#070707] p-8 md:p-12 rounded-2xl flex flex-col items-center text-center space-y-6 overflow-hidden select-none"
                        >
                            {/* Watermark Logo */}
                            <div className="absolute inset-0 opacity-[0.035] pointer-events-none flex items-center justify-center select-none">
                                <img src={logoDark} alt="Mentora Logo Watermark" className="w-[340px] object-contain rotate-[-12deg]" />
                            </div>

                            {/* Top emblem */}
                            <div className="flex flex-col items-center gap-1 select-none">
                                <img src={logoDark} alt="Mentora Emblem" className="h-7 object-contain" />
                                <div className="text-[7px] text-[#E8602E] font-bold uppercase tracking-[0.25em] mt-1 bg-[#E8602E]/5 border border-[#E8602E]/10 px-2 py-0.5 rounded-full">
                                    Digital Credential
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Certificate of Completion</h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">This is proudly presented to</p>
                            </div>

                            {/* Student Name */}
                            <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-wide border-b border-white/[0.08] pb-2 px-10">
                                {user?.name || "Mentora Student"}
                            </h1>

                            <div className="space-y-2 max-w-md">
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    for successfully completing all syllabus modules, interactive quizzes, and coding sandbox challenges in the course:
                                </p>
                                <p className="text-base md:text-lg font-extrabold text-[#E8602E] leading-tight">
                                    {courseDetails?.courseTitle}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-12 text-center pt-6 border-t border-white/[0.04] w-full max-w-md text-[10px]">
                                <div>
                                    <span className="text-zinc-500 block uppercase tracking-wider">Date of Issue</span>
                                    <span className="text-white font-bold">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block uppercase tracking-wider">Credential ID</span>
                                    <span className="text-white font-mono font-bold">MENT-{(courseId || "").slice(-4).toUpperCase()}-{(user?._id || "").slice(-4).toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Verification Footer sign */}
                            <div className="pt-4 flex items-center gap-6 justify-center">
                                <div className="text-center">
                                    <p className="font-mono text-zinc-500 text-[9px] uppercase tracking-wider">Verified by</p>
                                    <p className="font-bold text-[#E8602E] text-[10px] mt-0.5">Mentora Faculty Board</p>
                                </div>
                            </div>
                        </div>

                        {/* Print/Share Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                            <Button 
                                onClick={() => {
                                    window.print();
                                }}
                                className="flex-1 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white rounded-xl font-bold py-2 text-xs flex items-center justify-center gap-1.5 transition-all"
                            >
                                <FileText className="w-4 h-4" />
                                Print / PDF
                            </Button>
                            <Button 
                                onClick={() => {
                                    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://mentora.com/credentials/MENT-${(courseId || "").slice(-4).toUpperCase()}-${(user?._id || "").slice(-4).toUpperCase()}`;
                                    window.open(shareUrl, '_blank');
                                }}
                                className="flex-1 bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl font-bold py-2 text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#E8602E]/20"
                            >
                                <Sparkles className="w-4 h-4" />
                                Add to LinkedIn
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseProgress;

