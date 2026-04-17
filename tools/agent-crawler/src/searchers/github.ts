import axios from 'axios';
import type { RawAgentData } from '../types.js';

const GITHUB_API = 'https://api.github.com';

export interface GitHubSearchOptions {
  query?: string;
  minStars?: number;
  language?: string;
  perPage?: number;
}

export async function searchGitHub(options: GitHubSearchOptions = {}): Promise<RawAgentData[]> {
  const {
    query = 'AI agent OR MCP server OR LLM agent',
    minStars = 10,
    language,
    perPage = 20,
  } = options;

  const q = `${query} stars:>=${minStars}${language ? ` language:${language}` : ''}`;
  console.log(`🔍 Searching GitHub: ${q}`);

  try {
    const res = await axios.get(`${GITHUB_API}/search/repositories`, {
      params: { q, sort: 'stars', order: 'desc', per_page: perPage },
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'hireagent-crawler/1.0',
        // Add GITHUB_TOKEN env var support if rate limited
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });

    const items = res.data.items || [];
    const results: RawAgentData[] = [];

    for (const repo of items) {
      const raw: RawAgentData = {
        source: 'github',
        sourceUrl: repo.html_url,
        name: repo.name,
        description: repo.description || '',
        topics: repo.topics || [],
        language: repo.language || '',
        stars: repo.stargazers_count,
        rawText: `${repo.name}\n${repo.description || ''}\nTopics: ${(repo.topics || []).join(', ')}\nLanguage: ${repo.language || ''}\nStars: ${repo.stargazers_count}`,
      };

      // Try fetching README for richer content
      try {
        const readmeRes = await axios.get(`${GITHUB_API}/repos/${repo.full_name}/readme`, {
          headers: {
            Accept: 'application/vnd.github.v3.raw',
            'User-Agent': 'hireagent-crawler/1.0',
            ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
          },
          responseType: 'text',
          transformResponse: [(data) => data],
        });
        const readmeText = String(readmeRes.data).slice(0, 3000);
        raw.readmeSnippet = readmeText;
        raw.rawText += `\n\nREADME:\n${readmeText}`;
      } catch {
        // ignore readme fetch errors
      }

      results.push(raw);
    }

    console.log(`✅ GitHub returned ${results.length} repositories`);
    return results;
  } catch (err: any) {
    console.error('❌ GitHub search failed:', err.response?.data?.message || err.message);
    return [];
  }
}
