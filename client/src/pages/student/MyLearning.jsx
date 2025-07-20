import React, { useEffect, useState } from 'react';
import { useGetPurchasedCoursesQuery } from '../../features/api/purchaseApi';
import { useLoadUserQuery } from '@/features/api/authApi';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import EnhancedCourseCard from './EnhancedCourseCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Clock, Search, GraduationCap, BookOpenCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from 'react-router-dom';

// Skeleton loader for course cards
const CourseCardSkeleton = () => (
  <div className="overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800">
    <Skeleton className="w-full h-48" />
    <div className="p-5 space-y-3">
      <Skeleton className="w-3/4 h-6" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="w-full h-2 rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="w-20 h-8 rounded-md" />
        <Skeleton className="w-20 h-8 rounded-md" />
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-6 mb-6 text-blue-500 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
      <BookOpen size={48} />
    </div>
    <h2 className="mb-2 text-2xl font-bold">No courses yet</h2>
    <p className="max-w-md mb-8 text-gray-500 dark:text-gray-400">
      You haven't purchased any courses yet. Explore our catalog to find courses that match your interests.
    </p>
    <Link to="/">
      <Button className="px-6">
        <GraduationCap className="w-4 h-4 mr-2" />
        Explore Courses
      </Button>
    </Link>
  </div>
);

const MyLearning = () => {
  const { data: response, isLoading, error, refetch: refetchCourses } = useGetPurchasedCoursesQuery();
  const { data: userData, refetch: refetchUser } = useLoadUserQuery();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Use the custom hook to refetch data when the component comes into focus
  useRefetchOnFocus([refetchCourses, refetchUser]);

  // Process courses data
  useEffect(() => {
    if (Array.isArray(response)) {
      setCourses(response);
    } else if (response?.courses) {
      setCourses(response.courses);
    } else {
      setCourses([]);
    }
  }, [response]);

  // Filter courses based on search query and active tab
  useEffect(() => {
    let result = [...courses];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(course =>
        course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.creator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab !== 'all') {
      if (activeTab === 'in-progress') {
        result = result.filter(course => course.progress && course.progress > 0 && course.progress < 100);
      } else if (activeTab === 'completed') {
        result = result.filter(course => course.progress === 100);
      } else if (activeTab === 'not-started') {
        result = result.filter(course => !course.progress || course.progress === 0);
      }
    }

    setFilteredCourses(result);
  }, [courses, searchQuery, activeTab]);

  // Calculate learning stats
  const stats = {
    totalCourses: courses.length,
    inProgress: courses.filter(course => course.progress && course.progress > 0 && course.progress < 100).length,
    completed: courses.filter(course => course.progress === 100).length,
    notStarted: courses.filter(course => !course.progress || course.progress === 0).length
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="mb-8">
          <Skeleton className="w-64 h-10 mb-2" />
          <Skeleton className="w-96 h-6" />
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="w-48 h-24 rounded-lg" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold">My Learning</h1>
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 text-red-600 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-600 dark:text-red-300">Error loading courses</h3>
              <p className="text-red-500 dark:text-red-400">
                We couldn't load your courses. Please try again later.
              </p>
            </div>
            <Button variant="outline" className="ml-auto" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto mt-20">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Learning</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back{userData?.user?.name ? `, ${userData.user.name}` : ''}! Continue your learning journey.
        </p>
      </div>

      {/* Stats Cards */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-300">Total Courses</p>
                <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-200">{stats.totalCourses}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 text-amber-600 bg-amber-100 rounded-full dark:bg-amber-900 dark:text-amber-300">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-300">In Progress</p>
                <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-200">{stats.inProgress}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 text-green-600 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-300">Completed</p>
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-200">{stats.completed}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-2 text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-300">
                <BookOpenCheck size={20} />
              </div>
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-300">Not Started</p>
                <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-200">{stats.notStarted}</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filter */}
      {courses.length > 0 && (
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search your courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="not-started">Not Started</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Course List */}
      {courses.length === 0 ? (
        <EmptyState />
      ) : filteredCourses.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No courses match your search criteria.</p>
          <Button variant="link" onClick={() => {setSearchQuery(''); setActiveTab('all');}}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <EnhancedCourseCard
              key={course._id}
              course={course}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearning;