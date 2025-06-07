'use client';

import { useEffect } from 'react';

interface ImagePreloaderProps {
  publicIds: string[];
  startIndex?: number;
  count?: number;
  priority?: boolean;
}

const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  publicIds,
  startIndex = 0,
  count = 30, // Increased default to 30 images
  priority = false
}) => {
  useEffect(() => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName || publicIds.length === 0) return;
    
    // Preload images starting from startIndex
    const imagesToPreload = publicIds.slice(startIndex, startIndex + count);
    
    // Create a more aggressive preloading strategy
    const preloadImage = (publicId: string, index: number) => {
      // Create different sizes for responsive loading
      const sizes = [
        { width: 400, quality: 'auto:low' }, // Thumbnail
        { width: 720, quality: 'auto:good' }, // Gallery view
        { width: 1200, quality: 'auto:good' }, // Modal view
      ];
      
      sizes.forEach(({ width, quality }) => {
        const img = new Image();
        const params = [
          'f_auto',
          'c_limit',
          `w_${width}`,
          `q_${quality}`,
        ].join(',');
        
        img.src = `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${publicId}`;
        
        // Set loading priority for first batch of images
        if (priority && index < 12) {
          img.loading = 'eager';
        }
        
        // Use high priority for images that would appear in right columns
        // In a 6-column layout, images at positions 5, 11, 17, 23, 29 would be in the rightmost column
        const isRightColumn = (index % 6) >= 4; // Last 2 columns in 6-column layout
        if (isRightColumn && index < 30) {
          img.loading = 'eager';
          // Force immediate loading for right column images
          img.fetchPriority = 'high';
        }
        
        // Add to cache when loaded
        img.onload = () => {
          // Image is now cached by the browser
          if (typeof window !== 'undefined' && window.performance) {
            // Could add performance tracking here
          }
        };
        
        img.onerror = () => {
          // Silent error handling
        };
      });
    };

    // Preload images with staggered timing to avoid overwhelming the network
    imagesToPreload.forEach((publicId, index) => {
      // Immediate loading for first 12 images
      if (index < 12) {
        preloadImage(publicId, index);
      } else {
        // Staggered loading for remaining images
        setTimeout(() => {
          preloadImage(publicId, index);
        }, index * 50); // 50ms delay between each image
      }
    });

    // Also preload using link prefetch for even more aggressive caching
    if (typeof document !== 'undefined') {
      imagesToPreload.slice(0, 12).forEach((publicId, index) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,c_limit,w_720,q_auto:good/${publicId}`;
        link.as = 'image';
        
        // Add high priority for right column images
        const isRightColumn = (index % 6) >= 4;
        if (isRightColumn) {
          link.setAttribute('fetchpriority', 'high');
        }
        
        document.head.appendChild(link);
        
        // Clean up after 30 seconds to avoid memory leaks
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        }, 30000);
      });
    }
  }, [publicIds, startIndex, count, priority]);

    return null; // This component doesn't render anything
};

export default ImagePreloader; 