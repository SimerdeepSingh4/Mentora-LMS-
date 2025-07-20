import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetCreatorCourseQuery } from '@/features/api/courseApi';
import { Edit, Plus } from 'lucide-react';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CourseTable = () => {
    const user = useSelector((state) => state.auth.user);
    const { data, isLoading, refetch } = useGetCreatorCourseQuery();
    const navigate = useNavigate();
    useEffect(() => {
        refetch();
    }, [user, refetch]);

    if (isLoading) return <CourseTableSkeleton />;

    return (
        <div className="max-w-6xl p-6 mx-auto mt-16 bg-white shadow-lg dark:bg-gray-900 rounded-xl">
            <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Courses</h1>
                <Button
                    onClick={() => navigate(`create`)}
                    className="flex items-center gap-2 bg-[#003366] hover:bg-[#002244] text-white"
                >
                    <Plus size={16} /> Create New Course
                </Button>
            </div>

            <Table>
                <TableCaption className="text-gray-500 dark:text-gray-400">A list of your recent courses.</TableCaption>
                <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-gray-800">
                        <TableHead className="w-[120px] text-gray-700 dark:text-gray-300">Price</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-700 dark:text-gray-300">Title</TableHead>
                        <TableHead className="text-right text-gray-700 dark:text-gray-300">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.courses?.length > 0 ? (
                        data.courses.map((course) => (
                            <TableRow key={course._id} className="transition hover:bg-gray-100 dark:hover:bg-gray-800">
                                <TableCell className="font-medium">
                                    {course.coursePrice === "" || course.coursePrice === null || course.coursePrice === undefined
                                        ? "NA"
                                        : course.coursePrice === 0
                                            ? "Free"
                                            : `₹${course.coursePrice}`}
                                </TableCell>

                                <TableCell>
                                    <Badge className={course.isPublished ? "bg-green-500" : "bg-yellow-500"}>
                                        {course.isPublished ? "Published" : "Draft"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{course.courseTitle}</TableCell>
                                <TableCell className="text-right">
                                    <Button size='sm' variant='ghost' onClick={() => navigate(`${course._id}`)}>
                                        <Edit className="text-gray-600 dark:text-gray-300" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="py-6 text-center text-gray-500 dark:text-gray-400">
                                No courses available.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default CourseTable;

const CourseTableSkeleton = () => (
    <div className="max-w-6xl p-6 mx-auto mt-16 bg-white shadow-lg dark:bg-gray-900 rounded-xl animate-pulse">
        <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
            <div className="w-48 h-6 bg-gray-300 rounded"></div>
            <div className="w-32 h-10 bg-gray-300 rounded"></div>
        </div>
        <div className="w-full h-10 mb-4 bg-gray-300 rounded"></div>
        <div className="w-full">
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 rounded-lg dark:bg-gray-800">
                <div className="w-24 h-6 bg-gray-300 rounded"></div>
                <div className="w-24 h-6 bg-gray-300 rounded"></div>
                <div className="w-24 h-6 bg-gray-300 rounded"></div>
                <div className="w-24 h-6 bg-gray-300 rounded"></div>
            </div>
            {[...Array(4)].map((_, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-6 bg-gray-300 rounded"></div>
                    <div className="w-24 h-6 bg-gray-300 rounded"></div>
                    <div className="w-40 h-6 bg-gray-300 rounded"></div>
                    <div className="w-10 h-6 bg-gray-300 rounded justify-self-end"></div>
                </div>
            ))}
        </div>
    </div>
)