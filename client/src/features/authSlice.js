import { createSlice } from "@reduxjs/toolkit";
import { invalidateDashboardCache } from "./api/courseApi";

const initialState ={
    user:null,
    isAuthenticated:false,
}

const authSlice=createSlice({
    name:"authSlice",
    initialState,
    reducers:{
        userLoggedIn:(state,action)=>{
            state.user=action.payload.user;
            state.isAuthenticated=true;
            // Store user ID in localStorage
            if (action.payload.user?._id) {
                localStorage.setItem('userId', action.payload.user._id);
            }
        },
        userLoggedOut:(state)=>{
            state.user=null;
            state.isAuthenticated=false;
            // Remove user ID from localStorage
            localStorage.removeItem('userId');
            // Invalidate dashboard cache when user logs out
            invalidateDashboardCache();
        }
    },
});

export const {userLoggedIn, userLoggedOut}=authSlice.actions;

export default authSlice.reducer;