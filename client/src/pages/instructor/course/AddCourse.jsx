import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { 
    Loader2, 
    Sparkles, 
    BookOpen, 
    Layers, 
    LineChart, 
    Layout, 
    Cpu, 
    Globe, 
    FileCode, 
    Terminal, 
    Database, 
    ArrowLeft,
    Lightbulb,
    Target
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const predefinedCategories = [
    { name: "Next JS", icon: Layers },
    { name: "Data Science", icon: LineChart },
    { name: "Frontend Development", icon: Layout },
    { name: "Fullstack Development", icon: Cpu },
    { name: "MERN Stack", icon: Globe },
    { name: "Javascript", icon: FileCode },
    { name: "Python", icon: Terminal },
    { name: "MongoDB", icon: Database },
    { name: "Instructor Guide", icon: Lightbulb },
];

const AddCourse = () => {
    const { user } = useSelector((store) => store.auth);
    const [courseTitle, setCourseTitle] = useState("");
    const [category, setCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const navigate = useNavigate();

    const [createCourse, { data, isLoading, error, isSuccess }] = useCreateCourseMutation();

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "Course created successfully");
            navigate("/instructor/course");
        }
        if (error) {
            toast.error(error?.data?.message || "Failed to create course. Please try again.");
        }
    }, [isSuccess, error, data, navigate]);

    const filteredCategories = predefinedCategories.filter(
        (item) => item.name !== "Instructor Guide" || user?.role === "admin"
    );

    const createCourseHandler = async () => {
        const finalCategory = customCategory.trim() || category;
        if (!courseTitle.trim() || !finalCategory) {
            toast.error("Please fill in all fields");
            return;
        }

        if (finalCategory.trim().toLowerCase() === "instructor guide" && user?.role !== "admin") {
            toast.error("Only administrators can create Instructor Guide courses.");
            return;
        }

        await createCourse({ courseTitle, category: finalCategory });
    };

    const handlePredefinedCategorySelect = (catName) => {
        setCategory(catName);
        setCustomCategory(""); // Clear custom if predefined is clicked
    };

    const handleCustomCategoryChange = (val) => {
        setCustomCategory(val);
        if (val.trim()) {
            setCategory(""); // Clear predefined if custom is typed
        }
    };

    return (
        <div className="min-h-screen bg-[#060606] text-white pt-28 pb-16 px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <button 
                        onClick={() => navigate("/instructor/course")}
                        className="group flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Courses
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    
                    {/* Left Sidebar: Context and Guidelines (1 Column) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8602E]/8 border border-[#E8602E]/20 rounded-full text-[10px] font-bold text-[#E8602E] uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" />
                                <span>Instructor Console</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight leading-none text-white">
                                Create a New Course
                            </h1>
                            <p className="text-sm text-white/50 leading-relaxed font-medium">
                                Setup the basic details of your course to begin. You can customize the curriculum, upload video lectures, set pricing, and publish details later.
                            </p>
                        </div>

                        {/* Guidelines list */}
                        <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-2">
                                <Lightbulb className="w-3.5 h-3.5 text-[#E8602E]" /> Guidelines for Success
                            </h3>
                            <ul className="space-y-3 text-xs text-white/45 font-medium">
                                <li className="leading-relaxed">
                                    <strong className="text-white/75 font-semibold">Choose a clear title: </strong> 
                                    Keep it concise, actionable, and focus on the skills students will acquire.
                                </li>
                                <li className="leading-relaxed">
                                    <strong className="text-white/75 font-semibold">Tag accurately: </strong> 
                                    Proper categorization ensures your course appears in relevant student search filters.
                                </li>
                                <li className="leading-relaxed">
                                    <strong className="text-white/75 font-semibold">Draft content first: </strong> 
                                    Have your course outline ready before building lectures in the next steps.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Form: Input and Interaction (2 Columns) */}
                    <div className="lg:col-span-2">
                        <div className="w-full rounded-2xl border border-white/[0.05] bg-[#0c0c0c] overflow-hidden shadow-2xl">
                            <div className="p-6 md:p-8 space-y-6">
                                
                                {/* Course Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="courseTitle" className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                                        Course Title
                                    </Label>
                                    <Input
                                        id="courseTitle"
                                        type="text"
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        placeholder="e.g. Master Next.js 14 and Server Actions from Scratch"
                                        className="w-full h-11 bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl transition-all text-white outline-none"
                                    />
                                </div>

                                {/* Category Selection badges grid */}
                                <div className="space-y-3">
                                    <Label className="text-[11px] font-bold text-white/40 uppercase tracking-widest block">
                                        Select Category
                                    </Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                                        {filteredCategories.map((item) => {
                                            const IconComponent = item.icon;
                                            const isSelected = category === item.name;
                                            return (
                                                <button
                                                    key={item.name}
                                                    type="button"
                                                    onClick={() => handlePredefinedCategorySelect(item.name)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left group h-12 cursor-pointer ${
                                                        isSelected
                                                            ? "bg-[#E8602E]/8 border-[#E8602E] text-white scale-[1.01]"
                                                            : "bg-white/[0.01] border-white/[0.04] text-white/45 hover:text-white hover:border-white/[0.12]"
                                                    }`}
                                                >
                                                    <IconComponent className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                                                        isSelected ? "text-[#E8602E]" : "text-white/30"
                                                    }`} />
                                                    <span className="text-[11px] font-bold tracking-tight">
                                                        {item.name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Category Field */}
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="customCategory" className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
                                        Or Specify a Custom Category
                                    </Label>
                                    <Input
                                        id="customCategory"
                                        type="text"
                                        value={customCategory}
                                        onChange={(e) => handleCustomCategoryChange(e.target.value)}
                                        placeholder="e.g. Web3 Development, Swift, UI/UX Design..."
                                        className="w-full h-11 bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl transition-all text-white outline-none"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-white/[0.04] mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/instructor/course")}
                                        className="w-full sm:w-28 h-10 border-white/[0.06] bg-transparent hover:bg-white/[0.05] hover:text-white rounded-xl text-xs font-bold transition-all text-white/50"
                                    >
                                        Cancel
                                    </Button>
                                    
                                    <Button
                                        disabled={isLoading}
                                        onClick={createCourseHandler}
                                        className="w-full sm:w-40 h-10 bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#E8602E]/10"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <BookOpen className="w-4 h-4" />
                                                Create Course
                                            </>
                                        )}
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddCourse;
