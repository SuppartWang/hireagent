import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Award, Star, Download, Calendar, Bot, ArrowLeft } from 'lucide-react'
import { CATEGORY_LABELS, AgentCategory } from '@hireagent/shared'
import { usePublicProfile } from '@/hooks/use-users'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const BADGE_COLORS: Record<string, string> = {
  '新星': 'from-slate-400 to-slate-600',
  '成长者': 'from-green-400 to-emerald-600',
  '精英': 'from-brand-primary to-blue-700',
  '大师': 'from-brand-secondary to-purple-700',
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data: profile, isLoading } = usePublicProfile(username || '')
  const lang = i18n.language

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-32 rounded-2xl mb-6" />
        <Skeleton className="h-8 w-1/3" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg">{t('common.not_found')}</p>
        <Link to="/marketplace" className="btn-primary mt-4 inline-block">{t('common.go_home')}</Link>
      </div>
    )
  }

  const tier = profile.badgeTier

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="group inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t('common.back')}
          </button>
        </div>

        {/* Profile Header */}
        <div className="rounded-2xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-brand-primary/20 ring-1 ring-white/10">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full rounded-2xl object-cover" alt="" />
              ) : (
                (profile.displayName || profile.username || 'U').slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{profile.displayName || profile.username}</h1>
              <p className="text-slate-400 text-sm">@{profile.username}</p>
              {profile.bio && <p className="text-slate-300 text-sm mt-2 max-w-xl">{profile.bio}</p>}
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {lang === 'zh-CN' ? '加入于 ' : 'Joined '}
                  {new Date(profile.createdAt).toLocaleDateString(lang === 'zh-CN' ? 'zh-CN' : 'en-US')}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <div
                className={cn(
                  'px-4 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r',
                  BADGE_COLORS[tier] || BADGE_COLORS['新星']
                )}
              >
                <Award className="w-4 h-4 inline mr-1.5" />
                {t(`badges.${tier}`)}
              </div>
              <div className="text-slate-300 text-sm">
                <span className="font-bold text-white text-lg">{profile.totalPoints}</span> {t('profile.total_points')}
              </div>
            </div>
          </div>
        </div>

        {/* Published Agents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-brand-accent" />
              {lang === 'zh-CN' ? '发布的智能体' : 'Published Agents'}
            </h2>
            <span className="text-slate-400 text-sm">
              {profile.agents.length} {lang === 'zh-CN' ? '个' : 'agents'}
            </span>
          </div>

          {profile.agents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 rounded-2xl border border-white/[0.10] bg-white/[0.05]">
              <p>{lang === 'zh-CN' ? '该用户尚未发布智能体' : 'No agents published yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.agents.map((a: any) => (
                <Link
                  key={a.id}
                  to={`/marketplace/${a.slug}`}
                  className="rounded-2xl border border-white/[0.10] bg-white/[0.06] p-4 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl flex-shrink-0 font-semibold text-white">
                      {a.nameZh?.[0] || '🤖'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate group-hover:text-brand-accent transition-colors">{a.nameZh}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lang === 'zh-CN'
                          ? CATEGORY_LABELS[a.category as AgentCategory]?.zh
                          : CATEGORY_LABELS[a.category as AgentCategory]?.en}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {a.hireCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {Number(a.ratingAvg || 0).toFixed(1) || '–'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
