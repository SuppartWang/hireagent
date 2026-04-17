import OpenAI from 'openai';
import { config, VALID_CATEGORIES, VALID_CAPABILITIES } from './config.js';
import type { RawAgentData, EnrichedAgent } from './types.js';

type ProviderConfig = {
  client: OpenAI;
  model: string;
  provider: string;
};

export class LLMEnricher {
  private config: ProviderConfig | null = null;

  constructor() {
    this.config = this.resolveProvider();
  }

  private resolveProvider(): ProviderConfig | null {
    const provider = config.LLM_PROVIDER;

    if (provider === 'kimi' && config.KIMI_API_KEY) {
      return {
        client: new OpenAI({ apiKey: config.KIMI_API_KEY, baseURL: config.KIMI_BASE_URL }),
        model: config.KIMI_MODEL,
        provider: 'kimi',
      };
    }

    if (provider === 'openai' && config.OPENAI_API_KEY) {
      return {
        client: new OpenAI({ apiKey: config.OPENAI_API_KEY, baseURL: config.OPENAI_BASE_URL }),
        model: config.OPENAI_MODEL,
        provider: 'openai',
      };
    }

    if (provider === 'ollama') {
      return {
        client: new OpenAI({ apiKey: 'ollama', baseURL: config.OLLAMA_BASE_URL }),
        model: config.OLLAMA_MODEL,
        provider: 'ollama',
      };
    }

    // Auto-fallback logic if explicit provider is unavailable
    if (config.KIMI_API_KEY) {
      return {
        client: new OpenAI({ apiKey: config.KIMI_API_KEY, baseURL: config.KIMI_BASE_URL }),
        model: config.KIMI_MODEL,
        provider: 'kimi',
      };
    }
    if (config.OPENAI_API_KEY) {
      return {
        client: new OpenAI({ apiKey: config.OPENAI_API_KEY, baseURL: config.OPENAI_BASE_URL }),
        model: config.OPENAI_MODEL,
        provider: 'openai',
      };
    }

    return null;
  }

  isAvailable(): boolean {
    return !!this.config;
  }

  getProvider(): string {
    return this.config?.provider || 'none';
  }

  async enrich(raw: RawAgentData): Promise<EnrichedAgent | null> {
    if (!this.config) {
      throw new Error('LLM enricher not available. Please set KIMI_API_KEY or OPENAI_API_KEY, or ensure Ollama is running.');
    }

    const systemPrompt = `You are a data structuring expert for an AI Agent marketplace.
Convert the raw scraped information into a structured JSON object suitable for uploading.
Rules:
- nameZh is required. Translate from English if needed.
- descriptionZh should be 100-300 Chinese characters, professional and informative.
- systemPrompt should define the AI assistant's persona, responsibilities, and output format based on the description.
- category must be one of: ${VALID_CATEGORIES.join(', ')}
- capabilities should be selected only from: ${VALID_CAPABILITIES.join(', ')}
- tags should be 3-6 relevant keywords (Chinese preferred)
- supportedModels defaults to ["claude-3-5-sonnet-20241022", "gpt-4o"] unless specific
- languageSupport defaults to ["zh-CN", "en"]
- avatarUrl should be https://api.dicebear.com/7.x/bottts/svg?seed={safeName} (URL encoded name)
- Output ONLY valid JSON. No markdown code blocks.`;

    const userPrompt = `Raw data:\nSource: ${raw.source}\nName: ${raw.name}\nDescription: ${raw.description || 'N/A'}\nTopics: ${(raw.topics || []).join(', ')}\nReadme snippet:\n${raw.readmeSnippet || 'N/A'}\n\nRaw text:\n${raw.rawText.slice(0, 4000)}\n\nPlease output structured JSON.`;

    try {
      const completion = await this.config.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const text = completion.choices[0]?.message?.content?.trim() || '';
      const jsonText = text.replace(/^```json\s*|\s*```$/g, '');
      const parsed = JSON.parse(jsonText) as Partial<EnrichedAgent>;

      if (!parsed.nameZh || !parsed.descriptionZh || !parsed.systemPrompt) {
        console.warn(`⚠️ LLM enrichment incomplete for ${raw.name}`);
        return null;
      }

      // Normalize arrays
      const category = VALID_CATEGORIES.includes(parsed.category as any) ? parsed.category : 'other';
      const capabilities = (parsed.capabilities || []).filter((c) => VALID_CAPABILITIES.includes(c as any));
      const tags = Array.isArray(parsed.tags) ? parsed.tags : [];
      const supportedModels = Array.isArray(parsed.supportedModels) ? parsed.supportedModels : ['claude-3-5-sonnet-20241022', 'gpt-4o'];
      const languageSupport = Array.isArray(parsed.languageSupport) ? parsed.languageSupport : ['zh-CN', 'en'];
      const safeSeed = encodeURIComponent(parsed.nameZh.replace(/\s+/g, '-').slice(0, 30));

      return {
        ...parsed,
        nameZh: parsed.nameZh,
        descriptionZh: parsed.descriptionZh,
        systemPrompt: parsed.systemPrompt,
        category,
        capabilities,
        tags,
        supportedModels,
        languageSupport,
        avatarUrl: parsed.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${safeSeed}`,
      } as EnrichedAgent;
    } catch (err: any) {
      console.error(`❌ LLM enrichment failed for ${raw.name}:`, err.message);
      return null;
    }
  }
}
