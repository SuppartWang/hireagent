import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Star, Download, Edit, Award, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { BadgeTier, BADGE_THRESHOLDS } from '@hireagent/shared'
import { cn } from '@/lib/utils'
import { useMe, useMyAgents } from '@/hooks/use-users'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const BADGE_COLORS: Record<string, string> = {
  '新星': 'from-slate-400 to-slate-600',
  '成长者': 'from-green-400 to-emerald-600',
  '精英': 'from-brand-primary to-blue-700',
  '大师': 'from-brand-secondary to-purple-700',
}

export function UserProfilePage() {
  const { t } = useTranslation()
  const { user: authUser } = useAuthStore()
  const { data: user, isLoading: userLoading } = useMe()
  const { data: myAgents = [], isLoading: agentsLoading } = useMyAgents()
  const [tab, setTab] = useState<'agents' | 'points' | 'bookmarks'>('agents')

  if (!authUser) return <Navigate to="/login" replace />

  const profile = user || authUser
  const tier = (profile.badgeTier as BadgeTier) || '新星'
  const nextTierMap: Record<BadgeTier, BadgeTier | null> = {
    '新星': '成长者', '成长者': '精英', '精英': '大师', '大师': null,
  }
  const nextTier = nextTierMap[tier]
  const nextPoints = nextTier ? BADGE_THRESHOLDS[nextTier].min - (profile.totalPoints || 0) : 0

  const points: any[] = (profile as any).points || []
  const bookmarks: any[] = (profile as any).bookmarks || []

  const loading = userLoading || agentsLoading

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary border border-border flex items-center justify-center text-2xl">
            {profile.avatarUrl ? <img src={profile.avatarUrl} className="w-full h-full rounded-2xl object-cover" alt="" /> : '👤'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">{profile.displayName || profile.username}</h1>
            <p className="text-slate-400 text-sm">@{profile.username}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={cn('px-4 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r', BADGE_COLORS[tier] || BADGE_COLORS['新星'])}>
              <Award className="w-4 h-4 inline mr-1.5" />
              {t(`badges.${tier}`)}
            </div>
            <div className="text-slate-300 text-sm">
              <span className="font-bold text-white text-lg">{profile.totalPoints || 0}</span> {t('profile.total_points')}
            </div>
            {nextTier && nextPoints > 0 && (
              <div className="text-xs text-slate-500">{t('profile.next_badge', { points: nextPoints })}</div>
            )}
          </div>
        </div>

        {/* Points progress bar */}
        {nextTier && (
          <div className="mt-4">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((profile.totalPoints || 0) / BADGE_THRESHOLDS[nextTier].min) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['agents', 'points', 'bookmarks'] as const).map(t2 => (
          <button
            key={t2}
            onClick={() => setTab(t2)}
            className={cn(
              'py-2.5 px-4 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t2 ? 'border-primary text-brand-accent' : 'border-transparent text-slate-400 hover:text-white'
            )}
          >
            {t(`profile.${t2 === 'agents' ? 'my_agents' : t2 === 'points' ? 'points_history' : 'bookmarks'}`)}
          </button>
        ))}
      </div>

      {/* My Agents */}
      {tab === 'agents' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400 text-sm">{t('marketplace.total_agents', { count: myAgents.length })}</p>
            <Button size="sm" asChild>
              <Link to="/upload" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                {t('profile.create_agent')}
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : myAgents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-4">{t('profile.no_agents')}</p>
              <Button asChild><Link to="/upload">{t('profile.create_agent')}</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myAgents.map((a: any) => (
                <div key={a.id} className="card flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white truncate">{a.name_zh}</h3>
                      <span className={cn('badge text-xs', {
                        'bg-green-500/20 text-green-300': a.status === 'published',
                        'bg-yellow-500/20 text-yellow-300': a.status === 'featured',
                        'bg-secondary text-slate-400': a.status === 'draft',
                      })}>
                        {t(`agent.publish_status.${a.status}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" />{a.hire_count}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{Number(a.ratingAvg || 0).toFixed(1) || '–'}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{Number(a.rankingScore || 0).toFixed(3)}</span>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/edit/${a.slug}`} className="flex items-center gap-1">
                      <Edit className="w-3 h-3" />{t('profile.edit')}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Points History */}
      {tab === 'points' && (
        <div className="space-y-2">
          {points.length === 0 ? (
            <p className="text-center py-12 text-slate-500">{t('profile.no_points')}</p>
          ) : (
            points.map((p: any) => (
              <div key={p.id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-white">{p.description_zh || t(`points.reason_${p.reason}`)}</p>
                  {p.agent_name && <p className="text-xs text-slate-500 mt-0.5">智能体：{p.agent_name}</p>}
                  <p className="text-xs text-slate-600">{new Date(p.created_at).toLocaleDateString('zh-CN')}</p>
                </div>
                <span className={cn('font-bold', p.amount > 0 ? 'text-green-400' : 'text-red-400')}>
                  {p.amount > 0 ? '+' : ''}{p.amount}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bookmarks */}
      {tab === 'bookmarks' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bookmarks.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-500">{t('profile.no_bookmarks')}</div>
          ) : (
            bookmarks.map((a: any) => (
              <Link key={a.id} to={`/agents/${a.slug}`} className="card hover:border-primary/50 transition-colors">
                <h3 className="font-medium text-white mb-1">{a.name_zh}</h3>
                <p className="text-xs text-slate-500">{t('agent.hire_count', { count: a.hire_count })}</p>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
