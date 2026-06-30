import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import {
    Lock, PlayCircle, Clock, Users, BookOpen, Star,
    CheckCircle, ArrowRight, Zap, Award, ChevronDown,
    ChevronUp, GraduationCap, Loader2
} from "lucide-react";
import React, { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { useNavigate, useParams } from "react-router-dom";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { motion, AnimatePresence } from "framer-motion";

/* ── Collapsible lecture row ── */
const LectureRow = ({ lecture, idx, purchased }) => (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 group">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${purchased ? "bg-[#E8602E]/10 text-[#E8602E]" : "bg-[#141414] text-[#444]"}`}>
            {purchased ? <PlayCircle className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
        </div>
        <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate transition-colors ${purchased ? "text-[#ccc] group-hover:text-white" : "text-[#444]"}`}>
                {lecture?.lectureTitle || `Lecture ${idx + 1}`}
            </p>
        </div>
        <span className="text-[10px] font-semibold text-[#333] shrink-0">
            {purchased ? "HD" : "🔒"}
        </span>
    </div>
);

/* ── Skeleton loader ── */
const CourseDetailSkeleton = () => (
    <div className="min-h-screen bg-[#060606] pt-16 animate-pulse">
        <div className="bg-[#0c0c0c] border-b border-white/[0.05] py-16">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_380px] gap-16 items-start">
                <div className="space-y-4">
                    <div className="h-4 w-32 bg-[#1a1a1a] rounded-full" />
                    <div className="h-10 w-3/4 bg-[#1a1a1a] rounded-xl" />
                    <div className="h-5 w-1/2 bg-[#1a1a1a] rounded-xl" />
                    <div className="flex gap-4 mt-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-4 w-24 bg-[#1a1a1a] rounded-lg" />)}
                    </div>
                </div>
                <div className="h-64 bg-[#1a1a1a] rounded-2xl" />
            </div>
        </div>
    </div>
);

/* ── Main Component ── */
const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError, error, refetch } = useGetCourseDetailWithStatusQuery(courseId);
    const [showAllLectures, setShowAllLectures] = useState(false);

    useRefetchOnFocus(refetch);

    const { course, purchased } = data || {};
    const lectures = course?.lectures || [];

    // Redirect to login page if unauthenticated
    React.useEffect(() => {
        if (isError && error?.status === 401) {
            navigate("/login?tab=login", { replace: true });
        }
    }, [isError, error, navigate]);

    // Redirect to progress page if already purchased
    React.useEffect(() => {
        if (purchased) {
            navigate(`/course-progress/${courseId}`, { replace: true });
        }
    }, [purchased, courseId, navigate]);

    if (isLoading) return <CourseDetailSkeleton />;

    if (isError) return (
        <div className="min-h-screen bg-[#060606] flex items-center justify-center pt-16">
            <div className="text-center p-8 bg-red-500/5 border border-red-500/15 rounded-2xl max-w-sm">
                <p className="text-red-400 font-semibold mb-2">Failed to load course</p>
                <p className="text-sm text-[#555]">Please try refreshing the page.</p>
                <Button onClick={() => refetch()} className="mt-4 bg-[#E8602E] hover:bg-[#d4561f] text-white text-sm rounded-xl">
                    Retry
                </Button>
            </div>
        </div>
    );

    const visibleLectures = showAllLectures ? lectures : lectures.slice(0, 6);
    const hasMoreLectures = lectures.length > 6;

    const handleContinueCourse = () => {
        if (purchased) navigate(`/course-progress/${courseId}`);
    };

    const LEVEL_COLOR = {
        Beginner:     "text-green-400 bg-green-500/10 border-green-500/15",
        Intermediate: "text-yellow-400 bg-yellow-500/10 border-yellow-500/15",
        Advanced:     "text-red-400 bg-red-500/10 border-red-500/15",
    };
    const levelClass = LEVEL_COLOR[course?.courseLevel] || LEVEL_COLOR.Beginner;

    return (
        <div className="min-h-screen bg-[#060606] text-white pt-16">

            {/* ═══════════════════════════════════════════
                HERO HEADER BAND — dark gradient
            ═══════════════════════════════════════════ */}
            <div className="relative overflow-hidden bg-[#0a0a0a] border-b border-white/[0.05]">
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-[#E8602E]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/3 rounded-full blur-[100px] pointer-events-none" />
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8602E]/30 to-transparent" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-14">
                    <div className="max-w-3xl">

                        {/* Breadcrumb / category */}
                        <div className="flex items-center gap-2 mb-5 flex-wrap">
                            <span className="text-[10px] font-bold text-[#E8602E] bg-[#E8602E]/8 border border-[#E8602E]/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                {course?.category || "Course"}
                            </span>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${levelClass}`}>
                                {course?.courseLevel || "Beginner"}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-[48px] font-black leading-[1.05] tracking-tight text-white mb-4">
                            {course?.courseTitle}
                        </h1>

                        {/* Subtitle */}
                        {course?.subTitle && (
                            <p className="text-lg text-[#888] leading-relaxed mb-6">
                                {course.subTitle}
                            </p>
                        )}

                        {/* Stats row */}
                        <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                            <div className="flex items-center gap-1.5 text-[#666]">
                                <Users className="w-4 h-4 text-[#E8602E]" />
                                <span><strong className="text-white">{course?.enrolledStudents?.length || 0}</strong> students enrolled</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#666]">
                                <BookOpen className="w-4 h-4 text-[#E8602E]" />
                                <span><strong className="text-white">{lectures.length}</strong> lectures</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#666]">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-white font-semibold">4.8</span>
                                <span className="text-[#555]">(rating)</span>
                            </div>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#E8602E]/10 border border-[#E8602E]/15 flex items-center justify-center text-[#E8602E] font-black text-sm shrink-0">
                                {course?.creator?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                                <p className="text-[10px] text-[#444] font-semibold uppercase tracking-wider">Created by</p>
                                <p className="text-sm font-bold text-[#E8602E]">{course?.creator?.name || "Unknown Instructor"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                BODY — two column
            ═══════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">

                    {/* ── Left: Description + Curriculum ── */}
                    <div className="space-y-10">

                        {/* What you'll learn */}
                        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.05]">
                            <div className="flex items-center gap-2 mb-5">
                                <Zap className="w-5 h-5 text-[#E8602E]" />
                                <h2 className="text-lg font-black text-white">What You'll Learn</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[
                                    "Industry-standard techniques",
                                    "Real-world project experience",
                                    "Best practices & code quality",
                                    "Lifetime access to updates",
                                    "Quiz-tested understanding",
                                    "Certificate on completion",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <CheckCircle className="w-4 h-4 text-[#E8602E] shrink-0 mt-0.5" />
                                        <span className="text-sm text-[#999]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-xl font-black text-white mb-4">About This Course</h2>
                            <div
                                className="prose prose-sm prose-invert max-w-none text-[#777] leading-relaxed [&_strong]:text-[#ccc] [&_h2]:text-white [&_h3]:text-[#ccc] [&_ul]:pl-4 [&_li]:text-[#777] [&_p]:mb-3"
                                dangerouslySetInnerHTML={{ __html: course?.description || "<p>No description available.</p>" }}
                            />
                        </div>

                        {/* Curriculum */}
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-[#E8602E]" />
                                    <h2 className="text-xl font-black text-white">Course Curriculum</h2>
                                </div>
                                <span className="text-sm text-[#555] font-semibold">{lectures.length} lectures</span>
                            </div>

                            <div className="rounded-2xl bg-[#0a0a0a] border border-white/[0.05] overflow-hidden">
                                {/* Header row */}
                                <div className="px-5 py-3 bg-[#0d0d0d] border-b border-white/[0.04] flex items-center justify-between">
                                    <span className="text-xs font-bold text-[#444] uppercase tracking-wider">Lecture</span>
                                    <span className="text-xs font-bold text-[#333] uppercase tracking-wider">Access</span>
                                </div>

                                <div className="px-5">
                                    {/* Render first 5 lectures */}
                                    {lectures.slice(0, 5).map((lecture, idx) => (
                                        <LectureRow key={idx} lecture={lecture} idx={idx} purchased={purchased} />
                                    ))}

                                    {/* Render remaining lectures within a spring animated box */}
                                    <AnimatePresence initial={false}>
                                        {showAllLectures && lectures.length > 5 && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 240, damping: 24 }}
                                                className="overflow-hidden"
                                            >
                                                {lectures.slice(5).map((lecture, idx) => (
                                                    <LectureRow 
                                                        key={idx + 5} 
                                                        lecture={lecture} 
                                                        idx={idx + 5} 
                                                        purchased={purchased} 
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {hasMoreLectures && (
                                    <button
                                        onClick={() => setShowAllLectures(!showAllLectures)}
                                        className="w-full py-3 text-xs font-bold text-[#E8602E] hover:text-[#f0845a] border-t border-white/[0.04] flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        {showAllLectures ? (
                                            <><ChevronUp className="w-3.5 h-3.5" /> Show Less</>
                                        ) : (
                                            <><ChevronDown className="w-3.5 h-3.5" /> Show All {lectures.length} Lectures</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Instructor card */}
                        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/[0.05]">
                            <div className="flex items-center gap-2 mb-5">
                                <GraduationCap className="w-5 h-5 text-[#E8602E]" />
                                <h2 className="text-lg font-black text-white">Your Instructor</h2>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#E8602E]/10 border border-[#E8602E]/15 flex items-center justify-center text-[#E8602E] font-black text-xl shrink-0">
                                    {course?.creator?.name?.charAt(0) || "?"}
                                </div>
                                <div>
                                    <p className="font-black text-white text-base mb-0.5">{course?.creator?.name || "Unknown"}</p>
                                    <p className="text-xs text-[#555] font-semibold mb-3">Industry Expert & Educator</p>
                                    <p className="text-sm text-[#666] leading-relaxed">
                                        An experienced professional committed to delivering industry-standard knowledge and helping students build real, job-ready skills.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: sticky purchase card (desktop) ── */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <PurchaseCard
                                course={course}
                                lectures={lectures}
                                purchased={purchased}
                                courseId={courseId}
                                onContinue={handleContinueCourse}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                MOBILE sticky bottom bar
            ═══════════════════════════════════════════ */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.08]">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xl font-black text-white">
                            {course?.coursePrice === 0 ? "Free" : `₹${course?.coursePrice}`}
                        </p>
                        <p className="text-xs text-[#555]">Lifetime access</p>
                    </div>
                    <div className="flex-1">
                        {purchased ? (
                            <Button onClick={handleContinueCourse}
                                className="w-full bg-[#E8602E] hover:bg-[#d4561f] text-white font-bold rounded-xl py-3 h-auto shadow-lg shadow-[#E8602E]/20">
                                Continue Course <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        ) : (
                            <BuyCourseButton courseId={courseId} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
    PURCHASE CARD — shared between hero & body
═══════════════════════════════════════════ */
const PurchaseCard = ({ course, lectures, purchased, courseId, onContinue }) => (
    <div className="rounded-2xl bg-[#0c0c0c] border border-white/[0.07] overflow-hidden shadow-2xl shadow-black/60">
        {/* Top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#E8602E]/40 to-transparent" />

        {/* Video preview */}
        <div className="bg-[#000] relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
            {lectures?.length > 0 ? (
                <VideoPlayer
                    src={lectures[0].videoUrl}
                    poster={course?.courseThumbnail}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#0d0d0d]" style={{ minHeight: 180 }}>
                    <BookOpen className="w-10 h-10 text-[#2a2a2a]" />
                    <p className="text-xs text-[#333]">No preview available</p>
                </div>
            )}
        </div>

        <div className="p-5">
            {/* Price */}
            <div className="flex items-baseline gap-2 mb-5">
                <span className="text-3xl font-black text-white">
                    {course?.coursePrice === 0 ? "Free" : `₹${course?.coursePrice}`}
                </span>
                {course?.coursePrice > 0 && (
                    <span className="text-xs text-[#E8602E] font-bold bg-[#E8602E]/8 border border-[#E8602E]/15 px-2 py-0.5 rounded-full">Best Value</span>
                )}
            </div>

            {/* CTA */}
            {purchased ? (
                <Button onClick={onContinue}
                    className="w-full bg-[#E8602E] hover:bg-[#d4561f] text-white font-bold rounded-xl py-3.5 h-auto shadow-lg shadow-[#E8602E]/20 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-[#E8602E]/25 group mb-4">
                    Continue Course
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
            ) : (
                <div className="mb-4">
                    <BuyCourseButton courseId={courseId} />
                </div>
            )}

            {/* Trust bullets */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.04]">
                {[
                    { icon: <BookOpen className="w-3.5 h-3.5" />, text: `${lectures?.length || 0} lectures included` },
                    { icon: <Clock className="w-3.5 h-3.5" />,     text: "Lifetime access" },
                    { icon: <Award className="w-3.5 h-3.5" />,     text: "Certificate of completion" },
                    { icon: <Zap className="w-3.5 h-3.5" />,       text: "AI tutor included" },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[#666]">
                        <span className="text-[#E8602E]/60">{item.icon}</span>
                        <span className="text-xs font-medium">{item.text}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default CourseDetail;
