import { supabase } from '.'
import { TWord } from '@/types/word'

export async function searchWords(query: string, limit = 50, offset = 0) {
  const { data, error, count } = await supabase
    .from('words')
    .select('word', { count: 'exact' })
    .ilike('word', `%${query}%`)
    .range(offset, offset + limit - 1)
    .order('word')

  if (error) throw error
  return { words: data?.map(w => w.word) ?? [], totalCount: count ?? 0 }
}

export async function getWord(word: string): Promise<{ word: string; details: TWord } | null> {
  try {
    console.log(`[Supabase] Fetching word: ${word}`);

    // First get the word
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .select('id, word')
      .eq('word', word)
      .single()

    if (wordError) {
      console.error('[Supabase] Word fetch error:', {
        error: wordError,
        word,
        timestamp: new Date().toISOString()
      });
      return null;
    }

    if (!wordData) {
      console.log(`[Supabase] Word not found: ${word}`);
      return null;
    }

    console.log(`[Supabase] Fetching definitions for word_id: ${wordData.id}`);

    // Then get all definitions for this word
    const { data: definitionsData, error: definitionsError } = await supabase
      .from('definitions')
      .select(`
        id,
        text,
        examples (
          text
        )
      `)
      .eq('word_id', wordData.id)

    if (definitionsError) {
      console.error('[Supabase] Definitions fetch error:', {
        error: definitionsError,
        wordId: wordData.id,
        word,
        timestamp: new Date().toISOString()
      });
      throw definitionsError;
    }

    // Transform the data to match our TWord type
    const details: TWord = {
      definitions: definitionsData?.map((def) => ({
        text: def.text,
        examples: def.examples?.map(e => e.text) ?? []
      })) ?? []
    }

    return {
      word: wordData.word,
      details
    }
  } catch (error) {
    console.error('[Supabase] Unexpected error in getWord:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      word,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

export async function wordExists(word: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })
    .eq('word', word)

  if (error) throw error
  return (count ?? 0) > 0
}

export async function getRandomWords(limit: number = 50): Promise<string[]> {
  // First get total count for idx
  const { count, error: countError } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  if (countError) throw countError
  if (!count) return []

  // Generate random indexes
  const randomIndexes = Array.from({ length: limit }, () =>
    Math.floor(Math.random() * count) + 1
  )

  // Fetch words with those indexes
  const { data, error } = await supabase
    .from('words')
    .select('word')
    .in('idx', randomIndexes)

  if (error) {
    console.error('Error fetching random words:', error)
    throw error
  }

  return data?.map(row => row.word) ?? []
}