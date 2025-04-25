type SearchEngine = {
  hostname: string;
  queryParam: string;
};

const SEARCH_ENGINES: SearchEngine[] = [
  { hostname: 'google.com', queryParam: 'q' },
  { hostname: 'bing.com', queryParam: 'q' },
  { hostname: 'duckduckgo.com', queryParam: 'q' },
  { hostname: 'yahoo.com', queryParam: 'p' },
  { hostname: 'search.brave.com', queryParam: 'q' }
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

function handleSelectedWord(word: string, tabId: number) {
  const cleanWord = word.trim();
  const capitalizedWord = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
  chrome.tabs.create({
    url: `https://worddirectory.app/api/words/${encodeURIComponent(capitalizedWord)}`
  });
}

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'word-directory',
    title: 'Look up "%s" in WordDirectory',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'word-directory' && info.selectionText && tab?.id) {
    handleSelectedWord(info.selectionText, tab.id);
  }
});

// Handle search bar definitions
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = new URL(details.url);
  const searchEngine = isSearchEngine(url.hostname);
  
  if (searchEngine) {
    const searchParams = new URLSearchParams(url.search);
    const query = searchParams.get(searchEngine.queryParam);
    
    if (query) {
      const word = extractWord(query);
      if (word) {
        const cleanWord = word.trim();
        const capitalizedWord = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
        chrome.tabs.update(details.tabId, {
          url: `https://worddirectory.app/api/words/${encodeURIComponent(capitalizedWord)}?fallback=${encodeURIComponent(details.url)}`
        });
      }
    }
  }
});

// Handle extension icon clicks
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: 'https://worddirectory.app'
  });
}); 