import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLogoutUserMutation } from '@/features/api/authApi';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  LogOut,
  Settings
} from 'lucide-react';

const AdminSidebar = () => {
  const [logoutUser, { isSuccess, data }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || 'Logged out successfully');
      navigate('/login');
    }
  }, [isSuccess, data, navigate]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-gray-200 dark:border-gray-800 p-5 sticky top-0 h-screen bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <nav className="flex flex-col mt-20 space-y-6">
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 ${
                isActive ? "bg-gray-300 dark:bg-gray-700 font-semibold border-l-4 border-blue-500 pl-5" : "pl-4"
              }`
            }
            aria-label="Dashboard"
          >
            <LayoutDashboard size={22} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="applications"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 ${
                isActive ? "bg-gray-300 dark:bg-gray-700 font-semibold border-l-4 border-blue-500 pl-5" : "pl-4"
              }`
            }
            aria-label="Instructor Applications"
          >
            <ClipboardCheck size={22} />
            <span>Applications</span>
          </NavLink>

          <NavLink
            to="users"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 ${
                isActive ? "bg-gray-300 dark:bg-gray-700 font-semibold border-l-4 border-blue-500 pl-5" : "pl-4"
              }`
            }
            aria-label="Users"
          >
            <Users size={22} />
            <span>Users</span>
          </NavLink>

          <NavLink
            to="settings"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-gray-300 dark:hover:bg-gray-700 ${
                isActive ? "bg-gray-300 dark:bg-gray-700 font-semibold border-l-4 border-blue-500 pl-5" : "pl-4"
              }`
            }
            aria-label="Settings"
          >
            <Settings size={22} />
            <span>Settings</span>
          </NavLink>

          {/* Logout Button */}
          <Button
            variant="destructive"
            className="flex items-center gap-3 p-3 mt-auto transition-all duration-300 hover:bg-red-600"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-900">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminSidebar;
