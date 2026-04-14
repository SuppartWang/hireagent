import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react'
import { AgentListItem, AgentCategory, AgentCapability, SortOption, CATEGORY_LABELS, CAPABILITY_LABELS } from '@hireagent/shared'
import { agentsApi } from '../../api'
import { AgentCard } from '../../components/agent/AgentCard'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../utils/cn'

const SORT_OPTIONS: SortOption[] = ['ranking', 'newest', 'rating', 'usage', 'trending']

export function MarketplacePage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { viewMode, setViewMode } = useUIStore()
  const [agents, setAgents] = useState<AgentListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const sort = (searchParams.get('sort') || 'ranking') as SortOption
  const category = searchParams.get('category') || 'all'
  const capsParam = searchParams.get('capabilities') || ''
  const selectedCapabilities = capsParam ? capsParam.split(',') : []
  const q = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(q)

  const fetchAgents = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await agentsApi.list({
        sort,
        category: category !== 'all' ? category as AgentCategory : undefined,
        capabilities: selectedCapabilities.length ? selectedCapabilities as AgentCapability[] : undefined,
        search: q || undefined,
        page: p,
        limit: 20,
      })
      setAgents(p === 1 ? data.data : prev => [...prev, ...data.data])
      setTotal(data.total)
      setPage(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [sort, category, q, selectedCapabilities.join(',')])

  useEffect(() => { fetchAgents(1) }, [fetchAgents])

  const updateParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    value ? p.set(key, value) : p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('q', searchInput)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">{t('marketplace.title')}</h1>

        {/* Search + toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t('marketplace.search_placeholder')}
                className="input w-full pl-9"
              />
            </div>
            <button type="submit" className="btn-primary px-4">搜索</button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn('btn-secondary flex items-center gap-1.5', filterOpen && 'bg-brand-primary/20 text-brand-accent border-brand-primary/30')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{t('marketplace.filter_category')}</span>
            </button>
            <div className="flex border border-surface-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={cn('p-2', viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-surface-overlay text-slate-400 hover:text-white')}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={cn('p-2', viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-surface-overlay text-slate-400 hover:text-white')}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {SORT_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => updateParam('sort', s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                sort === s ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white hover:bg-surface-overlay'
              )}
            >
              {t(`marketplace.sort_${s}`)}
            </button>
          ))}
        </div>

        {/* Category filter */}
        {filterOpen && (
          <div className="mt-3 p-4 card space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">{t('marketplace.filter_category')}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateParam('category', '')}
                  className={cn('badge cursor-pointer', category === 'all' ? 'bg-brand-primary text-white' : 'bg-surface-overlay text-slate-400 hover:text-white')}
                >
                  {t('marketplace.all_categories')}
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, labels]) => (
                  <button
                    key={key}
                    onClick={() => updateParam('category', key)}
                    className={cn('badge cursor-pointer', category === key ? 'bg-brand-primary text-white' : 'bg-surface-overlay text-slate-400 hover:text-white')}
                  >
                    {i18n.language === 'zh-CN' ? labels.zh : labels.en}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300 mb-2">{t('marketplace.filter_capability')}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CAPABILITY_LABELS).map(([key, labels]) => {
                  const active = selectedCapabilities.includes(key)
                  const next = active
                    ? selectedCapabilities.filter(c => c !== key)
                    : [...selectedCapabilities, key]
                  return (
                    <button
                      key={key}
                      onClick={() => updateParam('capabilities', next.join(','))}
                      className={cn('badge cursor-pointer', active ? 'bg-brand-secondary text-white' : 'bg-surface-overlay text-slate-400 hover:text-white')}
                    >
                      {i18n.language === 'zh-CN' ? labels.zh : labels.en}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading && agents.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse">
              <div className="w-14 h-14 bg-surface-overlay rounded-xl mb-3" />
              <div className="h-4 bg-surface-overlay rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-overlay rounded w-1/3 mb-3" />
              <div className="h-3 bg-surface-overlay rounded w-full mb-1" />
              <div className="h-3 bg-surface-overlay rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('marketplace.no_results')}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">共 {total} 个智能体</p>
          <div className={cn(
            'gap-4',
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'flex flex-col'
          )}>
            {agents.map(agent => <AgentCard key={agent.id} agent={agent} compact={viewMode === 'list'} />)}
          </div>
          {agents.length < total && (
            <div className="mt-8 text-center">
              <button onClick={() => fetchAgents(page + 1)} disabled={loading} className="btn-secondary px-8">
                {loading ? t('common.loading') : t('marketplace.load_more')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
