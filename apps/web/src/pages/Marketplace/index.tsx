import { useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal, Grid3X3, LayoutList, Loader2 } from 'lucide-react'
import { AgentCard } from '@/components/agent/AgentCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAgents } from '@/hooks/use-agents'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import type { SortOption } from '@hireagent/shared'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'marketplace.sort_latest' },
  { value: 'ranking', label: 'marketplace.sort_ranking' },
  { value: 'trending', label: 'marketplace.sort_trending' },
]

export function MarketplacePage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { openExportModal } = useUIStore()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [q, setQ] = useState(searchParams.get('q') || '')
  const debouncedQ = useDebounce(q, 300)

  const sort = (searchParams.get('sort') as SortOption) || 'newest'
  const category = searchParams.get('category') || undefined

  const { data: response, isLoading } = useAgents({
    search: debouncedQ || undefined,
    sort,
    category: category as any,
    page: 1,
    limit: 20,
  })

  const agents = response?.data || []

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams)
      if (value) next.set(key, value)
      else next.delete(key)
      setSearchParams(next)
    },
    [searchParams, setSearchParams]
  )

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-8">
      {/* subtle aurora background */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-brand-secondary/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold glow-text mb-3">{t('marketplace.title')}</h1>
          <p className="text-slate-400 max-w-xl mx-auto">{t('marketplace.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('marketplace.search_placeholder')}
              className="pl-10 rounded-full border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-brand-accent/50 focus:ring-brand-accent/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateParam('sort', opt.value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  sort === opt.value
                    ? 'text-white bg-white/[0.08] border border-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                {t(opt.label)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              size="icon"
              variant={view === 'grid' ? 'default' : 'outline'}
              className={cn('rounded-full', view === 'grid' ? 'bg-white/10 text-white' : 'border-white/10 text-slate-400')}
              onClick={() => setView('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={view === 'list' ? 'default' : 'outline'}
              className={cn('rounded-full', view === 'list' ? 'bg-white/10 text-white' : 'border-white/10 text-slate-400')}
              onClick={() => setView('list')}
            >
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : agents.length > 0 ? (
          <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} compact={view === 'grid'} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] flex items-center justify-center">
              <SlidersHorizontal className="w-7 h-7 text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{t('marketplace.no_results')}</h3>
            <p className="text-slate-500">{t('marketplace.try_adjust')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
