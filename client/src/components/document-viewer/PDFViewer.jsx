import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, Maximize, Minimize } from 'lucide-react';
import './document-viewer.css';

/**
 * PDFViewer — Displays PDF files.
 *
 * It uses an <iframe> pointing directly to the PDF URL.
 * By using an iframe, we delegate the rendering to the browser's built-in, highly optimized,
 * and feature-rich native PDF viewer. Most importantly, it fetches the resource as a standard
 * frame navigation rather than an AJAX request, completely bypassing browser CORS restriction issues.
 */
const PDFViewer = ({ fileUrl, fileName }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`flex flex-col rounded-xl overflow-hidden border border-white/[0.05] bg-[#0c0c0c] ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-[#060606]' : 'relative'}`}>
            {/* Header controls bar */}
            <div className="flex items-center justify-between p-3 bg-[#0d0d0d] border-b border-white/[0.05]">
                <span className="text-xs font-semibold text-[#888] truncate max-w-[200px] md:max-w-md">
                    {fileName || "Lecture Handout"}
                </span>

                <div className="flex items-center gap-2">
                    {/* Fullscreen toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="border-white/[0.05] bg-transparent text-[#888] hover:text-white hover:bg-white/[0.05]"
                    >
                        {isFullscreen ? (
                            <><Minimize className="h-3.5 w-3.5 mr-1.5" /> Normal</>
                        ) : (
                            <><Maximize className="h-3.5 w-3.5 mr-1.5" /> Fullscreen</>
                        )}
                    </Button>

                    {/* Download */}
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-white/[0.05] bg-transparent text-[#888] hover:text-white hover:bg-white/[0.05]"
                    >
                        <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Download
                        </a>
                    </Button>

                    {/* Open in new tab */}
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="border-white/[0.05] bg-[#E8602E] text-white hover:bg-[#d4561f]"
                    >
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Open
                        </a>
                    </Button>
                </div>
            </div>

            {/* Document Iframe Box */}
            <div className={`w-full relative ${isFullscreen ? 'flex-1 mt-3' : 'h-[600px] bg-[#080808]'}`}>
                {fileUrl ? (
                    <iframe
                        src={`${fileUrl}#toolbar=1`}
                        className="w-full h-full border-none"
                        title={fileName || "PDF Document"}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#444] text-sm">
                        No document link available
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFViewer;
