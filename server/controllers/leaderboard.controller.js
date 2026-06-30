import { User } from "../models/user.model.js";

export const getLeaderboard = async (req, res) => {
    try {
        const userId = req.id;

        // Fetch top 10 users sorted by total XP descending
        const topUsers = await User.find({ role: "student" })
            .select("name photoUrl xp streak badges")
            .sort({ xp: -1 })
            .limit(10);

        // Find the ranking of the calling user
        // We will sort all students to find the exact rank
        const allStudents = await User.find({ role: "student" })
            .select("_id xp")
            .sort({ xp: -1 });

        const userRank = allStudents.findIndex(student => student._id.toString() === userId.toString()) + 1;
        const currentUserStats = await User.findById(userId).select("name photoUrl xp streak badges");

        // Format user badges count
        const formattedTopUsers = topUsers.map((user, idx) => ({
            rank: idx + 1,
            _id: user._id,
            name: user.name,
            photoUrl: user.photoUrl,
            xp: user.xp || 0,
            streak: user.streak || 0,
            badgesCount: user.badges ? user.badges.length : 0,
            badges: user.badges || []
        }));

        return res.status(200).json({
            success: true,
            data: {
                leaderboard: formattedTopUsers,
                currentUser: {
                    rank: userRank || -1,
                    _id: currentUserStats?._id,
                    name: currentUserStats?.name,
                    photoUrl: currentUserStats?.photoUrl,
                    xp: currentUserStats?.xp || 0,
                    streak: currentUserStats?.streak || 0,
                    badgesCount: currentUserStats?.badges ? currentUserStats.badges.length : 0,
                    badges: currentUserStats?.badges || []
                }
            }
        });
    } catch (error) {
        console.error("Error in getLeaderboard:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch leaderboard details",
            error: error.message
        });
    }
};
