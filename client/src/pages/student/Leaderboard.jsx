import React from "react";
import { useGetLeaderboardQuery } from "@/features/api/leaderboardApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Flame, Award, ArrowUp, Star } from "lucide-react";
import { motion } from "framer-motion";

const Leaderboard = () => {
    const { data, isLoading, error } = useGetLeaderboardQuery();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="w-12 h-12 border-4 border-[#E8602E] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse">Calculating rankings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-destructive font-semibold">Failed to load leaderboard details. Please try again later.</p>
            </div>
        );
    }

    const leaderboard = data?.data?.leaderboard || [];
    const currentUser = data?.data?.currentUser || {};

    // Split top 3 and others
    const podiumUsers = [...leaderboard].slice(0, 3);
    const tableUsers = [...leaderboard].slice(3);

    // Reorder podium as: 2nd place, 1st place, 3rd place for visual appeal
    const reorderedPodium = [];
    if (podiumUsers[1]) reorderedPodium.push({ ...podiumUsers[1], position: 2 });
    if (podiumUsers[0]) reorderedPodium.push({ ...podiumUsers[0], position: 1 });
    if (podiumUsers[2]) reorderedPodium.push({ ...podiumUsers[2], position: 3 });

    const podiumColors = {
        1: {
            bg: "from-yellow-500/20 via-yellow-650/10 to-transparent",
            border: "border-yellow-500/50 dark:border-yellow-400/60 shadow-yellow-500/10",
            medal: "bg-yellow-500 text-slate-950",
            crown: "text-yellow-500",
            height: "h-44"
        },
        2: {
            bg: "from-slate-400/20 via-slate-500/10 to-transparent",
            border: "border-slate-400/50 dark:border-slate-350/65 shadow-slate-400/10",
            medal: "bg-slate-400 text-slate-950",
            crown: "text-slate-400",
            height: "h-36"
        },
        3: {
            bg: "from-amber-700/20 via-amber-700/10 to-transparent",
            border: "border-amber-700/50 dark:border-amber-600/60 shadow-amber-700/10",
            medal: "bg-amber-700 text-white",
            crown: "text-amber-700",
            height: "h-32"
        }
    };

    return (
        <div className="p-4 md:p-8 mx-auto max-w-5xl mt-16 space-y-8">
            {/* Header Title */}
            <div className="text-center space-y-2">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex p-3 bg-[#E8602E]/10 rounded-full text-[#E8602E]"
                >
                    <Trophy className="w-8 h-8" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Global Leaderboard</h1>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Learn daily, complete course modules, and ace quizzes to earn XP and rank among the top learners!
                </p>
            </div>

            {/* Top 3 Podium */}
            {podiumUsers.length > 0 && (
                <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-10 px-4 max-w-3xl mx-auto border-b border-border/50 pb-8">
                    {reorderedPodium.map((user) => {
                        const style = podiumColors[user.position];
                        const isSelf = user._id === currentUser._id;
                        return (
                            <motion.div
                                key={user._id}
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: user.position * 0.15 }}
                                className={`w-full md:w-48 flex flex-col items-center justify-end ${style.height} p-5 rounded-2xl border bg-gradient-to-t ${style.bg} ${style.border} relative shadow-lg ${isSelf ? "ring-2 ring-[#E8602E]" : ""}`}
                            >
                                {/* Position Crown / Medals */}
                                <div className="absolute -top-10 flex flex-col items-center gap-1">
                                    {user.position === 1 && (
                                        <motion.div
                                            animate={{ rotate: [0, -10, 10, 0] }}
                                            transition={{ repeat: Infinity, duration: 4 }}
                                        >
                                            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                        </motion.div>
                                    )}
                                    <div className={`w-8 h-8 rounded-full ${style.medal} flex items-center justify-center font-extrabold text-sm shadow-md`}>
                                        {user.position}
                                    </div>
                                </div>

                                <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                                    <AvatarImage src={user.photoUrl || ""} />
                                    <AvatarFallback className="bg-muted text-foreground font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="text-center mt-3 w-full">
                                    <p className="font-bold text-sm truncate text-foreground flex items-center justify-center gap-1">
                                        {user.name}
                                        {isSelf && <span className="text-[10px] bg-[#E8602E] text-white px-1.5 py-0.5 rounded-full">You</span>}
                                    </p>
                                    <div className="flex items-center justify-center gap-3 mt-1.5 text-xs">
                                        <span className="font-semibold text-[#E8602E] flex items-center gap-0.5">
                                            {user.xp} XP
                                        </span>
                                        {user.streak > 0 && (
                                            <span className="font-semibold text-[#E8602E]/80 flex items-center gap-0.5">
                                                🔥 {user.streak}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                                        <Award className="w-3.5 h-3.5 text-[#E8602E]/60" />
                                        <span>{user.badgesCount} badges</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Current User Stats Card */}
            {currentUser && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="border border-[#E8602E]/25 bg-[#E8602E]/5 shadow-md max-w-3xl mx-auto overflow-hidden">
                        <CardContent className="flex flex-col sm:flex-row items-center justify-between p-5 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#E8602E]/10 text-[#E8602E] font-extrabold rounded-full flex items-center justify-center shadow-inner">
                                    #{currentUser.rank || "-"}
                                </div>
                                <div>
                                    <p className="font-bold text-base text-foreground flex items-center gap-1.5">
                                        {currentUser.name}
                                        <span className="text-xs bg-[#E8602E] text-white px-2 py-0.5 rounded-full font-normal">Your Rank</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">Keep studying to increase your global rank!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total XP</p>
                                    <p className="font-extrabold text-[#E8602E] text-xl">{currentUser.xp || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Streak</p>
                                    <p className="font-extrabold text-[#E8602E]/80 text-xl flex items-center gap-1 justify-center">
                                        🔥 {currentUser.streak || 0}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Badges</p>
                                    <p className="font-extrabold text-foreground text-xl flex items-center gap-1 justify-center">
                                        🏅 {currentUser.badgesCount || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Rankings Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-3xl mx-auto rounded-xl border border-border bg-card overflow-hidden shadow-sm"
            >
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                    <h3 className="font-bold text-base text-foreground">Top Learners</h3>
                </div>
                {tableUsers.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16 text-center">Rank</TableHead>
                                <TableHead>Learner</TableHead>
                                <TableHead className="text-center">XP</TableHead>
                                <TableHead className="text-center">Daily Streak</TableHead>
                                <TableHead className="text-right pr-6">Badges</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableUsers.map((user) => {
                                const isSelf = user._id === currentUser._id;
                                return (
                                    <TableRow 
                                        key={user._id}
                                        className={`transition-colors duration-200 ${isSelf ? "bg-[#E8602E]/5 hover:bg-[#E8602E]/10 font-semibold" : "hover:bg-muted/50"}`}
                                    >
                                        <TableCell className="text-center font-bold text-muted-foreground">
                                            #{user.rank}
                                        </TableCell>
                                        <TableCell className="flex items-center gap-3 py-3">
                                            <Avatar className="w-9 h-9 border border-border">
                                                <AvatarImage src={user.photoUrl || ""} />
                                                <AvatarFallback className="bg-muted text-foreground font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate max-w-[150px] md:max-w-xs text-foreground">
                                                {user.name}
                                                {isSelf && <span className="ml-1.5 text-[9px] bg-[#E8602E] text-white px-1.5 py-0.5 rounded-full font-normal">You</span>}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-[#E8602E]">
                                            {user.xp}
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-[#E8602E]/80">
                                            {user.streak > 0 ? `🔥 ${user.streak}` : "-"}
                                        </TableCell>
                                        <TableCell className="text-right pr-6 text-xs text-muted-foreground">
                                            {user.badgesCount > 0 ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Award className="w-3.5 h-3.5 text-[#E8602E]/60" />
                                                    {user.badgesCount}
                                                </span>
                                            ) : "-"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    podiumUsers.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No learners are ranked yet. Be the first to earn XP!
                        </div>
                    )
                )}
            </motion.div>
        </div>
    );
};

export default Leaderboard;
