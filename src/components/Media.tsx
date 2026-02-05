import React, { useState, useEffect, useMemo } from 'react';

/**
 * Robustly detects if a URL or string is a video.
 */
export const isMediaVideo = (src: string): boolean => {
    if (!src) return false;
    const lower = src.toLowerCase();

    // Explicit blob/data check
    if (lower.startsWith('blob:') || lower.startsWith('data:video')) return true;

    // Formats supported
    const videoExtensions = ['mp4', 'mov', 'webm', 'ogv', 'm4v', 'quicktime'];

    // 1. Simple extension check
    if (videoExtensions.some(ext => lower.endsWith(`.${ext}`))) return true;

    // 2. Firebase Storage / Complex URL check (search for extension before query params)
    const videoRegex = new RegExp(`\\.(${videoExtensions.join('|')})(\\?|$)`, 'i');
    return videoRegex.test(src);
};

interface MediaProps {
    src: string;
    alt?: string;
    className?: string;
    priority?: boolean;
    size?: 'thumbnail' | 'full';
}

export const Media: React.FC<MediaProps> = ({ src, alt = "Media", className = "", priority = false, size = 'full' }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const isVideo = isMediaVideo(src);

    // Optimization: For external images (like Firebase), we could append parameters if supported.
    // Here we simulate it by using a placeholder for thumbnails if preferred, or just using browser lazy loading.
    const optimizedSrc = useMemo(() => {
        if (!src || isVideo) return src;
        // If it's a known storage URL, we could add transformations here.
        // For now, we rely on browser loading=lazy and standard attributes.
        return src;
    }, [src, isVideo]);

    // Reset loading state when src changes
    useEffect(() => {
        setIsLoaded(false);
        setHasError(false);
    }, [src]);

    return (
        <div className={`relative w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
            {/* Loading Indicator / Skeleton */}
            {!isLoaded && src !== 'https://placehold.co/400x400?text=No+Image' && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-cream/10 dark:bg-white/5 animate-pulse">
                    <div className="w-8 h-8 border-2 border-brand-brown/20 dark:border-white/20 border-t-brand-brown dark:border-t-white rounded-full animate-spin" />
                </div>
            )}

            {isVideo ? (
                <video
                    key={src}
                    src={optimizedSrc}
                    autoPlay
                    muted
                    playsInline
                    loop
                    preload="metadata"
                    onLoadedData={() => setIsLoaded(true)}
                    onError={(e) => {
                        console.error("Video load error:", src);
                        setHasError(true);
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        setIsLoaded(true);
                    }}
                    className={`w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} object-cover`}
                />
            ) : (
                <img
                    src={optimizedSrc}
                    alt={alt}
                    loading={priority ? "eager" : "lazy"}
                    data-size={size}
                    {...(priority ? { fetchpriority: "high" } : {})}
                    onLoad={() => setIsLoaded(true)}
                    className={`w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} object-cover`}
                    onError={(e) => {
                        setHasError(true);
                        e.currentTarget.src = 'https://placehold.co/400x400?text=Error+Carga';
                        setIsLoaded(true);
                    }}
                />
            )}

            {/* Final fallback only if there is a real error or no src */}
            {(hasError || (src === '') || (!src)) && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-[#1a1a1a] flex flex-col items-center justify-center p-4">
                    <div className="w-10 h-10 border-2 border-brand-brown/10 dark:border-white/10 rounded-full flex items-center justify-center mb-2">
                        <span className="text-[10px] font-black text-brand-brown/40 dark:text-white/40">!</span>
                    </div>
                    {/* Optional text only if space allows */}
                    <span className="text-[8px] font-black text-brand-brown/20 dark:text-white/20 uppercase tracking-widest text-center">No disponible</span>
                </div>
            )}
        </div>
    );
};


