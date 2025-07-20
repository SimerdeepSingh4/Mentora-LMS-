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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="h-8 w-8 text-blue-500" />}
          className="bg-blue-50 dark:bg-blue-950"
        />
        <StatCard
          title="Students"
          value={stats?.totalStudents || 0}
          icon={<User className="h-8 w-8 text-green-500" />}
          className="bg-green-50 dark:bg-green-950"
        />
        <StatCard
          title="Instructors"
          value={stats?.totalInstructors || 0}
          icon={<GraduationCap className="h-8 w-8 text-amber-500" />}
          className="bg-amber-50 dark:bg-amber-950"
        />
        <StatCard
          title="Admins"
          value={stats?.totalAdmins || 0}
          icon={<UserCog className="h-8 w-8 text-purple-500" />}
          className="bg-purple-50 dark:bg-purple-950"
        />
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentUsers?.map((user) => (
              <div key={user._id} className="flex items-center gap-4 p-3 rounded-lg border">
                <Avatar>
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
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : user.role === 'instructor'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
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
    <Card className={className}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-white dark:bg-gray-800 shadow-sm">
          {icon}
        </div>
      </CardContent>
    </Card>
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
