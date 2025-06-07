'use client';

import React, { useState, useEffect } from 'react';

interface PerformanceStats {
  totalImages: number;
  loadedImages: number;
  averageLoadTime: number;
  webpSupported: boolean;
  avifSupported: boolean;
}

const PerformanceStats: React.FC = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    totalImages: 0,
    loadedImages: 0,
    averageLoadTime: 0,
    webpSupported: false,
    avifSupported: false,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check format support
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    const checkAVIFSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    };

    // Monitor image loading performance
    const images = document.querySelectorAll('img');
    const loadTimes: number[] = [];
    let loadedCount = 0;

    const handleImageLoad = (startTime: number) => {
      const loadTime = performance.now() - startTime;
      loadTimes.push(loadTime);
      loadedCount++;
      
      const averageTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      
      setStats(prev => ({
        ...prev,
        totalImages: images.length,
        loadedImages: loadedCount,
        averageLoadTime: averageTime,
      }));
    };

    // Attach load listeners to existing images
    images.forEach(img => {
      if (img.complete) {
        loadedCount++;
      } else {
        const startTime = performance.now();
        img.addEventListener('load', () => handleImageLoad(startTime), { once: true });
      }
    });

    setStats(prev => ({
      ...prev,
      totalImages: images.length,
      loadedImages: loadedCount,
      webpSupported: checkWebPSupport(),
      avifSupported: checkAVIFSupport(),
    }));
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 left-6 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-40"
      >
        📊 Performance
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 z-40 max-w-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900">Performance Stats</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Images Loaded:</span>
          <span className="font-medium">{stats.loadedImages}/{stats.totalImages}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Avg Load Time:</span>
          <span className="font-medium">{stats.averageLoadTime.toFixed(0)}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">WebP Support:</span>
          <span className={`font-medium ${stats.webpSupported ? 'text-green-600' : 'text-red-600'}`}>
            {stats.webpSupported ? '✅ Yes' : '❌ No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">AVIF Support:</span>
          <span className={`font-medium ${stats.avifSupported ? 'text-green-600' : 'text-red-600'}`}>
            {stats.avifSupported ? '✅ Yes' : '❌ No'}
          </span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="mb-1">🚀 <strong>Optimizations Active:</strong></div>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Auto format delivery (WebP/AVIF)</li>
            <li>Automatic quality optimization</li>
            <li>Responsive image sizing</li>
            <li>Lazy loading with blur placeholders</li>
            <li>Progressive JPEG loading</li>
            <li>Device pixel ratio optimization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats; 