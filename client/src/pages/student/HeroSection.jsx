import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const searchHandler = (e) => {
        e.preventDefault();
        if (searchQuery.trim() !== "") {
            navigate(`/course/search?query=${searchQuery}`);
            setSearchQuery(""); // Clear input only after navigation
        }
    };

    return (
        <div className="relative px-6 py-20 text-center bg-[#06D6A0] dark:bg-[#928DAB]">
            <div className="max-w-3xl mx-auto">
                <h1 className="mb-4 text-5xl font-extrabold text-[#202020]">
                    Learn Skills That Matter
                </h1>
                <p className="mb-6 text-lg text-[#003366]">
                    Explore courses designed to boost your career and make you job-ready.
                </p>

                <form onSubmit={searchHandler} className="flex items-center max-w-lg mx-auto overflow-hidden bg-white rounded-full shadow-lg">
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Courses"
                        aria-label="Search Courses"
                        className="flex-grow px-6 py-3 text-gray-900 placeholder-gray-400 border-none focus-visible:ring-0 dark:placeholder-gray-500"
                    />
                    <Button
                        type="submit"
                        className="px-6 py-3 text-white bg-[#003366] rounded-r-full hover:bg-[#002A55] transition duration-200"
                    >
                        Search
                    </Button>
                </form>

                <Button
                    onClick={() => navigate(`/course/search`)}
                    className="mt-6 px-6 py-3 text-lg font-medium text-white bg-[#47907f] rounded-full shadow-md hover:bg-[#63a898] transition duration-200 dark:bg-[#2b562d] dark:hover:bg-[#0e3510]"
                >
                    Explore Courses
                </Button>
            </div>
        </div>
    );
};

export default HeroSection;
