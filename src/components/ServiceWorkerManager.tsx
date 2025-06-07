'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

interface ServiceWorkerManagerProps {
  children?: React.ReactNode;
}

const ServiceWorkerManager: React.FC<ServiceWorkerManagerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const wb = new Workbox('/sw.js');

      // Handle service worker updates
      wb.addEventListener('waiting', () => {
        setUpdateAvailable(true);
      });

      wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      // Register the service worker
      wb.register().then((registration) => {
        setSwRegistration(registration);
        console.log('Service Worker registered successfully');
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated with new content');
        }
      });
    }

    // Get initial cache size
    getCacheSize();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getCacheSize = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data && typeof event.data.cacheSize === 'number') {
            setCacheSize(event.data.cacheSize);
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_SIZE' },
          [messageChannel.port2]
        );
      } catch (error) {
        console.error('Failed to get cache size:', error);
      }
    }
  };

  const updateServiceWorker = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        setCacheSize(0);
        console.log('All caches cleared');
        
        // Reload the page to get fresh content
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {children}
      
      {/* Online/Offline Status Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          <span className="text-sm font-medium">
            📡 You&apos;re offline - Some features may be limited
          </span>
        </div>
      )}

      {/* Service Worker Update Notification */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Update Available</h4>
              <p className="text-sm opacity-90">
                A new version of the app is ready to install.
              </p>
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => setUpdateAvailable(false)}
                className="text-white/70 hover:text-white text-sm"
              >
                Later
              </button>
              <button
                onClick={updateServiceWorker}
                className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cache Management (Development/Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-gray-800 text-white rounded-lg p-3 text-xs z-40">
          <div className="space-y-1">
            <div>Cache Size: {formatBytes(cacheSize)}</div>
            <div>Status: {isOnline ? '🟢 Online' : '🔴 Offline'}</div>
            <button
              onClick={clearCache}
              className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs mt-1"
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ServiceWorkerManager; 