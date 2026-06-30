import { User } from "../models/user.model.js";

const badgesToDefine = {
    STREAK_3: { title: "3-Day Learner", description: "Keep it up! Maintained a 3-day learning streak.", icon: "🔥" },
    STREAK_7: { title: "Week Warrior", description: "Excellent! Maintained a 7-day learning streak.", icon: "⚡" },
    STREAK_30: { title: "Habit Builder", description: "Incredible! Maintained a 30-day learning streak.", icon: "🏆" },
    XP_100: { title: "Fast Learner", description: "Reached 100 total Experience Points (XP).", icon: "🧠" },
    XP_500: { title: "Expert Scholar", description: "Reached 500 total Experience Points (XP).", icon: "🧙" },
    XP_1000: { title: "Super Brain", description: "Reached 1000 total Experience Points (XP).", icon: "🌌" },
    QUIZ_PERFECT: { title: "Perfect Score", description: "Got 100% correct answers on a quiz.", icon: "🎯" },
    COURSE_COMPLETE: { title: "Course Graduate", description: "Successfully finished all lectures in a course.", icon: "🎓" }
};

export const updateUserGamification = async (userId, actionType, actionMetadata = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error(`User ${userId} not found for gamification update`);
            return null;
        }

        if (user.role !== "student") {
            return null;
        }

        let xpGained = 0;
        
        // Define XP rewards
        switch (actionType) {
            case "LECTURE_COMPLETE":
                xpGained = 10;
                break;
            case "QUIZ_SUBMIT":
                xpGained = 20;
                // If they got perfect score, award +30 XP bonus
                if (actionMetadata.score === 100) {
                    xpGained += 30;
                }
                break;
            case "COURSE_COMPLETE":
                xpGained = 50;
                break;
            default:
                xpGained = 0;
        }

        user.xp = (user.xp || 0) + xpGained;

        // Daily active streak logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!user.lastActiveDate) {
            user.streak = 1;
            user.lastActiveDate = today;
        } else {
            const lastActive = new Date(user.lastActiveDate);
            lastActive.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - lastActive.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Next day consecutive activity
                user.streak = (user.streak || 0) + 1;
                user.lastActiveDate = today;
            } else if (diffDays > 1) {
                // Streak broken, reset
                user.streak = 1;
                user.lastActiveDate = today;
            }
            // If diffDays === 0, they already active today, streak remains same, lastActiveDate remains same.
        }

        const newlyUnlockedBadges = [];

        const unlockBadge = (badgeId) => {
            const hasBadge = user.badges.some(b => b.badgeId === badgeId);
            if (!hasBadge && badgesToDefine[badgeId]) {
                const newBadge = {
                    badgeId,
                    title: badgesToDefine[badgeId].title,
                    description: badgesToDefine[badgeId].description,
                    icon: badgesToDefine[badgeId].icon,
                    unlockedAt: new Date()
                };
                user.badges.push(newBadge);
                newlyUnlockedBadges.push(newBadge);
            }
        };

        // Evaluate streak badges
        if (user.streak >= 3) unlockBadge("STREAK_3");
        if (user.streak >= 7) unlockBadge("STREAK_7");
        if (user.streak >= 30) unlockBadge("STREAK_30");

        // Evaluate XP badges
        if (user.xp >= 100) unlockBadge("XP_100");
        if (user.xp >= 500) unlockBadge("XP_500");
        if (user.xp >= 1000) unlockBadge("XP_1000");

        // Evaluate action-specific badges
        if (actionType === "QUIZ_SUBMIT" && actionMetadata.score === 100) {
            unlockBadge("QUIZ_PERFECT");
        }
        if (actionType === "COURSE_COMPLETE") {
            unlockBadge("COURSE_COMPLETE");
        }

        await user.save();

        return {
            xpGained,
            newStreak: user.streak,
            newXp: user.xp,
            newlyUnlockedBadges
        };
    } catch (error) {
        console.error("Error updating user gamification:", error);
        return null;
    }
};
