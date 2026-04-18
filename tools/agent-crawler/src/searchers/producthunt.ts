import axios from 'axios';
import type { RawAgentData } from '../types.js';

// Product Hunt GraphQL API (public, no auth needed for basic queries)
const PH_API = 'https://www.producthunt.com/frontend/graphql';

export async function searchProductHunt(topic: string = 'artificial-intelligence', perPage: number = 15): Promise<RawAgentData[]> {
  console.log(`🔍 Product Hunt search: topic=${topic}`);

  const query = `
    query GetTopicPage($slug: String!, $first: Int!) {
      topic(slug: $slug) {
        id
        name
        posts(first: $first) {
          edges {
            node {
              id
              name
              tagline
              description
              url
              votesCount
              website
            }
          }
        }
      }
    }
  `;

  try {
    const res = await axios.post(
      PH_API,
      { query, variables: { slug: topic, first: perPage } },
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );

    const edges = res.data?.data?.topic?.posts?.edges || [];
    const results: RawAgentData[] = [];

    for (const edge of edges) {
      const post = edge.node;
      if (!post) continue;
      const desc = post.description || post.tagline || '';
      results.push({
        source: 'producthunt',
        sourceUrl: post.website || `https://www.producthunt.com/posts/${post.id}`,
        name: post.name,
        description: desc,
        rawText: `${post.name}\n${desc}\nVotes: ${post.votesCount || 0}\nURL: ${post.website || ''}`,
      });
    }

    console.log(`  ✅ Found ${results.length} products`);
    return results;
  } catch (err: any) {
    console.warn(`  ⚠️ Product Hunt failed: ${err.response?.data?.errors?.[0]?.message || err.message}`);
    return [];
  }
}
