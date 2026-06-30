import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useEditCourseMutation,
    useGetCourseByIdQuery,
    usePublishCourseMutation,
    useDeleteCourseMutation
} from "@/features/api/courseApi";
import { Loader2, Plus, Sparkles, BookOpen, Trash2, ArrowUpRight, CheckCircle2, AlertTriangle, FileUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseTab = () => {
    const { user } = useSelector((store) => store.auth);
    const [input, setInput] = useState({
        courseTitle: "",
        subTitle: "",
        description: "",
        category: "",
        courseLevel: "",
        coursePrice: "",
        courseThumbnail: "",
    });

    const params = useParams();
    const courseId = params.courseId;
    const { data: courseByIdData, isLoading: courseByIdLoading, refetch } =
        useGetCourseByIdQuery(courseId);

    const [publishCourse] = usePublishCourseMutation();
    const [previewThumbnail, setPreviewThumbnail] = useState("");
    const navigate = useNavigate();
    const [editCourse, { data, isLoading, isSuccess, error }] = useEditCourseMutation();
    const [open, setOpen] = useState(false);
    const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
    };

    const selectCategory = (value) => {
        setInput({ ...input, category: value });
    };

    const selectCourseLevel = (value) => {
        setInput({ ...input, courseLevel: value });
    };

    const selectThumbnail = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setInput({ ...input, courseThumbnail: file });
            const fileReader = new FileReader();
            fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    };

    const deleteCourseHandler = async () => {
        try {
            const response = await deleteCourse(courseId);
            if (response.data) {
                toast.success(response.data.message);
                setOpen(false);
                navigate("/instructor/course");
            } else {
                toast.error("Failed to delete course");
            }
        } catch (error) {
            toast.error(error?.data?.message || "Error deleting course");
        }
    };

    useEffect(() => {
        const savedCourse = localStorage.getItem(`course_${courseId}`);
        if (savedCourse) {
            setInput(JSON.parse(savedCourse));
        } else if (courseByIdData?.course) {
            setInput({
                courseTitle: courseByIdData.course.courseTitle,
                subTitle: courseByIdData.course.subTitle,
                description: courseByIdData.course.description,
                category: courseByIdData.course.category,
                courseLevel: courseByIdData.course.courseLevel,
                coursePrice: courseByIdData.course.coursePrice,
                courseThumbnail: "",
            });
            if (courseByIdData.course.courseThumbnail) {
                setPreviewThumbnail(courseByIdData.course.courseThumbnail);
            }
        }
    }, [courseByIdData, courseId]);

    const updateCourseHandler = async () => {
        if (input.category === "Instructor Guide" && user?.role !== "admin") {
            toast.error("Only administrators can assign courses to the Instructor Guide category.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("courseTitle", input.courseTitle);
            formData.append("subTitle", input.subTitle);
            formData.append("description", input.description);
            formData.append("category", input.category);
            formData.append("courseLevel", input.courseLevel);
            formData.append("coursePrice", input.coursePrice);
            formData.append("courseThumbnail", input.courseThumbnail);

            const response = await editCourse({ formData, courseId }).unwrap();
            localStorage.setItem(`course_${courseId}`, JSON.stringify(input));
            toast.success(response.message || "Course updated successfully!");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update course");
        }
    };

    const publishStatusHandler = async (action) => {
        try {
            const response = await publishCourse({ courseId, query: action });
            if (response.data) {
                refetch();
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error("Failed to publish or unpublish course");
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "Course update.");
        }
        if (error) {
            toast.error(error.data.message || "Failed to update course");
        }
    }, [isSuccess, error]);

    if (courseByIdLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#E8602E]" />
                <p className="text-xs text-white/40 font-bold">Loading course details...</p>
            </div>
        );
    }

    const course = courseByIdData?.course;
    const hasLectures = course?.lectures && course.lectures.length > 0;
    const hasImportantDetails = 
        course?.courseTitle?.trim() && 
        course?.subTitle?.trim() && 
        course?.description?.trim() && 
        course?.category?.trim() && 
        course?.courseLevel?.trim() && 
        course?.courseThumbnail;

    const isPublishDisabled = !hasLectures || !hasImportantDetails;

    return (
        <div className="w-full bg-[#0c0c0c] border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
            {/* Tab Header Actions */}
            <div className="p-6 border-b border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.01] to-transparent">
                <div className="space-y-1">
                    <h2 className="text-base font-extrabold text-white tracking-tight">Basic Information</h2>
                    <p className="text-xs text-white/40 font-medium">
                        Configure course titles, category tag, level, pricing, and thumbnail.
                        {isPublishDisabled && !course?.isPublished && (
                            <span className="text-[#E8602E] block mt-1 font-bold">
                                * To publish, add at least 1 lecture and fill all details (Title, Subtitle, Description, Category, Level, and Cover image).
                            </span>
                        )}
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        disabled={isPublishDisabled}
                        onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
                        className="bg-transparent hover:bg-white/[0.05] border border-white/[0.06] text-white text-xs font-bold px-4 h-9 rounded-xl transition-all"
                    >
                        {courseByIdData?.course.isPublished ? "Unpublish Course" : "Publish Course"}
                    </Button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                variant="ghost"
                                className="border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 hover:border-red-500/20 text-xs font-bold px-4 h-9 rounded-xl transition-all flex items-center gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0f0f0f] border border-white/[0.08] text-white">
                            <DialogHeader>
                                <DialogTitle className="text-white font-extrabold flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-400" /> Are you absolute sure?
                                </DialogTitle>
                                <DialogDescription className="text-white/50 text-xs leading-relaxed pt-1.5">
                                    This action is permanent and <strong className="text-white font-semibold">cannot be undone</strong>. Deleting this course will permanently delete all modules, curriculum chapters, attached documents, and student enrollment records.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-white/[0.04] mt-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setOpen(false)}
                                    className="border-white/[0.06] hover:bg-white/[0.05] text-xs font-bold rounded-xl h-9 text-white/50 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl h-9 px-4" 
                                    onClick={deleteCourseHandler} 
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 md:p-8 space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Course Title</Label>
                    <Input
                        type="text"
                        name="courseTitle"
                        value={input.courseTitle}
                        onChange={changeEventHandler}
                        placeholder="Enter course title"
                        className="w-full h-11 bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl text-white outline-none transition-all"
                    />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Subtitle</Label>
                    <Input
                        type="text"
                        name="subTitle"
                        value={input.subTitle}
                        onChange={changeEventHandler}
                        placeholder="Enter a brief, catchy subtitle..."
                        className="w-full h-11 bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl text-white outline-none transition-all"
                    />
                </div>

                {/* Description Editor */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Description</Label>
                    <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-white/[0.01]">
                        <RichTextEditor input={input} setInput={setInput} />
                    </div>
                </div>

                {/* Grid Inputs: Category, Level, Price */}
                <div className="grid gap-5 md:grid-cols-3">
                    
                    {/* Category */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Category</Label>
                        <Select
                            defaultValue={input.category}
                            onValueChange={selectCategory}
                        >
                            <SelectTrigger className="w-full h-11 bg-white/[0.02] border-white/[0.06] text-white/80 focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 rounded-xl text-xs font-semibold px-4">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#121212] border border-white/[0.08] text-white">
                                <SelectGroup>
                                    <SelectLabel className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Category</SelectLabel>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Next JS">Next JS</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Data Science">Data Science</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Frontend Development">Frontend Development</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Fullstack Development">Fullstack Development</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="MERN Stack Development">MERN Stack Development</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Javascript">Javascript</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Python">Python</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Docker">Docker</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="MongoDB">MongoDB</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="HTML">HTML</SelectItem>
                                    {user?.role === "admin" && (
                                        <SelectItem className="hover:bg-white/[0.05]" value="Instructor Guide">Instructor Guide</SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Course Level */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Course Level</Label>
                        <Select
                            defaultValue={input.courseLevel}
                            onValueChange={selectCourseLevel}
                        >
                            <SelectTrigger className="w-full h-11 bg-white/[0.02] border-white/[0.06] text-white/80 focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 rounded-xl text-xs font-semibold px-4">
                                <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#121212] border border-white/[0.08] text-white">
                                <SelectGroup>
                                    <SelectLabel className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Course Level</SelectLabel>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Beginner">Beginner</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Medium">Medium</SelectItem>
                                    <SelectItem className="hover:bg-white/[0.05]" value="Advance">Advance</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Price (INR)</Label>
                        <Input
                            type="number"
                            name="coursePrice"
                            value={input.coursePrice === null || input.coursePrice === undefined ? "" : input.coursePrice}
                            onChange={(e) => {
                                const value = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                                changeEventHandler({ target: { name: "coursePrice", value } });
                            }}
                            placeholder="e.g. 499"
                            min="0"
                            className="w-full h-11 bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl text-white outline-none transition-all"
                        />
                    </div>

                </div>

                {/* Course Thumbnail dashed dragzone */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Course Cover Thumbnail</Label>
                    
                    <div className="border border-dashed border-white/[0.1] hover:border-[#E8602E]/40 bg-white/[0.01] rounded-2xl p-6 text-center cursor-pointer transition-all relative group">
                        <input 
                            type="file" 
                            onChange={selectThumbnail} 
                            accept="image/*" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {previewThumbnail ? (
                            <div className="relative inline-block max-w-sm mx-auto z-0">
                                <img 
                                    src={previewThumbnail} 
                                    className="rounded-xl border border-white/[0.08] shadow-lg max-h-48 object-cover mx-auto" 
                                    alt="Course Thumbnail Preview" 
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                                    <span className="text-xs font-bold text-white bg-[#E8602E] px-3 py-1.5 rounded-lg flex items-center gap-1">
                                        <FileUp className="w-3.5 h-3.5" /> Change Cover Image
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 py-4">
                                <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-white/40 group-hover:text-[#E8602E] transition-colors">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">Upload course thumbnail</p>
                                    <p className="text-[10px] text-white/30 mt-0.5">Supports PNG, JPG, or WEBP up to 2MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Actions Footer */}
            <div className="p-6 border-t border-white/[0.04] bg-white/[0.01] flex items-center justify-end gap-3">
                <Button 
                    variant="outline" 
                    onClick={() => navigate("/instructor/course")}
                    className="h-10 border-white/[0.06] bg-transparent hover:bg-white/[0.05] hover:text-white rounded-xl text-xs font-bold transition-all text-white/50"
                >
                    Cancel
                </Button>
                
                <Button 
                    disabled={isLoading} 
                    onClick={updateCourseHandler}
                    className="h-10 bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#E8602E]/10 px-6"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </div>
    );
};

export default CourseTab;