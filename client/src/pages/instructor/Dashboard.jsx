import { useGetInstructorDashboardStatsQuery } from "@/features/api/courseApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
    IndianRupee, 
    Users, 
    BookOpen, 
    TrendingUp, 
    Sparkles, 
    Star, 
    ShoppingBag, 
    ArrowUpRight,
    Loader2
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
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
        <div className="min-h-screen bg-[#060606] text-white pt-28 pb-16 px-6 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="space-y-2">
                    <div className="w-48 h-7 bg-white/[0.03] rounded-lg"></div>
                    <div className="w-80 h-4 bg-white/[0.02] rounded-md"></div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-[#0c0c0c] border border-white/[0.03] rounded-2xl p-5 space-y-3">
                            <div className="flex justify-between">
                                <div className="w-20 h-4 bg-white/[0.02] rounded"></div>
                                <div className="w-4 h-4 bg-white/[0.02] rounded"></div>
                            </div>
                            <div className="w-28 h-7 bg-white/[0.03] rounded-md"></div>
                        </div>
                    ))}
                </div>

                {/* Chart Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-[380px] bg-[#0c0c0c] border border-white/[0.03] rounded-2xl p-5">
                        <div className="w-32 h-5 bg-white/[0.03] rounded-md mb-6"></div>
                        <div className="w-full h-[280px] bg-white/[0.01] rounded-xl"></div>
                    </div>
                    <div className="lg:col-span-1 h-[380px] bg-[#0c0c0c] border border-white/[0.03] rounded-2xl p-5">
                        <div className="w-32 h-5 bg-white/[0.03] rounded-md mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-9 h-9 rounded-full bg-white/[0.02]" />
                                        <div className="space-y-1">
                                            <div className="w-16 h-3 bg-white/[0.02] rounded" />
                                            <div className="w-24 h-3 bg-white/[0.02] rounded" />
                                        </div>
                                    </div>
                                    <div className="w-10 h-4 bg-white/[0.02] rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const isMounted = useRef(false);

    const { data, isLoading, error, refetch } = useGetInstructorDashboardStatsQuery();

    // Refetch stats when the logged-in user changes
    useEffect(() => {
        if (isMounted.current) {
            if (user?._id) {
                refetch();
            }
        } else {
            isMounted.current = true;
        }
    }, [user?._id, refetch]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#060606] text-white flex items-center justify-center">
                <div className="text-center space-y-3">
                    <p className="text-sm font-bold text-red-500">Error loading dashboard stats</p>
                    <button 
                        onClick={() => refetch()} 
                        className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-bold rounded-xl transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const stats = data?.stats;

    if (!stats) {
        return (
            <div className="min-h-screen bg-[#060606] text-white flex items-center justify-center">
                <p className="text-sm font-bold text-white/40">No dashboard analytics available</p>
            </div>
        );
    }

    // Prepare data for the revenue chart
    const revenueData = stats.courseStats.map(course => ({
        name: course.title,
        revenue: course.revenue
    }));

    return (
        <div className="min-h-screen bg-[#060606] text-white pt-28 pb-16 px-6 md:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-6">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8602E]/8 border border-[#E8602E]/20 rounded-full text-[10px] font-bold text-[#E8602E] uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" />
                            <span>Creator Analytics</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white mt-1">Instructor Dashboard</h1>
                        <p className="text-xs text-white/45 font-medium">
                            Monitor course revenues, enrollment sales, student activity, and ratings.
                        </p>
                    </div>
                </div>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    
                    {/* Total Revenue */}
                    <div className="bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 flex flex-col justify-between h-28 hover:border-white/[0.1] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/45 uppercase tracking-widest">Total Revenue</span>
                            <IndianRupee className="w-4 h-4 text-[#E8602E]" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white">₹{stats.totalRevenue}</span>
                            <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 border border-green-500/15 px-1.5 py-0.2 rounded-md ml-2 inline-block">
                                +20.1%
                            </span>
                        </div>
                    </div>

                    {/* Total Students */}
                    <div className="bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 flex flex-col justify-between h-28 hover:border-white/[0.1] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/45 uppercase tracking-widest">Enrolled Students</span>
                            <Users className="w-4 h-4 text-[#E8602E]" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white">{stats.totalStudents}</span>
                            <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 border border-green-500/15 px-1.5 py-0.2 rounded-md ml-2 inline-block">
                                +180%
                            </span>
                        </div>
                    </div>

                    {/* Total Courses */}
                    <div className="bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 flex flex-col justify-between h-28 hover:border-white/[0.1] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/45 uppercase tracking-widest">Active Courses</span>
                            <BookOpen className="w-4 h-4 text-[#E8602E]" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white">{stats.totalCourses}</span>
                            <span className="text-[10px] font-semibold text-white/40 border border-white/[0.08] px-1.5 py-0.2 rounded-md ml-2 inline-block">
                                Live
                            </span>
                        </div>
                    </div>

                    {/* Total Sales */}
                    <div className="bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 flex flex-col justify-between h-28 hover:border-white/[0.1] transition-all">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/45 uppercase tracking-widest">Total Sales</span>
                            <TrendingUp className="w-4 h-4 text-[#E8602E]" />
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white">{stats.totalSales}</span>
                            <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 border border-green-500/15 px-1.5 py-0.2 rounded-md ml-2 inline-block">
                                +12%
                            </span>
                        </div>
                    </div>

                </div>

                {/* Graph & Activity Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Revenue Area Chart (2 Columns) */}
                    <div className="lg:col-span-2 bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 flex flex-col justify-between h-[380px]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Revenue by Course</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0 text-xs">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#E8602E" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#E8602E" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" tickLine={false} />
                                    <YAxis stroke="rgba(255, 255, 255, 0.3)" tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#141414', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#E8602E" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueColor)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Purchases Feed (1 Column) */}
                    <div className="lg:col-span-1 bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 h-[380px] flex flex-col">
                        <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest mb-5">Recent Purchases</h3>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {stats.recentPurchases.length > 0 ? (
                                stats.recentPurchases.map((purchase) => (
                                    <div key={purchase._id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.01] transition-all">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <Avatar className="w-8 h-8 border border-white/[0.06] shrink-0">
                                                <AvatarImage src={purchase.userId?.photoUrl || ''} />
                                                <AvatarFallback className="bg-white/[0.05] text-[10px] text-[#E8602E] font-bold">
                                                    {purchase.userId?.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white leading-tight truncate">
                                                    {purchase.userId?.name || 'Student'}
                                                </p>
                                                <p className="text-[10px] text-white/40 truncate mt-0.5 max-w-[130px]">
                                                    {purchase.courseId?.courseTitle || 'Course Purchased'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 pl-2">
                                            <p className="text-xs font-black text-[#E8602E]">₹{purchase.amount}</p>
                                            <p className="text-[9px] text-white/30 mt-0.5">
                                                {formatDate(purchase.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                                    <ShoppingBag className="w-8 h-8 text-white/10" />
                                    <p className="text-xs font-bold text-white/30">No purchases yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Course Performance Table (Full Width) */}
                <div className="bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 space-y-5">
                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Course Performance Metrics</h3>
                    <div className="space-y-3">
                        {stats.courseStats.map((course) => (
                            <div 
                                key={course.courseId} 
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/[0.01] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-all gap-4"
                            >
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <p className="text-xs font-extrabold text-white truncate tracking-tight">{course.title}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[9px] font-bold text-white/40 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.04] uppercase">
                                            {course.enrolledStudents} Students Enrolled
                                        </span>
                                        <span className="text-[9px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/15 uppercase">
                                            ₹{course.revenue} Revenue
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 justify-between sm:justify-end shrink-0">
                                    <div className="text-left sm:text-right">
                                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Sales</span>
                                        <span className="text-xs font-black text-white mt-0.5 block">{course.totalSales}</span>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block">Rating</span>
                                        <span className="text-xs font-black text-[#E8602E] mt-0.5 flex items-center gap-1">
                                            <Star className="w-3.5 h-3.5 fill-[#E8602E]" /> {course.rating}/5
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;