'use client';

import { useEffect, useRef, useState } from 'react';
import { CloudinaryPhoto } from '@/lib/cloudinary';

interface SmartPrefetcherProps {
  photos: CloudinaryPhoto[];
  currentIndex?: number;
  prefetchRadius?: number;
}

const SmartPrefetcher: React.FC<SmartPrefetcherProps> = ({
  photos,
  currentIndex = 0,
  prefetchRadius = 3
}) => {
  const [prefetchedImages, setPrefetchedImages] = useState<Set<string>>(new Set());
  const [prefetchQueue, setPrefetchQueue] = useState<string[]>([]);
  const prefetchingRef = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Smart prefetching based on current index
  useEffect(() => {
    if (photos.length === 0) return;

    const imagesToPrefetch: string[] = [];
    
    // Prefetch images around current index
    const start = Math.max(0, currentIndex - prefetchRadius);
    const end = Math.min(photos.length - 1, currentIndex + prefetchRadius);
    
    for (let i = start; i <= end; i++) {
      const photo = photos[i];
      if (photo && !prefetchedImages.has(photo.secure_url)) {
        imagesToPrefetch.push(photo.secure_url);
      }
    }

    if (imagesToPrefetch.length > 0) {
      setPrefetchQueue(prev => [...prev, ...imagesToPrefetch]);
    }
  }, [currentIndex, photos, prefetchRadius, prefetchedImages]);

  // Process prefetch queue
  useEffect(() => {
    if (prefetchQueue.length === 0 || prefetchingRef.current) return;

    const prefetchNext = async () => {
      prefetchingRef.current = true;
      
      while (prefetchQueue.length > 0) {
        const imageUrl = prefetchQueue[0];
        
        if (!prefetchedImages.has(imageUrl)) {
          try {
            await prefetchImage(imageUrl);
            setPrefetchedImages(prev => new Set([...prev, imageUrl]));
          } catch (error) {
            console.warn('Failed to prefetch image:', imageUrl, error);
          }
        }
        
        setPrefetchQueue(prev => prev.slice(1));
        
        // Add a small delay to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      prefetchingRef.current = false;
    };

    prefetchNext();
  }, [prefetchQueue, prefetchedImages]);

  // Intersection Observer for viewport-based prefetching
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src && !prefetchedImages.has(src)) {
              setPrefetchQueue(prev => [...prev, src]);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start prefetching 50px before image enters viewport
        threshold: 0.1
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [prefetchedImages]);

  // Prefetch API data for next pages
  useEffect(() => {
    const prefetchApiData = async () => {
      try {
        // Prefetch next page of photos
        const nextPageUrl = '/api/photos?limit=30&page=2';
        
        if ('caches' in window) {
          const cache = await caches.open('photo-api-cache');
          const cachedResponse = await cache.match(nextPageUrl);
          
          if (!cachedResponse) {
            // Prefetch in background
            fetch(nextPageUrl)
              .then(response => {
                if (response.ok) {
                  cache.put(nextPageUrl, response.clone());
                }
              })
              .catch(error => {
                console.warn('Failed to prefetch API data:', error);
              });
          }
        }
      } catch (error) {
        console.warn('API prefetching failed:', error);
      }
    };

    // Prefetch API data after a delay
    const timer = setTimeout(prefetchApiData, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Network-aware prefetching
  useEffect(() => {
    const connection = (navigator as Record<string, any>).connection;
    
    if (connection) {
      const handleConnectionChange = () => {
        // Adjust prefetching based on connection quality
        if (connection.effectiveType === '4g') {
          // Aggressive prefetching on fast connections
          setPrefetchQueue(prev => prev.slice(0, 10));
        } else if (connection.effectiveType === '3g') {
          // Moderate prefetching on medium connections
          setPrefetchQueue(prev => prev.slice(0, 5));
        } else {
          // Conservative prefetching on slow connections
          setPrefetchQueue(prev => prev.slice(0, 2));
        }
      };

      connection.addEventListener('change', handleConnectionChange);
      return () => connection.removeEventListener('change', handleConnectionChange);
    }
  }, []);

  return null; // This component doesn't render anything
};

// Helper function to prefetch an image
const prefetchImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    
    // Set crossOrigin for Cloudinary images
    if (src.includes('cloudinary.com')) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = src;
  });
};

// Hook for using smart prefetching in components
export const useSmartPrefetch = (photos: CloudinaryPhoto[], currentIndex: number = 0) => {
  const [prefetchedCount, setPrefetchedCount] = useState(0);
  
  useEffect(() => {
    // Track prefetched images - placeholder for future implementation
    // This would be connected to the prefetching logic
    setPrefetchedCount(photos.length);
  }, [photos, currentIndex]);

  return {
    prefetchedCount,
    totalImages: photos.length,
    prefetchProgress: photos.length > 0 ? (prefetchedCount / photos.length) * 100 : 0
  };
};

export default SmartPrefetcher; 