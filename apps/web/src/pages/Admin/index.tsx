import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { BarChart3, RefreshCw, Star, Search, Users, Bot, Download, MessageSquare, Award } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { adminApi, agentsApi } from '../../api'
import { cn } from '../../utils/cn'

interface Stats {
  published_agents: number
  draft_agents: number
  total_users: number
  total_hires: number
  hires_today: number
  total_reviews: number
  total_points_awarded: number
}

export function AdminPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  if (!user?.isAdmin) return <Navigate to="/" replace />

  useEffect(() => {
    adminApi.stats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRecalculate = async () => {
    setRecalculating(true)
    try {
      await adminApi.recalculateRankings()
      alert(t('admin.recalculate_success'))
    } catch (err) {
      console.error(err)
      alert(t('common.error'))
    } finally {
      setRecalculating(false)
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

  const toggleFeature = async (id: string, current: boolean) => {
    try {
      await adminApi.featureAgent(id, !current)
      setSearchResults(prev => prev.map(a => a.id === id ? { ...a, is_featured: !current } : a))
    } catch (err) {
      console.error(err)
      alert(t('common.error'))
    }
  }

  const statCards = stats ? [
    { label: t('admin.published'), value: stats.published_agents, icon: Bot },
    { label: t('admin.drafts'), value: stats.draft_agents, icon: Bot },
    { label: t('admin.users'), value: stats.total_users, icon: Users },
    { label: t('admin.hires'), value: stats.total_hires, icon: Download },
    { label: t('admin.hires_today'), value: stats.hires_today, icon: Download },
    { label: t('admin.reviews'), value: stats.total_reviews, icon: MessageSquare },
    { label: t('admin.points_awarded'), value: stats.total_points_awarded, icon: Award },
  ] : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-brand-accent" />
        </div>
        <h1 className="text-2xl font-bold text-white">{t('nav.admin')}</h1>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-surface-raised" />
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
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', recalculating && 'animate-spin')} />
          {recalculating ? t('common.loading') : t('admin.recalculate_rankings')}
        </button>
      </div>

      {/* Feature Management */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">{t('admin.feature_management')}</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder={t('admin.search_agent')}
            className="input flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="btn-primary flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            {t('common.search')}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-surface-overlay rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-border flex items-center justify-center text-lg">
                    {a.name_zh?.[0] || '🤖'}
                  </div>
                  <div>
                    <div className="font-medium text-white">{a.name_zh}</div>
                    <div className="text-xs text-slate-500">@{a.creator_username || '—'}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(a.id, a.is_featured)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    a.is_featured
                      ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                      : 'bg-surface-border text-slate-300 hover:bg-surface-border/80'
                  )}
                >
                  <Star className={cn('w-4 h-4', a.is_featured && 'fill-yellow-300')} />
                  {a.is_featured ? t('admin.unfeature') : t('admin.feature')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
