import axios from 'axios';
import * as cheerio from 'cheerio';
import type { RawAgentData } from '../types.js';

interface AggregatorConfig {
  name: string;
  url: string;
  listSelector: string;
  itemSelector: string;
  titleSelector: string;
  descSelector: string;
  linkSelector: string;
  linkAttr: string;
}

const AGGREGATORS: AggregatorConfig[] = [
  {
    name: 'theresanaiforthat',
    url: 'https://theresanaiforthat.com/featured/',
    listSelector: '.index_masonry__3V7v7',
    itemSelector: 'a[href^="/"]',
    titleSelector: '.index_service_title__2lCeV',
    descSelector: '.index_service_desc__1b2wE',
    linkSelector: 'a',
    linkAttr: 'href',
  },
];

export async function fetchAggregators(): Promise<RawAgentData[]> {
  const results: RawAgentData[] = [];

  for (const agg of AGGREGATORS) {
    console.log(`🔍 Fetching aggregator: ${agg.name}`);
    try {
      const res = await axios.get(agg.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(res.data);
      const items = $(agg.itemSelector);

      items.each((_i, el) => {
        const $el = $(el);
        const title = $el.find(agg.titleSelector).text().trim() || $el.text().trim();
        const desc = $el.find(agg.descSelector).text().trim();
        let link = $el.find(agg.linkSelector).attr(agg.linkAttr) || $el.attr('href') || '';
        if (link && link.startsWith('/')) {
          const base = new URL(agg.url);
          link = `${base.protocol}//${base.host}${link}`;
        }

        if (title && title.length > 1) {
          results.push({
            source: `aggregator:${agg.name}`,
            sourceUrl: link,
            name: title,
            description: desc,
            rawText: `${title}\n${desc}\nURL: ${link}`,
          });
        }
      });

      console.log(`  ✅ Found ${items.length} items`);
    } catch (err: any) {
      console.warn(`  ⚠️ ${agg.name} failed: ${err.message}`);
    }
  }

  return results;
}
