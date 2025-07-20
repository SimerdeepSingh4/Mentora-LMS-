import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCourseMutation } from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const predefinedCategories = [
    "Next JS", "Data Science", "Frontend Development", "Fullstack Development",
    "MERN Stack Development", "Javascript", "Python", "Docker", "MongoDB", "HTML"
];

const AddCourse = () => {
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
            toast.error("Failed to create course. Please try again.");
        }
    }, [isSuccess, error, data, navigate]);

    const createCourseHandler = async () => {
        const finalCategory = customCategory || category;
        if (!courseTitle.trim() || !finalCategory) {
            toast.error("Please fill in all fields");
            return;
        }
        await createCourse({ courseTitle, category: finalCategory });
    };

    return (
        <div className="flex items-center justify-center w-full min-h-screen p-6">
            <div className="w-full max-w-2xl">
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">
                            📚 Add a New Course
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Provide basic details for your new course.
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Course Title Input */}
                        <div className="space-y-2">
                            <Label htmlFor="courseTitle">Title</Label>
                            <Input
                                id="courseTitle"
                                type="text"
                                value={courseTitle}
                                onChange={(e) => setCourseTitle(e.target.value)}
                                placeholder="Your Course Name"
                            />
                        </div>

                        {/* Predefined Categories Dropdown */}
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Categories</SelectLabel>
                                        {predefinedCategories.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Category Input */}
                        <div className="space-y-2">
                            <Label htmlFor="customCategory">Or Enter Your Own Category</Label>
                            <Input
                                id="customCategory"
                                type="text"
                                value={customCategory}
                                onChange={(e) => setCustomCategory(e.target.value)}
                                placeholder="Custom Category (Optional)"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <Button
                                disabled={isLoading}
                                onClick={createCourseHandler}
                                className="w-full sm:w-40"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Please wait...
                                    </>
                                ) : (
                                    "Create Course"
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/instructor/course")}
                                className="w-full sm:w-40"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AddCourse;
