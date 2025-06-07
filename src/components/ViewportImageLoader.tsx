'use client';

import { useEffect, useRef } from 'react';

interface ViewportImageLoaderProps {
  publicIds: string[];
  columns?: number;
  targetRowHeight?: number;
}

const ViewportImageLoader: React.FC<ViewportImageLoaderProps> = ({
  publicIds,
  columns = 6, // Default to 6 columns for large screens
  targetRowHeight = 480
}) => {
  const hasLoaded = useRef(false);
  const loadAttempts = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (hasLoaded.current || publicIds.length === 0) return;
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return;

    // Calculate how many images would be visible in the initial viewport
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const estimatedRowsVisible = Math.ceil(viewportHeight / targetRowHeight) + 2; // Add 2 rows buffer
    const estimatedImagesVisible = estimatedRowsVisible * columns;
    
    // Be extremely aggressive - load way more images than we think we need
    // This ensures right-side images are definitely loaded
    const imagesToLoad = Math.min(publicIds.length, Math.max(36, estimatedImagesVisible * 2));
    


    // Force immediate loading of these images with multiple strategies
    const loadImages = async () => {
      const promises = publicIds.slice(0, imagesToLoad).map(async (publicId, index) => {
        const attempts = loadAttempts.current.get(publicId) || 0;
        loadAttempts.current.set(publicId, attempts + 1);

        // Create multiple sizes for each image
        const sizes = [
          { width: 400, quality: 'auto:low' },
          { width: 720, quality: 'auto:good' },
          { width: 1200, quality: 'auto:good' }, // Add larger size for better caching
        ];

        const imagePromises = sizes.map(({ width, quality }) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            const params = [
              'f_auto',
              'c_limit',
              `w_${width}`,
              `q_${quality}`,
            ].join(',');
            
            // Add cache busting for refresh scenarios if this is a retry
            const cacheBuster = attempts > 0 ? `?cb=${Date.now()}` : '';
            img.src = `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${publicId}${cacheBuster}`;
            
            // Force eager loading
            img.loading = 'eager';
            
            // High priority for images that would be in right columns
            const columnIndex = index % columns;
            const isRightSide = columnIndex >= columns - 2; // Last 2 columns
            
            if (isRightSide || index < 12) {
              img.fetchPriority = 'high';
            }
            
            img.onload = () => {
              resolve();
            };
            
            img.onerror = () => {
              resolve(); // Don't fail the whole batch
            };
            
            // Timeout after 8 seconds (increased for slower connections)
            setTimeout(() => {
              resolve();
            }, 8000);
          });
        });

        // Load all sizes for this image
        await Promise.all(imagePromises);
      });

      // Load images in smaller batches to avoid overwhelming the network
      const batchSize = 4; // Smaller batches for more consistent loading
      for (let i = 0; i < promises.length; i += batchSize) {
        const batch = promises.slice(i, i + batchSize);
        await Promise.all(batch);
        
        // Shorter delay between batches for faster overall loading
        if (i + batchSize < promises.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    };

    // Also use link prefetch for even more aggressive caching
    const addPrefetchLinks = () => {
      if (typeof document === 'undefined') return;
      
      const fragment = document.createDocumentFragment();
      
      publicIds.slice(0, imagesToLoad).forEach((publicId, index) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,c_limit,w_720,q_auto:good/${publicId}`;
        link.as = 'image';
        
        // Add high priority for right column images
        const columnIndex = index % columns;
        const isRightSide = columnIndex >= columns - 2;
        if (isRightSide || index < 12) {
          link.setAttribute('fetchpriority', 'high');
        }
        
        fragment.appendChild(link);
      });
      
      document.head.appendChild(fragment);
      
      // Clean up after 60 seconds to avoid memory leaks
      setTimeout(() => {
        const links = document.head.querySelectorAll('link[rel="prefetch"][as="image"]');
        links.forEach(link => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
        });
      }, 60000);
    };

    // Start both strategies simultaneously
    Promise.all([
      loadImages(),
      Promise.resolve(addPrefetchLinks())
    ]).catch(() => {
      // Silent error handling
    });

    hasLoaded.current = true;
  }, [publicIds, columns, targetRowHeight]);

  return null;
};

export default ViewportImageLoader; 