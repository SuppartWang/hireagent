import { apiClient } from './client'
import { AgentFilters, PaginatedResponse, AgentListItem, Agent } from '@hireagent/shared'

export const agentsApi = {
  list: (filters?: AgentFilters) =>
    apiClient.get<PaginatedResponse<AgentListItem>>('/agents', { params: filters }),

  featured: () => apiClient.get<AgentListItem[]>('/agents/featured'),

  trending: () => apiClient.get<AgentListItem[]>('/agents/trending'),

  getBySlug: (slug: string) => apiClient.get<Agent>(`/agents/${slug}`),

  create: (data: Partial<Agent>) => apiClient.post<Agent>('/agents', data),

  update: (id: string, data: Partial<Agent>) => apiClient.put<Agent>(`/agents/${id}`, data),

  publish: (id: string) => apiClient.post<Agent>(`/agents/${id}/publish`),

  hire: (id: string, hireType: string) =>
    apiClient.post(`/agents/${id}/hire`, { hireType }),

  bookmark: (id: string) => apiClient.post(`/agents/${id}/bookmark`),

  platformStats: () => apiClient.get('/agents/stats/platform'),

  exportClaude: (agentId: string) =>
    apiClient.get(`/export/${agentId}/claude`, { responseType: 'blob' }),

  exportGeneric: (agentId: string) =>
    apiClient.get(`/export/${agentId}/generic`, { responseType: 'blob' }),

  exportYaml: (agentId: string) =>
    apiClient.get(`/export/${agentId}/yaml`, { responseType: 'blob' }),

  getPrompt: (agentId: string) =>
    apiClient.get(`/export/${agentId}/prompt`, { responseType: 'text' }),

  exportOpenClaw: (agentId: string) =>
    apiClient.get(`/export/${agentId}/openclaw`, { responseType: 'blob' }),
}

export const reviewsApi = {
  list: (agentId: string, page = 1) =>
    apiClient.get(`/reviews/agent/${agentId}`, { params: { page } }),

  create: (agentId: string, data: { rating: number; commentZh?: string; commentEn?: string }) =>
    apiClient.post(`/reviews/agent/${agentId}`, data),

  markHelpful: (reviewId: string) => apiClient.post(`/reviews/${reviewId}/helpful`),
}

export const usersApi = {
  me: () => apiClient.get('/users/me'),
  updateMe: (data: any) => apiClient.put('/users/me', data),
  myAgents: () => apiClient.get('/users/me/agents'),
  myPoints: (page = 1) => apiClient.get('/users/me/points', { params: { page } }),
  myBookmarks: () => apiClient.get('/users/me/bookmarks'),
  publicProfile: (username: string) => apiClient.get(`/users/${username}`),
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (email: string, password: string, username: string, displayName?: string) =>
    apiClient.post('/auth/register', { email, password, username, displayName }),
}

export const adminApi = {
  stats: () => apiClient.get('/admin/stats'),
  recalculateRankings: () => apiClient.post('/admin/rankings/recalculate'),
  featureAgent: (id: string, featured: boolean) =>
    apiClient.post(`/admin/agents/${id}/feature`, { featured }),
}
