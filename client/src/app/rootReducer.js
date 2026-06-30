import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { adminApi } from "@/features/api/adminApi";
import { instructorApplicationApi } from "@/features/api/instructorApplicationApi";
import { aiApi } from "@/features/api/aiApi";
import { leaderboardApi } from "@/features/api/leaderboardApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [courseApi.reducerPath]:courseApi.reducer,
    [purchaseApi.reducerPath]:purchaseApi.reducer,
    [courseProgressApi.reducerPath]:courseProgressApi.reducer,
    [adminApi.reducerPath]:adminApi.reducer,
    [instructorApplicationApi.reducerPath]:instructorApplicationApi.reducer,
    [aiApi.reducerPath]:aiApi.reducer,
    [leaderboardApi.reducerPath]:leaderboardApi.reducer,
    auth:authReducer,
});
export default rootReducer;