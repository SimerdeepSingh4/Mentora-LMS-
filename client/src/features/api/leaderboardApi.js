import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const LEADERBOARD_API = "http://localhost:8080/api/v1/leaderboard";

export const leaderboardApi = createApi({
    reducerPath: "leaderboardApi",
    baseQuery: fetchBaseQuery({
        baseUrl: LEADERBOARD_API,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getLeaderboard: builder.query({
            query: () => ({
                url: "/",
                method: "GET",
            }),
        }),
    }),
});

export const { useGetLeaderboardQuery } = leaderboardApi;
