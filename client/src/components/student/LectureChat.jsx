import React, { useState } from 'react';
import { 
    useGetLectureCommentsQuery, 
    useCreateCommentMutation, 
    useReplyToCommentMutation,
    useDeleteCommentMutation,
    useDeleteReplyMutation
} from "@/features/api/commentApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Reply, CornerDownRight, ShieldCheck, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const LectureChat = ({ courseId, lectureId, currentUser, courseCreatorId }) => {
    const { data: commentsResponse, isLoading, refetch } = useGetLectureCommentsQuery(lectureId, {
        skip: !lectureId,
    });
    const [createComment, { isLoading: isPostingComment }] = useCreateCommentMutation();
    const [replyToComment, { isLoading: isPostingReply }] = useReplyToCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();
    const [deleteReply] = useDeleteReplyMutation();

    const [newCommentText, setNewCommentText] = useState("");
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyText, setReplyText] = useState("");

    const comments = commentsResponse?.data || [];

    const canDelete = (authorId) => {
        if (!currentUser) return false;
        const isSender = authorId === currentUser._id;
        const isAdmin = currentUser.role === 'admin';
        const isCourseCreator = currentUser.role === 'instructor' && currentUser._id === courseCreatorId;
        return isSender || isAdmin || isCourseCreator;
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this doubt?")) return;
        try {
            await deleteComment(commentId).unwrap();
            refetch();
        } catch (error) {
            console.error("Failed to delete comment:", error);
            toast.error("Failed to delete comment. Please try again.");
        }
    };

    const handleDeleteReply = async (commentId, replyId) => {
        if (!window.confirm("Are you sure you want to delete this reply?")) return;
        try {
            await deleteReply({ commentId, replyId }).unwrap();
            refetch();
        } catch (error) {
            console.error("Failed to delete reply:", error);
            toast.error("Failed to delete reply. Please try again.");
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim()) return;

        try {
            await createComment({
                courseId,
                lectureId,
                text: newCommentText.trim()
            }).unwrap();
            setNewCommentText("");
            refetch();
        } catch (error) {
            console.error("Failed to post comment:", error);
            toast.error("Failed to post question. Please try again.");
        }
    };

    const handlePostReply = async (commentId) => {
        if (!replyText.trim()) return;

        try {
            await replyToComment({
                commentId,
                text: replyText.trim()
            }).unwrap();
            setReplyText("");
            setActiveReplyId(null);
            refetch();
        } catch (error) {
            console.error("Failed to post reply:", error);
            toast.error("Failed to add reply. Please try again.");
        }
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    // Helper to check if a user is an instructor/teacher
    const isTeacher = (user) => {
        return user?.role === 'instructor' || user?.role === 'admin';
    };

    return (
        <div className="space-y-6 text-white max-w-4xl mx-auto p-2">
            
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3 mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#E8602E]" />
                    <h3 className="text-base font-black tracking-tight">Class Discussion & Doubts</h3>
                </div>
                <span className="text-xs text-[#555] font-bold">
                    {comments.length} doubts posted
                </span>
            </div>

            {/* Post Doubt Form */}
            <form onSubmit={handlePostComment} className="space-y-3 bg-[#0a0a0a] border border-white/[0.05] p-4 rounded-2xl shadow-lg">
                <div className="flex items-start gap-3">
                    <Avatar className="w-9 h-9 border border-white/[0.06] shrink-0 mt-0.5">
                        <AvatarImage src={currentUser?.photoUrl} />
                        <AvatarFallback className="bg-[#141414] text-xs font-bold text-[#E8602E]">
                            {getInitials(currentUser?.name)}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                        <Textarea
                            placeholder="Ask a question or share a doubt about this lecture..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            className="w-full bg-[#0d0d0d] border-white/[0.05] focus:border-[#E8602E]/40 focus:ring-[#E8602E]/20 text-sm placeholder:text-[#444] rounded-xl min-h-[70px] resize-none"
                        />
                        <div className="flex justify-end">
                            <Button 
                                type="submit" 
                                disabled={isPostingComment || !newCommentText.trim()}
                                className="bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl text-xs h-9 font-bold px-4 flex items-center gap-2"
                            >
                                {isPostingComment ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                                Ask Question
                            </Button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments/Doubts List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E8602E]" />
                    <p className="text-xs text-[#555]">Loading discussions...</p>
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12 bg-[#0a0a0a]/50 border border-dashed border-white/[0.05] rounded-2xl">
                    <MessageSquare className="w-8 h-8 text-[#333] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#666]">No questions asked yet</p>
                    <p className="text-xs text-[#444] max-w-xs mx-auto mt-1">Be the first to post a doubt or initiate a discussion on this lecture!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => {
                        const commentUserIsTeacher = isTeacher(comment.user);
                        return (
                            <div key={comment._id} className="space-y-3">
                                
                                {/* Main Doubt Card */}
                                <div className={`p-4 rounded-2xl border transition-all duration-200 ${
                                    commentUserIsTeacher 
                                        ? 'bg-[#E8602E]/3 border-[#E8602E]/20 shadow-md shadow-[#E8602E]/1' 
                                        : 'bg-[#0a0a0a] border-white/[0.05]'
                                }`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <Avatar className="w-8 h-8 border border-white/[0.06]">
                                                <AvatarImage src={comment.user?.photoUrl} />
                                                <AvatarFallback className="bg-[#141414] text-[10px] font-bold text-[#E8602E]">
                                                    {getInitials(comment.user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-white leading-none">
                                                        {comment.user?.name || "Student"}
                                                    </span>
                                                    {commentUserIsTeacher && (
                                                        <span className="text-[9px] font-extrabold text-[#E8602E] bg-[#E8602E]/10 border border-[#E8602E]/25 px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5">
                                                            <ShieldCheck className="w-2.5 h-2.5" /> Instructor
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-[#444] font-medium block mt-0.5">
                                                    {formatTimeAgo(comment.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                                                className="h-7 text-[10px] text-[#666] hover:text-[#E8602E] hover:bg-[#E8602E]/5 rounded-lg font-bold flex items-center gap-1"
                                            >
                                                <Reply className="w-3 h-3" /> Reply
                                            </Button>
                                            
                                            {canDelete(comment.user?._id) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="w-7 h-7 text-[#555] hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center shrink-0"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Question Text */}
                                    <p className="text-sm mt-3 text-[#bbb] leading-relaxed whitespace-pre-wrap pl-0.5">
                                        {comment.text}
                                    </p>
                                </div>

                                {/* Replies Sub-List */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="pl-6 space-y-3">
                                        {comment.replies.map((reply) => {
                                            const replyUserIsTeacher = isTeacher(reply.user);
                                            return (
                                                <div 
                                                    key={reply._id} 
                                                    className={`p-3.5 rounded-xl border flex items-start gap-2.5 transition-all duration-200 ${
                                                        replyUserIsTeacher 
                                                            ? 'bg-[#E8602E]/2 border-[#E8602E]/15 shadow-[#E8602E]/0.5' 
                                                            : 'bg-[#0c0c0c] border-white/[0.04]'
                                                    }`}
                                                >
                                                    <CornerDownRight className="w-4 h-4 text-[#333] shrink-0 mt-0.5" />
                                                    
                                                    <Avatar className="w-7 h-7 border border-white/[0.06] shrink-0">
                                                        <AvatarImage src={reply.user?.photoUrl} />
                                                        <AvatarFallback className="bg-[#141414] text-[9px] font-bold text-[#E8602E]">
                                                            {getInitials(reply.user?.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-bold text-white leading-none">
                                                                {reply.user?.name || "User"}
                                                            </span>
                                                            {replyUserIsTeacher && (
                                                                <span className="text-[8px] font-extrabold text-[#E8602E] bg-[#E8602E]/10 border border-[#E8602E]/20 px-1 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5">
                                                                    <ShieldCheck className="w-2.5 h-2.5" /> Instructor
                                                                </span>
                                                            )}
                                                            <div className="flex items-center gap-2 ml-auto">
                                                                <span className="text-[9px] text-[#444] font-medium">
                                                                    {formatTimeAgo(reply.createdAt)}
                                                                </span>
                                                                {canDelete(reply.user?._id) && (
                                                                    <button
                                                                        onClick={() => handleDeleteReply(comment._id, reply._id)}
                                                                        className="text-[#444] hover:text-red-400 p-0.5 rounded transition-colors shrink-0"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-[#999] leading-relaxed mt-1">
                                                            {reply.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Inline Reply Input */}
                                {activeReplyId === comment._id && (
                                    <div className="pl-12 flex items-start gap-2">
                                        <Textarea
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="w-full bg-[#0d0d0d] border-white/[0.05] focus:border-[#E8602E]/40 text-xs placeholder:text-[#444] rounded-lg min-h-[50px] resize-none py-2"
                                        />
                                        <div className="flex flex-col gap-1.5 shrink-0">
                                            <Button
                                                onClick={() => handlePostReply(comment._id)}
                                                disabled={isPostingReply || !replyText.trim()}
                                                className="bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-lg text-[10px] h-8 px-3 font-bold"
                                            >
                                                Reply
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setActiveReplyId(null);
                                                    setReplyText("");
                                                }}
                                                className="text-[10px] text-[#555] hover:text-white h-8 rounded-lg"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
};
export default LectureChat;
