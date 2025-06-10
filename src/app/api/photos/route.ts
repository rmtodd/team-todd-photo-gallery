import { NextRequest, NextResponse } from 'next/server';
import { getPhotos } from '@/lib/cloudinary';
import { apiRateLimit } from '@/lib/rate-limit';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = apiRateLimit(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: 'Too many requests. Please slow down.',
        resetTime: rateLimitResult.resetTime 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
        }
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Input validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30'))); // Cap at 100
    const nextCursor = searchParams.get('next_cursor');
    const folder = searchParams.get('folder') || '';
    
    // Validate folder parameter to prevent path traversal
    if (folder && !/^[a-zA-Z0-9_-]+$/.test(folder)) {
      return NextResponse.json(
        { error: 'Invalid folder parameter' },
        { status: 400 }
      );
    }
    
    const result = await getPhotos({
      nextCursor: nextCursor || undefined,
      limit,
      folder,
    });
    
    const response = NextResponse.json({
      photos: result.photos,
      next_cursor: result.nextCursor,
      total_count: result.totalCount,
      page,
      limit,
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Add cache control headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Photos API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
} 