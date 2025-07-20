import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const courseApi = createApi({
    reducerPath: "courseApi",
    tagTypes: ["Refetch_Creator_Course", "Refetch_Lecture", "Refetch_Dashboard"],
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_SERVER_URL}/api/v1/course`,
        credentials: "include",
        prepareHeaders: (headers) => {
            headers.set('Accept', 'application/json');
            return headers;
        },
    }),
    endpoints: (builder) => ({
        createCourse: builder.mutation({
            query: ({ courseTitle, category }) => ({
                url: "",
                method: "POST",
                body: { courseTitle, category },
            }),
            invalidatesTags: ["Refetch_Creator_Course"],
        }),
        getSearchCourse: builder.query({
            query: ({ searchQuery, categories, sortByPrice }) => {
                // Build query string
                let queryString = `/search?query=${encodeURIComponent(searchQuery)}`

                // append categories
                if (categories && categories.length > 0) {
                    console.log("Sending categories to API:", categories);
                    categories.forEach(cat => {
                        if (cat && cat.trim() !== '') {
                            queryString += `&categories=${encodeURIComponent(cat)}`;
                        }
                    });
                }

                // Append sortByPrice if available
                if (sortByPrice) {
                    queryString += `&sortByPrice=${encodeURIComponent(sortByPrice)}`;
                }

                console.log("Final query string:", queryString);
                return {
                    url: queryString,
                    method: "GET",
                }
            }
        }),
        getPublishedCourse: builder.query({
            query: () => ({
                url: "/published-courses",
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                },
            }),
            transformResponse: (response) => {
                console.log("Published Courses Response:", response);
                if (!response) {
                    console.error("No response received from server");
                    return [];
                }
                if (!response.success) {
                    console.error("Error in published courses response:", response.message);
                    return [];
                }
                return response.courses || [];
            },
        }),
        getCreatorCourse: builder.query({
            query: () => ({
                url: "",
                method: "GET",
            }),
            providesTags: ["Refetch_Creator_Course"],
        }),
        editCourse: builder.mutation({
            query: ({ formData, courseId }) => ({
                url: `/${courseId}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Refetch_Creator_Course"],
        }),
        getCourseById: builder.query({
            query: (courseId) => ({
                url: `/${courseId}`,
                method: "GET",
            }),
        }),
        createLecture: builder.mutation({
            query: ({ lectureTitle, courseId }) => ({
                url: `/${courseId}/lecture`,
                method: "POST",
                body: { lectureTitle },
            }),
        }),
        getCourseLecture: builder.query({
            query: (courseId) => ({
                url: `/${courseId}/lecture`,
                method: "GET",
            }),
            providesTags: ["Refetch_Lecture"],
        }),
        editLecture: builder.mutation({
            query: ({
                lectureTitle,
                videoInfo,
                docInfo,
                isPreviewFree,
                courseId,
                lectureId,
            }) => ({
                url: `/${courseId}/lecture/${lectureId}`,
                method: "POST",
                body: { lectureTitle, videoInfo, docInfo, isPreviewFree },
            }),
        }),
        removeLecture: builder.mutation({
            query: (lectureId) => ({
                url: `/lecture/${lectureId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Refetch_Lecture"],
        }),
        getLectureById: builder.query({
            query: (lectureId) => ({
                url: `/lecture/${lectureId}`,
                method: "GET",
            }),
        }),
        publishCourse: builder.mutation({
            query: ({ courseId, query }) => ({
                url: `/${courseId}?publish=${query}`,
                method: "PATCH",
            }),
        }),
        deleteCourse: builder.mutation({
            query: (courseId) => ({
                url: `/${courseId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Refetch_Creator_Course"],
        }),
        getInstructorDashboardStats: builder.query({
            query: () => ({
                url: "/instructor/stats",
                method: "GET",
            }),
            providesTags: ["Refetch_Dashboard"],
            keepUnusedDataFor: 300,
        }),
    }),
});

export const {
    useCreateCourseMutation,
    useGetSearchCourseQuery,
    useGetPublishedCourseQuery,
    useGetCreatorCourseQuery,
    useEditCourseMutation,
    useGetCourseByIdQuery,
    useCreateLectureMutation,
    useGetCourseLectureQuery,
    useEditLectureMutation,
    useRemoveLectureMutation,
    useGetLectureByIdQuery,
    usePublishCourseMutation,
    useDeleteCourseMutation,
    useGetInstructorDashboardStatsQuery,
} = courseApi;

export const invalidateDashboardCache = () => {
    return courseApi.util.invalidateTags(["Refetch_Dashboard"]);
};