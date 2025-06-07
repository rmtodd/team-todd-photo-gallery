'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';

interface ServiceWorkerManagerProps {
  children?: React.ReactNode;
}

const ServiceWorkerManager: React.FC<ServiceWorkerManagerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
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
        setSwRegistration(registration || null);
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

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateServiceWorker = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
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


    </>
  );
};

export default ServiceWorkerManager; 