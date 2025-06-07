import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): { success: boolean; remaining: number; resetTime: number } => {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const now = Date.now();
    
    // Clean up old entries
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
    
    // Initialize or get current count for this IP
    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }
    
    store[ip].count++;
    
    const remaining = Math.max(0, config.maxRequests - store[ip].count);
    const success = store[ip].count <= config.maxRequests;
    
    return {
      success,
      remaining,
      resetTime: store[ip].resetTime,
    };
  };
}

// Pre-configured rate limiters
export const authRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced from 15)
  maxRequests: 50, // 50 attempts per 5 minutes (increased from 10)
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

// Development helper to clear rate limit store
export function clearRateLimitStore() {
  Object.keys(store).forEach(key => {
    delete store[key];
  });
} 