import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Clock, Trophy, Award, AlertCircle } from 'lucide-react';

const QuizResultDisplay = ({ quiz, attempt }) => {
    if (!attempt || !quiz) return null;

    // Calculate score details
    const totalQuestions = Number(attempt.totalQuestions) || quiz.questions?.length || 0;
    const correctAnswers = Number(attempt.correctAnswers) || 0;
    const incorrectAnswers = Number(attempt.incorrectAnswers) || 0;
    const unattempted = Number(attempt.unattempted) || 0;
    const scorePercent = Number(attempt.score) || 0;
    const timeTaken = Number(attempt.timeTaken) || 0;

    // Determine trophy icon and text based on score
    const getPerformanceStatus = (score) => {
        if (score >= 90) return { icon: <Trophy className="w-10 h-10 text-yellow-500" />, label: "Outstanding Performance!", desc: "You've fully mastered this lecture's concepts." };
        if (score >= 70) return { icon: <Award className="w-10 h-10 text-blue-400" />, label: "Great Job!", desc: "You have a solid understanding of the material." };
        return { icon: <AlertCircle className="w-10 h-10 text-[#E8602E]" />, label: "Keep Learning!", desc: "We recommend reviewing the lecture and trying again." };
    };
    const status = getPerformanceStatus(scorePercent);

    return (
        <div className="space-y-6 text-white">

            {/* Performance Header Summary */}
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.05] flex flex-col md:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
                {/* Accent glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8602E]/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/3 rounded-full blur-[60px] pointer-events-none" />

                {/* Circular Score Gauge */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" className="stroke-white/[0.04] fill-none" strokeWidth="8" />
                        <circle 
                            cx="56" cy="56" r="48" 
                            className="stroke-[#E8602E] fill-none transition-all duration-1000 ease-out" 
                            strokeWidth="8" 
                            strokeDasharray={301.6} 
                            strokeDashoffset={301.6 - (301.6 * scorePercent) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black">{scorePercent}%</span>
                        <span className="text-[10px] text-[#444] font-bold uppercase tracking-wider">Score</span>
                    </div>
                </div>

                <div className="text-center md:text-left space-y-1.5 flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2.5">
                        {status.icon}
                        <h2 className="text-xl font-black leading-none">{status.label}</h2>
                    </div>
                    <p className="text-sm text-[#888] leading-relaxed max-w-md">
                        {status.desc}
                    </p>
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Questions", value: totalQuestions, icon: <HelpCircleIcon className="text-blue-400" /> },
                    { label: "Correct", value: correctAnswers, icon: <CheckCircle2 className="text-green-500" /> },
                    { label: "Incorrect", value: incorrectAnswers, icon: <XCircle className="text-red-500" /> },
                    { label: "Time Taken", value: formatTimeTaken(timeTaken), icon: <Clock className="text-[#E8602E]" /> }
                ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.05] flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] text-[#444] font-bold uppercase tracking-wider">{item.label}</p>
                            <p className="text-lg font-black">{item.value}</p>
                        </div>
                        <span className="w-8 h-8 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                            {item.icon}
                        </span>
                    </div>
                ))}
            </div>

            {/* Question Review Sheet */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-base font-black text-white tracking-tight">Question Analysis</h3>
                    <span className="text-xs text-[#555] font-semibold">Review mode</span>
                </div>

                <div className="space-y-4">
                    {quiz.questions?.map((question, qIdx) => {
                        // Find the student's answer record
                        let studentAns = attempt.answers?.find(a => Number(a.questionIndex) === qIdx) 
                            || attempt.answers?.[qIdx];

                        const selectedIndex = studentAns ? Number(studentAns.selectedAnswer) : -1;
                        const correctIndex = Number(question.correctAnswer);
                        const isCorrect = selectedIndex === correctIndex;
                        const isUnattempted = selectedIndex === -1;

                        return (
                            <div 
                                key={qIdx} 
                                className={`p-5 rounded-2xl border transition-all duration-200 bg-[#0a0a0a] ${
                                    isUnattempted 
                                        ? 'border-white/[0.05]' 
                                        : isCorrect 
                                        ? 'border-green-500/10 shadow-lg shadow-green-500/2' 
                                        : 'border-red-500/10 shadow-lg shadow-red-500/2'
                                }`}
                            >
                                {/* Question Title block */}
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <p className="text-sm font-bold text-white leading-relaxed">
                                        Q{qIdx + 1}. {question.question}
                                    </p>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                                        isUnattempted 
                                            ? 'bg-white/[0.04] border border-white/[0.06] text-[#666]' 
                                            : isCorrect 
                                            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                    }`}>
                                        {isUnattempted ? "Skipped" : isCorrect ? "Correct" : "Incorrect"}
                                    </span>
                                </div>

                                {/* Options grid */}
                                <div className="space-y-2.5 pl-1">
                                    {question.options?.map((option, oIdx) => {
                                        const isSelectedOption = selectedIndex === oIdx;
                                        const isCorrectOption = correctIndex === oIdx;

                                        return (
                                            <div
                                                key={oIdx}
                                                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all duration-200 ${
                                                    isCorrectOption
                                                        ? 'bg-green-500/5 border-green-500/20 text-green-400 shadow-md shadow-green-500/1'
                                                        : isSelectedOption && !isCorrect
                                                        ? 'bg-red-500/5 border-red-500/20 text-red-400'
                                                        : 'bg-[#111] border-white/[0.03] text-[#555]'
                                                }`}
                                            >
                                                <span>{option}</span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    {isCorrectOption && (
                                                        <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/15 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> Correct Answer
                                                        </span>
                                                    )}
                                                    {isSelectedOption && !isCorrect && (
                                                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/15 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                                                            <XCircle className="w-3 h-3" /> Your Selection
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

/* ─── Helpers ─── */
const HelpCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

function formatTimeTaken(minutes) {
    if (minutes <= 0) return "0s";
    if (minutes < 0.1) return "less than 5s";
    if (minutes < 1) return `${Math.round(minutes * 60)}s`;
    
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

export default QuizResultDisplay;