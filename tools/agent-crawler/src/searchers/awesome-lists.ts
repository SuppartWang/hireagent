import axios from 'axios';
import type { RawAgentData } from '../types.js';

interface AwesomeListConfig {
  owner: string;
  repo: string;
  path?: string;
  category?: string;
}

const AWESOME_LISTS: AwesomeListConfig[] = [
  { owner: 'punkpeye', repo: 'awesome-mcp-servers', category: 'other' },
  { owner: 'modelcontextprotocol', repo: 'servers', path: 'README.md', category: 'other' },
  { owner: 'e2b-dev', repo: 'awesome-ai-agents', category: 'other' },
];

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

async function fetchReadme(owner: string, repo: string, path?: string): Promise<string> {
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${path || 'README.md'}`;
  try {
    const res = await axios.get(rawUrl, {
      timeout: 8000,
      responseType: 'text',
      transformResponse: [(data) => data],
    });
    return String(res.data);
  } catch {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme${path ? `/${path}` : ''}`;
    const res = await axios.get(apiUrl, {
      headers: getHeaders(),
      timeout: 10000,
    });
    const content = res.data.content || '';
    return Buffer.from(content, 'base64').toString('utf-8');
  }
}

// Heuristic to detect if a line looks like a tool/server entry in an awesome list
function isToolEntry(line: string): boolean {
  // Must contain a description separator
  if (!/[-–—:]/.test(line)) return false;
  // Skip TOC entries, video links, community links
  const skipPatterns = [
    /^\[?\s*what is/i, /^\[?\s*tips/i, /^\[?\s*setup/i,
    /reddit|discord|youtube|youtu\.be|twitter|x\.com/i,
    /blog post|article|guide|tutorial|documentation/i,
    /^\[?\s*official\s*\]?/i, /^\[?\s*community\s*\]?/i,
    /^#+\s/, /^\*\*[^*]+\*\*$/,
  ];
  return !skipPatterns.some((p) => p.test(line));
}

function extractListItems(md: string): Array<{ name: string; url: string; description: string }> {
  const items: Array<{ name: string; url: string; description: string }> = [];
  const lines = md.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('- ') && !trimmed.startsWith('* ')) continue;

    const content = trimmed.slice(2).trim();
    if (!isToolEntry(content)) continue;

    // Match [name](url) - description
    const linkDesc = content.match(/^\[([^\]]+)\]\(([^)]+)\)\s*[-–—:]\s*(.+)$/);
    if (linkDesc) {
      items.push({ name: linkDesc[1].trim(), url: linkDesc[2].trim(), description: linkDesc[3].trim() });
      continue;
    }

    // Match **[name](url)** - description
    const boldLinkDesc = content.match(/^\*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*[-–—:]\s*(.+)$/);
    if (boldLinkDesc) {
      items.push({ name: boldLinkDesc[1].trim(), url: boldLinkDesc[2].trim(), description: boldLinkDesc[3].trim() });
      continue;
    }

    // Match **name** - description (without link)
    const boldDesc = content.match(/^\*\*([^*]+)\*\*\s*[-–—:]\s*(.+)$/);
    if (boldDesc) {
      items.push({ name: boldDesc[1].trim(), url: '', description: boldDesc[2].trim() });
    }
  }
  return items;
}

function cleanName(name: string): string {
  // Remove markdown formatting, emoji, owner/repo prefix
  let cleaned = name
    .replace(/[\[\]]/g, '')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/^\s*[-–—]\s*/, '')
    .trim();

  // If it looks like owner/repo, extract repo part
  if (/^[^/\s]+\/[^/\s]+$/.test(cleaned)) {
    cleaned = cleaned.split('/').pop() || cleaned;
  }

  return cleaned
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDescription(desc: string): string {
  return desc
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchAwesomeLists(): Promise<RawAgentData[]> {
  const results: RawAgentData[] = [];

  for (const list of AWESOME_LISTS) {
    console.log(`📚 Fetching awesome list: ${list.owner}/${list.repo}`);

    try {
      const md = await fetchReadme(list.owner, list.repo, list.path);
      const listItems = extractListItems(md);

      for (const item of listItems) {
        const name = cleanName(item.name);
        const desc = cleanDescription(item.description);

        if (name.length > 1 && desc.length > 5 && !/^https?:/.test(name)) {
          results.push({
            source: `awesome:${list.repo}`,
            sourceUrl: item.url || `https://github.com/${list.owner}/${list.repo}`,
            name,
            description: desc,
            rawText: `${name}\n${desc}\nSource: ${list.owner}/${list.repo}\nURL: ${item.url}`,
          });
        }
      }

      console.log(`  ✅ Parsed ${listItems.length} tool entries (${results.length - (results.length - listItems.length)} kept)`);
    } catch (err: any) {
      console.warn(`  ⚠️ Failed: ${err.message}`);
    }
  }

  return results;
}
