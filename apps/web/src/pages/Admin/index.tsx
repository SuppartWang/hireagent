import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { BarChart3, RefreshCw, Star, Search, Users, Bot, Download, MessageSquare, Award } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { agentsApi } from '@/api'
import { cn } from '@/lib/utils'
import { useAdminStats, useRecalculateRankings, useFeatureAgent } from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function AdminPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: stats, isLoading } = useAdminStats()
  const { mutateAsync: recalculate, isPending: recalculating } = useRecalculateRankings()
  const { mutateAsync: toggleFeature } = useFeatureAgent()
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  if (!user?.isAdmin) return <Navigate to="/" replace />

  const handleRecalculate = async () => {
    try {
      await recalculate()
      toast.success(t('admin.recalculate_success'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  const handleSearch = async () => {
    if (!searchQ.trim()) return
    setSearching(true)
    try {
      const res = await agentsApi.list({ search: searchQ.trim(), limit: 10 })
      setSearchResults(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const onToggleFeature = async (id: string, current: boolean) => {
    try {
      await toggleFeature({ id, featured: !current })
      setSearchResults(prev => prev.map((a: any) => a.id === id ? { ...a, isFeatured: !current } : a))
      toast.success(t('common.success'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  const statCards = stats ? [
    { label: t('admin.published'), value: stats.publishedAgents, icon: Bot },
    { label: t('admin.drafts'), value: stats.draftAgents, icon: Bot },
    { label: t('admin.users'), value: stats.totalUsers, icon: Users },
    { label: t('admin.hires'), value: stats.totalHires, icon: Download },
    { label: t('admin.hires_today'), value: stats.hiresToday, icon: Download },
    { label: t('admin.reviews'), value: stats.totalReviews, icon: MessageSquare },
    { label: t('admin.points_awarded'), value: stats.totalPointsAwarded, icon: Award },
  ] : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-brand-accent" />
        </div>
        <h1 className="text-2xl font-bold text-white">{t('nav.admin')}</h1>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card text-center">
              <Icon className="w-5 h-5 mx-auto mb-2 text-brand-accent" />
              <div className="text-2xl font-bold text-white">{Number(value).toLocaleString()}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Actions */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">{t('admin.actions')}</h2>
        <Button onClick={handleRecalculate} disabled={recalculating} className="flex items-center gap-2">
          <RefreshCw className={cn('w-4 h-4', recalculating && 'animate-spin')} />
          {recalculating ? t('common.loading') : t('admin.recalculate_rankings')}
        </Button>
      </div>

      {/* Feature Management */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">{t('admin.feature_management')}</h2>
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('admin.search_agent')}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={searching}>
            <Search className="w-4 h-4 mr-1" />
            {t('common.search')}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-border flex items-center justify-center text-lg">
                    {a.nameZh?.[0] || '🤖'}
                  </div>
                  <div>
                    <div className="font-medium text-white">{a.nameZh}</div>
                    <div className="text-xs text-slate-500">@{a.creatorUsername || '—'}</div>
                  </div>
                </div>
                <Button
                  variant={a.isFeatured ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleFeature(a.id, a.isFeatured)}
                  className={cn(
                    'flex items-center gap-1',
                    a.isFeatured && 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border-yellow-500/30'
                  )}
                >
                  <Star className={cn('w-4 h-4', a.isFeatured && 'fill-yellow-300')} />
                  {a.isFeatured ? t('admin.unfeature') : t('admin.feature')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
