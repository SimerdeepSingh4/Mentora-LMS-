import React, { useEffect, useState, useMemo } from 'react';
import { useGetPurchasedCoursesQuery } from '../../features/api/purchaseApi';
import { useLoadUserQuery, useGetUserActivityQuery } from '@/features/api/authApi';
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Clock, Search, GraduationCap, Bell, ChevronLeft, ChevronRight, Award, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from 'react-router-dom';

// Skeleton loader for course cards
const CourseCardSkeleton = () => (
  <Card className="overflow-hidden border border-border">
    <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-5">
      <Skeleton className="w-full sm:w-44 h-28 rounded-lg shrink-0" />
      <div className="flex-1 w-full space-y-3">
        <Skeleton className="w-2/3 h-5" />
        <Skeleton className="w-1/3 h-4" />
        <div className="space-y-1">
          <Skeleton className="w-12 h-3" />
          <Skeleton className="w-full h-2 rounded-full" />
        </div>
      </div>
      <Skeleton className="w-full sm:w-32 h-10 rounded-md shrink-0" />
    </CardContent>
  </Card>
);

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-6 mb-6 text-[#E8602E] bg-[#E8602E]/10 rounded-full">
      <BookOpen size={48} />
    </div>
    <h2 className="mb-2 text-2xl font-bold text-foreground">No courses purchased yet</h2>
    <p className="max-w-md mb-8 text-muted-foreground text-sm">
      Ready to start learning? Explore our premium courses to find coding programs that match your interests.
    </p>
    <Link to="/">
      <Button className="px-6">
        <GraduationCap className="w-4 h-4 mr-2" />
        Explore Catalog
      </Button>
    </Link>
  </div>
);

// Helper function to generate mock 365-day calendar activity heatmap data
const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    // 364 days back = 365 days total (52 weeks of 7 days + 1 day)
    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        let level = 0;
        const randomVal = Math.random();
        if (randomVal > 0.88) {
            level = 3; // High activity
        } else if (randomVal > 0.75) {
            level = 2; // Medium activity
        } else if (randomVal > 0.55) {
            level = 1; // Low activity
        }
        
        data.push({
            date: date.toISOString().split('T')[0],
            level
        });
    }
    return data;
};

const MyLearning = () => {
  const { data: response, isLoading, error, refetch: refetchCourses } = useGetPurchasedCoursesQuery();
  const { data: userData, refetch: refetchUser } = useLoadUserQuery();
  const { data: activityData, refetch: refetchActivity } = useGetUserActivityQuery();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [heatmapOffset, setHeatmapOffset] = useState(0); // 0 = current 30 days, 1 = previous 30 days

  // Use the custom hook to refetch data when the component comes into focus
  useRefetchOnFocus([refetchCourses, refetchUser, refetchActivity]);

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

    // Apply sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredCourses(result);
  }, [courses, searchQuery, activeTab, sortOrder]);

  // Generate dynamic, actual-data based activity heatmap (98 days displayed at once - 14 weeks of 7 days)
  const { heatmapWeeks, totalActivities } = useMemo(() => {
    const xp = userData?.user?.xp || 0;
    const streak = userData?.user?.streak || 0;
    const registrationDateStr = userData?.user?.createdAt;
    const badges = userData?.user?.badges || [];
    const courseDates = courses.map(c => c.createdAt).filter(Boolean);

    // Number of activities from XP (1 activity per 10 XP)
    const count = xp > 0 ? Math.round(xp / 10) : 0;
    
    const activityMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDaysToCalculate = 196; // 196 days to support 2 periods of 98 days

    // 1. Load real recorded activity logs from the backend (real database logs)
    if (activityData?.data && Array.isArray(activityData.data)) {
      activityData.data.forEach(item => {
        if (item._id) {
          // backend returned _id format YYYY-MM-DD
          activityMap[item._id] = (activityMap[item._id] || 0) + item.count;
        }
      });
    }

    // 2. Mark the active streak days (real data)
    for (let s = 0; s < streak; s++) {
      const date = new Date(today);
      date.setDate(today.getDate() - s);
      const dateStr = date.toISOString().split('T')[0];
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    }

    // 3. Mark course purchase dates as active days (real data)
    courseDates.forEach(dateStr => {
      const d = new Date(dateStr);
      d.setHours(0, 0, 0, 0);
      const diff = today.getTime() - d.getTime();
      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < totalDaysToCalculate) {
        const dateKey = d.toISOString().split('T')[0];
        activityMap[dateKey] = (activityMap[dateKey] || 0) + 2; // heavier weight
      }
    });

    // 4. Mark badge unlock dates as active days (real data)
    badges.forEach(badge => {
      if (badge.unlockedAt) {
        const d = new Date(badge.unlockedAt);
        d.setHours(0, 0, 0, 0);
        const diff = today.getTime() - d.getTime();
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < totalDaysToCalculate) {
          const dateKey = d.toISOString().split('T')[0];
          activityMap[dateKey] = (activityMap[dateKey] || 0) + 2; // heavier weight
        }
      }
    });

    // 5. Fill in the remaining activities from XP deterministically
    let currentActivityCount = Object.values(activityMap).reduce((sum, val) => sum + val, 0);
    const targetActivities = Math.max(count, currentActivityCount);

    if (currentActivityCount < targetActivities) {
      const regDate = registrationDateStr ? new Date(registrationDateStr) : new Date(today.getTime() - 120 * 24 * 60 * 60 * 1000);
      regDate.setHours(0, 0, 0, 0);
      const daysSinceRegistration = Math.max(1, Math.floor((today.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24)));
      const activeWindow = Math.min(totalDaysToCalculate, daysSinceRegistration);

      // Deterministic pseudo-random seed based on user info to keep the historical grid stable
      const seedStr = userData?.user?._id || "guest";
      let seed = 0;
      for (let charIdx = 0; charIdx < seedStr.length; charIdx++) {
        seed += seedStr.charCodeAt(charIdx);
      }
      
      const pseudoRandom = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      let attempts = 0;
      while (currentActivityCount < targetActivities && attempts < 1000) {
        attempts++;
        const offset = Math.floor(pseudoRandom() * activeWindow);
        const activeDate = new Date(today);
        activeDate.setDate(today.getDate() - offset);
        const dateKey = activeDate.toISOString().split('T')[0];

        if (!activityMap[dateKey]) {
          activityMap[dateKey] = 1;
          currentActivityCount++;
        } else if (activityMap[dateKey] < 4) {
          activityMap[dateKey]++;
          currentActivityCount++;
        }
      }
    }

    // Build the 98-day window based on offset
    // offset = 0 (current 98 days): days 0 to 97 ago
    // offset = 1 (previous 98 days): days 98 to 195 ago
    const displayDays = [];
    const startOffset = heatmapOffset * 98;
    for (let i = 97; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - (i + startOffset));
      const dateStr = date.toISOString().split('T')[0];
      const levelVal = activityMap[dateStr] || 0;
      
      let level = 0;
      if (levelVal > 3) level = 4;
      else if (levelVal > 2) level = 3;
      else if (levelVal > 1) level = 2;
      else if (levelVal > 0) level = 1;
      
      displayDays.push({
        date: dateStr,
        level
      });
    }

    const weeks = [];
    let currentWeek = [];
    displayDays.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === displayDays.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return { heatmapWeeks: weeks, totalActivities: targetActivities };
  }, [userData?.user?.xp, userData?.user?.streak, userData?.user?.createdAt, userData?.user?.badges, courses, activityData, heatmapOffset]);

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto mt-20 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="w-64 h-10 mb-2" />
          <Skeleton className="w-96 h-6" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Array(3).fill(0).map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
          <div className="space-y-6">
            <Skeleton className="w-full h-48 rounded-xl" />
            <Skeleton className="w-full h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto mt-20 max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-foreground">Classroom</h1>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 text-red-600 bg-red-100 dark:bg-red-900 rounded-full">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-650 dark:text-red-400">Error loading courses</h3>
              <p className="text-red-500 text-sm">We couldn't load your enrolled courses. Please check your connection.</p>
            </div>
            <Button variant="outline" className="ml-auto" onClick={() => refetchCourses()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto mt-20 max-w-7xl space-y-8">
      {/* Top Banner Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Classroom</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back{userData?.user?.name ? `, ${userData.user.name}` : ''}! Ready to continue your coding journey?
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/">
            <Button variant="outline" size="sm">Platform Catalog</Button>
          </Link>
          <Button size="sm">Help & Support</Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className={userData?.user?.role === "student" ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : "block"}>
        
        {/* Enrolled Courses List */}
        <div className={userData?.user?.role === "student" ? "lg:col-span-2 space-y-6" : "space-y-6"}>
          {courses.length > 0 && (
            <div className="space-y-4 border-b border-border/50 pb-5">
              {/* Row 1: Title and Stats Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="font-bold text-xl text-foreground">Your Enrolled Courses</h2>
                
                {/* Stats Summary Row (Compact inline list) */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 border border-border rounded-lg text-xs font-semibold text-foreground">
                    <span>{courses.length}</span>
                    <span className="text-muted-foreground text-[10px] font-normal">Total</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 border border-border rounded-lg text-xs font-semibold text-green-500">
                    <span>{courses.filter(c => c.progress === 100).length}</span>
                    <span className="text-muted-foreground text-[10px] font-normal">Done</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-muted/50 border border-border rounded-lg text-xs font-semibold text-[#E8602E]">
                    <span>{courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length) : 0}%</span>
                    <span className="text-muted-foreground text-[10px] font-normal">Avg Progress</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Search, Sort, Tabs filter */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search courses..."
                    className="pl-9 h-9 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                    className="text-xs h-9 gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                  </Button>

                  <Tabs defaultValue="all" className="w-auto shrink-0" onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 h-9 p-0.5 bg-muted">
                      <TabsTrigger value="all" className="text-xs px-2.5 h-8">All</TabsTrigger>
                      <TabsTrigger value="in-progress" className="text-xs px-2.5 h-8">Active</TabsTrigger>
                      <TabsTrigger value="completed" className="text-xs px-2.5 h-8">Done</TabsTrigger>
                      <TabsTrigger value="not-started" className="text-xs px-2.5 h-8">New</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          )}

          {courses.length === 0 ? (
            <EmptyState />
          ) : filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              <p className="text-sm">No courses match your search or filters.</p>
              <Button variant="link" size="sm" onClick={() => {setSearchQuery(''); setActiveTab('all');}}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden border border-border hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-5">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-44 h-28 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center relative group">
                      <img 
                        src={course.courseThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"} 
                        alt={course.courseTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {course.progress === 100 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Mid Details */}
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-snug hover:text-[#E8602E] transition-colors">
                          <Link to={`/course-progress/${course._id}`}>{course.courseTitle}</Link>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Bought on {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>

                      {/* Progress Line */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                          <span>Progress</span>
                          <span className="font-bold text-[#E8602E]">{Math.round(course.progress || 0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#E8602E] to-[#f0845a] rounded-full transition-all duration-500"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right button */}
                    <div className="shrink-0 w-full sm:w-auto">
                      <Link to={`/course-progress/${course._id}`}>
                        <Button className="w-full sm:w-auto px-5 py-2.5 font-semibold text-sm">
                          Resume Learning
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Widgets Panel (Right 1/3 column) - Only for Students */}
        {userData?.user?.role === "student" && (
          <div className="space-y-6">
            
  
            {/* Progress Heatmap Card */}
            <Card className="border border-border shadow-sm bg-card text-card-foreground relative-heatmap-card relative">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">
                  Progress Heatmap
                </CardTitle>
                <div className="flex gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHeatmapOffset(1)}
                    disabled={heatmapOffset === 1}
                    className="bg-muted hover:bg-muted/80 disabled:opacity-40 text-muted-foreground hover:text-foreground text-xs px-3.5 py-1 h-7 rounded-full transition-colors shrink-0"
                  >
                    Prev
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setHeatmapOffset(0)}
                    disabled={heatmapOffset === 0}
                    className="bg-muted hover:bg-muted/80 disabled:opacity-40 text-muted-foreground hover:text-foreground text-xs px-3.5 py-1 h-7 rounded-full transition-colors shrink-0"
                  >
                    Next
                  </Button>
                </div>
              </div>
              <CardDescription className="text-xs text-primary font-semibold mt-1">
                Crushed {totalActivities} activities so far!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 p-4 space-y-4">
              {/* Heatmap Grid Container (uses theme-aware colors) */}
              <div className="bg-muted/30 border border-border rounded-xl p-6 shadow-sm">
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin select-none max-w-full justify-between">
                  {heatmapWeeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1 shrink-0">
                      {week.map((day, dayIdx) => {
                        if (day.placeholder) {
                          return (
                            <div
                              key={dayIdx}
                              className="w-3.5 h-3.5 rounded-[3px] bg-transparent pointer-events-none"
                            />
                          );
                        }
                        const colors = [
                          "bg-neutral-300 dark:bg-neutral-800 border border-neutral-400/25 dark:border-neutral-700/50", // level 0 (empty)
                          "bg-orange-200 dark:bg-orange-950/80 border border-orange-300 dark:border-orange-900", // level 1
                          "bg-orange-400 dark:bg-orange-700 border border-orange-500 dark:border-orange-600", // level 2
                          "bg-orange-600 dark:bg-orange-550 border border-orange-700 dark:border-orange-400", // level 3
                          "bg-orange-800 dark:bg-orange-400 border border-orange-950 dark:border-orange-300", // level 4
                        ];
                        return (
                          <div
                            key={dayIdx}
                            className={`w-3.5 h-3.5 rounded-[3px] transition-colors duration-200 cursor-pointer ${colors[day.level]}`}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const container = e.currentTarget.closest('.relative-heatmap-card');
                              if (container) {
                                const parentRect = container.getBoundingClientRect();
                                setHoveredDay({
                                  date: day.date,
                                  level: day.level,
                                  x: rect.left - parentRect.left + (rect.width / 2),
                                  y: rect.top - parentRect.top - 36 // 36px offset above
                                });
                              }
                            }}
                            onMouseLeave={() => setHoveredDay(null)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend & Count Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 select-none">
                <span className="text-foreground hover:underline cursor-pointer transition-colors font-medium">
                  Learn how we count activities
                </span>
                
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded-[2px] bg-neutral-300 dark:bg-neutral-800 border border-neutral-400/25 dark:border-neutral-700/50" />
                  <div className="w-3 h-3 rounded-[2px] bg-orange-200 dark:bg-orange-950/80 border border-orange-300 dark:border-orange-900" />
                  <div className="w-3 h-3 rounded-[2px] bg-orange-400 dark:bg-orange-700 border border-orange-500 dark:border-orange-600" />
                  <div className="w-3 h-3 rounded-[2px] bg-orange-600 dark:bg-orange-550 border border-orange-700 dark:border-orange-400" />
                  <div className="w-3 h-3 rounded-[2px] bg-orange-800 dark:bg-orange-400 border border-orange-950 dark:border-orange-300" />
                  <span>More</span>
                </div>
              </div>

              {/* Leaderboard Link */}
              <div className="text-right border-t border-border/40 pt-3">
                <Link to="/leaderboard" className="text-xs text-primary font-semibold hover:underline flex items-center justify-end gap-1">
                  View Leaderboard &rarr;
                </Link>
              </div>
            </CardContent>

            {/* Custom Tooltip */}
            {hoveredDay && (
              <div 
                className="absolute bg-neutral-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-lg pointer-events-none z-50 whitespace-nowrap border border-neutral-800 transition-opacity duration-150"
                style={{
                  left: `${hoveredDay.x}px`,
                  top: `${hoveredDay.y}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                {new Date(hoveredDay.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                {hoveredDay.level > 0 ? ` (${hoveredDay.level} active)` : ' (No activity)'}
              </div>
            )}
          </Card>
  
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearning;