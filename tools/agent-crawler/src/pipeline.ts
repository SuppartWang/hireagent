import { LLMEnricher } from './llm.js';
import { HireAgentAPI } from './api.js';
import {
  fetchAwesomeLists,
  searchGitHubRepos,
  searchProductHunt,
  fetchAggregators,
  searchWeb,
  closeBrowser,
} from './searchers/index.js';
import { config } from './config.js';
import type { RawAgentData, EnrichedAgent } from './types.js';

export interface PipelineOptions {
  sources?: string[];
  dryRun?: boolean;
}

const JUNK_KEYWORDS = [
  '核聚变', '人造太阳', 'BEST装置', '合肥', '发电',
  '邮件礼仪', 'best regards', 'sincerely', 'cheers',
  '英文信件', '结束语', '信件格式',
  '天气预报', '彩票', '股票推荐', '赌博',
  'nude', 'porn', 'adult', 'sex',
];

const POSITIVE_KEYWORDS = ['agent', 'mcp', 'llm', 'ai', 'assistant', 'bot', 'copilot', 'automation', 'workflow', 'plugin', 'extension', 'tool'];

function isJunk(raw: RawAgentData): boolean {
  const text = `${raw.name} ${raw.description}`.toLowerCase();
  return JUNK_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function relevanceScore(raw: RawAgentData): number {
  const text = `${raw.name} ${raw.description} ${(raw.topics || []).join(' ')}`.toLowerCase();
  let score = 0;
  for (const kw of POSITIVE_KEYWORDS) {
    if (text.includes(kw)) score += 2;
  }
  if (raw.source.startsWith('awesome')) score += 3; // awesome lists are curated
  if (raw.source === 'producthunt') score += 2;
  if (raw.stars && raw.stars > 100) score += 1;
  if (raw.stars && raw.stars > 1000) score += 2;
  return score;
}

function dedupeAndRank(rawData: RawAgentData[]): RawAgentData[] {
  const seen = new Map<string, RawAgentData>();
  for (const item of rawData) {
    const key = (item.sourceUrl || item.name).toLowerCase().trim();
    if (!seen.has(key) && !isJunk(item)) {
      seen.set(key, item);
    }
  }
  const unique = Array.from(seen.values());
  unique.sort((a, b) => relevanceScore(b) - relevanceScore(a));
  return unique;
}

export async function runPipeline(options: PipelineOptions = {}): Promise<void> {
  const { sources = ['awesome', 'github', 'producthunt', 'aggregators', 'web'], dryRun = false } = options;

  const llm = new LLMEnricher();
  if (!llm.isAvailable()) {
    console.error('❌ LLM enricher not available. Set KIMI_API_KEY / OPENAI_API_KEY in .env, or ensure Ollama is running.');
    process.exit(1);
  }
  console.log(`🤖 Using LLM provider: ${llm.getProvider()}`);

  const api = new HireAgentAPI();

  // 1. Collect raw data from multiple high-quality sources
  const rawData: RawAgentData[] = [];

  if (sources.includes('awesome')) {
    const awesome = await fetchAwesomeLists();
    rawData.push(...awesome);
  }

  if (sources.includes('github')) {
    const github = await searchGitHubRepos({
      query: 'topic:mcp-server OR topic:ai-agent OR topic:llm-agent',
      perPage: 20,
    });
    rawData.push(...github);
  }

  if (sources.includes('producthunt')) {
    const ph = await searchProductHunt('artificial-intelligence', 10);
    rawData.push(...ph);
  }

  if (sources.includes('aggregators')) {
    const agg = await fetchAggregators();
    rawData.push(...agg);
  }

  if (sources.includes('web')) {
    const web = await searchWeb(5);
    rawData.push(...web);
  }

  await closeBrowser();

  // 2. Deduplicate + filter junk + rank by relevance
  const ranked = dedupeAndRank(rawData);

  // Only send top candidates to LLM to avoid timeouts
  const LLM_BATCH_SIZE = Math.min(12, config.MAX_AGENTS_PER_RUN * 2);
  const candidates = ranked.slice(0, LLM_BATCH_SIZE);

  if (candidates.length === 0) {
    console.log('⚠️ No relevant data found after filtering. Exiting.');
    return;
  }

  console.log(`\n📦 Collected ${rawData.length} raw items, ${ranked.length} after dedup/filter.`);
  console.log(`🎯 Sending top ${candidates.length} candidates to LLM enrichment...\n`);

  // 3. Enrich with LLM
  const enriched: EnrichedAgent[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const raw = candidates[i];
    console.log(`🧠 [${i + 1}/${candidates.length}] ${raw.source} | ${raw.name.slice(0, 60)}`);
    const result = await llm.enrich(raw);
    if (result) {
      enriched.push(result);
    }
    await sleep(500);
  }

  if (enriched.length === 0) {
    console.log('⚠️ No agents could be enriched. Exiting.');
    return;
  }

  // Limit to max agents per run
  const toImport = enriched.slice(0, config.MAX_AGENTS_PER_RUN);
  console.log(`\n🚀 Ready to import ${toImport.length} agents.`);

  if (dryRun) {
    console.log('\n🏃 DRY RUN — would import the following agents:');
    for (const agent of toImport) {
      console.log(`  - [${agent.category}] ${agent.nameZh}`);
      console.log(`    Tags: ${agent.tags?.join(', ')}`);
      console.log(`    Capabilities: ${agent.capabilities?.join(', ')}`);
    }
    return;
  }

  // 4. Upload via API
  try {
    const result = await api.importAgents(toImport);
    console.log(`\n✅ Import complete: ${result.success} success, ${result.failed} failed`);
    if (result.errors.length > 0) {
      console.log('Errors:', result.errors);
    }
    if (result.importedIds.length > 0) {
      console.log('Imported IDs:', result.importedIds.join(', '));
    }
  } catch (err: any) {
    console.error('\n❌ Upload failed:', err.message);
    process.exit(1);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
