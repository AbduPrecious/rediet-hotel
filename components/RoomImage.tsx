// frontend/components/RoomImage.tsx
'use client';

import { useState } from 'react';

interface RoomImageProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackColor?: string;
}

export default function RoomImage({ src, alt, className = '', fallbackColor = 'from-blue-400 to-purple-500' }: RoomImageProps) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || imgError) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${fallbackColor} flex items-center justify-center text-white`}>
        <div className="text-center">
          <p className="text-sm">{!src ? 'No image' : 'Failed to load'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`w-full h-full bg-gradient-to-br ${fallbackColor} animate-pulse flex items-center justify-center`}>
          <div className="text-white text-sm">Loading...</div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgError(true);
          setIsLoading(false);
        }}
      />
    </>
  );
}