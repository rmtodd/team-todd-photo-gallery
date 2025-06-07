'use client';

import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import PhotoGallery from "@/components/PhotoGallery";
import UploadWidget from "@/components/UploadWidget";
import PerformanceStats from "@/components/PerformanceStats";
import { useEffect, useState } from "react";

export default function Home() {
  const { authenticated, permission, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch and content flash
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state until component is mounted and auth is resolved
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // This shouldn't happen due to middleware, but just in case
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Team Todd Photo Gallery
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            A secure photo gallery for the Todd family
          </p>
          <p className="text-sm text-gray-500">
            You have <span className="font-medium">{permission}</span> access
          </p>
        </div>

        {/* Photo Gallery */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Photo Gallery
          </h2>
          
          <PhotoGallery 
            onPhotoClick={(index, photos) => {
              console.log('Photo clicked:', index, photos[index]);
              // TODO: Implement modal view in next task
            }}
          />
        </div>

        {/* Feature Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                🔐 Secure Authentication
              </h3>
              <p className="text-gray-600">
                Two-level password protection with upload and view-only access levels.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                ☁️ Cloud Storage
              </h3>
              <p className="text-gray-600">
                Photos are securely stored and optimized using Cloudinary.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                📱 Responsive Design
              </h3>
              <p className="text-gray-600">
                Works perfectly on desktop, tablet, and mobile devices.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                🚀 Fast Performance
              </h3>
              <p className="text-gray-600">
                Built with Next.js for optimal performance and user experience.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Widget - only shows for users with upload permission */}
      <UploadWidget 
        onSuccess={(result) => {
          console.log('Upload success:', result);
          // Refresh the page to show new photos in gallery
          setTimeout(() => {
            window.location.reload();
          }, 1000); // Small delay to let the upload complete
        }}
        onFailure={(error) => {
          console.error('Upload error:', error);
          alert('Upload failed. Please try again.');
        }}
      />

      {/* Performance Stats - shows optimization benefits */}
      <PerformanceStats />
    </div>
  );
}
