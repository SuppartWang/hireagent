#!/usr/bin/env node

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
HireAgent Crawler — Automated agent discovery and ingestion

Usage:
  pnpm crawl [--dry-run] [--sources=...]

Sources (comma-separated):
  awesome      Parse awesome lists (awesome-mcp-servers, awesome-ai-agents)
  github       Search GitHub repos for MCP servers / AI agents
  producthunt  Crawl Product Hunt AI products
  aggregators  Fetch AI tool aggregators
  web          DuckDuckGo web search
  all          All of the above (default)

Options:
  --dry-run    Preview without uploading
  --help       Show this help

Environment:
  KIMI_API_KEY / OPENAI_API_KEY / OLLAMA
  HIREAGENT_ADMIN_EMAIL / HIREAGENT_ADMIN_PASSWORD
`);
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const dryRun = args.includes('--dry-run');

const sourcesArg = args.find((a) => a.startsWith('--sources='));
let sources: string[] | undefined;
if (sourcesArg) {
  const val = sourcesArg.split('=')[1];
  sources = val === 'all' ? ['awesome', 'github', 'producthunt', 'aggregators', 'web'] : val.split(',');
}

async function main() {
  const { runPipeline } = await import('./pipeline.js');
  await runPipeline({ sources, dryRun });
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
