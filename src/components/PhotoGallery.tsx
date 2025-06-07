'use client';

import React, { useState, useEffect, useCallback } from 'react';
import PhotoAlbum from 'react-photo-album';
import { useInView } from 'react-intersection-observer';
import useSWR from 'swr';
import { CloudinaryPhoto } from '@/lib/cloudinary';
import OptimizedImage from './OptimizedImage';

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
      setAllPhotos(data.photos);
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
        setAllPhotos(prev => [...prev, ...newData.photos]);
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

  // Handle photo click
  const handlePhotoClick = useCallback(({ index }: { index: number }) => {
    if (onPhotoClick) {
      onPhotoClick(index, allPhotos);
    }
  }, [onPhotoClick, allPhotos]);

  // Custom render function for optimized images
  const renderPhoto = useCallback(({ photo, imageProps }: any) => {
    const { alt, style, ...restImageProps } = imageProps;
    
    return (
      <OptimizedImage
        publicId={photo.publicId}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        priority={photo.index < 6} // Prioritize first 6 images
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="cursor-pointer transition-transform duration-200 hover:scale-105"
        onClick={() => handlePhotoClick({ index: photo.index })}
        {...restImageProps}
        style={style}
      />
    );
  }, [handlePhotoClick]);

  // Transform Cloudinary photos to react-photo-album format
  const photos = allPhotos.map((photo, index) => ({
    src: photo.secure_url, // We'll use public_id with OptimizedImage instead
    width: photo.width,
    height: photo.height,
    key: photo.public_id,
    alt: photo.context?.custom?.caption || photo.context?.custom?.alt || 'Photo',
    publicId: photo.public_id, // Add public_id for OptimizedImage
    index, // Add index for priority loading
  }));

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
      <PhotoAlbum
        layout="masonry"
        photos={photos}
        spacing={8}
        targetRowHeight={300}
        onClick={handlePhotoClick}
        renderPhoto={renderPhoto}
      />
      
      {/* Loading indicator for infinite scroll */}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-8">
          {isLoadingMore && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          )}
        </div>
      )}
      
      {/* End of gallery indicator */}
      {!hasMore && allPhotos.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          You've reached the end of the gallery
        </div>
      )}
    </div>
  );
};

export default PhotoGallery; 