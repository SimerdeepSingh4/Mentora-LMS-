import { useState, useEffect } from 'react';
import { useSubmitQuizMutation, useGetQuizAttemptsQuery } from '@/features/api/quizApi';
import { toast } from 'sonner';

export const useQuizAttempt = (quizId) => {
    // ⭐⭐ CRITICAL FIX: We'll need to pass the quiz object when calling handleQuizSubmit
    const [quizAnswers, setQuizAnswers] = useState({});
    const [submitQuiz] = useSubmitQuizMutation();

    const { data: attemptsData, refetch: refetchAttempts } = useGetQuizAttemptsQuery(quizId, {
        skip: !quizId,
        refetchOnMountOrArgChange: true
    });

    // Load saved answers from localStorage
    useEffect(() => {
        const savedAnswers = localStorage.getItem('quizAnswers');
        if (savedAnswers) {
            try {
                setQuizAnswers(JSON.parse(savedAnswers));
            } catch (error) {
                console.error('Error loading saved answers:', error);
                localStorage.removeItem('quizAnswers');
            }
        }
    }, []);

    const handleQuizSubmit = async (quizId, timeLeft, timeLimit, quizObject) => {
        // ⭐⭐ CRITICAL FIX: Make sure we have a valid quiz object with questions
        if (!quizObject || !quizObject.questions || !Array.isArray(quizObject.questions)) {
            console.error("Quiz object is missing or invalid:", quizObject);
            toast.error("Quiz data is missing. Please try again.");
            return false;
        }
        try {
            if (!quizId) {
                throw new Error("Quiz ID is required for submission");
            }

            // Ensure we have a clean MongoDB ObjectId
            // Remove any trailing characters after the ObjectId
            const cleanQuizId = quizId.toString().split(':')[0].trim();

            console.log("Submitting quiz with ID:", cleanQuizId);

            // Validate ObjectId format (24 hex characters)
            if (!/^[0-9a-fA-F]{24}$/.test(cleanQuizId)) {
                throw new Error("Invalid quiz ID format");
            }

            const timeTaken = ((timeLimit * 60) - timeLeft) / 60;
            console.log("Time taken:", timeTaken);

            // Check if we have any answers to submit
            const hasAnswers = Object.keys(quizAnswers).length > 0;

            // ⭐⭐ CRITICAL FIX: Ensure we have answers for all questions
            // Get all questions and create answers for each one
            const formattedAnswers = [];

            // First, log the current answers
            console.log("Current quiz answers:", quizAnswers);

            // If we have no answers but need to submit, create default answers for all questions
            if (Object.keys(quizAnswers).length === 0) {
                console.log("No answers found, creating default answers for all questions");

                // For each question in the quiz, create a default answer (unattempted)
                for (let i = 0; i < quizObject.questions.length; i++) {
                    formattedAnswers.push({
                        questionIndex: i,
                        selectedAnswer: -1 // -1 means unattempted
                    });
                }
            } else {
                // Process the answers we have
                Object.keys(quizAnswers).forEach((key) => {
                    const questionIndex = parseInt(key);
                    const rawAnswer = quizAnswers[key];
                    const selectedAnswer = rawAnswer !== undefined && rawAnswer !== null ? parseInt(rawAnswer) : -1;

                    console.log(`Formatting answer for question ${questionIndex}:`, {
                        rawAnswer,
                        selectedAnswer,
                        type: typeof rawAnswer
                    });

                    formattedAnswers.push({
                        questionIndex,
                        selectedAnswer
                    });
                });

                // Add unattempted answers for any questions that weren't answered
                for (let i = 0; i < quizObject.questions.length; i++) {
                    if (!quizAnswers.hasOwnProperty(i)) {
                        console.log(`Adding unattempted answer for question ${i}`);
                        formattedAnswers.push({
                            questionIndex: i,
                            selectedAnswer: -1 // -1 means unattempted
                        });
                    }
                }
            }

            console.log("Formatted answers:", formattedAnswers);

            // Save a backup of answers in case submission fails
            const answersBackup = JSON.stringify(quizAnswers);

            // First check if the quiz has already been attempted
            const existingAttempts = await refetchAttempts().unwrap();
            console.log("Checking existing attempts before submission:", existingAttempts);

            if (existingAttempts?.data?.length > 0) {
                console.log("Found existing attempts, quiz already completed");
                // Quiz already attempted, clear answers and show results
                clearAnswers();

                // Only show the toast if we actually had answers to submit
                if (hasAnswers) {
                    toast.info("Quiz is already attempted. Showing your results.");
                }

                return true; // Return true to show the results
            }

            // ⭐⭐ CRITICAL FIX: Submit the quiz with answers
            console.log("Submitting quiz with formatted answers:", formattedAnswers);

            // Make sure we have answers for all questions
            if (formattedAnswers.length === 0) {
                console.error("No answers to submit!");
                toast.error("No answers to submit. Please try again.");
                return false;
            }

            // Submit the quiz - DO NOT clear answers before submission
            const result = await submitQuiz({
                quizId: cleanQuizId,
                data: { answers: formattedAnswers, timeTaken }
            });

            console.log("Quiz submission result:", result);

            if (result.error) {
                // If the error is that the quiz was already attempted, handle it gracefully
                if (result.error.status === 400 && result.error.data?.message === "You have already attempted this quiz") {
                    console.log("Quiz already attempted, showing results");

                    // Only clear answers AFTER we've confirmed the quiz was already attempted
                    clearAnswers();
                    await refetchAttempts();

                    // Only show the toast if we actually had answers to submit
                    // This prevents showing the toast when just viewing results
                    if (hasAnswers) {
                        toast.info("Quiz is already attempted. Showing your results.");
                    }

                    return true; // Return true to show the results
                }

                // For other errors, restore the answers from backup
                if (answersBackup) {
                    try {
                        localStorage.setItem('quizAnswers', answersBackup);
                        setQuizAnswers(JSON.parse(answersBackup));
                    } catch (e) {
                        console.error("Failed to restore answers from backup:", e);
                    }
                }

                throw new Error(result.error.data?.message || "Failed to submit quiz");
            }

            // ⭐⭐ CRITICAL FIX: Only clear answers AFTER successful submission
            console.log("Quiz submitted successfully, clearing answers");
            clearAnswers();

            // Fetch the latest attempts to ensure we have the most up-to-date data
            await refetchAttempts();

            const score = result.data?.data?.score || 0;
            toast.success(`Quiz submitted successfully! Score: ${score}%`);

            return true;
        } catch (error) {
            console.error("Quiz submission error:", error);
            toast.error(error.message || "Failed to submit quiz");
            return false;
        }
    };


    const updateAnswer = (questionIndex, selectedAnswer) => {
        // Ensure we're storing the answer as a number
        const parsedAnswer = parseInt(selectedAnswer);

        console.log(`Updating answer for question ${questionIndex}:`, {
            originalValue: selectedAnswer,
            parsedValue: parsedAnswer,
            type: typeof parsedAnswer
        });

        const newAnswers = {
            ...quizAnswers,
            [questionIndex]: parsedAnswer
        };

        setQuizAnswers(newAnswers);
        localStorage.setItem('quizAnswers', JSON.stringify(newAnswers));
    };

    const clearAnswers = () => {
        // Only update state if there are actually answers to clear
        if (Object.keys(quizAnswers).length > 0) {
            setQuizAnswers({});
        }
        // Always clear localStorage
        localStorage.removeItem('quizAnswers');
    };

    // Get the latest attempt with proper formatting
    const latestAttempt = attemptsData?.data?.[0] || null;

    return {
        quizAnswers,
        updateAnswer,
        clearAnswers,
        handleQuizSubmit,
        latestAttempt,
        refetchAttempts
    };
};
