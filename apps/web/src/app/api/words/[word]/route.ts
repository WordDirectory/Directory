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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
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
    const word = (await params).word.toLowerCase().trim();

    // If word exists, redirect to the word page
    if (words[word]) {
      return NextResponse.redirect(`https://worddirectory.app/words/${encodeURIComponent(word)}`);
    }

    // If word doesn't exist and we have a fallback URL, redirect there
    if (fallback) {
      return NextResponse.redirect(fallback);
    }

    // If no fallback provided, redirect to 404 page
    return NextResponse.redirect(`https://worddirectory.app/words/${encodeURIComponent(word)}`);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Too many requests') {
      return NextResponse.redirect('https://worddirectory.app/429');
    }
    // In case of any other errors, redirect to homepage
    return NextResponse.redirect('https://worddirectory.app');
  }
} 