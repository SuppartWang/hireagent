import dotenv from 'dotenv';
import { z } from 'zod';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const configSchema = z.object({
  HIREAGENT_API_BASE_URL: z.string().url().default('http://localhost:3001/api/v1'),
  HIREAGENT_ADMIN_EMAIL: z.string().default(''),
  HIREAGENT_ADMIN_PASSWORD: z.string().default(''),

  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  KIMI_API_KEY: z.string().optional(),
  KIMI_BASE_URL: z.string().url().default('https://api.moonshot.cn/v1'),
  KIMI_MODEL: z.string().default('moonshot-v1-8k'),

  OLLAMA_BASE_URL: z.string().url().default('http://localhost:11434/v1'),
  OLLAMA_MODEL: z.string().default('qwen2.5:7b'),

  LLM_PROVIDER: z.enum(['kimi', 'ollama', 'openai']).default('kimi'),

  SERPER_API_KEY: z.string().optional(),

  MAX_AGENTS_PER_RUN: z.coerce.number().default(20),
  PUBLISH_ON_IMPORT: z.coerce.boolean().default(true),
});

export const config = configSchema.parse(process.env);

export const VALID_CATEGORIES = [
  'coding', 'writing', 'research', 'data_analysis', 'customer_service',
  'education', 'creative', 'productivity', 'legal', 'finance', 'other',
] as const;

export const VALID_CAPABILITIES = [
  'web_search', 'code_execution', 'image_generation', 'file_reading',
  'database_query', 'email_send', 'calendar_access', 'browser_control',
  'memory', 'multi_agent',
] as const;
