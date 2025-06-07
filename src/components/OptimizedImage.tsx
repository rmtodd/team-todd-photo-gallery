'use client';

import React from 'react';
import { CldImage } from 'next-cloudinary';

interface OptimizedImageProps {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  onClick?: () => void;
  crop?: string;
  gravity?: string;
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
  crop = 'fill',
  gravity = 'auto',
}) => {
  return (
    <CldImage
      src={publicId}
      width={width}
      height={height}
      alt={alt || 'Photo'}
      priority={priority}
      sizes={sizes}
      className={className}
      onClick={onClick}
      crop={crop}
      gravity={gravity}
      // Optimization parameters
      format="auto" // Automatically deliver WebP/AVIF when supported
      quality="auto" // Automatic quality optimization
      dpr="auto" // Device pixel ratio optimization
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      // Enhanced transformations for better performance
      fetchFormat="auto"
      flags={['progressive']} // Progressive JPEG loading
      // Responsive breakpoints
      responsive
      // Additional optimizations
      transformation={[
        {
          quality: 'auto:good',
          fetchFormat: 'auto',
        }
      ]}
      // Generate a low-quality placeholder
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
};

export default OptimizedImage; 