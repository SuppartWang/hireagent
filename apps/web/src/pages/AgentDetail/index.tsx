import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Star, Download, Heart, Share2, Bot, Calendar, User, ExternalLink, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAgent, useHireAgent } from '@/hooks/use-agents'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const categoryColors: Record<string, string> = {
  'coding': 'border-cyan-400/30 text-cyan-300 bg-cyan-500/10',
  'writing': 'border-rose-400/30 text-rose-300 bg-rose-500/10',
  'research': 'border-blue-400/30 text-blue-300 bg-blue-500/10',
  'data_analysis': 'border-emerald-400/30 text-emerald-300 bg-emerald-500/10',
  'customer_service': 'border-amber-400/30 text-amber-300 bg-amber-500/10',
  'education': 'border-violet-400/30 text-violet-300 bg-violet-500/10',
  'creative': 'border-purple-400/30 text-purple-300 bg-purple-500/10',
  'productivity': 'border-orange-400/30 text-orange-300 bg-orange-500/10',
  'legal': 'border-slate-400/30 text-slate-300 bg-slate-500/10',
  'finance': 'border-teal-400/30 text-teal-300 bg-teal-500/10',
  'other': 'border-slate-400/30 text-slate-300 bg-slate-500/10',
}

export function AgentDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()
  const { openExportModal } = useUIStore()
  const { data: agent, isLoading } = useAgent(slug || '')
  const hireMutation = useHireAgent()

  const isZh = i18n.language.startsWith('zh')

  if (isLoading) {
    return (
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-64 rounded-2xl mb-6" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="px-4 py-16 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] flex items-center justify-center">
          <Bot className="w-8 h-8 text-slate-500" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{t('agent.not_found')}</h2>
        <p className="text-slate-500 mb-6">{t('agent.try_again')}</p>
        <Button onClick={() => navigate('/marketplace')} className="rounded-full px-6">{t('agent.back_marketplace')}</Button>
      </div>
    )
  }

  const categoryLabel = agent.category || 'other'
  const categoryStyle = categoryColors[categoryLabel] || categoryColors.other
  const avg = Number(agent.ratingAvg || 0).toFixed(1)
  const name = isZh ? agent.nameZh : (agent.nameEn || agent.nameZh)
  const description = isZh ? agent.descriptionZh : (agent.descriptionEn || agent.descriptionZh)
  const tagline = isZh ? agent.taglineZh : (agent.taglineEn || agent.taglineZh)

  const handleHire = async () => {
    try {
      await hireMutation.mutateAsync({ id: agent.id, hireType: 'try' })
      toast.success(t('agent.hire_success'))
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('agent.hire_error'))
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-8">
      {/* ambient aurora */}
      <div className="absolute top-[-10%] left-1/3 w-[600px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <button onClick={() => navigate(-1)} className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t('common.back')}
        </button>

        {/* Header card */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-6 md:items-start">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-brand-primary/20 ring-1 ring-white/10">
              {name.slice(0, 2).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className={cn('text-xs font-medium rounded-full px-3 py-1 border', categoryStyle)}>
                  {categoryLabel}
                </Badge>
                {agent.isFeatured && (
                  <Badge className="rounded-full text-[11px] font-medium border border-yellow-400/40 bg-yellow-500/15 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.25)]">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    精选
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{name}</h1>
              <p className="text-slate-400 leading-relaxed max-w-2xl">{tagline || description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {agent.creatorDisplayName || agent.creatorUsername || '官方'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : '-'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {avg} ({agent.ratingCount || 0} 评价)
                </span>
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-brand-accent" />
                  {agent.hireCount || 0} {t('agent.hires')}
                </span>
              </div>
            </div>

            <div className="flex md:flex-col gap-2 md:min-w-[10rem]">
              <Button
                className="flex-1 rounded-full bg-gradient-to-r from-brand-primary to-blue-500 text-white hover:from-blue-500 hover:to-brand-primary shadow-lg shadow-brand-primary/20"
                onClick={handleHire}
                disabled={hireMutation.isPending}
              >
                {hireMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t('agent.try_now')}
              </Button>
              <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/[0.06]" onClick={() => openExportModal(agent.id, name)}>
                <Share2 className="w-4 h-4 mr-2" />
                {t('agent.share')}
              </Button>
              <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/[0.06]">
                <Heart className="w-4 h-4 mr-2" />
                {t('agent.favorite')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {agent.coverUrl && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <img src={agent.coverUrl} alt={name} className="w-full object-cover" />
              </div>
            )}

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">{t('agent.overview')}</h3>
              <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed">
                {(description || '暂无描述').split('\n').map((p: string, idx: number) => (
                  <p key={idx} className="mb-4 last:mb-0">{p}</p>
                ))}
              </div>
            </div>

            {agent.capabilities && agent.capabilities.length > 0 && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4">{t('agent.features')}</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agent.capabilities.map((cap: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-400">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-white mb-4">{t('agent.tags')}</h4>
              <div className="flex flex-wrap gap-2">
                {(agent.tags || []).map((tag: string) => (
                  <span key={tag} className="px-2.5 py-1 rounded-full text-xs border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:text-white transition-colors cursor-default">
                    #{tag}
                  </span>
                ))}
                {(agent.tags || []).length === 0 && <span className="text-sm text-slate-500">-</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
