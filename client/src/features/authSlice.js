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
        },
        userRewardsUpdated:(state, action)=>{
            if (state.user) {
                if (action.payload.newStreak !== undefined && action.payload.newStreak > 0) {
                    state.user.streak = action.payload.newStreak;
                }
                if (action.payload.newXp !== undefined && action.payload.newXp > 0) {
                    state.user.xp = action.payload.newXp;
                }
                if (action.payload.newlyUnlockedBadges && action.payload.newlyUnlockedBadges.length > 0) {
                    state.user.badges = [...(state.user.badges || []), ...action.payload.newlyUnlockedBadges];
                }
            }
        }
    },
});

export const {userLoggedIn, userLoggedOut, userRewardsUpdated}=authSlice.actions;

export default authSlice.reducer;