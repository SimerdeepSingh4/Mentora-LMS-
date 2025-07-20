import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    useCreateLectureMutation,
    useGetCourseLectureQuery,
} from "@/features/api/courseApi";
import { Loader2 } from "lucide-react";
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
        <div className="flex-1 mx-10 mt-20">
            <div className="mb-4">
                <h1 className="text-xl font-bold">Add a New Lecture</h1>
                <p className="text-sm text-gray-600">Provide basic details for your new lecture.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="lecture-title">Title</Label>
                    <Input
                        id="lecture-title"
                        type="text"
                        value={lectureTitle}
                        onChange={(e) => setLectureTitle(e.target.value)}
                        placeholder="Enter lecture title"
                        className="mt-1"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate(`/instructor/course/${courseId}`)}>
                        Back to Course
                    </Button>
                    <Button disabled={isLoading} onClick={createLectureHandler}>
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Lecture"
                        )}
                    </Button>
                </div>

                <div className="mt-10">
                    {lectureLoading ? (
                        <p className="text-gray-500">Loading lectures...</p>
                    ) : lectureError ? (
                        <p className="text-red-500">Failed to load lectures. Please try again.</p>
                    ) : lectureData?.lectures.length === 0 ? (
                        <p className="text-gray-500">No lectures available.</p>
                    ) : (
                        lectureData.lectures.map((lecture, index) => (
                            <Lecture key={lecture._id} lecture={lecture} courseId={courseId} index={index} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateLecture;
