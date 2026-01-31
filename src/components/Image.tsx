import React, { useState } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

export const Image: React.FC<ImageProps> = ({ src, alt, className, fallbackSrc = "https://placehold.co/400x400?text=No+Image", ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <img
            src={imgSrc}
            alt={alt}
            onError={() => setImgSrc(fallbackSrc)}
            className={`object-cover w-full h-full ${className}`}
            {...props}
        />
    );
};
