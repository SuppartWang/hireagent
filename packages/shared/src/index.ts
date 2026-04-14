export type AgentCategory =
  | 'coding'
  | 'writing'
  | 'research'
  | 'data_analysis'
  | 'customer_service'
  | 'education'
  | 'creative'
  | 'productivity'
  | 'legal'
  | 'finance'
  | 'other';

export type AgentCapability =
  | 'web_search'
  | 'code_execution'
  | 'image_generation'
  | 'file_reading'
  | 'database_query'
  | 'email_send'
  | 'calendar_access'
  | 'browser_control'
  | 'memory'
  | 'multi_agent';

export type AgentStatus = 'draft' | 'published' | 'featured' | 'archived';

export type HireType = 'export_claude' | 'export_generic' | 'export_yaml' | 'try' | 'copy_prompt';

export type BadgeTier = '新星' | '成长者' | '精英' | '大师';

export type SortOption = 'ranking' | 'newest' | 'rating' | 'usage' | 'trending';

export interface AgentMCPServer {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface AgentMCPConfig {
  mcpServers: Record<string, Omit<AgentMCPServer, 'name'>>;
}

export interface Agent {
  id: string;
  creatorId: string;
  creatorUsername?: string;
  creatorDisplayName?: string;
  slug: string;
  nameZh: string;
  nameEn?: string;
  descriptionZh: string;
  descriptionEn?: string;
  taglineZh?: string;
  taglineEn?: string;
  systemPrompt: string;
  systemPromptLang: 'zh-CN' | 'en';
  mcpConfig?: AgentMCPConfig;
  category: AgentCategory;
  tags: string[];
  capabilities: AgentCapability[];
  supportedModels: string[];
  languageSupport: string[];
  avatarUrl?: string;
  coverUrl?: string;
  demoVideoUrl?: string;
  hireCount: number;
  tryCount: number;
  ratingAvg: number;
  ratingCount: number;
  qualityScore: number;
  rankingScore: number;
  status: AgentStatus;
  isFeatured: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface AgentListItem extends Pick<Agent,
  'id' | 'slug' | 'nameZh' | 'nameEn' | 'taglineZh' | 'taglineEn' |
  'category' | 'tags' | 'capabilities' | 'avatarUrl' |
  'hireCount' | 'ratingAvg' | 'ratingCount' | 'rankingScore' |
  'status' | 'isFeatured' | 'publishedAt' | 'createdAt' |
  'creatorUsername' | 'creatorDisplayName'
> {}

export interface Review {
  id: string;
  agentId: string;
  userId: string;
  username?: string;
  displayName?: string;
  rating: number;
  commentZh?: string;
  commentEn?: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  preferredLang: 'zh-CN' | 'en';
  totalPoints: number;
  badgeTier: BadgeTier;
  isAdmin: boolean;
  createdAt: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  agentId?: string;
  agentName?: string;
  amount: number;
  reason: string;
  descriptionZh?: string;
  descriptionEn?: string;
  createdAt: string;
}

export interface AgentFilters {
  search?: string;
  category?: AgentCategory | 'all';
  capabilities?: AgentCapability[];
  language?: string;
  model?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const POINT_RULES = {
  AGENT_HIRED: 10,
  FIVE_STAR_REVIEW: 50,
  FEATURED: 100,
  FIRST_PUBLISH: 25,
  REVIEW_HELPFUL: 5,
} as const;

export const BADGE_THRESHOLDS: Record<BadgeTier, { min: number; max: number }> = {
  '新星': { min: 0, max: 99 },
  '成长者': { min: 100, max: 499 },
  '精英': { min: 500, max: 1999 },
  '大师': { min: 2000, max: Infinity },
};

export const CATEGORY_LABELS: Record<AgentCategory, { zh: string; en: string }> = {
  coding: { zh: '编程开发', en: 'Coding' },
  writing: { zh: '写作创作', en: 'Writing' },
  research: { zh: '研究调查', en: 'Research' },
  data_analysis: { zh: '数据分析', en: 'Data Analysis' },
  customer_service: { zh: '客户服务', en: 'Customer Service' },
  education: { zh: '教育培训', en: 'Education' },
  creative: { zh: '创意设计', en: 'Creative' },
  productivity: { zh: '效率工具', en: 'Productivity' },
  legal: { zh: '法律咨询', en: 'Legal' },
  finance: { zh: '财务金融', en: 'Finance' },
  other: { zh: '其他', en: 'Other' },
};

export const CAPABILITY_LABELS: Record<AgentCapability, { zh: string; en: string }> = {
  web_search: { zh: '网络搜索', en: 'Web Search' },
  code_execution: { zh: '代码执行', en: 'Code Execution' },
  image_generation: { zh: '图像生成', en: 'Image Generation' },
  file_reading: { zh: '文件读取', en: 'File Reading' },
  database_query: { zh: '数据库查询', en: 'Database Query' },
  email_send: { zh: '发送邮件', en: 'Email Send' },
  calendar_access: { zh: '日历访问', en: 'Calendar Access' },
  browser_control: { zh: '浏览器控制', en: 'Browser Control' },
  memory: { zh: '长期记忆', en: 'Memory' },
  multi_agent: { zh: '多智能体', en: 'Multi-Agent' },
};

export function computeBadgeTier(totalPoints: number): BadgeTier {
  for (const [tier, range] of Object.entries(BADGE_THRESHOLDS) as [BadgeTier, { min: number; max: number }][]) {
    if (totalPoints >= range.min && totalPoints <= range.max) return tier;
  }
  return '新星';
}
