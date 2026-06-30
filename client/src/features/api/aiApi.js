import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const AI_API = "/api/v1/ai";

export const aiApi = createApi({
    reducerPath: "aiApi",
    baseQuery: fetchBaseQuery({
        baseUrl: AI_API,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        chatWithAI: builder.mutation({
            query: ({ courseId, lectureId, message, history }) => ({
                url: "/chat",
                method: "POST",
                body: { courseId, lectureId, message, history },
            }),
        }),
        generateAIQuiz: builder.mutation({
            query: ({ lectureId, courseId }) => ({
                url: "/generate-quiz",
                method: "POST",
                body: { lectureId, courseId },
            }),
        }),
    }),
});

export const { useChatWithAIMutation, useGenerateAIQuizMutation } = aiApi;
