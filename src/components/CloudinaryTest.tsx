'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface CloudinaryInfo {
  cloudName: string;
  hasApiKey: boolean;
  hasApiSecret: boolean;
}

interface Photo {
  secure_url: string;
}

const CloudinaryTest = () => {
  const [info, setInfo] = useState<CloudinaryInfo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test Cloudinary configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    setInfo({
      cloudName: cloudName || 'Not configured',
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
    });

    // Test photos API
    fetch('/api/photos?limit=3')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setPhotos(data.photos || []);
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Cloudinary Configuration</h4>
        <div className="text-sm space-y-1">
          <p>Cloud Name: <span className="font-mono">{info?.cloudName}</span></p>
          <p>API Key: {info?.hasApiKey ? '✅ Configured' : '❌ Missing'}</p>
          <p>API Secret: {info?.hasApiSecret ? '✅ Configured' : '❌ Missing'}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Photos API Test</h4>
        {loading ? (
          <p className="text-sm text-gray-600">Loading...</p>
        ) : error ? (
          <div className="text-sm">
            <p className="text-red-600">Error: {error}</p>
            <p className="text-gray-500 mt-1">
              This might be because there are no photos uploaded yet, or there&apos;s a configuration issue.
            </p>
          </div>
        ) : (
          <div className="text-sm">
            <p className="text-green-600">✅ API working! Found {photos.length} photos</p>
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.slice(0, 3).map((photo, index) => (
                  <Image
                    key={index}
                    src={photo.secure_url}
                    alt={`Test photo ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                    width={80}
                    height={80}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudinaryTest;
