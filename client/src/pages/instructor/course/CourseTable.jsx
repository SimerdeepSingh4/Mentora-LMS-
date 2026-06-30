import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetCreatorCourseQuery } from '@/features/api/courseApi';
import { Edit3, Plus, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CourseTable = () => {
    const user = useSelector((state) => state.auth.user);
    const { data, isLoading, refetch } = useGetCreatorCourseQuery();
    const navigate = useNavigate();

    useEffect(() => {
        refetch();
    }, [user, refetch]);

    if (isLoading) return <CourseTableSkeleton />;

    const courses = data?.courses || [];

    return (
        <div className="min-h-screen bg-[#060606] text-white pt-28 pb-16 px-6 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-black tracking-tight text-white">Your Courses</h1>
                        <p className="text-xs text-white/45 font-medium">
                            Create, organize, and manage your courses. Add modules, lectures, and configure pricing.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate(`create`)}
                        className="bg-[#E8602E] hover:bg-[#d4561f] text-white text-xs font-bold px-4 py-2.5 h-10 rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-md shadow-[#E8602E]/10"
                    >
                        <Plus className="w-4 h-4" /> Create New Course
                    </Button>
                </div>

                {/* Courses List Container */}
                {courses.length > 0 ? (
                    <div className="space-y-3">
                        {courses.map((course) => {
                            const isPublished = course.isPublished;
                            return (
                                <div 
                                    key={course._id}
                                    className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#0c0c0c] border border-white/[0.05] rounded-2xl hover:border-white/[0.12] hover:bg-white/[0.01] transition-all duration-200 gap-4"
                                >
                                    {/* Left: Info */}
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white/35 uppercase tracking-widest flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5 text-[#E8602E]" /> {course.category || "General"}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-extrabold text-white tracking-tight leading-snug truncate">
                                            {course.courseTitle}
                                        </h3>
                                    </div>

                                    {/* Center/Right: Metadata & Action */}
                                    <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                                        
                                        {/* Pricing */}
                                        <div className="text-left md:text-right">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Price</span>
                                            <span className="text-sm font-black text-white mt-0.5 block">
                                                {course.coursePrice === "" || course.coursePrice === null || course.coursePrice === undefined
                                                    ? "NA"
                                                    : course.coursePrice === 0
                                                        ? "Free"
                                                        : `₹${course.coursePrice}`}
                                            </span>
                                        </div>

                                        {/* Status Tag */}
                                        <div className="text-left md:text-right">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Status</span>
                                            <div className="mt-1">
                                                {isPublished ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 font-bold rounded-full text-[9px] uppercase tracking-wider">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold rounded-full text-[9px] uppercase tracking-wider">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Draft
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Edit Action Button */}
                                        <button
                                            onClick={() => navigate(`${course._id}`)}
                                            className="h-9 w-9 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] text-white/50 hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-[#0c0c0c] border border-white/[0.05] rounded-3xl max-w-xl mx-auto space-y-4">
                        <BookOpen className="w-10 h-10 text-white/20 mx-auto" />
                        <div>
                            <h3 className="text-sm font-bold text-white">No courses created yet</h3>
                            <p className="text-xs text-white/40 max-w-xs mx-auto mt-1 leading-relaxed">
                                Get started by launching your first course and creating learning content for your students!
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate(`create`)}
                            className="bg-[#E8602E] hover:bg-[#d4561f] text-white text-xs font-bold px-4 py-2.5 h-9 rounded-xl transition-all"
                        >
                            Create Your First Course
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CourseTable;

const CourseTableSkeleton = () => (
    <div className="min-h-screen bg-[#060606] text-white pt-28 pb-16 px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="w-48 h-7 bg-white/[0.03] rounded-lg"></div>
                    <div className="w-80 h-4 bg-white/[0.02] rounded-md"></div>
                </div>
                <div className="w-36 h-10 bg-white/[0.03] rounded-xl"></div>
            </div>
            <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex flex-col md:flex-row items-center justify-between p-5 bg-[#0c0c0c]/50 border border-white/[0.03] rounded-2xl gap-4">
                        <div className="space-y-2 flex-1 w-full">
                            <div className="w-20 h-4 bg-white/[0.02] rounded"></div>
                            <div className="w-2/3 h-5 bg-white/[0.03] rounded-md"></div>
                        </div>
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="w-16 h-6 bg-white/[0.02] rounded"></div>
                            <div className="w-20 h-6 bg-white/[0.02] rounded"></div>
                            <div className="w-9 h-9 bg-white/[0.02] rounded-xl"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);