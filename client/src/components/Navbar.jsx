import LogoLight from '../assets/logo_light.png'; // Dark mode logo
import LogoDark from '../assets/logo_dark.png'; // Light mode logo
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import React, { useEffect } from "react";
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
import DarkMode from "@/DarkMode";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useLogoutUserMutation, useLoadUserQuery } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { useGetPurchasedCoursesQuery } from "@/features/api/purchaseApi";

const Navbar = () => {
    // const user = true;
    const { user } = useSelector((store) => store.auth);
    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
    const { refetch: refetchUser } = useLoadUserQuery();
    const { refetch: refetchPurchasedCourses } = useGetPurchasedCoursesQuery();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const logoutHandler = async () => {
        await logoutUser();
    };

    // Function to handle navigation with refetching
    const handleNavigation = (path) => {
        // Refetch data before navigating
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

    return (
        <div className="h-16 dark:bg-[#0A0A0A] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 z-10 px-4 flex items-center">
            {/* Desktop Navbar */}
            <div className="items-center justify-between hidden w-full mx-auto md:flex max-w-7xl">
                {/* Logo */}
                <Link to="/">
                    <img
                        src={LogoLight}
                        alt="Mentora Logo Light"
                        className="h-12 dark:hidden"
                    />
                    <img
                        src={LogoDark}
                        alt="Mentora Logo Dark"
                        className="hidden h-12 dark:block"
                    />
                </Link>
                {/* User icons and dark mode icon  */}
                <div className="flex items-center gap-8">
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar>
                                    <AvatarImage
                                        src={
                                            user?.photoUrl ||
                                            (user?.role === "admin"
                                                ? "https://github.com/shadcn.png" // Default admin avatar
                                                : user?.role === "instructor"
                                                    ? "https://cdn-icons-png.flaticon.com/128/3135/3135715.png" // Default instructor avatar
                                                    : "https://cdn-icons-png.flaticon.com/128/1945/1945977.png") // Default student avatar
                                        }
                                        alt="@user"
                                    />
                                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>

                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => handleNavigation(user?.role === "instructor" ? "/instructor/course" : "/my-learning")}>
                                        {user?.role === "instructor" ? "My Courses" : "My Learning"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleNavigation("/profile")}>
                                        Edit Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleNavigation("/")}>
                                        Home Page
                                    </DropdownMenuItem>


                                </DropdownMenuGroup>
                                {user?.role === "instructor" && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem><Button onClick={() => handleNavigation("/instructor/dashboard")} className="w-full mt-auto">Instructor Dashboard</Button></DropdownMenuItem>
                                    </>
                                )}
                                {user?.role === "admin" && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem><Button onClick={() => handleNavigation("/admin/dashboard")} className="w-full mt-auto">Admin Dashboard</Button></DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem onClick={logoutHandler}>
                                    <Button variant="destructive" className="w-full mt-auto">Log out</Button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => handleNavigation("/login")}>
                                Login
                            </Button>
                            <Button onClick={() => handleNavigation("/login")}>Signup</Button>
                        </div>
                    )}
                    <DarkMode />
                </div>
            </div>
            {/* Mobile Navbar */}
            <div className="flex items-center justify-between w-full md:hidden">
                <Link to="/">
                    <img
                        src={LogoLight}
                        alt="Mentora Logo Light"
                        className="w-auto h-12 dark:hidden"
                    />
                    <img
                        src={LogoDark}
                        alt="Mentora Logo Dark"
                        className="hidden w-auto h-12 dark:block"
                    />
                </Link>
                <MobileNavbar user={user} />
            </div>

        </div>
    );
};


export default Navbar;

const MobileNavbar = ({ user }) => {
    const { user: authUser } = useSelector((store) => store.auth); // Get updated user state
    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
    const { refetch: refetchUser } = useLoadUserQuery();
    const { refetch: refetchPurchasedCourses } = useGetPurchasedCoursesQuery();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        await logoutUser();
    };

    // Function to handle navigation with refetching
    const handleNavigation = (path) => {
        // Refetch data before navigating
        refetchUser();
        refetchPurchasedCourses();
        navigate(path);
    };

    useEffect(() => {
        if (isSuccess) {
            toast.success(data?.message || "User logged out.");
            navigate("/login");
        }
    }, [isSuccess, navigate, data]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" className="rounded-full hover:bg-gray-200" variant="outline">
                    <Menu />
                </Button>
            </SheetTrigger>

            <SheetContent className="flex flex-col gap-4">
                {/* Header */}
                <SheetHeader className="flex items-center justify-between mt-2">
                    <SheetTitle>
                        <Link to="/" className="text-xl font-bold">Mentora</Link>
                    </SheetTitle>
                    <DarkMode />
                </SheetHeader>

                <Separator />

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-3 text-lg">
                    {authUser ? (
                        <>
                            <SheetClose asChild>
                                <Button variant="ghost" className="justify-start w-full p-0 hover:underline"
                                    onClick={() => handleNavigation(authUser.role === "instructor" ? "/instructor/course" : "/my-learning")}>
                                    {authUser.role === "instructor" ? "My Courses" : "My Learning"}
                                </Button>
                            </SheetClose>

                            <SheetClose asChild>
                                <Button variant="ghost" className="justify-start w-full p-0 hover:underline"
                                    onClick={() => handleNavigation("/profile")}>
                                    Edit Profile
                                </Button>
                            </SheetClose>

                            <SheetClose asChild>
                                <Button variant="ghost" className="justify-start w-full p-0 hover:underline"
                                    onClick={() => handleNavigation("/")}>
                                    Home Page
                                </Button>
                            </SheetClose>


                            {/* Logout Button */}
                            <Button onClick={logoutHandler} variant="destructive">
                                Log out
                            </Button>
                        </>
                    ) : (
                        <>
                            <SheetClose asChild>
                                <Button variant="outline" onClick={() => handleNavigation("/login")}>
                                    Login
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button onClick={() => handleNavigation("/login")}>Signup</Button>
                            </SheetClose>
                        </>
                    )}
                </nav>

                {/* Dashboard Buttons */}
                {authUser?.role === "instructor" && (
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button onClick={() => handleNavigation("/instructor/dashboard")} className="w-full">
                                Instructor Dashboard
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                )}

                {authUser?.role === "admin" && (
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button onClick={() => handleNavigation("/admin/dashboard")} className="w-full">
                                Admin Dashboard
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                )}
                <Separator />

            </SheetContent>
        </Sheet>
    );
};
