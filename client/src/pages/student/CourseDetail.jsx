import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React, { useEffect } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError, refetch } = useGetCourseDetailWithStatusQuery(courseId);

    // Use the custom hook to refetch data when the component comes into focus
    useRefetchOnFocus(refetch);


    if (isLoading) return <div className="flex justify-center mt-10"><h1>Loading...</h1></div>;
    if (isError) return <div className="flex justify-center mt-10 text-red-500"><h1>Failed to load course details</h1></div>;

    const { course, purchased } = data || {};

    const handleContinueCourse = () => {
        if (purchased) navigate(`/course-progress/${courseId}`);
    };

    return (
        <div className="mt-10 space-y-5">
            {/* Course Header */}
            <div className="bg-[#2D2F31] text-white">
                <div className="flex flex-col gap-2 px-4 py-8 mx-auto max-w-7xl md:px-8">
                    <h1 className="text-2xl font-bold md:text-3xl">{course?.courseTitle}</h1>
                    <p className="text-base md:text-lg">{course?.subTitle || "Course Sub-title"}</p>
                    <p>
                        Created By{" "}
                        <span className="text-[#C0C4FC] underline italic">
                            {course?.creator?.name || "Unknown"}
                        </span>
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        <BadgeInfo size={16} />
                        <p>Last updated {course?.createdAt?.split("T")[0] || "N/A"}</p>
                    </div>
                    <p>Students enrolled: {course?.enrolledStudents?.length || 0}</p>
                </div>
            </div>

            {/* Course Content */}
            <div className="flex flex-col justify-between gap-10 px-4 mx-auto my-5 max-w-7xl md:px-8 lg:flex-row">
                <div className="w-full space-y-5 lg:w-1/2">
                    <h1 className="text-xl font-bold md:text-2xl">Description</h1>
                    <p
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: course?.description || "No description available." }}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle>Course Content</CardTitle>
                            <CardDescription>{course?.lectures?.length || 0} lectures</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {course?.lectures?.map((lecture, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                    <span>
                                        {purchased ? <PlayCircle size={14} /> : <Lock size={14} />}
                                    </span>
                                    <p>{lecture?.lectureTitle || "Untitled Lecture"}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Video & Purchase Section */}
                <div className="w-full lg:w-1/3">
                    <Card>
                        <CardContent className="flex flex-col p-4">
                            <div className="w-full mb-4 aspect-video">
                                {course?.lectures?.length > 0 ? (
                                    <ReactPlayer
                                        width="100%"
                                        height="100%"
                                        url={course.lectures[0].videoUrl}
                                        controls
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-white bg-gray-800">
                                        No preview available
                                    </div>
                                )}
                            </div>
                            <h1 className="text-lg font-semibold md:text-xl">
                                {course?.coursePrice === 0 ? "Free" : `₹${course.coursePrice}`}
                            </h1>
                        </CardContent>
                        <CardFooter className="flex justify-center p-4">
                            {purchased ? (
                                <Button onClick={handleContinueCourse} className="w-full">
                                    Continue Course
                                </Button>
                            ) : (
                                <BuyCourseButton courseId={courseId} />
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
