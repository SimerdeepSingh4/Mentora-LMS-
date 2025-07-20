import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:8080/api/v1";

export const purchaseApi = createApi({
    reducerPath: "purchaseApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/purchase`,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        createCheckoutSession: builder.mutation({
            query: (courseId) => ({
                url: "/checkout/create-checkout-session",
                method: "POST",
                body: { courseId },
            }),
        }),
        getCourseDetailWithStatus: builder.query({
            query: (courseId) => ({
                url: `/course/${courseId}/detail-with-status`,
                method: "GET",
            }),
        }),
        getPurchasedCourses: builder.query({
            query: () => ({
                url: "/get-purchased-courses",
                method: "GET",
            }),
            transformResponse: (response) => {
                console.log("Raw Purchased Courses Response:", response);
                if (Array.isArray(response)) {
                    console.log("Response is already an array");
                    return response;
                }
                if (response?.success && Array.isArray(response.courses)) {
                    console.log("Extracting courses from response object");
                    return response.courses;
                }
                console.log("No valid courses found in response");
                return [];
            },
        }),
    }),
});

export const {
    useCreateCheckoutSessionMutation,
    useGetCourseDetailWithStatusQuery,
    useGetPurchasedCoursesQuery,
} = purchaseApi;