import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase/server";

// Get all unique first letters of words efficiently using a database function
async function getUniqueFirstLetters(): Promise<string[]> {
  // Use the RPC function that directly gets unique first letters
  const { data, error } = await supabase
    .rpc('get_unique_first_letters');

  if (error) {
    console.error('Error fetching unique first letters:', error);
    throw error;
  }
  
  return data.map((item: { first_letter: string }) => item.first_letter);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? `http://${process.env.NEXT_PUBLIC_SITE_URL}`
    : `https://${process.env.NEXT_PUBLIC_SITE_URL}`;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  // Get all letters that have words
  const letters = await getUniqueFirstLetters();

  return [
    // Static routes
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/roadmap`, lastModified: new Date() },
    
    // Letter-based sitemaps
    ...letters.map((letter: string) => ({
      url: `${baseUrl}/words/sitemap/${letter}.xml`,
      lastModified: new Date()
    }))
  ];
}
