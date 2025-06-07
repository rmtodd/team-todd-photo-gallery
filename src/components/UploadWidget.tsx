'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UploadWidgetProps {
  onSuccess?: (result: any) => void;
  onFailure?: (error: any) => void;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

const UploadWidget: React.FC<UploadWidgetProps> = ({ onSuccess, onFailure }) => {
  const { permission } = useAuth();
  const cloudinaryRef = useRef<any>();
  const widgetRef = useRef<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  // Only show upload button for users with upload permission
  if (permission !== 'upload') {
    return null;
  }

  useEffect(() => {
    // Add Cloudinary script if not already loaded
    if (!cloudinaryRef.current) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        cloudinaryRef.current = window.cloudinary;
        initializeWidget();
      };
    } else {
      initializeWidget();
    }
    
    return () => {
      // Clean up widget if component unmounts
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);
  
  const initializeWidget = () => {
    if (!cloudinaryRef.current) return;
    
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'team_todd_uploads',
        sources: [
          'local',
          'camera',
          'url',
          'google_drive',
          'dropbox',
          'instagram'
        ],
        multiple: true,
        maxFiles: 50,
        maxFileSize: 10000000, // 10MB
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'],
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#3B82F6',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#3B82F6',
            action: '#3B82F6',
            inactiveTabIcon: '#9CA3AF',
            error: '#EF4444',
            inProgress: '#3B82F6',
            complete: '#10B981',
            sourceBg: '#F9FAFB'
          },
          fonts: {
            default: null,
            "'Inter', sans-serif": {
              url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
              active: true
            }
          }
        },
        showUploadMoreButton: true,
        autoMinimize: false,
        showAdvancedOptions: false,
        showPoweredBy: false,
        folder: 'family-photos', // Organize uploads in a folder
        resourceType: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          console.log('Upload successful:', result.info);
          setUploadCount(prev => prev + 1);
          if (onSuccess) onSuccess(result.info);
        }
        
        if (error) {
          console.error('Upload error:', error);
          if (onFailure) onFailure(error);
        }

        // Handle upload start/end for loading state
        if (result?.event === 'upload-added') {
          setIsLoading(true);
        }
        
        if (result?.event === 'close' || result?.event === 'success') {
          setIsLoading(false);
        }
      }
    );
  };
  
  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };
  
  return (
    <>
      {/* Upload Button */}
      <button
        onClick={openWidget}
        disabled={isLoading}
        className={`
          fixed bottom-6 right-6 z-50
          bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300
          text-white font-semibold
          py-3 px-6 rounded-full shadow-lg
          transition-all duration-200 ease-in-out
          transform hover:scale-105 active:scale-95
          flex items-center space-x-2
          ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            <span>Upload Photos</span>
          </>
        )}
      </button>

      {/* Upload Success Notification */}
      {uploadCount > 0 && (
        <div className="fixed bottom-20 right-6 z-40 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          {uploadCount} photo{uploadCount > 1 ? 's' : ''} uploaded!
        </div>
      )}
    </>
  );
};

export default UploadWidget; 