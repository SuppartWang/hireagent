import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, Download, Copy, ExternalLink, Tag, Cpu, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { Agent, CATEGORY_LABELS, CAPABILITY_LABELS } from '@hireagent/shared'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useAgent, useHireAgent } from '@/hooks/use-agents'
import { useReviews, useCreateReview } from '@/hooks/use-reviews'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AgentDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const { openExportModal } = useUIStore()
  const { user } = useAuthStore()
  const { data: agent, isLoading } = useAgent(slug || '')
  const { data: reviews = [] } = useReviews(agent?.id || '')
  const { mutateAsync: hire } = useHireAgent()
  const { mutateAsync: submitReview, isPending: submittingReview } = useCreateReview()
  const [promptExpanded, setPromptExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const lang = i18n.language

  const handleCopyPrompt = async () => {
    if (!agent) return
    await navigator.clipboard.writeText(agent.systemPrompt)
    setCopied(true)
    hire({ id: agent.id, hireType: 'copy_prompt' }).catch(console.error)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitReview = async () => {
    if (!agent || !rating) return
    try {
      await submitReview({
        agentId: agent.id,
        payload: {
          rating,
          commentZh: lang === 'zh-CN' ? comment : undefined,
          commentEn: lang === 'en' ? comment : undefined,
        },
      })
      setRating(0)
      setComment('')
      toast.success(t('common.success'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg">{t('common.not_found')}</p>
        <Link to="/marketplace" className="btn-primary mt-4 inline-block">{t('common.go_home')}</Link>
      </div>
    )
  }

  const name = lang === 'zh-CN' ? agent.nameZh : (agent.nameEn || agent.nameZh)
  const description = lang === 'zh-CN' ? agent.descriptionZh : (agent.descriptionEn || agent.descriptionZh)
  const categoryLabel = CATEGORY_LABELS[agent.category]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-card border border-border flex items-center justify-center text-4xl flex-shrink-0 shadow-inner">
            {agent.avatarUrl
              ? <img src={agent.avatarUrl} alt={name} className="w-full h-full rounded-2xl object-cover" />
              : <span className="opacity-90">{agent.nameZh?.[0] || '🤖'}</span>}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              {agent.isFeatured && <span className="badge bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">{t('agent.featured')}</span>}
              <span className="badge bg-secondary text-slate-400">v{agent.version}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-3">
              <span className="badge bg-blue-500/15 text-blue-300 border border-blue-500/20">
                {lang === 'zh-CN' ? categoryLabel.zh : categoryLabel.en}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{Number(agent.ratingAvg || 0).toFixed(1) || '–'}</span>
                <span>({agent.ratingCount} {t('agent.reviews')})</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{t('agent.hire_count', { count: agent.hireCount })}</span>
              </div>
              {agent.creatorUsername && (
                <span>by <Link to={`/users/${agent.creatorUsername}`} className="text-brand-accent hover:underline">{agent.creatorDisplayName || agent.creatorUsername}</Link></span>
              )}
            </div>
            <p className="text-slate-300">{description}</p>
          </div>
        </div>

        {/* Export actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          <Button onClick={() => openExportModal(agent.id, name)}>
            <Download className="w-4 h-4 mr-1" />
            {t('agent.hire_now')}
          </Button>
          <Button variant="secondary" onClick={handleCopyPrompt}>
            <Copy className="w-4 h-4 mr-1" />
            {copied ? t('agent.copy_success') : t('agent.copy_prompt')}
          </Button>
          <Button variant="secondary" asChild>
            <Link to={`/try/${agent.slug}`}>
              <ExternalLink className="w-4 h-4 mr-1" />
              {t('agent.try_agent')}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* System Prompt */}
          <div className="card">
            <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-accent" />
              {t('agent.system_prompt')}
            </h2>
            <div className={cn('relative', !promptExpanded && 'max-h-32 overflow-hidden')}>
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans bg-secondary rounded-lg p-3">
                {agent.systemPrompt}
              </pre>
              {!promptExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
              )}
            </div>
            <button
              onClick={() => setPromptExpanded(!promptExpanded)}
              className="flex items-center gap-1 text-brand-accent text-sm mt-2 hover:underline"
            >
              {promptExpanded ? <><ChevronUp className="w-4 h-4" />{t('agent.collapse')}</> : <><ChevronDown className="w-4 h-4" />{t('agent.expand_all')}</>}
            </button>
          </div>

          {/* MCP Config */}
          {agent.mcpConfig && (
            <div className="card">
              <h2 className="font-semibold text-white mb-3">{t('agent.mcp_config')}</h2>
              <pre className="text-slate-300 text-sm bg-secondary rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(agent.mcpConfig, null, 2)}
              </pre>
            </div>
          )}

          {/* Reviews */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4">{t('agent.reviews')}</h2>
            {user && (
              <div className="mb-6 p-4 bg-secondary rounded-lg">
                <p className="text-sm text-slate-300 mb-2">{t('agent.your_rating')}</p>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star className={cn('w-6 h-6', s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600')} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={t('agent.review_comment')}
                  className="input w-full resize-none h-20 mb-3"
                />
                <Button onClick={handleSubmitReview} disabled={!rating || submittingReview}>
                  {t('agent.submit_review')}
                </Button>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">{t('agent.no_reviews')}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{r.display_name || r.username}</span>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={cn('w-3.5 h-3.5', s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600')} />
                        ))}
                      </div>
                    </div>
                    {(r.comment_zh || r.comment_en) && (
                      <p className="text-slate-400 text-sm">{lang === 'zh-CN' ? r.comment_zh : r.comment_en}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Capabilities */}
          {agent.capabilities?.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-white mb-3 text-sm flex items-center gap-1.5">
                <Cpu className="w-4 h-4" />{t('agent.capabilities')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.map(cap => (
                  <span key={cap} className="badge bg-brand-secondary/20 text-purple-300 text-xs">
                    {lang === 'zh-CN' ? CAPABILITY_LABELS[cap]?.zh : CAPABILITY_LABELS[cap]?.en}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {agent.tags?.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-white mb-3 text-sm flex items-center gap-1.5">
                <Tag className="w-4 h-4" />{t('agent.tags')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {agent.tags.map(tag => (
                  <span key={tag} className="badge bg-secondary text-slate-400 text-xs">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {agent.languageSupport?.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-white mb-3 text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4" />{t('agent.language_support')}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {agent.languageSupport.map(l => (
                  <span key={l} className="badge bg-secondary text-slate-400 text-xs">{l}</span>
                ))}
              </div>
            </div>
          )}

          {/* Supported Models */}
          {agent.supportedModels?.length > 0 && (
            <div className="card">
              <h3 className="font-medium text-white mb-3 text-sm">{t('agent.supported_models')}</h3>
              <div className="space-y-1">
                {agent.supportedModels.map(m => (
                  <div key={m} className="text-xs text-slate-400 font-mono bg-secondary px-2 py-1 rounded">{m}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
