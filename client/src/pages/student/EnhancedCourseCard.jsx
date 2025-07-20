import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, Award, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

const EnhancedCourseCard = ({ course }) => {
  const navigate = useNavigate();
  
  if (!course) {
    return null;
  }

  // Calculate progress percentage (default to 0 if not available)
  const progressPercentage = course.progress || 0;
  
  // Format last accessed date if available
  const lastAccessed = course.lastAccessed 
    ? formatDistanceToNow(new Date(course.lastAccessed), { addSuffix: true })
    : 'Not started yet';

  // Determine status and badge color
  let statusBadge;
  if (progressPercentage === 100) {
    statusBadge = <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800">Completed</Badge>;
  } else if (progressPercentage > 0) {
    statusBadge = <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:hover:bg-amber-800">In Progress</Badge>;
  } else {
    statusBadge = <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800">Not Started</Badge>;
  }

  // Handle continue learning button click
  const handleContinueLearning = (e) => {
    e.preventDefault();
    navigate(`/course-progress/${course._id}`);
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 transform bg-white rounded-lg shadow-lg dark:bg-gray-800 hover:shadow-xl">
      <div className="relative">
        <img
          src={course.courseThumbnail || "https://via.placeholder.com/400x200"}
          alt={course.courseTitle || "Course thumbnail"}
          className="object-cover w-full h-48"
        />
        {statusBadge && (
          <div className="absolute top-3 right-3">
            {statusBadge}
          </div>
        )}
      </div>
      
      <CardContent className="px-5 py-4 space-y-3">
        <Link to={`/course-detail/${course._id}`} className="block">
          <h1 className="text-lg font-bold hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1">
            {course.courseTitle}
          </h1>
        </Link>
        
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
            <span className="text-sm font-medium">{course.creator?.name || 'Unknown'}</span>
          </div>
          <Badge className="bg-[#425d4d] text-white px-2 py-1 text-xs rounded-full dark:hover:text-black">
            {course.courseLevel || 'Beginner'}
          </Badge>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        {/* Last accessed info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock size={14} />
          <span>Last accessed: {lastAccessed}</span>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 py-4 border-t dark:border-gray-700">
        <div className="flex w-full gap-2">
          <Button 
            variant="default" 
            className="flex-1"
            onClick={handleContinueLearning}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {progressPercentage > 0 ? 'Continue' : 'Start'}
          </Button>
          
          {progressPercentage === 100 && (
            <Button variant="outline" className="flex-1">
              <Award className="w-4 h-4 mr-2" />
              Certificate
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EnhancedCourseCard;
