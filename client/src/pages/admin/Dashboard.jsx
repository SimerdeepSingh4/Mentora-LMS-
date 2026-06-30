import React from 'react';
import { useGetAdminStatsQuery } from '@/features/api/adminApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, GraduationCap, UserCog, User } from 'lucide-react';

const Dashboard = () => {
  const { data, isLoading, error } = useGetAdminStatsQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading dashboard data: {error.message}</p>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-8 relative">
      <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="h-6 w-6 text-[#E8602E]" />}
          className="group relative p-6 rounded-2xl bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] hover:border-[#E8602E]/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#E8602E]/5 overflow-hidden"
        />
        <StatCard
          title="Students"
          value={stats?.totalStudents || 0}
          icon={<User className="h-6 w-6 text-green-500" />}
          className="group relative p-6 rounded-2xl bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] hover:border-green-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/5 overflow-hidden"
        />
        <StatCard
          title="Instructors"
          value={stats?.totalInstructors || 0}
          icon={<GraduationCap className="h-6 w-6 text-amber-500" />}
          className="group relative p-6 rounded-2xl bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] hover:border-amber-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/5 overflow-hidden"
        />
        <StatCard
          title="Admins"
          value={stats?.totalAdmins || 0}
          icon={<UserCog className="h-6 w-6 text-purple-500" />}
          className="group relative p-6 rounded-2xl bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] hover:border-purple-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 overflow-hidden"
        />
      </div>

      {/* Recent Users */}
      <Card className="bg-[#0a0a0a]/50 backdrop-blur-md border border-white/[0.05] overflow-hidden">
        <CardHeader className="border-b border-white/[0.05] bg-white/[0.01]">
          <CardTitle className="text-lg font-black text-white">Recent Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {stats?.recentUsers?.map((user, i) => (
              <div key={user._id} className={`flex items-center gap-4 p-4 ${i !== (stats?.recentUsers?.length - 1) ? "border-b border-white/[0.05]" : ""} hover:bg-white/[0.02] transition-colors`}>
                <Avatar className="h-10 w-10 border border-white/[0.1]">
                  <AvatarImage
                    src={
                      user.photoUrl ||
                      (user.role === 'admin'
                        ? "https://github.com/shadcn.png"
                        : user.role === 'instructor'
                          ? "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
                          : "https://cdn-icons-png.flaticon.com/128/1945/1945977.png")
                    }
                  />
                  <AvatarFallback className="bg-[#111] text-white">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">{user.name}</h3>
                  <p className="text-xs text-[#888]">{user.email}</p>
                </div>
                <div className="text-xs">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                    user.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : user.role === 'instructor'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon, className }) => {
  return (
    <div className={className}>
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/[0.02] group-hover:to-transparent transition-all duration-500 rounded-2xl" />

      <div className="relative flex items-start justify-between mb-4">
        <div className="w-12 h-12 flex items-center justify-center bg-white/[0.04] rounded-xl border border-white/[0.08] group-hover:bg-white/[0.08] transition-colors">
          {icon}
        </div>
      </div>
      
      <p className="relative text-xs font-bold text-[#888] tracking-wide uppercase mb-1">{title}</p>
      <h3 className="relative text-4xl font-black text-white">{value}</h3>
    </div>
  );
};

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-48" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
