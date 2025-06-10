'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PhotoAlbum, { RenderPhotoProps } from 'react-photo-album';
import 'react-photo-album/styles.css'; // Required CSS for PhotoAlbum component
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import { CloudinaryPhoto } from '@/lib/cloudinary';
import PhotoModal from './PhotoModal';
import SmartPrefetcher from './SmartPrefetcher';
import ImagePreloader from './ImagePreloader';
import ViewportImageLoader from './ViewportImageLoader';
import RefreshDetector from './RefreshDetector';
import OptimizedImage from './OptimizedImage';

interface PhotoGalleryProps {
  onPhotoClick?: (index: number, photos: CloudinaryPhoto[]) => void;
  onRefreshNeeded?: () => void;
}

// Export the refresh function for external use
export interface PhotoGalleryRef {
  refreshGallery: () => Promise<void>;
}

interface TransformedPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
  publicId: string;
  index: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onPhotoClick }) => {
  const [allPhotos, setAllPhotos] = useState<CloudinaryPhoto[]>([]);
  const [photos, setPhotos] = useState<TransformedPhoto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Fetch photos from API
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch photos');
    return response.json();
  };

  // Initial data fetch
  const { data, error, isLoading, mutate } = useSWR('/api/photos?limit=30', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 0, // Disable automatic polling
  });

  // Function to refresh gallery data - defined AFTER mutate is available
  const refreshGallery = useCallback(async () => {
    console.log('🔄 Refreshing gallery data...');
    try {
      await mutate(); // Revalidate SWR cache
      // Reset pagination state to fetch from beginning
      setNextCursor(null);
      setHasMore(true);
    } catch (error) {
      console.error('Error refreshing gallery:', error);
    }
  }, [mutate]);

  // Set initial photos when data loads
  useEffect(() => {
    if (data?.photos && Array.isArray(data.photos)) {
      const validPhotos = data.photos.filter((photo: CloudinaryPhoto) => 
        photo && 
        photo.secure_url &&
        photo.public_id &&
        photo.width > 1 && 
        photo.height > 1
      );
      
      console.log('Initial photos loaded:', {
        totalReceived: data.photos.length,
        validPhotos: validPhotos.length,
        invalidPhotos: data.photos.length - validPhotos.length
      });
      
      setAllPhotos(validPhotos);
      setNextCursor(data.next_cursor || null);
      setHasMore(!!data.next_cursor);
    }
  }, [data]);

  // Transform photos for PhotoAlbum when allPhotos changes
  useEffect(() => {
    const transformedPhotos = allPhotos
      .filter(photo => {
        // Validate photo has all required properties
        return photo && 
               photo.secure_url && 
               photo.width > 0 && 
               photo.height > 0 &&
               photo.public_id;
      })
      .map((photo, index) => ({
        src: photo.secure_url,
        width: photo.width,
        height: photo.height,
        alt: `Photo ${index + 1}`,
        publicId: photo.public_id,
        index,
      }));
    
    console.log('Transformed photos:', {
      originalCount: allPhotos.length,
      transformedCount: transformedPhotos.length,
      sample: transformedPhotos[0]
    });
    
    setPhotos(transformedPhotos);
  }, [allPhotos]);

  // Add hover handlers after photos are loaded
  useEffect(() => {
    if (photos.length === 0) return;

    // Debug: Check computed background colors
    const timer = setTimeout(() => {
      const body = document.body;
      const bodyStyle = window.getComputedStyle(body);
      console.log('Body background-color:', bodyStyle.backgroundColor);
      
      const galleryWrapper = document.querySelector('[data-gallery-wrapper]');
      if (galleryWrapper) {
        const wrapperStyle = window.getComputedStyle(galleryWrapper);
        console.log('Gallery wrapper background-color:', wrapperStyle.backgroundColor);
      }
      
      const photoAlbum = document.querySelector('.react-photo-album--masonry');
      if (photoAlbum) {
        const albumStyle = window.getComputedStyle(photoAlbum);
        console.log('Photo album background-color:', albumStyle.backgroundColor);
      }
    }, 100);

    // Wait a bit for PhotoAlbum to render
    const hoverTimer = setTimeout(() => {
      const photoElements = document.querySelectorAll('[class*="photo"], [role="img"], img');
      console.log('Photo elements found:', photoElements.length);
      
      // Add hover handlers to photo containers
      const containers = document.querySelectorAll('.react-photo-album--photo, [style*="cursor: pointer"]');
      console.log('Containers found:', containers.length);
      
      containers.forEach((container: Element) => {
        const el = container as HTMLElement;
        // Set initial styles to ensure consistency
        el.style.overflow = 'hidden';
        el.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Add hover class handling
        container.addEventListener('mouseenter', (event) => {
          const target = event.currentTarget as HTMLElement;
          target.style.transform = 'translateY(-1px) scale(1.002)';
          target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
          target.style.zIndex = '10';
          target.style.overflow = 'hidden';
        });
        
        container.addEventListener('mouseleave', (event) => {
          const target = event.currentTarget as HTMLElement;
          target.style.transform = '';
          target.style.boxShadow = '';
          target.style.zIndex = '';
          target.style.overflow = 'hidden';
        });
      });
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(hoverTimer);
    };
  }, [photos]);

  // Load more photos when scrolling
  const loadMorePhotos = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/photos?limit=30&next_cursor=${nextCursor}`);
      if (!response.ok) throw new Error('Failed to load more photos');
      
      const newData = await response.json();
      if (!newData.photos || !Array.isArray(newData.photos)) {
        console.error('Invalid photos data received:', newData);
        setHasMore(false);
        return;
      }
      
      const validPhotos = newData.photos.filter((photo: CloudinaryPhoto) => 
        photo && 
        photo.secure_url &&
        photo.public_id &&
        photo.width > 1 && 
        photo.height > 1
      );
      
      console.log('More photos loaded:', {
        totalReceived: newData.photos.length,
        validPhotos: validPhotos.length,
        invalidPhotos: newData.photos.length - validPhotos.length
      });
      
      setAllPhotos(prev => [...prev, ...validPhotos]);
      setNextCursor(newData.next_cursor || null);
      setHasMore(!!newData.next_cursor);
    } catch (error) {
      console.error('Error loading more photos:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, hasMore, isLoadingMore]);

  // Trigger load more when intersection observer fires
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      loadMorePhotos();
    }
  }, [inView, hasMore, isLoadingMore, loadMorePhotos]);

  // Handle photo click
  const handlePhotoClick = useCallback(({ index }: { index: number }) => {
    setCurrentPhotoIndex(index);
    setScrollPosition(window.scrollY);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
    
    // Call the optional onPhotoClick prop for backward compatibility
    if (onPhotoClick) {
      onPhotoClick(index, allPhotos);
    }
  }, [onPhotoClick, allPhotos]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    document.body.style.overflow = 'unset';
    window.scrollTo(0, scrollPosition);
  }, [scrollPosition]);

  // Handle navigation in modal
  const handleNavigate = useCallback((newIndex: number) => {
    setCurrentPhotoIndex(newIndex);
  }, []);

  // Custom render function for optimized images with elegant styling
  const renderPhoto = useCallback((props: RenderPhotoProps, context: { photo: TransformedPhoto; index: number; width: number; height: number }) => {
    // PhotoAlbum passes photo data through context parameter
    const { photo, index } = context;
    
    // Type assertion for our transformed photo
    const typedPhoto = photo as TransformedPhoto;
    
    // Defensive checks for photo object
    if (!typedPhoto || typeof typedPhoto !== 'object') {
      console.warn('Invalid photo prop received:', props);
      return null;
    }
    
    // Check if it's an empty object
    if (Object.keys(typedPhoto).length === 0) {
      console.warn('Empty photo object received');
      return null;
    }
    
    // Ensure required properties exist
    if (!typedPhoto.src || !typedPhoto.width || !typedPhoto.height) {
      console.warn('Photo missing required properties:', typedPhoto);
      return null;
    }
    
    const photoIndex = index;
    
    // Props available but not currently used in our custom implementation
    
          return (
        <div
          key={typedPhoto.publicId || `photo-${photoIndex}`}
          className="photo-wrapper"
          style={{
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
          onClick={() => handlePhotoClick({ index: photoIndex })}
        >
        <OptimizedImage
          publicId={typedPhoto.publicId}
          alt={typedPhoto.alt || `Photo ${photoIndex}`}
          width={typedPhoto.width}
          height={typedPhoto.height}
          index={photoIndex}
          className="photo-image"
          style={{ 
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onClick={() => handlePhotoClick({ index: photoIndex })}
        />
      </div>
    );
  }, [handlePhotoClick]);

  if (error) {
    console.log('❌ ERROR STATE:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Failed to load photos
        </div>
        <p className="text-gray-600 text-center">
          There was an error loading the photo gallery. Please try refreshing the page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    console.log('⏳ LOADING STATE: Still loading initial data');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!photos.length) {
    console.log('🚨 NO PHOTOS STATE:', {
      allPhotosLength: allPhotos.length,
      photosLength: photos.length,
      dataPhotosLength: data?.photos?.length,
      isLoading,
      error,
      hasMore,
      nextCursor
    });
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-gray-600 text-lg font-semibold mb-2">
          No photos found
        </div>
        <p className="text-gray-500 text-center">
          Upload some photos to get started with your gallery.
        </p>
      </div>
    );
  }

  console.log('✅ RENDERING GALLERY:', {
    photosCount: photos.length,
    allPhotosCount: allPhotos.length,
    firstPhotoSrc: photos[0]?.src,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    hasMore,
    isLoadingMore
  });

  return (
    <div className="w-full bg-white" style={{ backgroundColor: '#ffffff' }}>
      {/* Refresh Detector - Ultra-aggressive loading on page refresh */}
      <RefreshDetector 
        publicIds={allPhotos.map(photo => photo.public_id)}
      />
      
      {/* Viewport Image Loader - Force load images that would be visible */}
      <ViewportImageLoader 
        publicIds={allPhotos.map(photo => photo.public_id)}
        columns={6}
        targetRowHeight={480}
      />
      
      {/* Aggressive Image Preloader - Load first 36 images immediately */}
      <ImagePreloader 
        publicIds={allPhotos.map(photo => photo.public_id)}
        startIndex={0}
        count={36}
        priority={true}
      />
      
      {/* Smart Prefetcher */}
      <SmartPrefetcher 
        photos={allPhotos} 
        currentIndex={modalOpen ? currentPhotoIndex : 0}
        prefetchRadius={5}
      />
      
      {/* Clean Photo Gallery with Consistent Spacing */}
      <div style={{ backgroundColor: '#ffffff', width: '100%' }} data-gallery-wrapper="true">
        <div className="p-4" style={{ backgroundColor: '#ffffff' }} data-gallery-container="true">
          <PhotoAlbum
            layout="masonry"
            photos={photos}
            spacing={16}
            onClick={handlePhotoClick}
            render={{ photo: renderPhoto }}
            breakpoints={[640, 768, 1024, 1280, 1536]}
            columns={(containerWidth) => {
              if (containerWidth < 640) return 1;
              if (containerWidth < 768) return 2;
              if (containerWidth < 1024) return 3;
              if (containerWidth < 1280) return 4;
              if (containerWidth < 1536) return 5;
              return 6;
            }}
            sizes={{
              size: "calc(100vw - 48px)",
              sizes: [
                { viewport: "(max-width: 640px)", size: "calc(100vw - 16px)" },
                { viewport: "(max-width: 768px)", size: "calc(50vw - 12px)" },
                { viewport: "(max-width: 1024px)", size: "calc(33.333vw - 10px)" },
                { viewport: "(max-width: 1280px)", size: "calc(25vw - 8px)" },
                { viewport: "(max-width: 1536px)", size: "calc(20vw - 6px)" },
              ],
            }}
          />
        </div>
      </div>
      
      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
          )}
        </div>
      )}
      
      {/* End of gallery indicator */}
      {!hasMore && allPhotos.length > 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          You&apos;ve reached the end of the gallery
        </div>
      )}

      {/* Photo Modal */}
      <PhotoModal
        photos={allPhotos}
        currentIndex={currentPhotoIndex}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default PhotoGallery; 