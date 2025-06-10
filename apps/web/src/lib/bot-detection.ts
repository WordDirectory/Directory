/**
 * Simple bot detection for bypassing word lookup limits
 * Only for search engines crawling word pages
 */

const SEARCH_ENGINE_BOTS = [
  "Googlebot",
  "bingbot",
  "Slurp", // Yahoo
  "DuckDuckBot",
  "Baiduspider",
  "YandexBot",
  "facebookexternalhit",
  "Twitterbot",
];

/**
 * Check if request is from a search engine bot that should bypass word limits
 */
export function isSearchEngineBot({
  userAgent,
}: {
  userAgent: string | null | undefined;
}): boolean {
  if (!userAgent) return false;

  const userAgentLower = userAgent.toLowerCase();
  const isBot = SEARCH_ENGINE_BOTS.some((bot) =>
    userAgentLower.includes(bot.toLowerCase())
  );

  if (isBot) {
    console.log(`[Bot Detection] Search engine bot detected: ${userAgent}`);
  }

  return isBot;
}
