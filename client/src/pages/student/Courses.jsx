import { Skeleton } from '@/components/ui/skeleton';
import React, { useState, useMemo, useEffect } from 'react';
import Course from './Course';
import { useGetPublishedCourseQuery } from '@/features/api/courseApi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowRight, BookOpen, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Courses = ({ limit }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data, isLoading, isError, error } = useGetPublishedCourseQuery();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');

    useEffect(() => {
        setSearchQuery(searchParams.get('query') || '');
    }, [searchParams]);

    const courses = useMemo(() => Array.isArray(data) ? data : [], [data]);

    const categories = useMemo(() => {
        const cats = new Set(courses.map(c => c.category || 'Uncategorized'));
        return ['All', ...Array.from(cats)];
    }, [courses]);

    const filteredCourses = useMemo(() => {
        let result = courses;
        if (activeCategory !== 'All') {
            result = courses.filter(c => (c.category || 'Uncategorized') === activeCategory);
        }
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter(c => 
                (c.courseTitle || '').toLowerCase().includes(q) ||
                (c.subTitle || '').toLowerCase().includes(q) ||
                (c.category || '').toLowerCase().includes(q)
            );
        }
        return limit ? result.slice(0, limit) : result;
    }, [courses, activeCategory, searchQuery, limit]);

    if (isLoading) return <CoursesLoadingSkeleton />;

    if (isError) {
        return (
<section className="py-20 bg-[#060606]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="p-8 text-center bg-red-500/5 border border-red-500/15 rounded-2xl">
                        <p className="text-red-400 font-semibold">Failed to load courses.</p>
                        <p className="text-sm text-red-500/70 mt-1">{error?.data?.message || 'Please try again later.'}</p>
                    </div>
                </div>
            </section>
        );
    }

    if (courses.length === 0) {
        return (
<section className="py-20 bg-[#060606]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-[#333]" />
                    </div>
                    <p className="text-[#444] font-medium">No courses available yet. Check back soon!</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-[#060606]">
            <div className="max-w-7xl mx-auto px-6">

                {/* ── Section header ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-3 text-xs font-bold text-[#E8602E] bg-[#E8602E]/8 border border-[#E8602E]/20 rounded-full">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            {courses.length} Courses Available
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white">
                            Explore Our <span className="text-[#E8602E]">Courses</span>
                        </h2>
                        <p className="text-sm text-[#555] mt-2 max-w-sm">
                            Handcrafted by industry pros — updated for 2024 job requirements.
                        </p>
                    </div>

                    {limit ? (
                        <Button
                            onClick={() => navigate('/courses')}
                            variant="outline"
                            className="self-start md:self-auto flex items-center gap-2 border-[#222] text-[#666] hover:border-[#E8602E]/30 hover:text-[#E8602E] rounded-xl font-semibold text-sm transition-colors bg-transparent"
                        >
                            View All Courses <ArrowRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <div className="relative w-full md:w-80 shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by title, sub-title, or category..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    const newParams = new URLSearchParams(searchParams);
                                    if (e.target.value) {
                                        newParams.set('query', e.target.value);
                                    } else {
                                        newParams.delete('query');
                                    }
                                    setSearchParams(newParams);
                                }}
                                className="w-full pl-11 pr-10 py-2.5 bg-[#0f0f0f] border border-[#222] rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-[#E8602E]/40 focus:ring-1 focus:ring-[#E8602E]/40 transition-all shadow-md"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        const newParams = new URLSearchParams(searchParams);
                                        newParams.delete('query');
                                        setSearchParams(newParams);
                                    }}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Category filter pills ── */}
                {!limit && (
                    <div className="flex items-center gap-2 flex-wrap mb-8">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all duration-200 ${
                                    activeCategory === cat
                                        ? 'bg-[#E8602E] text-white border-[#E8602E]'
                                        : 'bg-transparent text-[#555] border-[#222] hover:border-[#E8602E]/30 hover:text-[#E8602E]'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                        {activeCategory !== 'All' && (
                            <span className="text-xs text-[#444] ml-1">
                                — {filteredCourses.length} result{filteredCourses.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                )}

                {/* ── Course grid ── */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCourses.map((course) => (
                            <Course key={course._id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="w-7 h-7 text-[#333]" />
                        </div>
                        <p className="text-zinc-500 text-sm font-medium mb-2">
                            {searchQuery 
                                ? `No courses found matching "${searchQuery}"`
                                : `No courses in "${activeCategory}" yet.`
                            }
                        </p>
                        {(activeCategory !== 'All' || searchQuery) && (
                            <button
                                onClick={() => {
                                    setActiveCategory('All');
                                    setSearchQuery('');
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.delete('query');
                                    setSearchParams(newParams);
                                }}
                                className="text-[#E8602E] text-sm font-bold hover:underline underline-offset-2"
                            >
                                Reset search & filters
                            </button>
                        )}
                    </div>
                )}

                {/* ── Bottom CTA if many courses ── */}
                {((limit && courses.length > limit) || (!limit && filteredCourses.length >= 4)) && (
                    <div className="mt-12 text-center">
                        <Button
                            onClick={() => navigate('/courses')}
                            className="px-10 py-3 h-auto bg-[#E8602E] text-white rounded-xl hover:bg-[#d4561f] font-bold text-sm shadow-lg shadow-[#E8602E]/20 transition hover:scale-[1.02]"
                        >
                            Browse All {courses.length} Courses <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Courses;

/* ── Loading skeleton ── */
const CourseSkeleton = () => (
    <div className="overflow-hidden bg-[#0c0c0c] border border-white/[0.05] rounded-2xl">
        <Skeleton className="w-full h-44 rounded-none bg-[#141414]" />
        <div className="p-5 space-y-3">
            <Skeleton className="w-3/4 h-4 rounded-lg bg-[#141414]" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-7 h-7 rounded-full bg-[#141414]" />
                    <Skeleton className="w-20 h-3 rounded-lg bg-[#141414]" />
                </div>
                <Skeleton className="w-16 h-5 rounded-full bg-[#141414]" />
            </div>
            <Skeleton className="w-1/4 h-5 rounded-lg bg-[#141414]" />
        </div>
    </div>
);

const CoursesLoadingSkeleton = () => (
    <section className="py-20 bg-[#060606]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10">
                <Skeleton className="h-5 w-40 rounded-full mb-3 bg-[#141414]" />
                <Skeleton className="h-9 w-64 rounded-xl mb-2 bg-[#141414]" />
                <Skeleton className="h-4 w-48 rounded-lg bg-[#141414]" />
            </div>
            <div className="flex gap-2 mb-8">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full bg-[#141414]" />)}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => <CourseSkeleton key={i} />)}
            </div>
        </div>
    </section>
);