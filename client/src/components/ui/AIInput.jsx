import React, { useRef, useEffect, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AIInput = ({ value, onChange, onSubmit, placeholder = "Ask Mentora AI tutor anything...", isLoading = false }) => {
    const textareaRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    // Auto-adjust height based on content
    useEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) {
                onSubmit();
            }
        }
    };

    return (
        <div 
            className={`relative rounded-2xl transition-all duration-300 p-[1.5px] ${
                isFocused 
                    ? "bg-gradient-to-r from-[#E8602E] via-orange-500 to-amber-500 shadow-lg shadow-[#E8602E]/15" 
                    : "bg-[#141414] border border-white/[0.05]"
            }`}
        >
            <div className="relative bg-[#090909] rounded-[15px] flex items-end gap-2 p-2">
                {/* Visual indicator decorator */}
                <div className="p-2 select-none">
                    <Sparkles className={`w-4 h-4 transition-colors ${isFocused ? "text-[#E8602E] animate-pulse" : "text-[#444]"}`} />
                </div>

                {/* Input Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    rows={1}
                    className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-white placeholder-[#444] text-xs py-2 px-1 resize-none min-h-[36px] max-h-[200px] leading-relaxed custom-scrollbar"
                />

                {/* Submit button */}
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={!value.trim() || isLoading}
                    className={`h-8 w-8 rounded-xl p-0 flex items-center justify-center transition-all ${
                        value.trim() && !isLoading
                            ? "bg-[#E8602E] hover:bg-[#d4561f] text-white"
                            : "bg-[#141414] text-[#444] cursor-not-allowed"
                    }`}
                >
                    <Send className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
};

export default AIInput;
