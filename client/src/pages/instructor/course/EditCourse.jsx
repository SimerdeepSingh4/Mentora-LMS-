import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Megaphone, Settings } from "lucide-react";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import CourseTab from "./CourseTab";
import AnnouncementTab from "./AnnouncementTab";

const EditCourse = () => {
    const [activeTab, setActiveTab] = useState("details");
    const { courseId } = useParams();

    return (
        <div className="min-h-screen bg-[#060606] text-white pt-28 pb-16 px-6 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8602E]/8 border border-[#E8602E]/20 rounded-full text-[10px] font-bold text-[#E8602E] uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>Course Setup</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white mt-1">Course Management</h1>
                        <p className="text-xs text-white/45 font-medium">
                            Manage details, write announcements, and create lectures for your students.
                        </p>
                    </div>
                    
                    <Link to="lecture" className="shrink-0">
                        <Button 
                            variant="outline" 
                            className="bg-[#E8602E] hover:bg-[#d4561f] text-white border-transparent text-xs font-bold px-4 py-2.5 h-10 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#E8602E]/10"
                        >
                            Create Course Curriculum <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                {/* Tabs Selector */}
                <div className="flex gap-6 border-b border-white/[0.04] pb-px">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "details"
                                ? "border-[#E8602E] text-white"
                                : "border-transparent text-white/40 hover:text-white/80"
                        }`}
                    >
                        <Settings className="w-4 h-4" /> Course Details
                    </button>
                    <button
                        onClick={() => setActiveTab("announcements")}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "announcements"
                                ? "border-[#E8602E] text-white"
                                : "border-transparent text-white/40 hover:text-white/80"
                        }`}
                    >
                        <Megaphone className="w-4 h-4" /> Announcements
                    </button>
                </div>

                {/* Tab Contents */}
                {activeTab === "details" ? (
                    <CourseTab />
                ) : (
                    <AnnouncementTab courseId={courseId} />
                )}

            </div>
        </div>
    );
};

export default EditCourse;
