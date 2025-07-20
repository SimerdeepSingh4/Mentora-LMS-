import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = "http://localhost:8080/api/v1";

export const instructorApplicationApi = createApi({
  reducerPath: "instructorApplicationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BASE_URL}/instructor-applications`,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createInstructorApplication: builder.mutation({
      query: (applicationData) => ({
        url: "/apply",
        method: "POST",
        body: applicationData,
      }),
    }),
  }),
});

export const { 
  useCreateInstructorApplicationMutation 
} = instructorApplicationApi;
