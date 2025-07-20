import { useState, useEffect } from 'react';

export const useQuizTimer = (timeLimit, isQuizStarted, isQuizSubmitted, onTimeUp) => {
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedTime = localStorage.getItem('quizTimer');
        return savedTime ? parseInt(savedTime) : timeLimit * 60;
    });

    useEffect(() => {
        if (isQuizStarted && !isQuizSubmitted) {
            setTimeLeft(timeLimit * 60);
        }
    }, [isQuizStarted, timeLimit, isQuizSubmitted]);

    useEffect(() => {
        let timer;
        if (timeLeft > 0 && isQuizStarted && !isQuizSubmitted) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        onTimeUp();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [timeLeft, isQuizStarted, isQuizSubmitted, onTimeUp]);

    useEffect(() => {
        if (isQuizStarted && !isQuizSubmitted) {
            localStorage.setItem('quizTimer', timeLeft);
        }
    }, [timeLeft, isQuizStarted, isQuizSubmitted]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return { timeLeft, formatTime };
}; 