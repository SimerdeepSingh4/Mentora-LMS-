import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, LogOut } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Course from './Course'
import { useLoadUserQuery, useUpdateUserMutation, useLogoutUserMutation } from '@/features/api/authApi'
import { useGetPurchasedCoursesQuery } from '@/features/api/purchaseApi'
import { useGetCreatorCourseQuery } from '@/features/api/courseApi'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useRefetchOnFocus } from '@/hooks/useRefetchOnFocus'

const Profile = () => {
    const [name, setName] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const { data: userData, isLoading, refetch: refetchUser } = useLoadUserQuery();
    const { data: purchasedCourses, isLoading: purchasedCoursesLoading, refetch: refetchPurchasedCourses } = useGetPurchasedCoursesQuery();
    const [updateUser, { data: updateUserData, isLoading: updateUserIsLoading, isError, error, isSuccess }] = useUpdateUserMutation();
    const [logoutUser, { data: logoutUserData, isSuccess: logoutUserisSuccess }] = useLogoutUserMutation();
    const { data: instructorCourses, isLoading: instructorisLoading, refetch: refetchInstructorCourses } = useGetCreatorCourseQuery();

    // Use the custom hook to refetch data when the component comes into focus
    useRefetchOnFocus([refetchUser, refetchPurchasedCourses, refetchInstructorCourses]);

    const navigate = useNavigate();
    const user = userData?.user;

    const onChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) setProfilePhoto(file);
    }

    const logoutHandler = async () => {
        await logoutUser();
    };

    useEffect(() => {
        if (logoutUserisSuccess) {
            toast.success(logoutUserData?.message || "User logged out.");
            navigate("/login");
        }
    }, [logoutUserisSuccess, navigate, logoutUserData]);

    const updateUserHandler = async () => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("profilePhoto", profilePhoto);
        await updateUser(formData);
    };

    useEffect(() => {
        refetchUser();
    }, [refetchUser])

    useEffect(() => {
        if (isSuccess) {
            refetchUser();
            toast.success(userData.message || "Profile updated.")
        }
        if (isError) {
            toast.error(error.message || "Failed to update profile.")
        }
    }, [error, updateUserData, isSuccess, isError, refetchUser])

    if (isLoading || !userData) {
        return <ProfileSkeleton />;
    }

    // Helper function to get courses array
    const getCoursesArray = (data) => {
        if (Array.isArray(data)) {
            return data;
        }
        if (data?.courses && Array.isArray(data.courses)) {
            return data.courses;
        }
        return [];
    };

    return (
        <div className="max-w-4xl px-4 mx-auto my-24">
            <h1 className="text-2xl font-bold text-center md:text-left">PROFILE</h1>
            <div className="flex flex-col items-center gap-8 my-5 md:flex-row md:items-start">
                <div className="flex flex-col items-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Avatar className="w-24 h-24 mb-4 cursor-pointer md:h-32 md:w-32">
                                <AvatarImage
                                    src={
                                        user?.photoUrl ||
                                        (user?.role === "instructor"
                                            ? "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
                                            : "https://cdn-icons-png.flaticon.com/128/1945/1945977.png")
                                    }
                                    alt="@user"
                                />
                                <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                            </Avatar>
                        </DialogTrigger>
                        <DialogContent className="p-0 bg-transparent border-none shadow-none">
                            <img
                                src={
                                    user?.photoUrl ||
                                    (user?.role === "instructor"
                                        ? "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"
                                        : "https://cdn-icons-png.flaticon.com/128/1945/1945977.png")
                                }
                                alt="Profile"
                                className="rounded-lg"
                            />
                        </DialogContent>
                    </Dialog>
                </div>
                <div>
                    <div className='mb-2'>
                        <h2 className='font-semibold text-gray-900 dark:text-gray-100'>
                            Name: <span className='ml-2 font-normal text-gray-700 dark:text-gray-300'>{user.name}</span>
                        </h2>
                    </div>
                    <div className='mb-2'>
                        <h2 className='font-semibold text-gray-900 dark:text-gray-100'>
                            Email: <span className='ml-2 font-normal text-gray-700 dark:text-gray-300'>{user.email}</span>
                        </h2>
                    </div>
                    <div className='mb-2'>
                        <h2 className='font-semibold text-gray-900 dark:text-gray-100'>
                            Role: <span className='ml-2 font-normal text-gray-700 dark:text-gray-300'>{user?.role?.toUpperCase() || "User"}</span>
                        </h2>
                    </div>
                    <div className='flex gap-3 mt-3'>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size='sm'>Edit Profile</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>Update your details below.</DialogDescription>
                                </DialogHeader>
                                <div className='grid gap-4 py-4'>
                                    <div className='grid items-center grid-cols-4 gap-4'>
                                        <Label>Name</Label>
                                        <Input type="text" value={name} placeholder="Name" onChange={(e) => setName(e.target.value)} className="col-span-3" />
                                    </div>
                                    <div className='grid items-center grid-cols-4 gap-4'>
                                        <Label>Profile Image</Label>
                                        <Input type="file" accept="image/*" onChange={onChangeHandler} className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button disabled={updateUserIsLoading} onClick={updateUserHandler}>
                                        {updateUserIsLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                                            </>
                                        ) : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant='outline' className='flex items-center gap-2' onClick={logoutHandler}>
                            <LogOut className='w-4 h-4' /> Logout
                        </Button>
                    </div>
                </div>
            </div>
            <div>
                {user?.role === "instructor" ? (
                    <>
                        <h1 className="text-lg font-medium">Courses you're teaching</h1>
                        <div className="grid grid-cols-1 gap-4 my-5 sm:grid-cols-2 md:grid-cols-3">
                            {instructorisLoading ? (
                                <h1 className="text-gray-500">Loading...</h1>
                            ) : !instructorCourses || !instructorCourses.courses || instructorCourses.courses.length === 0 ? (
                                <h1 className="text-gray-500">You haven't created any courses yet</h1>
                            ) : (
                                instructorCourses.courses
                                    .filter((course) => course.isPublished)
                                    .map((course) => <Course course={course} key={course._id}  />)
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className="text-lg font-medium">Courses you're enrolled in</h1>
                        <div className="grid grid-cols-1 gap-4 my-5 sm:grid-cols-2 md:grid-cols-3">
                            {purchasedCoursesLoading ? (
                                <h1 className="text-gray-500">Loading...</h1>
                            ) : getCoursesArray(purchasedCourses).length === 0 ? (
                                <h1 className="text-gray-500">You haven't enrolled in any courses yet</h1>
                            ) : (
                                getCoursesArray(purchasedCourses).map((course) => <Course course={course} key={course._id} />)
                            )}
                        </div>
                    </>
                )}

                {user?.role === "student" && (
                    <div className="flex flex-col items-center justify-between w-full gap-6 mt-6 md:flex-row md:items-start">
                        <div className="w-full p-6 bg-blue-100 rounded-lg dark:bg-gray-800 md:w-1/2">
                            <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100 md:text-left">
                                Want to Join as an Instructor?
                            </h2>
                            <p className="text-sm text-center text-gray-700 dark:text-gray-300 md:text-left">
                                Submit your details and get verified to become an instructor.
                            </p>
                            <div className="flex justify-center md:justify-start">
                                <Button
                                    className="mt-3"
                                    onClick={() => navigate("/become-instructor")}
                                >
                                    Apply Now
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

const ProfileSkeleton = () => (
    <div className="max-w-4xl px-4 mx-auto my-24 animate-pulse">
        <div className="w-32 h-6 mb-4 bg-gray-300 rounded"></div>
        <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="w-24 h-24 bg-gray-300 rounded-full md:w-32 md:h-32"></div>
            <div className="flex flex-col w-full max-w-sm gap-2">
                <div className="w-48 h-4 bg-gray-300 rounded"></div>
                <div className="w-64 h-4 bg-gray-300 rounded"></div>
                <div className="w-40 h-4 bg-gray-300 rounded"></div>
                <div className="w-24 h-8 bg-gray-300 rounded"></div>
            </div>
        </div>
        <div className="mt-6">
            <div className="w-48 h-6 mb-4 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className="h-40 bg-gray-300 rounded-lg dark:bg-gray-700 animate-pulse"
                    ></div>
                ))}
            </div>
        </div>
    </div>
);