'use client';

import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import CloudinaryTest from "@/components/CloudinaryTest";

export default function Home() {
  const { authenticated, permission, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // This shouldn't happen due to middleware, but just in case
    return null;
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

        {/* Gallery Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Photo Gallery
          </h2>
          
          {/* Cloudinary Integration Demo */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cloudinary Integration Test
            </h3>
            <CloudinaryTest />
          </div>

          {/* Placeholder for actual gallery */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Photo Gallery Coming Soon
                </h3>
                <p className="text-gray-500">
                  The main photo gallery will be implemented in the next phase.
                </p>
                {permission === 'upload' && (
                  <p className="text-sm text-indigo-600 mt-2">
                    You can upload photos using the Upload page in the navigation.
                  </p>
                )}
              </div>
            </div>
          </div>
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
    </div>
  );
}
