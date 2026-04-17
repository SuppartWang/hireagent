#!/usr/bin/env node

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
HireAgent Crawler — Automated agent discovery and ingestion

Usage:
  pnpm crawl [--dry-run] [--sources=github,web] [--github-query="..."] [--web-query="..."]

Options:
  --dry-run          Preview without uploading
  --sources          Comma-separated list: github,web (default: both)
  --github-query     Custom GitHub search query
  --web-query        Custom web search query
  --help             Show this help

Environment:
  HIREAGENT_API_BASE_URL
  HIREAGENT_ADMIN_EMAIL
  HIREAGENT_ADMIN_PASSWORD
  OPENAI_API_KEY
`);
}

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const dryRun = args.includes('--dry-run');

const sourcesArg = args.find((a) => a.startsWith('--sources='));
const sources = sourcesArg
  ? (sourcesArg.split('=')[1].split(',') as ('github' | 'web')[])
  : undefined;

const githubQueryArg = args.find((a) => a.startsWith('--github-query='));
const githubQuery = githubQueryArg ? githubQueryArg.split('=')[1] : undefined;

const webQueryArg = args.find((a) => a.startsWith('--web-query='));
const webQuery = webQueryArg ? webQueryArg.split('=')[1] : undefined;

async function main() {
  const { runPipeline } = await import('./pipeline.js');
  await runPipeline({ sources, githubQuery, webQuery, dryRun });
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
