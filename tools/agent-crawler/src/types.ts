export interface RawAgentData {
  source: string;
  sourceUrl: string;
  name: string;
  description?: string;
  readmeSnippet?: string;
  topics?: string[];
  language?: string;
  stars?: number;
  rawText: string;
}

export interface EnrichedAgent {
  nameZh: string;
  nameEn?: string;
  descriptionZh: string;
  descriptionEn?: string;
  taglineZh?: string;
  taglineEn?: string;
  systemPrompt: string;
  systemPromptLang?: 'zh-CN' | 'en';
  category?: string;
  tags?: string[];
  capabilities?: string[];
  supportedModels?: string[];
  languageSupport?: string[];
  avatarUrl?: string;
  coverUrl?: string;
  demoVideoUrl?: string;
  mcpConfig?: Record<string, unknown>;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  importedIds: string[];
}

export type SearchProvider = 'github' | 'web';
