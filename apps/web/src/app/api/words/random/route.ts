import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'
import { getRandomWords } from '@/lib/supabase/queries'
import { unstable_cache } from 'next/cache'

// Cache the random words fetch with Next.js built-in caching
const getCachedRandomWords = unstable_cache(
  async (limit: number) => {
    return await getRandomWords(limit)
  },
  ['random-words'],
  { revalidate: 31536000, tags: ['random-words'] } // Cache for 1 year
)

export async function GET(request: Request) {
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'
    
    // Apply rate limiting
    await rateLimit(ip)

    const { searchParams } = new URL(request.url)
    console.log(searchParams)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100) // Max 100 results
    console.log(limit)

    // Get random words using Next.js cache
    const results = await getCachedRandomWords(limit)

    return NextResponse.json({ words: results, totalCount: results.length })
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Too many requests') {
        return new NextResponse(null, { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        })
      }
    }
    
    return new NextResponse(null, { status: 500 })
  }
} 