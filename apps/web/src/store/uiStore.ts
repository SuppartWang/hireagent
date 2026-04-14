import { create } from 'zustand'

interface UIState {
  viewMode: 'grid' | 'list'
  lang: 'zh-CN' | 'en'
  exportModal: { open: boolean; agentId: string | null; agentName: string }
  setViewMode: (mode: 'grid' | 'list') => void
  setLang: (lang: 'zh-CN' | 'en') => void
  openExportModal: (agentId: string, agentName: string) => void
  closeExportModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'grid',
  lang: 'zh-CN',
  exportModal: { open: false, agentId: null, agentName: '' },
  setViewMode: (mode) => set({ viewMode: mode }),
  setLang: (lang) => set({ lang }),
  openExportModal: (agentId, agentName) => set({ exportModal: { open: true, agentId, agentName } }),
  closeExportModal: () => set({ exportModal: { open: false, agentId: null, agentName: '' } }),
}))
