import { NextResponse } from 'next/server';
import { clearRateLimitStore } from '@/lib/rate-limit';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    clearRateLimitStore();
    return NextResponse.json({ 
      success: true, 
      message: 'Rate limit store cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing rate limit store:', error);
    return NextResponse.json({ error: 'Failed to clear rate limit store' }, { status: 500 });
  }
} 