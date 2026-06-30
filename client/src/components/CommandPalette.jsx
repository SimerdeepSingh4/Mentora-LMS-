import React, { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Sparkles, Trophy, BookOpen, Compass } from "lucide-react";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { useNavigate } from "react-router-dom";

export const CommandPalette = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Query courses based on search text
    const { data, isLoading } = useGetSearchCourseQuery(
        { searchQuery, categories: [], sortByPrice: "" },
        { skip: !isOpen }
    );

    const courses = data?.courses || [];

    // Focus input when palette opens
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Handle Keyboard shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % Math.max(courses.length, 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + Math.max(courses.length, 1)) % Math.max(courses.length, 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (courses[selectedIndex]) {
                    handleSelect(courses[selectedIndex]._id);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, courses, selectedIndex]);

    const handleSelect = (courseId) => {
        onClose();
        navigate(`/course-detail/${courseId}`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/75 backdrop-blur-sm px-4">
            {/* Backdrop click closer */}
            <div className="absolute inset-0 z-0" onClick={onClose} />

            {/* Main Command Card */}
            <div className="relative z-10 w-full max-w-lg bg-[#0a0a0a]/95 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[450px]">
                {/* Search Bar Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.05] bg-white/[0.01]">
                    <Search className="w-4 h-4 text-[#E8602E] shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        placeholder="Search courses, levels, categories..."
                        className="flex-1 bg-transparent text-sm text-white placeholder-[#444] outline-none border-none focus:ring-0"
                    />
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-[#888] animate-spin" />
                    ) : searchQuery ? (
                        <button onClick={() => setSearchQuery("")} className="text-[#555] hover:text-white transition-colors">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <span className="text-[10px] bg-white/[0.05] border border-white/[0.08] px-1.5 py-0.5 rounded text-[#444] font-mono select-none">ESC</span>
                    )}
                </div>

                {/* Suggestions / Results */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {courses.length === 0 ? (
                        isLoading ? (
                            <div className="py-12 text-center space-y-2">
                                <Loader2 className="w-5 h-5 text-[#E8602E] animate-spin mx-auto" />
                                <p className="text-xs text-[#555]">Searching catalogs...</p>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-xs text-[#555] flex flex-col items-center gap-2">
                                <Compass className="w-5 h-5 text-[#333]" />
                                No courses found for "{searchQuery}"
                            </div>
                        )
                    ) : (
                        <>
                            <div className="px-2.5 py-1.5 text-[10px] font-black text-[#444] uppercase tracking-wider">
                                Results
                            </div>
                            {courses.map((course, idx) => {
                                const isSelected = idx === selectedIndex;
                                return (
                                    <div
                                        key={course._id}
                                        onClick={() => handleSelect(course._id)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                            isSelected
                                                ? "bg-[#E8602E] text-white"
                                                : "hover:bg-white/[0.03] text-[#888]"
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                            isSelected ? "bg-white/20 text-white" : "bg-white/[0.04] text-[#E8602E]"
                                        }`}>
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-white/[0.9]"}`}>
                                                {course.courseTitle}
                                            </p>
                                            <p className={`text-[10px] font-medium truncate ${isSelected ? "text-orange-100" : "text-[#444]"}`}>
                                                {course.category} • {course.courseLevel}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] font-black shrink-0 ${
                                            isSelected ? "text-white bg-white/20" : "text-green-500 bg-green-500/10"
                                        } px-2 py-0.5 rounded-full`}>
                                            {course.coursePrice === 0 ? "Free" : `₹${course.coursePrice}`}
                                        </span>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Footer hints */}
                <div className="px-4 py-2 border-t border-white/[0.05] bg-white/[0.01] flex items-center justify-between text-[10px] text-[#444]">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="bg-white/[0.03] px-1 rounded font-mono">↑↓</span> Navigate</span>
                        <span className="flex items-center gap-1"><span className="bg-white/[0.03] px-1 rounded font-mono">↵</span> Select</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#E8602E] font-bold">
                        <Sparkles className="w-3 h-3" /> Mentora Command Bar
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
