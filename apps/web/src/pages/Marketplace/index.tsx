import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react'
import { AgentCategory, AgentCapability, SortOption, CATEGORY_LABELS, CAPABILITY_LABELS } from '@hireagent/shared'
import { AgentCard } from '@/components/agent/AgentCard'
import { useUIStore } from '@/store/uiStore'
import { useAgents } from '@/hooks/use-agents'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const SORT_OPTIONS: SortOption[] = ['ranking', 'newest', 'rating', 'usage', 'trending']

export function MarketplacePage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { viewMode, setViewMode } = useUIStore()
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  const sort = (searchParams.get('sort') || 'ranking') as SortOption
  const category = searchParams.get('category') || 'all'
  const capsParam = searchParams.get('capabilities') || ''
  const selectedCapabilities = capsParam ? capsParam.split(',') : []
  const q = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(q)

  const filters = {
    sort,
    category: category !== 'all' ? category as AgentCategory : undefined,
    capabilities: selectedCapabilities.length ? selectedCapabilities as AgentCapability[] : undefined,
    search: q || undefined,
    page,
    limit: 20,
  }

  const { data, isLoading, isFetching } = useAgents(filters)
  const agents = data?.data || []
  const total = data?.total || 0

  const updateParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    value ? p.set(key, value) : p.delete(key)
    p.delete('page')
    setSearchParams(p)
    setPage(1)
  }, [searchParams, setSearchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('q', searchInput)
  }

  const loadMore = () => setPage(p => p + 1)

  const showSkeleton = isLoading && agents.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">{t('marketplace.title')}</h1>

        {/* Search + toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t('marketplace.search_placeholder')}
                className="w-full pl-9"
              />
            </div>
            <Button type="submit">{t('common.search')}</Button>
          </form>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setFilterOpen(!filterOpen)}
              className={cn('flex items-center gap-1.5', filterOpen && 'border-primary text-primary')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{t('marketplace.filter_category')}</span>
            </Button>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={cn('p-2', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-slate-400 hover:text-white')}>
                <Grid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={cn('p-2', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-slate-400 hover:text-white')}>
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
                sort === s ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white hover:bg-secondary'
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
                  className={cn('badge cursor-pointer', category === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-slate-400 hover:text-white')}
                >
                  {t('marketplace.all_categories')}
                </button>
                {Object.entries(CATEGORY_LABELS).map(([key, labels]) => (
                  <button
                    key={key}
                    onClick={() => updateParam('category', key)}
                    className={cn('badge cursor-pointer', category === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-slate-400 hover:text-white')}
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
                      className={cn('badge cursor-pointer', active ? 'bg-brand-secondary text-white' : 'bg-secondary text-slate-400 hover:text-white')}
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
      {showSkeleton ? (
        <div className={cn('gap-4', viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col')}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{t('marketplace.no_results')}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 mb-4">{t('marketplace.total_agents', { count: total })}</p>
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
              <Button variant="secondary" onClick={loadMore} disabled={isFetching}>
                {isFetching ? t('common.loading') : t('marketplace.load_more')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
