'use client';

import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface OptimizedImageProps {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onClick?: () => void;
  quality?: number;
  blurDataURL?: string;
  loading?: 'lazy' | 'eager';
  index?: number; // Add index to help with debugging
  onMouseEnter?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLImageElement>) => void;
  style?: React.CSSProperties;
}

// Generate optimized blur placeholder
function generateBlurPlaceholder(publicId: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto:low,w_10,h_10,c_fill,e_blur:300/${publicId}`;
}

// Generate optimized image URL
function generateImageUrl(publicId: string, width: number, quality: number = 80): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const params = [
    'f_auto', // Auto format (WebP/AVIF when supported)
    'c_limit', // Limit to prevent upscaling
    `w_${width}`,
    `q_${quality === 80 ? 'auto' : quality}`,
  ];
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.join(',')}/${publicId}`;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  publicId,
  alt,
  width,
  height,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
  onClick,
  quality = 80,
  blurDataURL,
  loading,
  index = 0,
  onMouseEnter,
  onMouseLeave,
  style,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  
  // Generate optimized blur placeholder
  const optimizedBlurDataURL = blurDataURL || generateBlurPlaceholder(publicId);
  
  // Generate the main image URL
  const imageUrl = generateImageUrl(publicId, width, quality);

  // Be much more aggressive about immediate loading
  // Load first 24 images immediately (covers 4 rows in 6-column layout)
  const shouldLoadImmediately = priority || loading === 'eager' || index < 24;

  useEffect(() => {
    if (shouldLoadImmediately) {
      setLoadStartTime(performance.now());
    }
  }, [shouldLoadImmediately, index, publicId]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    // Silent error handling - could log to analytics service if needed
  };

  // For images that should load immediately, use regular img tag with eager loading
  if (shouldLoadImmediately) {
    return (
      <div className="relative w-full h-full">
        {/* Show blur placeholder while loading */}
        {!imageLoaded && (
          <img
            src={optimizedBlurDataURL}
            alt=""
            className="absolute inset-0 w-full h-full object-cover filter blur-sm"
            style={{ filter: 'blur(15px)' }}
          />
        )}
        
        {/* Main image */}
        <img
          src={imageUrl}
          width={width}
          height={height}
          alt={alt || 'Photo'}
          className={`${className} transition-all duration-300 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClick}
          style={{ 
            transform: 'translate3d(0, 0, 0)',
            cursor: onClick ? 'pointer' : 'default',
            ...style
          }}
          draggable={false}
          loading="eager"
          onLoad={handleImageLoad}
          onError={handleImageError}
          // Force high priority for first batch
          fetchPriority={index < 12 ? 'high' : 'auto'}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </div>
    );
  }

  // For images beyond the first 24, use lazy loading but with very aggressive settings
  return (
    <LazyLoadImage
      src={imageUrl}
      width={width}
      height={height}
      alt={alt || 'Photo'}
      className={`${className} transition-all duration-300 ease-out`}
      onClick={onClick}
      placeholderSrc={optimizedBlurDataURL}
      effect="blur"
      threshold={500} // Even more aggressive - start loading 500px before viewport
      visibleByDefault={false}
      delayMethod="throttle"
      delayTime={25} // Even more responsive throttling
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      wrapperProps={{
        style: {
          display: 'block',
          width: '100%',
          height: '100%'
        }
      }}
      onLoad={() => {
        console.log(`🔄 Lazy loaded image ${index}: ${publicId.substring(0, 20)}...`);
      }}
      onError={() => {
        console.warn(`❌ Failed to lazy load image ${index}: ${publicId}`);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

export default OptimizedImage; 