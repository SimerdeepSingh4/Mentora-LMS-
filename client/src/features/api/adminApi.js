import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "http://localhost:8080/api/v1/admin",
        credentials: "include"
    }),
    tagTypes: ["Users", "Applications", "AdminStats"],
    endpoints: (builder) => ({
        getAdminStats: builder.query({
            query: () => ({
                url: "stats",
                method: "GET"
            }),
            providesTags: ["AdminStats"]
        }),
        getAllUsers: builder.query({
            query: (role) => ({
                url: `users${role ? `?role=${role}` : ''}`,
                method: "GET"
            }),
            providesTags: ["Users"]
        }),
        getUserDetails: builder.query({
            query: (userId) => ({
                url: `users/${userId}`,
                method: "GET"
            }),
            providesTags: (result, error, userId) => [{ type: "Users", id: userId }]
        }),
        updateUserRole: builder.mutation({
            query: ({ userId, role }) => ({
                url: `users/${userId}/role`,
                method: "PUT",
                body: { role }
            }),
            invalidatesTags: ["Users", "AdminStats"]
        }),
        getAllApplications: builder.query({
            query: (status) => ({
                url: `../instructor-applications${status ? `?status=${status}` : ''}`,
                method: "GET"
            }),
            providesTags: ["Applications"]
        }),
        getApplicationDetails: builder.query({
            query: (applicationId) => ({
                url: `../instructor-applications/${applicationId}`,
                method: "GET"
            }),
            providesTags: (result, error, applicationId) => [{ type: "Applications", id: applicationId }]
        }),
        updateApplicationStatus: builder.mutation({
            query: ({ applicationId, status }) => ({
                url: `../instructor-applications/${applicationId}/status`,
                method: "PUT",
                body: { status }
            }),
            invalidatesTags: ["Applications", "Users", "AdminStats"]
        }),
        resetRejectedApplication: builder.mutation({
            query: (applicationId) => ({
                url: `../instructor-applications/${applicationId}/reset`,
                method: "POST"
            }),
            invalidatesTags: ["Applications", "AdminStats"]
        })
    })
});

export const {
    useGetAdminStatsQuery,
    useGetAllUsersQuery,
    useGetUserDetailsQuery,
    useUpdateUserRoleMutation,
    useGetAllApplicationsQuery,
    useGetApplicationDetailsQuery,
    useUpdateApplicationStatusMutation,
    useResetRejectedApplicationMutation
} = adminApi;
