'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PhotoAlbum from 'react-photo-album';
import 'react-photo-album/styles.css'; // Required CSS for PhotoAlbum component
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import { CloudinaryPhoto } from '@/lib/cloudinary';
import OptimizedImage from './OptimizedImage';
import PhotoModal from './PhotoModal';
import SmartPrefetcher from './SmartPrefetcher';

interface PhotoGalleryProps {
  onPhotoClick?: (index: number, photos: CloudinaryPhoto[]) => void;
}

interface PhotosResponse {
  photos: CloudinaryPhoto[];
  next_cursor?: string;
  total_count: number;
  page: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onPhotoClick }) => {
  const [allPhotos, setAllPhotos] = useState<CloudinaryPhoto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
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

  // Initial data fetch
  const { data, error, isLoading } = useSWR<PhotosResponse>(
    '/api/photos?limit=30',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Set initial photos when data loads
  useEffect(() => {
    if (data?.photos) {
      // Filter out corrupted photos (1x1 pixels) from initial data load
      const validPhotos = data.photos.filter((photo) => {
        return photo.width > 1 && photo.height > 1;
      });
      
      setAllPhotos(validPhotos);
      setNextCursor(data.next_cursor);
      setHasMore(!!data.next_cursor);
    }
  }, [data]);

  // Load more photos when scrolling to bottom
  const loadMorePhotos = useCallback(async () => {
    if (!nextCursor || isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const response = await fetch(`/api/photos?limit=30&next_cursor=${nextCursor}`);
      const newData: PhotosResponse = await response.json();
      
      if (newData.photos) {
        // Filter out corrupted photos (1x1 pixels) from newly loaded photos
        const validNewPhotos = newData.photos.filter((photo) => {
          return photo.width > 1 && photo.height > 1;
        });
        
        setAllPhotos(prev => [...prev, ...validNewPhotos]);
        setNextCursor(newData.next_cursor);
        setHasMore(!!newData.next_cursor);
      }
    } catch (error) {
      console.error('Error loading more photos:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, hasMore]);

  // Trigger load more when intersection observer fires
  useEffect(() => {
    if (inView && hasMore && !isLoadingMore) {
      loadMorePhotos();
    }
  }, [inView, hasMore, isLoadingMore, loadMorePhotos]);

  // Modal handlers
  const handlePhotoClick = useCallback(({ index }: { index: number }) => {
    // Store current scroll position
    setScrollPosition(window.scrollY);
    setCurrentPhotoIndex(index);
    setModalOpen(true);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Call the optional onPhotoClick prop for backward compatibility
    if (onPhotoClick) {
      onPhotoClick(index, allPhotos);
    }
  }, [onPhotoClick, allPhotos]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    
    // Restore body scroll
    document.body.style.overflow = 'unset';
    
    // Restore scroll position after a brief delay to ensure modal is closed
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 100);
  }, [scrollPosition]);

  const handleNavigate = useCallback((newIndex: number) => {
    setCurrentPhotoIndex(newIndex);
  }, []);

  // Custom render function for optimized images with elegant styling
  const renderPhoto = useCallback(({ photo, imageProps }: { photo: Record<string, any>; imageProps: Record<string, any> }) => {
    const { style, ...restImageProps } = imageProps;
    
    return (
      <div className="group relative overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-out">
        <OptimizedImage
          publicId={photo.publicId}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          priority={photo.index < 6} // Prioritize first 6 images
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="cursor-pointer transition-all duration-300 ease-out group-hover:scale-[1.02] w-full h-full object-cover"
          onClick={() => handlePhotoClick({ index: photo.index })}
          {...restImageProps}
          style={style}
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 ease-out pointer-events-none" />
      </div>
    );
  }, [handlePhotoClick]);

  // Transform Cloudinary photos to react-photo-album format with normalized dimensions
  const photos = allPhotos
    .filter((photo) => {
      // Filter out photos with invalid dimensions (1x1 pixels are corrupted/placeholder images)
      return photo.width > 1 && photo.height > 1;
    })
    .map((photo, index) => {
      // Normalize extremely large dimensions to reasonable display sizes
      // Target max width of 800px while maintaining aspect ratio
      const maxDisplayWidth = 800;
      const maxDisplayHeight = 1200;
      const aspectRatio = photo.width / photo.height;
      
      let displayWidth = photo.width;
      let displayHeight = photo.height;
      
      // Scale down if width is too large
      if (displayWidth > maxDisplayWidth) {
        displayWidth = maxDisplayWidth;
        displayHeight = Math.round(displayWidth / aspectRatio);
      }
      
      // Also ensure height isn't too large
      if (displayHeight > maxDisplayHeight) {
        displayHeight = maxDisplayHeight;
        displayWidth = Math.round(displayHeight * aspectRatio);
      }
      
      return {
        src: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${photo.public_id}`,
        width: displayWidth,
        height: displayHeight,
        alt: `Photo ${index + 1}`,
        // Store original dimensions and metadata for reference
        original: {
          width: photo.width,
          height: photo.height,
          public_id: photo.public_id,
          format: photo.format
        }
      };
    });

  if (error) {
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!photos.length) {
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

  return (
    <div className="w-full">
      {/* Smart Prefetcher */}
      <SmartPrefetcher 
        photos={allPhotos} 
        currentIndex={modalOpen ? currentPhotoIndex : 0}
        prefetchRadius={5}
      />
      
      {/* Elegant Photo Gallery Container */}
      <div className="bg-white p-4 sm:p-6 lg:p-8">
        <PhotoAlbum
          layout="masonry"
          photos={photos}
          spacing={6} // Slightly increased spacing for better visual separation
          targetRowHeight={320} // Increased target height for better proportions with normalized dimensions
          onClick={handlePhotoClick}
          renderPhoto={renderPhoto}
          breakpoints={[640, 768, 1024, 1280, 1536]} // More granular breakpoints
          columns={(containerWidth) => {
            if (containerWidth < 640) return 1; // Mobile: single column
            if (containerWidth < 768) return 2; // Small tablet: 2 columns  
            if (containerWidth < 1024) return 3; // Tablet: 3 columns
            if (containerWidth < 1280) return 4; // Desktop: 4 columns
            if (containerWidth < 1536) return 5; // Large desktop: 5 columns
            return 6; // Extra large: 6 columns
          }}
          sizes={{
            size: "calc(100vw - 240px)",
            sizes: [
              { viewport: "(max-width: 640px)", size: "calc(100vw - 32px)" },
              { viewport: "(max-width: 768px)", size: "calc(50vw - 24px)" },
              { viewport: "(max-width: 1024px)", size: "calc(33.333vw - 20px)" },
              { viewport: "(max-width: 1280px)", size: "calc(25vw - 18px)" },
              { viewport: "(max-width: 1536px)", size: "calc(20vw - 16px)" },
            ],
          }}
        />
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