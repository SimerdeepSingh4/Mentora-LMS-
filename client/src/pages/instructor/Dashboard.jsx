import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetInstructorDashboardStatsQuery } from "@/features/api/courseApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Users, BookOpen, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const DashboardSkeleton = () => {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-[200px]" />

            {/* Stats Overview Skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-[100px]" />
                            <Skeleton className="w-4 h-4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-[120px] mb-2" />
                            <Skeleton className="h-3 w-[80px]" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart Skeleton */}
            <Card className="col-span-2">
                <CardHeader>
                    <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <Skeleton className="w-full h-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Recent Purchases Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div>
                                        <Skeleton className="h-4 w-[100px] mb-1" />
                                        <Skeleton className="h-3 w-[150px]" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Skeleton className="h-4 w-[60px] mb-1" />
                                    <Skeleton className="h-3 w-[80px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Course Performance Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-[150px]" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-4 w-[120px] mb-1" />
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-5 w-[80px]" />
                                        <Skeleton className="h-5 w-[80px]" />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Skeleton className="h-4 w-[60px] mb-1" />
                                    <Skeleton className="h-3 w-[40px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
    const [showContent, setShowContent] = useState(false);

    const { data, isLoading, error, refetch } = useGetInstructorDashboardStatsQuery(undefined, {
        skip: isSwitchingAccount
    });

    // Handle account switching
    useEffect(() => {
        if (user) {
            setIsSwitchingAccount(true);
            setShowContent(false);
            // Clear the cache and refetch
            refetch()
                .then(() => {
                    setIsSwitchingAccount(false);
                    setShowContent(true);
                })
                .catch(() => {
                    setIsSwitchingAccount(false);
                    setShowContent(true);
                });
        }
    }, [user, refetch]);

    // Show loading state during account switch or initial load
    if (isLoading || isSwitchingAccount || !showContent) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-500">Error loading dashboard</div>
            </div>
        );
    }

    if (!data || !data.stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">No data available</div>
            </div>
        );
    }

    const { stats } = data;

    // Prepare data for the revenue chart
    const revenueData = stats.courseStats.map(course => ({
        name: course.title,
        revenue: course.revenue
    }));

    return (
        <div className="p-6 mt-5 space-y-6">
            <h1 className="text-3xl font-bold">Instructor Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCourses}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalSales}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Revenue by Course</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Purchases */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.recentPurchases.map((purchase) => (
                            <div key={purchase._id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Avatar>
                                        <AvatarImage src={purchase.userId?.photoUrl || ''} />
                                        <AvatarFallback>{purchase.userId?.name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{purchase.userId?.name || 'Unknown User'}</p>
                                        <p className="text-sm text-muted-foreground">{purchase.courseId?.courseTitle || 'Unknown Course'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">₹{purchase.amount}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(purchase.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Course Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.courseStats.map((course) => (
                            <div key={course.courseId} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{course.title}</p>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{course.enrolledStudents} students</Badge>
                                        <Badge variant="outline">₹{course.revenue} revenue</Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{course.totalSales} sales</p>
                                    <p className="text-xs text-muted-foreground">Rating: {course.rating}/5</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Dashboard;