import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import CourseTab from "./CourseTab";

const EditCourse = () => {
    return (
        <div className="flex-1 px-6 py-4">
            <div className="flex flex-col items-start justify-between gap-4 mt-8 mb-5 md:flex-row md:items-center">
                <h1 className="text-2xl font-semibold">
                    Add Detailed Information Regarding Course
                </h1>
                <Link to="lecture">
                    <Button variant="default" className="flex items-center gap-2">
                        Go to Lectures Page <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
            <CourseTab />
        </div>
    );
};

export default EditCourse;
