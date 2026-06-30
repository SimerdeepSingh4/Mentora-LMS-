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
    <div className="flex min-h-screen bg-[#060606]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-white/[0.05] p-5 sticky top-0 h-screen bg-[#050505] shadow-2xl relative overflow-hidden">
        {/* Subtle mesh glow in sidebar */}
        <div className="absolute -top-40 -left-40 w-[300px] h-[300px] rounded-full bg-[#E8602E]/[0.03] blur-[100px] pointer-events-none" />
        
        <nav className="flex flex-col mt-20 space-y-4 relative z-10">
          <NavLink
            to="dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-gradient-to-r from-[#E8602E]/10 to-transparent border-l-2 border-[#E8602E] text-white shadow-[inset_0_0_20px_rgba(232,96,46,0.05)]" 
                  : "text-[#888] hover:bg-white/[0.02] hover:text-white"
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
              `flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-gradient-to-r from-[#E8602E]/10 to-transparent border-l-2 border-[#E8602E] text-white shadow-[inset_0_0_20px_rgba(232,96,46,0.05)]" 
                  : "text-[#888] hover:bg-white/[0.02] hover:text-white"
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
              `flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-gradient-to-r from-[#E8602E]/10 to-transparent border-l-2 border-[#E8602E] text-white shadow-[inset_0_0_20px_rgba(232,96,46,0.05)]" 
                  : "text-[#888] hover:bg-white/[0.02] hover:text-white"
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
              `flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? "bg-gradient-to-r from-[#E8602E]/10 to-transparent border-l-2 border-[#E8602E] text-white shadow-[inset_0_0_20px_rgba(232,96,46,0.05)]" 
                  : "text-[#888] hover:bg-white/[0.02] hover:text-white"
              }`
            }
            aria-label="Settings"
          >
            <Settings size={22} />
            <span>Settings</span>
          </NavLink>

          {/* Logout Button */}
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-3 p-3.5 mt-auto rounded-xl transition-all duration-300 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 hover:border-l-2 hover:border-red-500"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" /> Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto bg-[#060606] text-white">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminSidebar;
