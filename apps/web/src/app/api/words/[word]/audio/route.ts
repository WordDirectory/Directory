import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { audioRateLimit } from '@/lib/rate-limit';
import { wordExists } from '@/lib/supabase/queries';

// Default voice ID for a natural, clear voice from ElevenLabs
const DEFAULT_VOICE_ID = 'TX3LPaxmHKxFdv7VOQHJ';

export async function GET(
  request: Request,
  context: Promise<{ params: { word: string } }>
) {
  const { params } = await context;
  try {
    // Get IP address from X-Forwarded-For header or fallback to a default
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    
    // Apply stricter rate limiting for audio requests
    await audioRateLimit(ip);

    // Decode the URL-encoded word parameter
    const word = decodeURIComponent(params.word).trim();
    
    // Check if word exists
    const exists = await wordExists(word);
    if (!exists) {
      return new NextResponse(null, { status: 404 });
    }

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVEN_LABS_API_KEY!,
        },
        body: JSON.stringify({
          text: word,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('ElevenLabs API error:', await response.text());
      return new NextResponse(null, { status: 500 });
    }

    // Get the audio data
    const audioData = await response.arrayBuffer();

    // Return the audio with appropriate headers
    return new NextResponse(audioData, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error: unknown) {
    console.error('Error in audio generation:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Too many audio requests') {
        return new NextResponse(null, { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        });
      }
    }
    
    return new NextResponse(null, { status: 500 });
  }
} 