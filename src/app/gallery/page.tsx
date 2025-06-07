'use client';

import { useAuth } from "@/contexts/AuthContext";
import PhotoGallery from "@/components/PhotoGallery";
import UploadWidget from "@/components/UploadWidget";

// Force dynamic rendering to prevent caching issues with middleware authentication
export const dynamic = 'force-dynamic';

export default function GalleryPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { authenticated, loading, hasUploadPermission } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Team Todd Photo Gallery
            </h1>
            <p className="text-gray-600">
              Please log in to access the gallery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ backgroundColor: '#ffffff' }}>
      {/* Clean, edge-to-edge photo gallery extending to top */}
      <main className="w-full bg-white">
        <PhotoGallery />
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
    </div>
  );
} 