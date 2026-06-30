import { toast } from "sonner";

export const showGamificationToast = (reward) => {
    if (!reward) return;
    
    // 1. Show XP gained
    if (reward.xpGained > 0) {
        toast.success(`+${reward.xpGained} XP Earned! 🧠`, {
            description: `Total XP: ${reward.newXp}`,
            duration: 4000
        });
    }
    
    // 2. Show Streak increase
    if (reward.newStreak > 0) {
        setTimeout(() => {
            toast(`Current Streak: ${reward.newStreak} Days! 🔥`, {
                description: "Keep learning tomorrow to maintain your streak!",
                duration: 4500
            });
        }, 1200);
    }
    
    // 3. Show Badges unlocked
    if (reward.newlyUnlockedBadges && reward.newlyUnlockedBadges.length > 0) {
        reward.newlyUnlockedBadges.forEach((badge, idx) => {
            setTimeout(() => {
                toast.success(`🏆 Badge Unlocked: ${badge.title}!`, {
                    description: `${badge.icon} ${badge.description}`,
                    duration: 7000,
                    style: {
                        border: '1px solid rgb(99 102 241)',
                        background: 'rgba(99, 102, 241, 0.05)'
                    }
                });
            }, 2400 + idx * 1800);
        });
    }
};
