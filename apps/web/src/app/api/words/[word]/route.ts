import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { getWord } from '@/lib/supabase/queries';

export async function HEAD(
  request: Request,
  { params }: { params: { word: string } }
) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    
    // Apply rate limiting
    await rateLimit(ip);
    
    // Decode the URL-encoded word parameter
    const word = decodeURIComponent(params.word).trim();
    const result = await getWord(word);
    
    if (result) {
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

export async function GET(
  request: Request,
  { params }: { params: { word: string } }
) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    
    // Apply rate limiting
    await rateLimit(ip);

    const { searchParams } = new URL(request.url);
    const fallback = searchParams.get('fallback');
    // Decode the URL-encoded word parameter
    const word = decodeURIComponent(params.word).trim();

    const result = await getWord(word);

    // If word exists, return the data
    if (result) {
      return NextResponse.json(result);
    }

    // If word doesn't exist and we have a fallback URL, redirect there
    if (fallback) {
      return NextResponse.redirect(fallback);
    }

    // If no fallback provided, return 404
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