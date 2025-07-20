import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
    useCompleteCourseMutation,
    useGetCourseProgressQuery,
    useInCompleteCourseMutation,
    useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useGetQuizQuery } from "@/features/api/quizApi";
import { QuizUI } from "@/components/quiz/QuizUI";
import QuizSummary from "@/components/quiz/QuizSummary";
import { useQuizAttempt } from "@/hooks/useQuizAttempt";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import DocumentViewer from "@/components/document-viewer/DocumentViewer";

// Simple ObjectId validation function
const isValidObjectId = (id) => {
    if (!id) return false;
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(id);
};

const CourseProgress = () => {
    const params = useParams();
    const courseId = params.courseId;
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
    // ⭐⭐ CRITICAL FIX: Add state for manual attempt data
    const [manualAttemptData, setManualAttemptData] = useState(null);

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

    const { data: quizData, error: quizError, isLoading: isQuizLoading } = useGetQuizQuery(
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
        clearAnswers
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
        if (hasValidAttempt || hasAttemptedInQuizData) {
            // If we have a valid attempt, store it in localStorage
            localStorage.setItem(`quiz_${currentQuiz?._id}_attempted`, 'true');
        }
    }, [hasValidAttempt, hasAttemptedInQuizData, currentQuiz?._id]);

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

                // Store in localStorage for future reference
                if (currentQuiz?._id) {
                    localStorage.setItem(`quiz_${currentQuiz._id}_attempted`, 'true');
                }

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
        await updateLectureProgress({ courseId, lectureId });
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

    return (
        <div className="p-4 mx-auto max-w-7xl">
            {/* Course Title and Completion Button */}
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold text-foreground">{courseTitle}</h1>
                <Button onClick={completed ? handleInCompleteCourse : handleCompleteCourse} variant={completed ? "outline" : "default"}>
                    {completed ? (
                        <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span>Completed</span>
                        </div>
                    ) : (
                        "Mark as completed"
                    )}
                </Button>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
                {/* Video and Files Section */}
                <div className="flex-1 p-4 rounded-lg shadow-lg bg-card md:w-3/5 h-fit">
                    {/* Video Player */}
                    <div>
                        {/* If there's a selected lecture, use its video */}
                        {currentLecture ? (
                            currentLecture.videoUrl ? (
                                <div className="relative w-full">
                                    <video
                                        key={currentLecture.videoUrl}
                                        src={currentLecture.videoUrl}
                                        controls
                                        className="w-full h-auto md:rounded-lg"
                                        onPlay={() => handleLectureProgress(currentLecture._id)}
                                        onError={(e) => {
                                            console.error('Video loading error:', e);
                                            toast.error('Failed to load video. Please try again later.');
                                        }}
                                        onLoadStart={() => {
                                            // Add loading state if needed
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-64 rounded-lg bg-muted">
                                    <p className="text-muted-foreground">No video available for this lecture</p>
                                </div>
                            )
                        ) : (
                            // If no lecture is selected, use the first lecture's video
                            courseDetails.lectures[0]?.videoUrl ? (
                                <div className="relative w-full">
                                    <video
                                        key={courseDetails.lectures[0].videoUrl}
                                        src={courseDetails.lectures[0].videoUrl}
                                        controls
                                        className="w-full h-auto md:rounded-lg"
                                        onPlay={() => handleLectureProgress(courseDetails.lectures[0]._id)}
                                        onError={(e) => {
                                            console.error('Video loading error:', e);
                                            toast.error('Failed to load video. Please try again later.');
                                        }}
                                        onLoadStart={() => {
                                            // Add loading state if needed
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-64 rounded-lg bg-muted">
                                    <p className="text-muted-foreground">No video available for this lecture</p>
                                </div>
                            )
                        )}
                    </div>

                    {/* Lecture Title */}
                    <div className="mt-2">
                        <h3 className="text-lg font-medium text-foreground">
                            {currentLecture
                                ? `Lecture ${courseDetails.lectures.findIndex((lec) => lec._id === currentLecture._id) + 1} : ${currentLecture.lectureTitle}`
                                : `Lecture 1 : ${courseDetails.lectures[0]?.lectureTitle || "Introduction"}`
                            }
                        </h3>
                    </div>

                    {/* File Attachments */}
                    {currentLecture ? (
                        currentLecture.docInfo?.length > 0 ? (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-foreground">Lecture Files:</h3>
                                <div className="mt-4 space-y-4">
                                    {currentLecture.docInfo.map((doc, index) => (
                                        <div key={index}>
                                            <DocumentViewer
                                                fileUrl={doc.fileUrl}
                                                fileName={doc.fileName}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="mt-4 text-muted-foreground">No files available for this lecture.</p>
                        )
                    ) : (
                        courseDetails.lectures[0]?.docInfo?.length > 0 ? (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-foreground">Lecture Files:</h3>
                                <div className="mt-4 space-y-4">
                                    {courseDetails.lectures[0].docInfo.map((doc, index) => (
                                        <div key={index}>
                                            <DocumentViewer
                                                fileUrl={doc.fileUrl}
                                                fileName={doc.fileName}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="mt-4 text-muted-foreground">No files available for this lecture.</p>
                        )
                    )}
                </div>

                {/* Lecture Sidebar */}
                <div className="flex flex-col w-full pt-4 border-t border-border md:w-2/5 md:border-t-0 md:border-l md:pl-4 md:pt-0">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">Course Lectures</h2>
                    <div className="flex-1 overflow-y-auto">
                        {courseDetails?.lectures.map((lecture) => (
                            <Card
                                key={lecture._id}
                                className={`mb-3 cursor-pointer transition transform ${
                                    lecture._id === currentLecture?._id ? "bg-muted" : ""
                                }`}
                                onClick={() => handleSelectLecture(lecture)}
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center">
                                        {isLectureCompleted(lecture._id) ? (
                                            <CheckCircle2 size={24} className="mr-2 text-green-500" />
                                        ) : (
                                            <CirclePlay size={24} className="mr-2 text-muted-foreground" />
                                        )}
                                        <div>
                                            <CardTitle className="text-lg font-medium text-foreground">{lecture.lectureTitle}</CardTitle>
                                        </div>
                                    </div>
                                    {isLectureCompleted(lecture._id) && (
                                        <Badge variant={"outline"} className="text-green-600 bg-green-200 dark:bg-green-900 dark:text-green-300">
                                            Completed
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quiz Section */}
            {currentQuiz && (
                <div className="p-8 mt-8 shadow-lg bg-card rounded-xl">
                    <div className="flex items-center justify-between pb-4 mb-8 border-b border-border">
                        <div className="flex items-center gap-4">
                            <h3 className="text-2xl font-bold text-foreground">Quiz</h3>
                            {hasAttemptedQuiz && (effectiveLatestAttempt || currentQuiz) && (
                                <div className="px-4 py-2 text-sm font-medium text-blue-700 border border-blue-100 rounded-full bg-blue-50 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
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
                                    />
                                </div>
                            );
                        }
                        // If quiz has been attempted but not being shown, show completion summary
                        else if (!showQuiz && hasAttemptedQuiz) {
                            return (
                                <div className="max-w-2xl mx-auto text-center">
                                    <div className="p-8 border-2 border-green-100 rounded-xl bg-green-50/50 dark:bg-green-900/50 dark:border-green-800">
                                        <h4 className="mb-4 text-xl font-bold text-green-800 dark:text-green-300">Quiz Attempted</h4>
                                        <div className="space-y-3 text-green-700 dark:text-green-300">
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
                                            className="px-8 py-6 mt-6 text-lg bg-green-600 hover:bg-green-700"
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
                                    />
                                </div>
                            );
                        }
                        // Default case: show quiz instructions or "already attempted" message
                        else {
                            return (
                                <div className="max-w-2xl mx-auto text-center">
                                    <div className="p-8 border-2 border-blue-100 rounded-xl bg-blue-50/50 dark:bg-blue-900/50 dark:border-blue-800">
                                        <h4 className="mb-4 text-xl font-bold text-blue-800 dark:text-blue-300">
                                            Quiz Instructions
                                        </h4>

                                        <div className="space-y-3 text-blue-700 dark:text-blue-300">
                                            <p>• This quiz contains {currentQuiz.questions.length} questions</p>
                                            <p>• Time limit: {currentQuiz.timeLimit} minutes</p>
                                            <p>• You can attempt this quiz only once</p>
                                            <p>• Make sure you have a stable internet connection</p>

                                            {hasAttemptedQuiz && (
                                                <p className="font-medium text-green-700 dark:text-green-300">
                                                    • You have already attempted this quiz with score: {effectiveLatestAttempt?.correctAnswers || 0}/{currentQuiz.questions.length}
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            onClick={handleStartQuiz}
                                            className={`px-8 py-6 mt-6 text-lg ${
                                                hasAttemptedQuiz
                                                    ? "bg-green-600 hover:bg-green-700"
                                                    : ""
                                            }`}
                                        >
                                            {hasAttemptedQuiz ? "Quiz is already attempted, see result" : "Start Quiz"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        }
                    })()}
                </div>
            )}

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
        </div>
    );
};

export default CourseProgress;

