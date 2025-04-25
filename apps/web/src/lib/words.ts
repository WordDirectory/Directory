import { SearchWordsResponse, WordResponse } from '@/types/api'

const API_BASE = '/api/words'

// Cache for 1 year - practically forever since our data is static
const CACHE_OPTIONS = {
  next: {
    revalidate: 31536000 // 1 year in seconds
  }
}

export async function searchWords(query: string, limit = 50, offset = 0): Promise<SearchWordsResponse> {
  const searchParams = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    offset: offset.toString()
  })

  const res = await fetch(`${API_BASE}/search?${searchParams}`, CACHE_OPTIONS)
  if (!res.ok) throw new Error('Failed to search words')
  
  return res.json()
}

export async function getWord(word: string | null): Promise<WordResponse | null> {
  if (!word) return null

  const isServer = typeof window === 'undefined';
  const relativeUrl = `${API_BASE}/${encodeURIComponent(word)}`;
  const url = isServer ? `http://${process.env.NEXT_PUBLIC_SITE_URL}${relativeUrl}` : relativeUrl;

  const res = await fetch(url, CACHE_OPTIONS)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error('Failed to fetch word')
  }

  return res.json()
}

export async function checkWordExists(word: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(word)}`, {
    method: 'HEAD',
    ...CACHE_OPTIONS
  })
  return res.ok
}

export function getWordAudioUrl(word: string): string {
  return `${API_BASE}/${encodeURIComponent(word)}/audio`
}

export async function getRandomWords(limit = 50): Promise<SearchWordsResponse> {
  const searchParams = new URLSearchParams({
    limit: limit.toString()
  })

  const res = await fetch(`${API_BASE}/random?${searchParams}`, CACHE_OPTIONS)
  if (!res.ok) throw new Error('Failed to fetch random words')
  
  return res.json()
} 