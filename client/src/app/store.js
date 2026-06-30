import { configureStore } from "@reduxjs/toolkit"
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { quizApi } from "@/features/api/quizApi";
import { adminApi } from "@/features/api/adminApi";
import { instructorApplicationApi } from "@/features/api/instructorApplicationApi";
import { aiApi } from "@/features/api/aiApi";
import { leaderboardApi } from "@/features/api/leaderboardApi";
import { commentApi } from "@/features/api/commentApi";
import authReducer from "@/features/authSlice";


export const appStore = configureStore({
    reducer: {
        auth: authReducer,
        [authApi.reducerPath]: authApi.reducer,
        [courseApi.reducerPath]: courseApi.reducer,
        [purchaseApi.reducerPath]: purchaseApi.reducer,
        [courseProgressApi.reducerPath]: courseProgressApi.reducer,
        [quizApi.reducerPath]: quizApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        [instructorApplicationApi.reducerPath]: instructorApplicationApi.reducer,
        [aiApi.reducerPath]: aiApi.reducer,
        [leaderboardApi.reducerPath]: leaderboardApi.reducer,
        [commentApi.reducerPath]: commentApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
        authApi.middleware,
        courseApi.middleware,
        purchaseApi.middleware,
        courseProgressApi.middleware,
        quizApi.middleware,
        adminApi.middleware,
        instructorApplicationApi.middleware,
        aiApi.middleware,
        leaderboardApi.middleware,
        commentApi.middleware
    )
});

const initializeApp = async () => {
    await appStore.dispatch(authApi.endpoints.loadUser.initiate({}, { forceRefetch: true }))
}
initializeApp();