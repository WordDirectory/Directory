import { NextResponse } from 'next/server';
import { words } from '@/data/words';

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ word: string }> }
) {
  const word = (await params).word.toLowerCase().trim();
  
  if (words[word]) {
    return new NextResponse(null, { status: 200 });
  }
  
  return new NextResponse(null, { status: 404 });
} 