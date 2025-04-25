import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase/server";

// Helper to get words starting with a letter
async function getWordsByLetter(letter: string) {
  const { data, error } = await supabase
    .from('words')
    .select('word, updated_at')
    .ilike('word', `${letter}%`)
    .order('word');

  if (error) throw error;
  return data || [];
}

// Get all unique first letters of words
async function getUniqueFirstLetters() {
  const { data, error } = await supabase
    .from('words')
    .select('word')

  if (error) throw error;
  
  // Get unique first letters
  const letters = new Set(data?.map(w => w.word[0].toLowerCase()) || []);
  return Array.from(letters).sort();
}

export async function generateSitemaps() {
  const letters = await getUniqueFirstLetters();
  return letters.map(letter => ({ id: letter }));
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NODE_ENV === 'development'
    ? `http://${process.env.NEXT_PUBLIC_SITE_URL}`
    : `https://${process.env.NEXT_PUBLIC_SITE_URL}`;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  // Get all words starting with this letter
  const words = await getWordsByLetter(id);
  
  return words.map((word) => ({
    url: `${baseUrl}/words/${encodeURIComponent(word.word)}`,
    lastModified: word.updated_at || new Date(),
    // These pages change rarely
    changeFrequency: 'monthly' as const,
    // Dictionary entries are important content
    priority: 0.8,
  }));
} 