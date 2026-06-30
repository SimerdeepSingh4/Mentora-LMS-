import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import QuizResultDisplay from './QuizResultDisplay';
import { RotateCcw, X } from 'lucide-react';

const QuizSummary = ({ quiz, attempt, onClose, onReset }) => {
    const [localAttempt, setLocalAttempt] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

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

    const handleReset = async () => {
        if (!onReset) return;
        const confirm = window.confirm("Are you sure you want to reset your quiz attempt? This will permanently delete your score and answers, letting you retake the quiz.");
        if (!confirm) return;

        setIsResetting(true);
        const success = await onReset();
        setIsResetting(false);
        if (success && onClose) {
            onClose(); // Close the result view to return to the quiz start view
        }
    };

    if (!localAttempt && !attempt) {
        return (
            <div className="p-6 bg-[#0a0a0a] rounded-2xl border border-white/[0.05] text-center space-y-4">
                <p className="text-sm text-[#888]">No attempt data available.</p>
                <div className="flex justify-center gap-3">
                    {onReset && (
                        <Button 
                            onClick={handleReset} 
                            disabled={isResetting}
                            className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs h-9"
                        >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Force Reset
                        </Button>
                    )}
                    <Button onClick={onClose} className="bg-[#1a1a1a] hover:bg-[#252525] border border-white/[0.05] rounded-xl text-xs h-9">Close</Button>
                </div>
            </div>
        );
    }

    const displayAttempt = localAttempt || attempt;

    return (
        <div className="space-y-6">
            
            {/* Top Close bar */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
                <span className="text-xs font-bold text-[#888] uppercase tracking-wider">
                    Attempt Results Review
                </span>
                <Button 
                    onClick={onClose}
                    className="bg-[#1a1a1a] hover:bg-[#252525] border border-white/[0.05] text-white font-bold px-3 py-1.5 text-xs rounded-xl h-8 flex items-center gap-1.5"
                >
                    <X className="w-3.5 h-3.5" /> Close Results
                </Button>
            </div>

            <QuizResultDisplay quiz={quiz} attempt={displayAttempt} />
            
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                {onReset ? (
                    <Button
                        onClick={handleReset}
                        disabled={isResetting}
                        className="bg-red-500/15 border border-red-500/25 hover:bg-red-500/25 text-red-400 font-bold px-4 py-2 text-xs rounded-xl shadow-lg transition-all"
                    >
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5 animate-spin-hover" />
                        {isResetting ? "Resetting..." : "Reset Attempt (Dev Tool)"}
                    </Button>
                ) : (
                    <div />
                )}

                <Button 
                    onClick={onClose}
                    className="bg-[#E8602E] hover:bg-[#d4561f] text-white font-bold px-6 py-2 text-xs rounded-xl"
                >
                    Close Results
                </Button>
            </div>
        </div>
    );
};

export default QuizSummary;