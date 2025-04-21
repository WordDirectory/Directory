type SearchEngine = {
  hostname: string;
  queryParam: string;
};

const SEARCH_ENGINES: SearchEngine[] = [
  { hostname: 'google.com', queryParam: 'q' },
  { hostname: 'bing.com', queryParam: 'q' },
  { hostname: 'duckduckgo.com', queryParam: 'q' },
  { hostname: 'yahoo.com', queryParam: 'p' }
];

const isSearchEngine = (hostname: string): SearchEngine | undefined => {
  return SEARCH_ENGINES.find(engine => hostname.includes(engine.hostname));
};

const extractWord = (query: string): string | null => {
  const normalizedQuery = query.toLowerCase().trim();
  if (normalizedQuery.endsWith('definition')) {
    return query.slice(0, -10).trim(); // Remove "definition" and trim
  }
  return null;
};

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = new URL(details.url);
  const searchEngine = isSearchEngine(url.hostname);
  
  if (searchEngine) {
    const searchParams = new URLSearchParams(url.search);
    const query = searchParams.get(searchEngine.queryParam);
    
    if (query) {
      const word = extractWord(query);
      if (word) {
        chrome.tabs.update(details.tabId, {
          url: `https://worddirectory.app/words/${encodeURIComponent(word)}`
        });
      }
    }
  }
}); 