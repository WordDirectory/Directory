import { NextResponse } from 'next/server';
import { words } from '@/data/words';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'
    
    // Apply rate limiting
    await rateLimit(ip)
    
    const word = (await params).word.toLowerCase().trim();
    
    if (words[word]) {
      return new NextResponse(null, { status: 200 });
    }
    
    return new NextResponse(null, { status: 404 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Too many requests') {
      return new NextResponse(null, { 
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      });
    }
    return new NextResponse(null, { status: 500 });
  }
} 