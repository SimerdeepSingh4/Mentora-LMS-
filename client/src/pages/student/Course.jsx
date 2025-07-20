import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";

const Course = ({ course }) => {
    if (!course) {
        console.log("No course data received:", course);
        return null;
    }

    return (
        <Link to={`/course-detail/${course._id}`}>
            <Card className="overflow-hidden transition-all duration-300 transform bg-white rounded-lg shadow-lg dark:bg-gray-800 hover:shadow-2xl hover:scale-105">
                <div className="relative">
                    <img
                        src={course.courseThumbnail || "https://via.placeholder.com/400x200"}
                        alt={course.courseTitle || "Course thumbnail"}
                        className="object-cover w-full rounded-t-lg h-50"
                    />
                </div>
                <CardContent className="px-5 py-4 space-y-3">
                    <h1 className="text-lg font-bold truncate hover:underline">
                        {course.courseTitle}
                    </h1>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarImage 
                                    src={course.creator?.photoUrl || "https://cdn-icons-png.flaticon.com/128/10617/10617214.png"} 
                                    alt="Instructor" 
                                />
                                <AvatarFallback>
                                    {course.creator?.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <h1 className="text-sm font-medium">{course.creator?.name || 'Unknown'}</h1>
                        </div>
                        <Badge className={'bg-[#425d4d] text-white px-2 py-1 text-xs rounded-full dark:hover:text-black'}>
                            {course.courseLevel || 'Beginner'}
                        </Badge>
                    </div>
                    <div className="text-lg font-bold">
                        <span>{course.coursePrice === 0 ? "Free" : `₹${course.coursePrice}`}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default Course;