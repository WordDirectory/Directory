import { NextResponse } from 'next/server';
import { words } from '@/data/words';

export async function HEAD(
  { params }: { params: { word: string } }
) {
  const word = params.word.toLowerCase().trim();
  
  if (words[word]) {
    return new NextResponse(null, { status: 200 });
  }
  
  return new NextResponse(null, { status: 404 });
} 