import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { adminApi } from "@/features/api/adminApi";
import { instructorApplicationApi } from "@/features/api/instructorApplicationApi";

const rootReducer = combineReducers({
    [authApi.reducerPath]:authApi.reducer,
    [courseApi.reducerPath]:courseApi.reducer,
    [purchaseApi.reducerPath]:purchaseApi.reducer,
    [courseProgressApi.reducerPath]:courseProgressApi.reducer,
    [adminApi.reducerPath]:adminApi.reducer,
    [instructorApplicationApi.reducerPath]:instructorApplicationApi.reducer,
    auth:authReducer,
});
export default rootReducer;