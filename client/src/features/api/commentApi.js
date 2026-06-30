import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const commentApi = createApi({
  reducerPath: "commentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/v1/comment",
    credentials: "include",
  }),
  tagTypes: ["Comments"],
  endpoints: (builder) => ({
    getLectureComments: builder.query({
      query: (lectureId) => `/${lectureId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: "Comments", id: _id })),
              { type: "Comments", id: "LIST" },
            ]
          : [{ type: "Comments", id: "LIST" }],
    }),
    createComment: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Comments", id: "LIST" }],
    }),
    replyToComment: builder.mutation({
      query: ({ commentId, text }) => ({
        url: `/reply/${commentId}`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comments", id: commentId },
        { type: "Comments", id: "LIST" },
      ],
    }),
    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Comments", id: "LIST" }],
    }),
    deleteReply: builder.mutation({
      query: ({ commentId, replyId }) => ({
        url: `/${commentId}/reply/${replyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Comments", id: commentId },
        { type: "Comments", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetLectureCommentsQuery,
  useCreateCommentMutation,
  useReplyToCommentMutation,
  useDeleteCommentMutation,
  useDeleteReplyMutation,
} = commentApi;
