import React from "react";
import ReactPlayer from "react-player";

/**
 * VideoPlayer — Wraps ReactPlayer inside a premium styled container.
 *
 * ReactPlayer is a native React library that handles React lifecycle methods,
 * event delegation, and autoplay policies perfectly. It requires zero custom
 * styling overlays, works on all platforms (Safari, Chrome, iOS, Android),
 * and completely avoids DOM manipulation bugs or playback failure states.
 */
const VideoPlayer = ({
    src,
    poster,
    onPlay,
    onError,
    className = "",
}) => {
    if (!src) {
        return (
            <div className="flex items-center justify-center w-full aspect-video bg-[#0a0a0a] text-[#444] text-sm rounded-xl border border-white/[0.06]">
                No video source provided
            </div>
        );
    }

    return (
        <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/[0.06] ${className}`}>
            <ReactPlayer
                url={src}
                controls={true}
                width="100%"
                height="100%"
                playing={false} // Disable autoplay, loads paused
                playIcon={true}
                light={poster || false} // Shows poster before playing
                onPlay={onPlay}
                onError={onError}
                config={{
                    file: {
                        attributes: {
                            controlsList: "nodownload", // Prevent easy downloads
                            playsInline: true,
                        },
                    },
                }}
            />
        </div>
    );
};

export default VideoPlayer;
