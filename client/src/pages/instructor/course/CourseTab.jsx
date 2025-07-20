import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseTab = () => {
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
        }
    }, [courseByIdData, courseId]);

    const updateCourseHandler = async () => {
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

    if (courseByIdLoading) return <h1>Loading...</h1>;

    return (
        <Card className="p-1">
            <CardHeader className="flex flex-col items-center justify-between md:flex-row">
                <div>
                    <CardTitle className="text-xl font-bold">Basic Course Information</CardTitle>
                    <CardDescription>
                        Modify your course details below.
                    </CardDescription>
                </div>
                <div className="flex space-x-3">
                    <Button
                        disabled={courseByIdData?.course.lectures.length === 0}
                        onClick={() => publishStatusHandler(courseByIdData?.course.isPublished ? "false" : "true")}
                    >
                        {courseByIdData?.course.isPublished ? "Unpublish" : "Publish"}
                    </Button>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive">Remove Course</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                                <DialogDescription>
                                    This action **cannot be undone**. Deleting this course will remove all associated lectures and data.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button variant="destructive" onClick={deleteCourseHandler} disabled={isDeleting}>
                                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="space-y-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            type="text"
                            name="courseTitle"
                            value={input.courseTitle}
                            onChange={changeEventHandler}
                            placeholder="Enter course title"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input
                            type="text"
                            name="subTitle"
                            value={input.subTitle}
                            onChange={changeEventHandler}
                            placeholder="Enter subtitle"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <RichTextEditor input={input} setInput={setInput} />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                defaultValue={input.category}
                                onValueChange={selectCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Category</SelectLabel>
                                        <SelectItem value="Next JS">Next JS</SelectItem>
                                        <SelectItem value="Data Science">Data Science</SelectItem>
                                        <SelectItem value="Frontend Development">
                                            Frontend Development
                                        </SelectItem>
                                        <SelectItem value="Fullstack Development">
                                            Fullstack Development
                                        </SelectItem>
                                        <SelectItem value="MERN Stack Development">
                                            MERN Stack Development
                                        </SelectItem>
                                        <SelectItem value="Javascript">Javascript</SelectItem>
                                        <SelectItem value="Python">Python</SelectItem>
                                        <SelectItem value="Docker">Docker</SelectItem>
                                        <SelectItem value="MongoDB">MongoDB</SelectItem>
                                        <SelectItem value="HTML">HTML</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Course Level</Label>
                            <Select
                                defaultValue={input.courseLevel}
                                onValueChange={selectCourseLevel}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Course Level</SelectLabel>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Advance">Advance</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Price in (INR)</Label>
                            <Input
                                type="number"
                                name="coursePrice"
                                value={input.coursePrice === null || input.coursePrice === undefined ? "" : input.coursePrice}
                                onChange={(e) => {
                                    const value = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                                    changeEventHandler({ target: { name: "coursePrice", value } });
                                }}
                                placeholder="199"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Course Thumbnail</Label>
                        <Input
                            type="file"
                            onChange={selectThumbnail}
                            accept="image/*"
                        />
                        {previewThumbnail && (
                            <img
                                src={previewThumbnail}
                                className="my-2 max-w-64"
                                alt="Course Thumbnail"
                            />
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => navigate("/instructor/course")}>Cancel</Button>
                <Button disabled={isLoading} onClick={updateCourseHandler}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save"}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CourseTab;