'use client';

import { useEffect, useRef, useCallback } from 'react';

interface RefreshDetectorProps {
  publicIds: string[];
  onRefreshDetected?: () => void;
}

const RefreshDetector: React.FC<RefreshDetectorProps> = ({
  publicIds,
  onRefreshDetected
}) => {
  const hasDetectedRefresh = useRef(false);
  const isInitialLoad = useRef(true);

  const implementUltraAggressiveLoading = useCallback(() => {
    if (publicIds.length === 0) return;
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return;

    console.log('🚀 Ultra-aggressive loading: Force loading first 36 images immediately');

    // Force load the first 36 images (6 rows × 6 columns) with multiple strategies
    const imagesToForceLoad = Math.min(36, publicIds.length);
    
    // Strategy 1: Create hidden img elements with high priority
    const createHiddenImages = () => {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      container.id = 'refresh-preloader';
      
      publicIds.slice(0, imagesToForceLoad).forEach((publicId, index) => {
        const img = document.createElement('img');
        const params = 'f_auto,c_limit,w_720,q_auto:good';
        img.src = `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${publicId}?refresh=${Date.now()}`;
        img.loading = 'eager';
        img.fetchPriority = 'high';
        
        img.onload = () => {
          console.log(`💨 Ultra-preloaded image ${index}: ${publicId.substring(0, 15)}...`);
        };
        
        img.onerror = () => {
          console.warn(`❌ Ultra-preload failed for image ${index}: ${publicId.substring(0, 15)}...`);
        };
        
        container.appendChild(img);
      });
      
      document.body.appendChild(container);
      
      // Clean up after 30 seconds
      setTimeout(() => {
        const existingContainer = document.getElementById('refresh-preloader');
        if (existingContainer) {
          document.body.removeChild(existingContainer);
        }
      }, 30000);
    };

    // Strategy 2: Use fetch with high priority
    const fetchImages = async () => {
      const fetchPromises = publicIds.slice(0, imagesToForceLoad).map(async (publicId, index) => {
        try {
          const params = 'f_auto,c_limit,w_720,q_auto:good';
          const url = `https://res.cloudinary.com/${cloudName}/image/upload/${params}/${publicId}?refresh=${Date.now()}`;
          
          const response = await fetch(url, {
            method: 'GET',
            priority: 'high',
            cache: 'force-cache'
          });
          
          if (response.ok) {
            console.log(`🎯 Fetch-preloaded image ${index}: ${publicId.substring(0, 15)}...`);
          }
        } catch (error) {
          console.warn(`⚠️ Fetch-preload failed for image ${index}:`, error);
        }
      });

      await Promise.all(fetchPromises);
    };

    // Strategy 3: Add multiple prefetch links with cache busting
    const addPrefetchLinks = () => {
      const fragment = document.createDocumentFragment();
      
      publicIds.slice(0, imagesToForceLoad).forEach((publicId) => {
        // Add multiple sizes
        const sizes = [
          { width: 400, quality: 'auto:low' },
          { width: 720, quality: 'auto:good' },
        ];
        
        sizes.forEach(({ width, quality }) => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,c_limit,w_${width},q_${quality}/${publicId}?refresh=${Date.now()}`;
          link.as = 'image';
          link.setAttribute('fetchpriority', 'high');
          fragment.appendChild(link);
        });
      });
      
      document.head.appendChild(fragment);
    };

    // Execute all strategies
    createHiddenImages();
    fetchImages();
    addPrefetchLinks();
  }, [publicIds]);

  useEffect(() => {
    // Detect if this is a refresh vs initial navigation
    const detectRefresh = () => {
      // Check if this is a refresh by looking at navigation timing
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const isRefresh = navigation.type === 'reload';
          const isBackForward = navigation.type === 'back_forward';
          
          if (isRefresh || isBackForward) {
            hasDetectedRefresh.current = true;
            onRefreshDetected?.();
            implementUltraAggressiveLoading();
          }
        }
      }
      
      isInitialLoad.current = false;
    };

    // Run detection after a short delay to ensure navigation timing is available
    const timer = setTimeout(detectRefresh, 100);
    
    return () => clearTimeout(timer);
  }, [onRefreshDetected, implementUltraAggressiveLoading]);

  return null;
};

export default RefreshDetector; 