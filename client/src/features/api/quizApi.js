import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/api/v1/quiz",
    credentials: "include",
    prepareHeaders: (headers) => {
      // Get the user ID from localStorage or your auth state
      const userId = localStorage.getItem('userId');
      if (userId) {
        headers.set('X-User-ID', userId);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createQuiz: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
    }),
    getQuiz: builder.query({
      query: (quizId) => {
        // Remove any trailing characters after the ObjectId
        const cleanQuizId = quizId?.split(':')[0];
        console.log("getQuiz query with quizId:", quizId, "cleaned to:", cleanQuizId);
        return `/${cleanQuizId}`;
      },
      transformResponse: (response) => {
        console.log("getQuiz raw response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.log("getQuiz error response:", response);

        // If the error is because user has already attempted the quiz,
        // we want to treat it as a successful response with hasAttempted flag
        if (response.status === 400 && response.data?.message === "You have already attempted this quiz") {
          console.log("Quiz already attempted, transforming error to success response");
          const transformedResponse = {
            data: {
              hasAttempted: true,
              attempt: response.data.data?.attempt
            }
          };
          console.log("Transformed response:", transformedResponse);
          return transformedResponse;
        }
        return response;
      }
    }),
    submitQuiz: builder.mutation({
      query: ({ quizId, data }) => {
        // Remove any trailing characters after the ObjectId
        const cleanQuizId = quizId?.split(':')[0];
        return {
          url: `/${cleanQuizId}/submit`,
          method: "POST",
          body: data,
        };
      },
      transformResponse: (response) => {
        if (response.success && response.data) {
          // Ensure all required fields are present and properly formatted
          const transformedData = {
            ...response.data,
            score: Number(response.data.score) || 0,
            correctAnswers: Number(response.data.correctAnswers) || 0,
            incorrectAnswers: Number(response.data.incorrectAnswers) || 0,
            totalQuestions: Number(response.data.totalQuestions) || 0,
            unattempted: Number(response.data.unattempted) || 0,
            timeTaken: Number(response.data.timeTaken) || 0
          };
          return {
            ...response,
            data: transformedData
          };
        }
        return response;
      }
    }),
    getQuizAttempts: builder.query({
      query: (quizId) => {
        // Remove any trailing characters after the ObjectId
        const cleanQuizId = quizId?.split(':')[0];
        console.log("getQuizAttempts query with quizId:", quizId, "cleaned to:", cleanQuizId);
        return `/${cleanQuizId}/attempts`;
      },
      transformResponse: (response) => {
        console.log("getQuizAttempts raw response:", response);

        if (response.success && response.data) {
          // Ensure each attempt has all required fields and they are properly formatted
          const transformedAttempts = response.data.map(attempt => ({
            ...attempt,
            score: Number(attempt.score) || 0,
            correctAnswers: Number(attempt.correctAnswers) || 0,
            incorrectAnswers: Number(attempt.incorrectAnswers) || 0,
            totalQuestions: Number(attempt.totalQuestions) || 0,
            timeTaken: Number(attempt.timeTaken) || 0,
            answers: attempt.answers || []
          }));

          console.log("getQuizAttempts transformed attempts:", transformedAttempts);

          return {
            ...response,
            data: transformedAttempts
          };
        }

        console.log("getQuizAttempts no data or not successful");
        return response;
      }
    }),
  }),
});

export const {
  useCreateQuizMutation,
  useGetQuizQuery,
  useSubmitQuizMutation,
  useGetQuizAttemptsQuery,
} = quizApi;