import React, { useState } from "react";
import Filter from "./Filter";
import SearchResult from "./SearchResult";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSearchCourseQuery } from "@/features/api/courseApi";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";
    const [selectedCategories, setSelectedCatgories] = useState([]);
    const [sortByPrice, setSortByPrice] = useState("");

    const { data, isLoading } = useGetSearchCourseQuery({
        searchQuery: query,
        categories: selectedCategories,
        sortByPrice
    });

    const isEmpty = !isLoading && data?.courses.length === 0;

    const handleFilterChange = (categories, price) => {
        console.log("Filter changed - Categories:", categories, "Price:", price);
        setSelectedCatgories(categories);
        setSortByPrice(price);
    }
    return (
        <div className="p-4 mx-auto mt-5 max-w-7xl md:p-8">
            <div className="my-6">
                <h1 className="text-xl font-bold md:text-2xl">result for "{query}"</h1>
                <p>
                    Showing results for{""}
                    <span className="italic font-bold text-blue-800">{query}</span>
                </p>
            </div>
            <div className="flex flex-col gap-10 md:flex-row">
                <Filter handleFilterChange={handleFilterChange} />
                <div className="flex-1">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <CourseSkeleton key={idx} />
                        ))
                    ) : isEmpty ? (
                        <CourseNotFound />
                    ) : (
                        data?.courses?.map((course) => <SearchResult key={course._id} course={course} />)
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;

const CourseNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center p-6 min-h-32 dark:bg-gray-900">
            <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-gray-800 md:text-4xl dark:text-gray-200">
                Course Not Found
            </h1>
            <p className="mb-4 text-lg text-gray-600 dark:text-gray-400">
                Sorry, we couldn't find the course you're looking for.
            </p>
            <Link to="/" className="italic">
                <Button variant="link">Browse All Courses</Button>
            </Link>
        </div>
    );
};

const CourseSkeleton = () => {
    return (
        <div className="flex flex-col justify-between flex-1 py-4 border-b border-gray-300 md:flex-row">
            <div className="w-full h-32 md:w-64">
                <Skeleton className="object-cover w-full h-full" />
            </div>

            <div className="flex flex-col flex-1 gap-2 px-4">
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
                <div className="flex items-center gap-2">
                    <Skeleton className="w-1/3 h-4" />
                </div>
                <Skeleton className="w-20 h-6 mt-2" />
            </div>

            <div className="flex flex-col items-end justify-between mt-4 md:mt-0">
                <Skeleton className="w-12 h-6" />
            </div>
        </div>
    );
};