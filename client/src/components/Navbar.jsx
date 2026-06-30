import LogoLight from '../assets/logo_light.png'; // Dark mode logo
import LogoDark from '../assets/logo_dark.png'; // Light mode logo
import { Button } from "@/components/ui/button";
import { Menu, LogOut, BookOpen, Trophy, LayoutDashboard, UserCheck, Flame, User as UserIcon, Home, Compass, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import CommandPalette from "./CommandPalette";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useLogoutUserMutation, useLoadUserQuery } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";

const Navbar = () => {
    const { user } = useSelector((store) => store.auth);
    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
    const { refetch: refetchUser } = useLoadUserQuery();
    const { refetch: refetchPurchasedCourses } = useGetPurchasedCoursesQuery();
    const navigate = useNavigate();
    const location = useLocation();

    const logoutHandler = async () => {
        await logoutUser();
    };

    const handleNavigation = (path) => {
        refetchUser();
        refetchPurchasedCourses();
        navigate(path);
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "User logged out.");
            navigate("/login");
        }
    }, [isSuccess]);

    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Global Cmd/Ctrl + K shortcut to open Command Palette
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Active state helper
    const isActive = (path) => location.pathname === path;

    return (
        <div className="h-16 bg-[#060606]/85 backdrop-blur-md border-b border-white/[0.05] fixed top-0 left-0 right-0 z-50 px-6 flex items-center">
            {/* Desktop Navbar */}
            <div className="items-center justify-between hidden w-full mx-auto md:flex max-w-7xl">
                {/* Logo */}
                <Link to="/" className="hover:opacity-90 transition-opacity">
                    <img
                        src={LogoDark}
                        alt="Mentora Logo"
                        className="h-10 object-contain block"
                    />
                </Link>

                {/* Primary Nav Links */}
                <div className="flex items-center gap-6">
                    <Link 
                        to="/" 
                        className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-white ${
                            isActive("/") ? "text-white" : "text-[#777]"
                        }`}
                    >
                        Home
                    </Link>
                    <Link 
                        to="/courses" 
                        className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-white flex items-center gap-1.5 ${
                            isActive("/courses") ? "text-white" : "text-[#777]"
                        }`}
                    >
                        <BookOpen className="w-3.5 h-3.5" /> Courses
                    </Link>

                    {user && (
                        <>
                            {user.role !== "admin" && (
                                <Link 
                                    to={user.role === "instructor" ? "/instructor/course" : "/my-learning"} 
                                    className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-white flex items-center gap-1.5 ${
                                        isActive("/my-learning") || isActive("/instructor/course") ? "text-white" : "text-[#777]"
                                    }`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" /> {user.role === "instructor" ? "My Courses" : "My Learning"}
                                </Link>
                            )}
                            {user.role === "instructor" && (
                                <Link 
                                    to="/courses?query=Instructor Guide" 
                                    className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-white flex items-center gap-1.5 ${
                                        location.search.includes("Instructor Guide") ? "text-white" : "text-[#777]"
                                    }`}
                                >
                                    <Compass className="w-3.5 h-3.5" /> Training Guides
                                </Link>
                            )}
                            {user.role === "student" && (
                                <Link 
                                    to="/leaderboard" 
                                    className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-white flex items-center gap-1.5 ${
                                        isActive("/leaderboard") ? "text-white" : "text-[#777]"
                                    }`}
                                >
                                    <Trophy className="w-3.5 h-3.5 text-[#E8602E]" /> Leaderboard
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* User Info & Profile Actions */}
                <div className="flex items-center gap-4">
                    {/* Search Trigger Button */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="flex items-center gap-2 px-3.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl text-[#555] hover:text-[#bbb] transition-all text-xs h-9 w-40"
                    >
                        <Search className="w-3.5 h-3.5 text-[#E8602E]" />
                        <span className="flex-1 text-left font-bold select-none">Search...</span>
                        <span className="bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded font-mono text-[8px] font-bold select-none text-[#555]">Ctrl K</span>
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            {/* Streak badge */}
                            {user?.role === "student" && user?.streak > 0 && (
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-[#E8602E]/10 border border-[#E8602E]/20 rounded-xl text-[#E8602E] font-black text-xs shadow-md shadow-[#E8602E]/2 animate-pulse">
                                    <Flame className="w-3.5 h-3.5 fill-[#E8602E]" />
                                    <span>{user.streak} Days</span>
                                </div>
                            )}

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex items-center gap-2 cursor-pointer select-none">
                                        <Avatar className="w-9 h-9 hover:scale-105 transition-transform duration-200 ring-2 ring-[#E8602E] ring-offset-2 ring-offset-[#060606] cursor-pointer">
                                            <AvatarImage
                                                src={
                                                    user?.photoUrl ||
                                                    (user?.role === "admin"
                                                        ? "https://github.com/shadcn.png" 
                                                        : user?.role === "instructor"
                                                            ? "https://cdn-icons-png.flaticon.com/128/3135/3135715.png" 
                                                            : "https://cdn-icons-png.flaticon.com/128/1945/1945977.png")
                                                }
                                                alt="@user"
                                            />
                                            <AvatarFallback className="bg-[#141414] text-[#E8602E] font-bold">
                                                {user?.name?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </DropdownMenuTrigger>
                                
                                <DropdownMenuContent className="bg-[#0c0c0c] border border-white/[0.08] text-white rounded-xl shadow-xl p-1.5 w-56 mt-2">
                                    <DropdownMenuLabel className="px-2.5 py-2 text-xs font-bold text-[#555] uppercase tracking-wider">
                                        My Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/[0.05]" />
                                    <DropdownMenuGroup className="space-y-0.5">
                                         {user?.role !== "admin" && (
                                             <DropdownMenuItem 
                                                 onClick={() => handleNavigation(user?.role === "instructor" ? "/instructor/course" : "/my-learning")}
                                                 className="px-2.5 py-2 text-xs font-semibold text-[#888] focus:text-white focus:bg-white/[0.05] rounded-lg cursor-pointer flex items-center gap-2"
                                             >
                                                 <BookOpen className="w-3.5 h-3.5" />
                                                 {user?.role === "instructor" ? "My Courses" : "My Learning"}
                                             </DropdownMenuItem>
                                         )}
                                        <DropdownMenuItem 
                                            onClick={() => handleNavigation("/profile")}
                                            className="px-2.5 py-2 text-xs font-semibold text-[#888] focus:text-white focus:bg-white/[0.05] rounded-lg cursor-pointer flex items-center gap-2"
                                        >
                                            <UserIcon className="w-3.5 h-3.5" />
                                            Edit Profile
                                        </DropdownMenuItem>
                                        {user?.role === "student" && (
                                            <DropdownMenuItem 
                                                onClick={() => handleNavigation("/leaderboard")}
                                                className="px-2.5 py-2 text-xs font-semibold text-[#888] focus:text-white focus:bg-white/[0.05] rounded-lg cursor-pointer flex items-center gap-2"
                                            >
                                                <Trophy className="w-3.5 h-3.5" />
                                                Leaderboard
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem 
                                            onClick={() => handleNavigation("/")}
                                            className="px-2.5 py-2 text-xs font-semibold text-[#888] focus:text-white focus:bg-white/[0.05] rounded-lg cursor-pointer flex items-center gap-2"
                                        >
                                            <Home className="w-3.5 h-3.5" />
                                            Home Page
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    
                                    {/* Dashboard Portals */}
                                    {user?.role === "instructor" && (
                                        <>
                                            <DropdownMenuSeparator className="bg-white/[0.05]" />
                                            <DropdownMenuItem className="p-1 focus:bg-transparent">
                                                <Button 
                                                    onClick={() => handleNavigation("/instructor/dashboard")} 
                                                    className="w-full text-xs font-bold bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-lg h-8 flex items-center justify-center gap-1.5"
                                                >
                                                    <LayoutDashboard className="w-3.5 h-3.5" />
                                                    Instructor Portal
                                                </Button>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {user?.role === "admin" && (
                                        <>
                                            <DropdownMenuSeparator className="bg-white/[0.05]" />
                                            <DropdownMenuItem className="p-1 focus:bg-transparent flex flex-col gap-1">
                                                <Button 
                                                    onClick={() => handleNavigation("/admin/dashboard")} 
                                                    className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 flex items-center justify-center gap-1.5"
                                                >
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    Admin Portal
                                                </Button>
                                                <Button 
                                                    onClick={() => handleNavigation("/instructor/dashboard")} 
                                                    className="w-full text-xs font-bold bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-lg h-8 flex items-center justify-center gap-1.5"
                                                >
                                                    <LayoutDashboard className="w-3.5 h-3.5" />
                                                    Instructor Portal
                                                </Button>
                                                <Button 
                                                    onClick={() => handleNavigation("/courses?query=Instructor Guide")} 
                                                    className="w-full text-xs font-bold bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-lg h-8 flex items-center justify-center gap-1.5"
                                                >
                                                    <Compass className="w-3.5 h-3.5" />
                                                    Guides Portal
                                                </Button>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuSeparator className="bg-white/[0.05]" />
                                    <DropdownMenuItem className="p-1 focus:bg-transparent">
                                        <Button 
                                            onClick={logoutHandler} 
                                            variant="ghost" 
                                            className="w-full text-xs font-bold border border-white/[0.05] text-[#888] hover:text-red-400 hover:bg-red-500/10 rounded-lg h-8 flex items-center justify-center gap-1.5"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            Log out
                                        </Button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                onClick={() => handleNavigation("/login?tab=login")}
                                className="text-xs font-bold text-[#888] hover:text-white hover:bg-white/[0.05] px-4 rounded-xl h-9"
                            >
                                Login
                            </Button>
                            <Button 
                                onClick={() => handleNavigation("/login?tab=signup")}
                                className="bg-[#E8602E] hover:bg-[#d4561f] text-white text-xs font-bold px-4 rounded-xl h-9"
                            >
                                Signup
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navbar */}
            <div className="flex items-center justify-between w-full md:hidden">
                <Link to="/" className="hover:opacity-90 transition-opacity">
                    <img
                        src={LogoDark}
                        alt="Mentora Logo"
                        className="w-auto h-9 object-contain"
                    />
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="rounded-xl border border-white/[0.05] bg-white/[0.01] text-[#888] hover:text-white w-9 h-9 flex items-center justify-center transition-all"
                    >
                        <Search className="w-4 h-4 text-[#E8602E]" />
                    </button>
                    <MobileNavbar user={user} isActive={isActive} logoutHandler={logoutHandler} handleNavigation={handleNavigation} />
                </div>
            </div>

            {/* Command Palette search overlays */}
            <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
};

export default Navbar;

const MobileNavbar = ({ user, isActive, logoutHandler, handleNavigation }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button 
                    size="icon" 
                    className="rounded-xl border-white/[0.05] bg-transparent text-[#888] hover:text-white hover:bg-white/[0.05] w-9 h-9"
                    variant="outline"
                >
                    <Menu className="w-5 h-5" />
                </Button>
            </SheetTrigger>

            <SheetContent className="flex flex-col gap-5 bg-[#060606] border-l border-white/[0.08] text-white">
                <SheetHeader className="mt-2 text-left">
                    <SheetTitle className="text-xl font-black text-white tracking-tight">
                        Mentora
                    </SheetTitle>
                </SheetHeader>

                <div className="w-full h-[1px] bg-white/[0.05]" />

                {/* Profile overview if logged in */}
                {user && (
                    <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                        <Avatar className="w-10 h-10 border border-[#E8602E]">
                            <AvatarImage
                                src={
                                    user?.photoUrl ||
                                    (user?.role === "admin"
                                        ? "https://github.com/shadcn.png" 
                                        : user?.role === "instructor"
                                            ? "https://cdn-icons-png.flaticon.com/128/3135/3135715.png" 
                                            : "https://cdn-icons-png.flaticon.com/128/1945/1945977.png")
                                }
                            />
                            <AvatarFallback className="bg-[#141414] text-[#E8602E] font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-[#444] font-bold uppercase tracking-wider">{user.role}</p>
                        </div>
                        {user?.role === "student" && user.streak > 0 && (
                            <span className="ml-auto text-[10px] font-bold text-[#E8602E] bg-[#E8602E]/10 px-2 py-1 rounded-lg">
                                🔥 {user.streak}d
                            </span>
                        )}
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-2 flex-1">
                    <SheetClose asChild>
                        <Button 
                            variant="ghost" 
                            className={`justify-start w-full text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-3 ${
                                isActive("/") ? "bg-white/[0.05] text-white" : "text-[#777] hover:text-white"
                            }`}
                            onClick={() => handleNavigation("/")}
                        >
                            <Home className="w-4 h-4 mr-2.5" /> Home Page
                        </Button>
                    </SheetClose>

                    <SheetClose asChild>
                        <Button 
                            variant="ghost" 
                            className={`justify-start w-full text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-3 ${
                                isActive("/courses") ? "bg-white/[0.05] text-white" : "text-[#777] hover:text-white"
                            }`}
                            onClick={() => handleNavigation("/courses")}
                        >
                            <BookOpen className="w-4 h-4 mr-2.5" /> All Courses
                        </Button>
                    </SheetClose>



                    {user ? (
                        <>
                            {user.role !== "admin" && (
                                <SheetClose asChild>
                                    <Button 
                                        variant="ghost" 
                                        className={`justify-start w-full text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-3 ${
                                            isActive("/my-learning") || isActive("/instructor/course") ? "bg-white/[0.05] text-white" : "text-[#777] hover:text-white"
                                        }`}
                                        onClick={() => handleNavigation(user.role === "instructor" ? "/instructor/course" : "/my-learning")}
                                    >
                                        <BookOpen className="w-4 h-4 mr-2.5" />
                                        {user.role === "instructor" ? "My Courses" : "My Learning"}
                                    </Button>
                                </SheetClose>
                            )}

                            {user.role === "instructor" && (
                                <SheetClose asChild>
                                    <Button 
                                        variant="ghost" 
                                        className={`justify-start w-full text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-3 ${
                                            location.search.includes("Instructor Guide") ? "bg-white/[0.05] text-white" : "text-[#777] hover:text-white"
                                        }`}
                                        onClick={() => handleNavigation("/courses?query=Instructor Guide")}
                                    >
                                        <Compass className="w-4 h-4 mr-2.5" /> Training Guides
                                    </Button>
                                </SheetClose>
                            )}

                            <SheetClose asChild>
                                <Button 
                                    variant="ghost" 
                                    className={`justify-start w-full text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-3 ${
                                        isActive("/profile") ? "bg-white/[0.05] text-white" : "text-[#777] hover:text-white"
                                    }`}
                                    onClick={() => handleNavigation("/profile")}
                                >
                                    <UserIcon className="w-4 h-4 mr-2.5" /> Edit Profile
                                </Button>
                            </SheetClose>

                            {user.role === "student" && (
                                <SheetClose asChild>
                                    <Button 
                                        variant="ghost" 
                                        className={`justify-start w-full text-xs font-bold uppercase tracking-wider rounded-xl h-10 px-3 ${
                                            isActive("/leaderboard") ? "bg-white/[0.05] text-white" : "text-[#777] hover:text-white"
                                        }`}
                                        onClick={() => handleNavigation("/leaderboard")}
                                    >
                                        <Trophy className="w-4 h-4 mr-2.5" /> Leaderboard
                                    </Button>
                                </SheetClose>
                            )}

                            {/* Logout Action */}
                            <div className="pt-4 mt-auto">
                                <Button 
                                    onClick={logoutHandler} 
                                    variant="destructive" 
                                    className="w-full text-xs font-bold h-10 rounded-xl flex items-center justify-center gap-1.5"
                                >
                                    <LogOut className="w-4 h-4" /> Log out
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2 pt-4">
                            <SheetClose asChild>
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleNavigation("/login?tab=login")}
                                    className="w-full text-xs font-bold h-10 rounded-xl border-white/[0.05] bg-transparent text-[#888] hover:text-white"
                                >
                                    Login
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button 
                                    onClick={() => handleNavigation("/login?tab=signup")}
                                    className="w-full text-xs font-bold h-10 rounded-xl bg-[#E8602E] hover:bg-[#d4561f]"
                                >
                                    Signup
                                </Button>
                            </SheetClose>
                        </div>
                    )}
                </nav>

                {/* Portal access dashboards at bottom */}
                {user?.role === "instructor" && (
                    <SheetFooter className="mt-auto pt-2">
                        <SheetClose asChild>
                            <Button 
                                onClick={() => handleNavigation("/instructor/dashboard")} 
                                className="w-full text-xs font-bold bg-[#E8602E] hover:bg-[#d4561f] h-10 rounded-xl flex items-center justify-center gap-1.5"
                            >
                                <LayoutDashboard className="w-4 h-4" /> Instructor Dashboard
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                )}

                {user?.role === "admin" && (
                    <SheetFooter className="mt-auto pt-2 flex flex-col gap-2">
                        <SheetClose asChild>
                            <Button 
                                onClick={() => handleNavigation("/admin/dashboard")} 
                                className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700 h-10 rounded-xl flex items-center justify-center gap-1.5"
                            >
                                <UserCheck className="w-4 h-4" /> Admin Dashboard
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                            <Button 
                                onClick={() => handleNavigation("/instructor/dashboard")} 
                                className="w-full text-xs font-bold bg-[#E8602E] hover:bg-[#d4561f] h-10 rounded-xl flex items-center justify-center gap-1.5"
                            >
                                <LayoutDashboard className="w-4 h-4" /> Instructor Dashboard
                            </Button>
                        </SheetClose>
                        <SheetClose asChild>
                            <Button 
                                onClick={() => handleNavigation("/courses?query=Instructor Guide")} 
                                className="w-full text-xs font-bold bg-[#E8602E] hover:bg-[#d4561f] h-10 rounded-xl flex items-center justify-center gap-1.5"
                            >
                                <Compass className="w-4 h-4" /> Guides Portal
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                )}

            </SheetContent>
        </Sheet>
    );
};
