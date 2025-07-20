import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import QuizResultDisplay from './QuizResultDisplay';

const QuizSummary = ({ quiz, attempt, onClose }) => {
    const [localAttempt, setLocalAttempt] = useState(null);

    // Store the attempt data locally to prevent it from disappearing
    useEffect(() => {
        if (attempt) {
            console.log("Setting local attempt data:", attempt);
            setLocalAttempt(attempt);

            // Also store in localStorage as a backup
            if (quiz?._id) {
                try {
                    localStorage.setItem(`quiz_${quiz._id}_attempt`, JSON.stringify(attempt));
                } catch (e) {
                    console.error("Failed to store attempt in localStorage:", e);
                }
            }
        }
    }, [attempt, quiz?._id]);

    // Try to load from localStorage if no attempt is provided
    useEffect(() => {
        if (!attempt && !localAttempt && quiz?._id) {
            try {
                const savedAttempt = localStorage.getItem(`quiz_${quiz._id}_attempt`);
                if (savedAttempt) {
                    console.log("Loading attempt from localStorage");
                    setLocalAttempt(JSON.parse(savedAttempt));
                }
            } catch (e) {
                console.error("Failed to load attempt from localStorage:", e);
            }
        }
    }, [attempt, localAttempt, quiz?._id]);

    if (!localAttempt && !attempt) {
        return (
            <div className="p-4">
                <p>No attempt data available</p>
                <Button onClick={onClose}>Close</Button>
            </div>
        );
    }

    // Use the local attempt data if available, otherwise use the prop
    const displayAttempt = localAttempt || attempt;

    return (
        <div className="space-y-6">
            <QuizResultDisplay quiz={quiz} attempt={displayAttempt} />
            <div className="flex justify-end">
                <Button onClick={onClose}>Close</Button>
            </div>
        </div>
    );
};

export default QuizSummary;