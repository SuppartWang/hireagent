export type AgentCategory = 'coding' | 'writing' | 'research' | 'data_analysis' | 'customer_service' | 'education' | 'creative' | 'productivity' | 'legal' | 'finance' | 'other';
export type AgentCapability = 'web_search' | 'code_execution' | 'image_generation' | 'file_reading' | 'database_query' | 'email_send' | 'calendar_access' | 'browser_control' | 'memory' | 'multi_agent';
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
export interface AgentListItem extends Pick<Agent, 'id' | 'slug' | 'nameZh' | 'nameEn' | 'taglineZh' | 'taglineEn' | 'category' | 'tags' | 'capabilities' | 'avatarUrl' | 'hireCount' | 'ratingAvg' | 'ratingCount' | 'rankingScore' | 'status' | 'isFeatured' | 'publishedAt' | 'createdAt' | 'creatorUsername' | 'creatorDisplayName'> {
}
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
export declare const POINT_RULES: {
    readonly AGENT_HIRED: 10;
    readonly FIVE_STAR_REVIEW: 50;
    readonly FEATURED: 100;
    readonly FIRST_PUBLISH: 25;
    readonly REVIEW_HELPFUL: 5;
};
export declare const BADGE_THRESHOLDS: Record<BadgeTier, {
    min: number;
    max: number;
}>;
export declare const CATEGORY_LABELS: Record<AgentCategory, {
    zh: string;
    en: string;
}>;
export declare const CAPABILITY_LABELS: Record<AgentCapability, {
    zh: string;
    en: string;
}>;
export declare function computeBadgeTier(totalPoints: number): BadgeTier;
