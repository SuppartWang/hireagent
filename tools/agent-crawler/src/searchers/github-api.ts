import axios from 'axios';
import type { RawAgentData } from '../types.js';

const GITHUB_API = 'https://api.github.com';

export interface GitHubSearchOptions {
  query?: string;
  minStars?: number;
  perPage?: number;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'hireagent-crawler/1.0',
  };
  const token = process.env.GITHUB_TOKEN || '';
  if (token && (token.startsWith('ghp_') || token.startsWith('github_pat_'))) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

const AGENT_KEYWORDS = ['agent', 'mcp', 'llm', 'ai', 'assistant', 'bot', 'copilot', 'automation', 'workflow'];
const JUNK_NAMES = ['awesome', 'list', 'collection', 'curated', 'resources', 'examples', 'templates'];

export function isLikelyAgentRepo(name: string, description: string, topics: string[]): boolean {
  const text = `${name} ${description} ${topics.join(' ')}`.toLowerCase();
  const hasAgentKw = AGENT_KEYWORDS.some((kw) => text.includes(kw));
  const isJunk = JUNK_NAMES.some((kw) => name.toLowerCase().includes(kw));
  return hasAgentKw && !isJunk;
}

export async function searchGitHubRepos(options: GitHubSearchOptions = {}): Promise<RawAgentData[]> {
  const {
    query = 'mcp-server in:name,description',
    minStars = 20,
    perPage = 15,
  } = options;

  const q = `${query} stars:>=${minStars}`;
  console.log(`🔍 GitHub API search: ${q}`);

  try {
    const res = await axios.get(`${GITHUB_API}/search/repositories`, {
      params: { q, sort: 'stars', order: 'desc', per_page: perPage },
      headers: getHeaders(),
      timeout: 15000,
    });

    const items = res.data.items || [];
    const results: RawAgentData[] = [];

    for (const repo of items) {
      const desc = repo.description || '';
      const topics = repo.topics || [];
      if (!isLikelyAgentRepo(repo.name, desc, topics)) {
        continue;
      }
      results.push({
        source: 'github',
        sourceUrl: repo.html_url,
        name: repo.name,
        description: desc,
        topics,
        language: repo.language || '',
        stars: repo.stargazers_count,
        rawText: `${repo.name}\n${desc}\nTopics: ${topics.join(', ')}\nStars: ${repo.stargazers_count}\nURL: ${repo.html_url}`,
      });
    }

    console.log(`  ✅ Found ${results.length}/${items.length} relevant repositories`);
    return results;
  } catch (err: any) {
    if (err.response?.status === 401) {
      console.warn('  ⚠️ GitHub token invalid. Running unauthenticated (rate limit: 60/hr).');
      const saved = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = '';
      const retry = await searchGitHubRepos(options);
      process.env.GITHUB_TOKEN = saved;
      return retry;
    }
    console.error(`  ❌ GitHub search failed: ${err.response?.data?.message || err.message}`);
    return [];
  }
}
