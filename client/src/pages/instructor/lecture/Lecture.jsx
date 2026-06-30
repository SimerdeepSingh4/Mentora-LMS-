import { Edit3, PlayCircle } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Lecture = ({ lecture, courseId, index }) => {
  const navigate = useNavigate();
  const goToUpdateLecture = () => {
    navigate(`${lecture._id}`);
  };
  
  return (
    <div className="flex items-center justify-between bg-[#0c0c0c] border border-white/[0.05] hover:border-white/[0.12] p-4 rounded-xl my-2.5 transition-all duration-200 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[#E8602E] shrink-0">
          <PlayCircle className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-bold text-white/35 uppercase tracking-wider block">Lecture {index + 1}</span>
          <h3 className="text-sm font-extrabold text-white truncate mt-0.5 leading-snug">
            {lecture.lectureTitle}
          </h3>
        </div>
      </div>
      
      <button
        onClick={goToUpdateLecture}
        className="w-8 h-8 rounded-lg border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.06] text-white/50 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
      >
        <Edit3 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Lecture;