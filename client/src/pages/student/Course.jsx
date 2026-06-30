import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, BookOpen } from "lucide-react";
import { GlowCard } from "@/components/ui/GlowCard";

const LEVEL_STYLES = {
  Beginner:     { dot: "bg-green-500",  text: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/15" },
  Intermediate: { dot: "bg-yellow-500", text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/15" },
  Advanced:     { dot: "bg-red-500",    text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/15" },
};

const Course = ({ course }) => {
  if (!course) return null;

  const lvl = LEVEL_STYLES[course.courseLevel] || LEVEL_STYLES["Beginner"];

  return (
    <Link to={`/course-detail/${course._id}`} className="block group h-full">
      <GlowCard className="h-full rounded-2xl">
        <div className="relative flex flex-col h-full overflow-hidden bg-[#0c0c0c] border border-white/[0.05] transition-all duration-300 group-hover:border-[#E8602E]/20">

        {/* Thin orange top-border on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8602E]/0 to-transparent group-hover:via-[#E8602E]/50 transition-all duration-500" />

        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-video bg-[#141414] shrink-0">
          <img
            src={course.courseThumbnail || "https://via.placeholder.com/400x225/141414/333?text=Course"}
            alt={course.courseTitle || "Course"}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Level badge on thumbnail */}
          <div className={`absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md ${lvl.bg} ${lvl.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot} shrink-0`} />
            <span className={`text-[10px] font-bold ${lvl.text}`}>{course.courseLevel || "Beginner"}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5 gap-3">

          {/* Category */}
          {course.category && (
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-[#444]" />
              <span className="text-[10px] font-bold text-[#444] uppercase tracking-[0.15em]">{course.category}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-bold text-[#e0e0e0] leading-snug line-clamp-2 group-hover:text-white transition-colors duration-200 flex-1">
            {course.courseTitle}
          </h3>

          {/* Instructor */}
          <div className="flex items-center gap-2">
            <Avatar className="w-5 h-5 ring-1 ring-[#E8602E]/15">
              <AvatarImage
                src={course.creator?.photoUrl || "https://cdn-icons-png.flaticon.com/128/10617/10617214.png"}
                alt="Instructor"
              />
              <AvatarFallback className="text-[8px] bg-[#E8602E]/10 text-[#E8602E]">
                {course.creator?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[11px] text-[#555] font-medium truncate">
              {course.creator?.name || "Unknown"}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.04]" />

          {/* Price row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white">
                {course.coursePrice === 0 ? "Free" : `₹${course.coursePrice}`}
              </span>
              {course.coursePrice === 0 && (
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/15 px-1.5 py-0.5 rounded-full">Free</span>
              )}
            </div>
            <span className="text-[11px] font-bold text-[#E8602E]/60 group-hover:text-[#E8602E] transition-colors">Enroll →</span>
          </div>
        </div>
      </div>
    </GlowCard>
  </Link>
  );
};

export default Course;