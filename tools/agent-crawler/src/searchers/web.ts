import { chromium, type Browser, type Page } from 'playwright';
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

export interface WebSearchOptions {
  query: string;
  maxResults?: number;
}

export async function searchWeb(options: WebSearchOptions): Promise<RawAgentData[]> {
  const { query, maxResults = 10 } = options;
  console.log(`🔍 Searching Web: ${query}`);

  const browser = await getBrowser();
  const page = await browser.newPage();
  const results: RawAgentData[] = [];

  try {
    // Use Bing as a simple scraping target
    await page.goto(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('li.b_algo', { timeout: 10000 }).catch(() => null);

    const items = await page.locator('li.b_algo').evaluateAll(
      (elements: HTMLElement[], max: number) =>
        elements.slice(0, max).map((el) => {
          const titleEl = el.querySelector('h2 a');
          const descEl = el.querySelector('p');
          return {
            title: titleEl?.textContent?.trim() || '',
            url: (titleEl as HTMLAnchorElement)?.href || '',
            description: descEl?.textContent?.trim() || '',
          };
        }),
      maxResults
    );

    for (const item of items) {
      if (!item.title || !item.url) continue;
      results.push({
        source: 'web',
        sourceUrl: item.url,
        name: item.title,
        description: item.description,
        rawText: `${item.title}\n${item.description}\nURL: ${item.url}`,
      });
    }

    console.log(`✅ Web search returned ${results.length} results`);
  } catch (err: any) {
    console.error('❌ Web search failed:', err.message);
  } finally {
    await page.close();
  }

  return results;
}
