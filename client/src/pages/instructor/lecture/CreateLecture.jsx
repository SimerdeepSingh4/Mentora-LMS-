import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    useCreateLectureMutation,
    useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import { Loader2, ArrowLeft, Plus, Play, Sparkles, AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Lecture from "./Lecture";

const CreateLecture = () => {
    const [lectureTitle, setLectureTitle] = useState("");
    const params = useParams();
    const courseId = params.courseId;
    const navigate = useNavigate();

    const [createLecture, { data, isLoading, isSuccess, error }] = useCreateLectureMutation();
    const { data: lectureData, isLoading: lectureLoading, isError: lectureError, refetch } = useGetCourseLectureQuery(courseId);

    const createLectureHandler = async () => {
        if (!lectureTitle.trim()) {
            toast.error("Lecture title cannot be empty.");
            return;
        }
        await createLecture({ lectureTitle, courseId });
    };

    useEffect(() => {
        if (isSuccess && data) {
            refetch();
            toast.success(data.message);
            setLectureTitle(""); // Clear input field after successful creation
        }
        if (error && error.data?.message) {
            toast.error(error.data.message);
        }
    }, [isSuccess, error, data, refetch]);

    return (
        <div className="min-h-screen bg-[#060606] text-white pt-28 pb-16 px-6 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8602E]/8 border border-[#E8602E]/20 rounded-full text-[10px] font-bold text-[#E8602E] uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>Course Builder</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white mt-1">Curriculum Lectures</h1>
                        <p className="text-xs text-white/45 font-medium">
                            Create the step-by-step structure of your course. Add lectures, upload videos, and append resource PDF files.
                        </p>
                    </div>
                    <Button 
                        onClick={() => navigate(`/instructor/course/${courseId}`)}
                        className="bg-transparent hover:bg-white/[0.05] border border-white/[0.06] text-white/70 hover:text-white text-xs font-bold px-4 py-2.5 h-10 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Course
                    </Button>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Add Lecture Card Form (1 Column) */}
                    <div className="lg:col-span-1 bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 space-y-5">
                        <div className="space-y-1.5">
                            <h3 className="text-sm font-extrabold text-white">Add New Lecture</h3>
                            <p className="text-[11px] text-white/40 leading-relaxed">Enter a descriptive title for this chapter segment.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="lecture-title" className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                    Lecture Title
                                </Label>
                                <Input
                                    id="lecture-title"
                                    type="text"
                                    value={lectureTitle}
                                    onChange={(e) => setLectureTitle(e.target.value)}
                                    placeholder="e.g. Introduction to React state"
                                    className="w-full h-11 bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl text-white outline-none transition-all"
                                />
                            </div>

                            <Button 
                                disabled={isLoading} 
                                onClick={createLectureHandler}
                                className="w-full h-10 bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#E8602E]/10"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" /> Create Lecture
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Lectures List (2 Columns) */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5">Course Outline & Lectures</h3>
                        
                        {lectureLoading ? (
                            <div className="space-y-2.5">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-16 bg-[#0c0c0c]/50 border border-white/[0.03] rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : lectureError ? (
                            <div className="flex items-center gap-2.5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold">
                                <AlertCircle className="w-4 h-4" />
                                <span>Failed to load curriculum. Please refresh the page.</span>
                            </div>
                        ) : !lectureData?.lectures || lectureData.lectures.length === 0 ? (
                            <div className="text-center py-12 bg-[#0c0c0c] border border-white/[0.05] rounded-2xl space-y-3">
                                <Play className="w-8 h-8 text-white/20 mx-auto" />
                                <div>
                                    <h4 className="text-xs font-bold text-white">No lectures created yet</h4>
                                    <p className="text-[10px] text-white/45 mt-0.5">Use the left form panel to start adding learning chapters.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {lectureData.lectures.map((lecture, index) => (
                                    <Lecture key={lecture._id} lecture={lecture} courseId={courseId} index={index} />
                                ))}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CreateLecture;
