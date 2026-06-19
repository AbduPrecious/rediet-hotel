// frontend/components/ImageGallery.tsx
'use client';

import { useState } from 'react';
import RoomImage from './RoomImage';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface ImageGalleryProps {
  images: any[];
  roomTitle: string;
}

export default function ImageGallery({ images, roomTitle }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="h-56 relative overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <span className="text-white">No images available</span>
      </div>
    );
  }

  const getImageUrl = (img: any) => {
    if (!img) return null;
    if (img.url?.startsWith('http')) return img.url;
    if (img.url) return `${STRAPI_URL}${img.url}`;
    return null;
  };

  const mainImageUrl = getImageUrl(images[selectedImage]);

  return (
    <div>
      {/* Main Image */}
      <div className="h-56 relative overflow-hidden bg-gray-200">
        <RoomImage
          src={mainImageUrl}
          alt={`${roomTitle} - main image`}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        
        {/* Image Count Badge */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            📸 {images.length} photo{images.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
          {images.map((img, idx) => {
            const thumbUrl = getImageUrl(img);
            if (!thumbUrl) return null;
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-12 h-12 rounded-md overflow-hidden border-2 transition flex-shrink-0 ${
                  selectedImage === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-white hover:border-gray-300'
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={`${roomTitle} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}