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

async function wordExists(word: string): Promise<boolean> {
  try {
    const response = await fetch(`https://worddirectory.app/api/words/${encodeURIComponent(word)}`, {
      method: 'HEAD'
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

function handleSelectedWord(word: string, tabId: number) {
  const cleanWord = word.toLowerCase().trim();
  chrome.tabs.update(tabId, {
    url: `https://worddirectory.app/words/${encodeURIComponent(cleanWord)}`
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
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const url = new URL(details.url);
  const searchEngine = isSearchEngine(url.hostname);
  
  if (searchEngine) {
    const searchParams = new URLSearchParams(url.search);
    const query = searchParams.get(searchEngine.queryParam);
    
    if (query) {
      const word = extractWord(query);
      if (word && await wordExists(word)) {
        chrome.tabs.update(details.tabId, {
          url: `https://worddirectory.app/words/${encodeURIComponent(word)}`
        });
      }
      // If word doesn't exist or API fails, do nothing (let search proceed)
    }
  }
}); 