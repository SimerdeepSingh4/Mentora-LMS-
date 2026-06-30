import React, { useState } from "react";
import { useCreateAnnouncementMutation, useGetAnnouncementsQuery, useDeleteAnnouncementMutation } from "@/features/api/courseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Megaphone, Trash2, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const AnnouncementTab = ({ courseId }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const { data: announcementData, isLoading: isAnnouncementsLoading } = useGetAnnouncementsQuery(courseId);
    const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
    const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error("Please fill in both title and content.");
            return;
        }

        try {
            await createAnnouncement({ courseId, title, content }).unwrap();
            toast.success("Announcement posted successfully!");
            setTitle("");
            setContent("");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to post announcement");
        }
    };

    const handleDeleteAnnouncement = async (announcementId) => {
        try {
            await deleteAnnouncement({ courseId, announcementId }).unwrap();
            toast.success("Announcement deleted successfully!");
        } catch (err) {
            toast.error(err?.data?.message || "Failed to delete announcement");
        }
    };

    const announcements = announcementData?.announcements || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Create Announcement Form Pane */}
            <div className="lg:col-span-1 bg-[#0c0c0c] border border-white/[0.05] rounded-2xl p-6 space-y-5">
                <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        <Megaphone className="w-4 h-4 text-[#E8602E]" /> Post Announcement
                    </h3>
                    <p className="text-[11px] text-white/40 leading-relaxed">Send updates, notes, or schedules directly to enrolled students.</p>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Announcement Title</Label>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Live Session Rescheduled"
                            className="w-full h-11 bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl text-white outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Content / Message</Label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Provide details about this announcement..."
                            rows={4}
                            className="w-full bg-white/[0.02] border-white/[0.06] focus:border-[#E8602E]/60 focus:ring-1 focus:ring-[#E8602E]/30 text-sm placeholder-white/20 rounded-xl text-white outline-none resize-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isCreating}
                        className="w-full h-10 bg-[#E8602E] hover:bg-[#d4561f] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-[#E8602E]/10"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" /> Post Announcement
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* Announcements Feed Pane */}
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-white/70 uppercase tracking-widest">Announcement History</h3>

                {isAnnouncementsLoading ? (
                    <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-28 bg-[#0c0c0c]/50 border border-white/[0.03] rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-16 bg-[#0c0c0c] border border-white/[0.05] rounded-2xl space-y-3">
                        <Megaphone className="w-8 h-8 text-white/20 mx-auto" />
                        <div>
                            <h4 className="text-xs font-bold text-white">No announcements published</h4>
                            <p className="text-[10px] text-white/45 mt-0.5">Your posted announcements will show up here for students.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {announcements.map((ann) => (
                            <div key={ann._id} className="p-5 bg-[#0c0c0c] border border-white/[0.05] hover:border-white/[0.08] rounded-2xl transition-all space-y-3 relative group">
                                <button
                                    onClick={() => handleDeleteAnnouncement(ann._id)}
                                    className="absolute top-4 right-4 w-7 h-7 rounded-lg border border-red-500/10 hover:border-red-500/20 bg-red-500/5 text-red-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                
                                <div className="space-y-1.5 pr-8">
                                    <h4 className="text-sm font-extrabold text-white tracking-tight">{ann.title}</h4>
                                    <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                                </div>

                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/30 uppercase tracking-wider">
                                    <Calendar className="w-3.5 h-3.5 text-[#E8602E]" />
                                    <span>{formatDate(ann.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default AnnouncementTab;
