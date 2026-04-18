import { chromium, type Browser } from 'playwright';
import type { RawAgentData } from '../types.js';

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await chromium.launch({ headless: true });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

const SEARCH_QUERIES = [
  '"AI agent" "productivity" "tool" site:producthunt.com OR site:futurepedia.io',
  '"MCP server" "model context protocol" github.com',
  '"AI assistant" "workflow automation" 2024 2025',
  '"GPT agent" "custom AI" marketplace platform',
];

export async function searchWeb(maxResults: number = 8): Promise<RawAgentData[]> {
  const browser = await getBrowser();
  const results: RawAgentData[] = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`🔍 Web search: ${query.slice(0, 80)}...`);
    const page = await browser.newPage();

    try {
      // Use DuckDuckGo HTML version (lighter than Bing)
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

      const items = await page.locator('.result').evaluateAll((elements: HTMLElement[], max: number) =>
        elements.slice(0, max).map((el) => {
          const titleEl = el.querySelector('.result__a');
          const snippetEl = el.querySelector('.result__snippet');
          const urlEl = el.querySelector('.result__url');
          return {
            title: titleEl?.textContent?.trim() || '',
            url: (titleEl as HTMLAnchorElement)?.href || urlEl?.textContent?.trim() || '',
            snippet: snippetEl?.textContent?.trim() || '',
          };
        }),
        maxResults
      );

      for (const item of items) {
        if (!item.title || !item.url) continue;
        // Skip news / generic content
        if (/核聚变|人造太阳|BEST|regards|sincerely/i.test(item.title + item.snippet)) continue;
        results.push({
          source: 'web',
          sourceUrl: item.url,
          name: item.title,
          description: item.snippet,
          rawText: `${item.title}\n${item.snippet}\nURL: ${item.url}`,
        });
      }

      console.log(`  ✅ Returned ${items.length} results`);
    } catch (err: any) {
      console.warn(`  ⚠️ Web search failed: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  return results;
}
