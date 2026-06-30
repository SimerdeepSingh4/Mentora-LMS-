import { Button } from "@/components/ui/button";
import { ChartNoAxesColumn, LogOut, SquareLibrary, Sparkles } from "lucide-react";
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogoutUserMutation } from "@/features/api/authApi";

const Sidebar = () => {
    const navigate = useNavigate();
    const [logoutUser] = useLogoutUserMutation();

    const handleLogout = async () => {
        try {
            await logoutUser().unwrap();
            toast.success("Logged out successfully.");
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to logout. Please try again.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#060606] text-white">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-[260px] flex-col border-r border-white/[0.05] pt-24 pb-6 px-6 sticky top-0 h-screen bg-[#090909] justify-between">
                    {/* Navigation list */}
                    <nav className="flex flex-col space-y-2">
                        <NavLink
                            to="dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all border text-xs font-bold tracking-wide ${
                                    isActive 
                                        ? "bg-[#E8602E]/8 border-[#E8602E]/20 text-[#E8602E]" 
                                        : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                                }`
                            }
                            aria-label="Dashboard"
                        >
                            <ChartNoAxesColumn className="w-4 h-4 shrink-0" />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="course"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all border text-xs font-bold tracking-wide ${
                                    isActive 
                                        ? "bg-[#E8602E]/8 border-[#E8602E]/20 text-[#E8602E]" 
                                        : "border-transparent text-white/40 hover:text-white/80 hover:bg-white/[0.02]"
                                }`
                            }
                            aria-label="Courses"
                        >
                            <SquareLibrary className="w-4 h-4 shrink-0" />
                            <span>Courses</span>
                        </NavLink>
                    </nav>

                {/* Logout Action at Bottom */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.04] bg-transparent text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/15 transition-all text-xs font-bold cursor-pointer"
                >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out</span>
                </button>
            </aside>

            {/* Main Content Pane */}
            <main className="flex-1 overflow-auto bg-[#060606] text-white">
                <Outlet />
            </main>
        </div>
    );
};

export default Sidebar;
