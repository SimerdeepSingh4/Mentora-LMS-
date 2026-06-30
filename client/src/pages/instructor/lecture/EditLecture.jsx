import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import React from "react";
import { Link, useParams } from "react-router-dom";
import LectureTab from "./LectureTab";

const EditLecture = () => {
  const params = useParams();
  const courseId = params.courseId;
  
  return (
    <div className="min-h-screen bg-[#060606] text-white pt-28 pb-16 px-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
            <div className="flex items-center gap-4">
                <Link to={`/instructor/course/${courseId}/lecture`}>
                    <Button 
                        size="icon" 
                        variant="outline" 
                        className="rounded-xl h-10 w-10 border-white/[0.06] bg-[#0c0c0c] hover:bg-white/[0.05] text-white transition-all"
                    >
                        <ArrowLeft size={16} />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8602E]/8 border border-[#E8602E]/20 rounded-full text-[10px] font-bold text-[#E8602E] uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        <span>Curriculum Editor</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white mt-1">Edit Lecture</h1>
                </div>
            </div>
        </div>

        {/* Edit Lecture Form Tab */}
        <LectureTab />

      </div>
    </div>
  );
};

export default EditLecture;