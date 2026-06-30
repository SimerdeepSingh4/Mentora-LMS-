import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChatWithAIMutation } from "@/features/api/aiApi";
import { Bot, Send, Sparkles, Trash2, User, X } from "lucide-react";
import { toast } from "sonner";
import { AIInput } from "@/components/ui/AIInput";

export const AITutor = ({ courseId, currentLecture, onClose }) => {
    const { user } = useSelector(state => state.auth);
    const storageKey = `mentora_ai_chat_${courseId}_${user?._id || "anon"}`;
    
    const [messages, setMessages] = useState(() => {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : [];
    });
    
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const [chatWithAI, { isLoading }] = useChatWithAIMutation();

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }, [messages, storageKey]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollTo({
            top: messagesEndRef.current.scrollHeight,
            behavior: "smooth"
        });
    };

    const handleSend = async (textToSend) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        const userMsg = { role: "user", content: query };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        try {
            const history = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await chatWithAI({
                courseId,
                lectureId: currentLecture?._id,
                message: query,
                history
            }).unwrap();

            if (response.success) {
                setMessages(prev => [...prev, { role: "assistant", content: response.response }]);
            } else {
                toast.error(response.message || "Failed to get response from AI Tutor");
            }
        } catch (error) {
            console.error("AI Tutor error:", error);
            const errMsg = error.data?.message || "Something went wrong. Please check if GEMINI_API_KEY is configured on the server.";
            toast.error(errMsg);
        }
    };

    const suggestedPrompts = currentLecture ? [
        `Explain the main concept of "${currentLecture.lectureTitle}"`,
        `Summarize this lecture in 3 bullet points`,
        `Create a practice quiz question for "${currentLecture.lectureTitle}"`,
    ] : [
        "Explain the key concepts of this course",
        "How should I structure my study for this course?",
        "Create a practice quiz question on the introductory concepts",
    ];

    const parseInline = (text) => {
        if (!text) return "";
        const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={index} className="px-1.5 py-0.5 rounded bg-muted text-destructive dark:text-red-400 font-mono text-xs">{part.slice(1, -1)}</code>;
            }
            return part;
        });
    };

    const parseMarkdown = (text) => {
        if (!text) return "";
        
        const parts = text.split(/(```[\s\S]*?```)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('```')) {
                const lines = part.split('\n');
                const language = lines[0].slice(3).trim() || 'code';
                const code = lines.slice(1, -1).join('\n');
                
                return (
                    <div key={index} className="my-3 overflow-hidden rounded-lg bg-slate-950 dark:bg-slate-900 border border-slate-800 font-mono text-xs shadow-md">
                        <div className="flex items-center justify-between bg-slate-900 dark:bg-slate-950 px-4 py-1.5 text-slate-400 border-b border-slate-850">
                            <span className="text-[10px] uppercase font-bold tracking-wider">{language}</span>
                            <button 
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(code);
                                    toast.success("Code copied!");
                                }}
                                className="text-[10px] hover:text-white transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-slate-100 whitespace-pre-wrap">
                            <code>{code}</code>
                        </pre>
                    </div>
                );
            } else {
                const lines = part.split('\n');
                return lines.map((line, lIdx) => {
                    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                        return (
                            <ul key={`${index}-${lIdx}`} className="list-disc pl-5 my-1 space-y-1 text-sm text-foreground/90">
                                <li>{parseInline(line.trim().substring(2))}</li>
                            </ul>
                        );
                    }
                    if (line.trim().match(/^\d+\.\s/)) {
                        const content = line.trim().replace(/^\d+\.\s/, '');
                        return (
                            <ol key={`${index}-${lIdx}`} className="list-decimal pl-5 my-1 space-y-1 text-sm text-foreground/90">
                                <li>{parseInline(content)}</li>
                            </ol>
                        );
                    }
                    if (line.trim() === '') return <div key={`${index}-${lIdx}`} className="h-2" />;
                    return <p key={`${index}-${lIdx}`} className="my-1 text-sm leading-relaxed text-foreground/90">{parseInline(line)}</p>;
                });
            }
        });
    };

    return (
        <div className="flex flex-col h-[550px] border border-border rounded-xl bg-card overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#E8602E]/10 via-[#E8602E]/5 to-transparent border-b border-border">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#E8602E] animate-pulse" />
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">AI Course Tutor</h4>
                        <p className="text-[10px] text-muted-foreground">Ask questions about lectures</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                                if (window.confirm("Clear chat history?")) {
                                    setMessages([]);
                                }
                            }}
                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                    {onClose && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={onClose}
                            className="w-8 h-8 text-muted-foreground hover:text-white hover:bg-white/[0.05]"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={messagesEndRef}>
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <div className="p-3 bg-[#E8602E]/10 rounded-full animate-bounce">
                            <Bot className="w-8 h-8 text-[#E8602E]" />
                        </div>
                        <div>
                            <h5 className="font-semibold text-sm text-foreground">Ask Mentora AI</h5>
                            <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
                                Get immediate help with code, concepts, or summaries in this lecture.
                            </p>
                        </div>
                        
                        <div className="w-full space-y-2 pt-2">
                            <p className="text-[10px] font-bold text-[#E8602E] uppercase tracking-wider text-left pl-1">Suggested prompts</p>
                            {suggestedPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSend(prompt)}
                                    className="w-full text-left text-xs p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-[#E8602E]/5 hover:border-[#E8602E]/30 transition-all text-muted-foreground hover:text-[#E8602E] dark:hover:text-[#E8602E] font-medium"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role !== 'user' && (
                                    <Avatar className="w-8 h-8 border border-border shadow-sm">
                                        <AvatarFallback className="bg-[#E8602E]/10 text-[#E8602E] font-bold">
                                            <Bot className="w-4 h-4 text-[#E8602E]" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-[#E8602E] text-white rounded-tr-none' 
                                    : 'bg-muted/70 text-foreground border border-border/50 rounded-tl-none'
                                }`}>
                                    {msg.role === 'user' ? msg.content : parseMarkdown(msg.content)}
                                </div>
                                {msg.role === 'user' && (
                                    <Avatar className="w-8 h-8 border border-border shadow-sm">
                                        <AvatarImage src={user?.photoUrl || ""} />
                                        <AvatarFallback className="bg-muted text-foreground">
                                            <User className="w-4 h-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex items-start gap-2.5 justify-start">
                                <Avatar className="w-8 h-8 border border-border shadow-sm animate-pulse">
                                    <AvatarFallback className="bg-[#E8602E]/10 text-white">
                                        <Bot className="w-4 h-4 text-[#E8602E]" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-muted/70 border border-border/50 rounded-2xl rounded-tl-none px-3.5 py-4 text-sm shadow-sm flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[#E8602E] animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-[#E8602E] animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 rounded-full bg-[#E8602E] animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-card">
                <AIInput 
                    value={input}
                    onChange={setInput}
                    onSubmit={() => handleSend()}
                    isLoading={isLoading}
                    placeholder={currentLecture ? `Ask about "${currentLecture.lectureTitle}"...` : "Ask a question..."}
                />
            </div>
        </div>
    );
};
