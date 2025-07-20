import { Skeleton } from '@/components/ui/skeleton';
import React from 'react'
import Course from './Course';
import { useGetPublishedCourseQuery } from '@/features/api/courseApi';

const Courses = () => {
    const { data, isLoading, isError, error } = useGetPublishedCourseQuery();

    if (isLoading) {
        return (
            <div className="bg-[#F8FFE5] dark:bg-[#1F1C2C]">
                <div className="p-6 mx-auto max-w-7xl">
                    <h2 className="mb-10 text-3xl font-bold text-center">Our Courses</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <CourseSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        console.error('Error fetching courses:', error);
        return (
            <div className="bg-[#F8FFE5] dark:bg-[#1F1C2C]">
                <div className="p-6 mx-auto max-w-7xl">
                    <h2 className="mb-10 text-3xl font-bold text-center">Our Courses</h2>
                    <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
                        <p>Failed to load courses. Please try again later.</p>
                        <p className="text-sm text-red-500">Error: {error?.data?.message || 'Unknown error'}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Ensure data is an array
    const courses = Array.isArray(data) ? data : [];

    if (courses.length === 0) {
        return (
            <div className="bg-[#F8FFE5] dark:bg-[#1F1C2C]">
                <div className="p-6 mx-auto max-w-7xl">
                    <h2 className="mb-10 text-3xl font-bold text-center">Our Courses</h2>
                    <div className="p-4 text-center text-gray-600 bg-gray-100 rounded-lg">
                        <p>No courses available at the moment.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FFE5] dark:bg-[#1F1C2C]">
            <div className="p-6 mx-auto max-w-7xl">
                <h2 className="mb-10 text-3xl font-bold text-center">Our Courses</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {courses.map((course) => (
                        <Course key={course._id} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Courses;

const CourseSkeleton = () => {
    return (
        <div className="overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
            <Skeleton className="w-full h-36" />
            <div className="px-5 py-4 space-y-3">
                <Skeleton className="w-3/4 h-6" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                    <Skeleton className="w-16 h-4" />
                </div>
                <Skeleton className="w-1/4 h-4" />
            </div>
        </div>
    );
};