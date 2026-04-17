import { LLMEnricher } from './llm.js';
import { HireAgentAPI } from './api.js';
import { searchGitHub, searchWeb, closeBrowser } from './searchers/index.js';
import { config } from './config.js';
import type { RawAgentData, EnrichedAgent } from './types.js';

export interface PipelineOptions {
  sources?: ('github' | 'web')[];
  githubQuery?: string;
  webQuery?: string;
  dryRun?: boolean;
}

export async function runPipeline(options: PipelineOptions = {}): Promise<void> {
  const { sources = ['github', 'web'], dryRun = false } = options;

  const llm = new LLMEnricher();
  if (!llm.isAvailable()) {
    console.error('❌ LLM enricher not available. Set KIMI_API_KEY / OPENAI_API_KEY in .env, or ensure Ollama is running.');
    process.exit(1);
  }
  console.log(`🤖 Using LLM provider: ${llm.getProvider()}`);

  const api = new HireAgentAPI();

  // 1. Collect raw data
  const rawData: RawAgentData[] = [];

  if (sources.includes('github')) {
    const githubResults = await searchGitHub({
      query: options.githubQuery || 'AI agent OR MCP server',
      perPage: Math.max(5, Math.floor(config.MAX_AGENTS_PER_RUN / 2)),
    });
    rawData.push(...githubResults);
  }

  if (sources.includes('web')) {
    const webResults = await searchWeb({
      query: options.webQuery || 'best AI agents 2024 2025',
      maxResults: Math.max(5, Math.floor(config.MAX_AGENTS_PER_RUN / 2)),
    });
    rawData.push(...webResults);
  }

  await closeBrowser();

  // Deduplicate by sourceUrl or name
  const seen = new Map<string, RawAgentData>();
  for (const item of rawData) {
    const key = item.sourceUrl || item.name.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  const uniqueRawData = Array.from(seen.values());

  if (uniqueRawData.length === 0) {
    console.log('⚠️ No raw data found. Exiting.');
    return;
  }

  console.log(`\n📦 Collected ${rawData.length} raw items, ${uniqueRawData.length} after dedup. Starting LLM enrichment...\n`);

  // 2. Enrich with LLM
  const enriched: EnrichedAgent[] = [];
  for (let i = 0; i < uniqueRawData.length; i++) {
    const raw = uniqueRawData[i];
    console.log(`🧠 [${i + 1}/${rawData.length}] Enriching: ${raw.name}`);
    const result = await llm.enrich(raw);
    if (result) {
      enriched.push(result);
    }
    // Small delay to avoid rate limits
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
      console.log(`  - ${agent.nameZh} (${agent.category})`);
    }
    return;
  }

  // 3. Upload via API
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
