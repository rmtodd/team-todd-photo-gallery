import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { CloudinaryPhoto } from '@/lib/cloudinary';

interface PhotoModalProps {
  photos: CloudinaryPhoto[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newIndex: number) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Reset scale and position when photo changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < photos.length - 1 && scale === 1) {
        onNavigate(currentIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0 && scale === 1) {
        onNavigate(currentIndex - 1);
      }
    },
    onSwipedUp: () => {
      if (scale === 1) {
        onClose();
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.5, 3));
  };

  const handleZoomOut = () => {
    setScale(prevScale => {
      const newScale = Math.max(prevScale - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prevScale => Math.max(1, Math.min(3, prevScale + delta)));
  };

  if (!isOpen || !photos[currentIndex]) return null;

  const photo = photos[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
        onClick={onClose}
      >
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          {...handlers}
          onWheel={handleWheel}
        >
          <motion.div
            className="relative"
            style={{
              scale,
              x: position.x,
              y: position.y,
            }}
            drag={scale > 1}
            dragConstraints={{
              left: -100,
              right: 100,
              top: -100,
              bottom: 100,
            }}
            onDragStart={() => {}}
            onDragEnd={() => {}}
            whileDrag={{ cursor: 'grabbing' }}
          >
            <img
              src={photo.secure_url}
              alt={photo.context?.custom?.caption || `Photo ${currentIndex + 1}`}
              className="max-h-screen max-w-full object-contain select-none"
              draggable={false}
            />
          </motion.div>

          {/* Navigation arrows */}
          {currentIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
              onClick={() => onNavigate(currentIndex - 1)}
              aria-label="Previous photo"
            >
              &#8249;
            </button>
          )}

          {currentIndex < photos.length - 1 && (
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
              onClick={() => onNavigate(currentIndex + 1)}
              aria-label="Next photo"
            >
              &#8250;
            </button>
          )}

          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-full transition-all"
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-full transition-all"
              aria-label="Zoom out"
            >
              -
            </button>
            <button
              onClick={handleReset}
              disabled={scale === 1}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-full transition-all"
              aria-label="Reset zoom"
            >
              Reset
            </button>
          </div>

          {/* Photo counter */}
          <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>

          {/* Photo caption */}
          {photo.context?.custom?.caption && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg max-w-md text-center">
              {photo.context.custom.caption}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PhotoModal; 