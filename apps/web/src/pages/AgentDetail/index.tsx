import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, Download, Copy, ExternalLink, Tag, Cpu, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { Agent, CATEGORY_LABELS, CAPABILITY_LABELS } from '@hireagent/shared'
import { agentsApi, reviewsApi } from '../../api'
import { useUIStore } from '../../store/uiStore'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/cn'

export function AgentDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const { openExportModal } = useUIStore()
  const { user } = useAuthStore()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [promptExpanded, setPromptExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const lang = i18n.language

  useEffect(() => {
    if (!slug) return
    Promise.all([
      agentsApi.getBySlug(slug),
    ]).then(([agentRes]) => {
      setAgent(agentRes.data)
      return reviewsApi.list(agentRes.data.id)
    }).then(reviewRes => {
      setReviews(reviewRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [slug])

  const handleCopyPrompt = async () => {
    if (!agent) return
    await navigator.clipboard.writeText(agent.systemPrompt)
    setCopied(true)
    agentsApi.hire(agent.id, 'copy_prompt').catch(console.error)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitReview = async () => {
    if (!agent || !rating) return
    setSubmittingReview(true)
    try {
      const { data } = await reviewsApi.create(agent.id, {
        rating,
        commentZh: lang === 'zh-CN' ? comment : undefined,
        commentEn: lang === 'en' ? comment : undefined,
      })
      setReviews(prev => [data, ...prev])
      setRating(0)
      setComment('')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-surface-raised rounded w-1/2" />
        <div className="h-4 bg-surface-raised rounded w-1/3" />
        <div className="h-32 bg-surface-raised rounded" />
      </div>
    </div>
  )

  if (!agent) return (
    <div className="text-center py-20 text-slate-400">
      <p className="text-lg">智能体不存在</p>
      <Link to="/marketplace" className="btn-primary mt-4 inline-block">返回广场</Link>
    </div>
  )

  const name = lang === 'zh-CN' ? agent.nameZh : (agent.nameEn || agent.nameZh)
  const description = lang === 'zh-CN' ? agent.descriptionZh : (agent.descriptionEn || agent.descriptionZh)
  const categoryLabel = CATEGORY_LABELS[agent.category]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center text-4xl flex-shrink-0">
            {agent.avatarUrl
              ? <img src={agent.avatarUrl} alt={name} className="w-full h-full rounded-2xl object-cover" />
              : <span>{agent.nameZh?.[0] || '🤖'}</span>}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{name}</h1>
              {agent.isFeatured && <span className="badge bg-brand-primary/20 text-brand-accent">精选</span>}
              <span className="badge bg-surface-overlay text-slate-400">v{agent.version}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-3">
              <span className="badge bg-blue-500/20 text-blue-300">
                {lang === 'zh-CN' ? categoryLabel.zh : categoryLabel.en}
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{agent.ratingAvg?.toFixed(1) || '–'}</span>
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
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-border">
          <button
            onClick={() => openExportModal(agent.id, name)}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('agent.hire_now')}
          </button>
          <button onClick={handleCopyPrompt} className="btn-secondary flex items-center gap-2">
            <Copy className="w-4 h-4" />
            {copied ? t('agent.copy_success') : t('agent.copy_prompt')}
          </button>
          <Link to={`/try/${agent.slug}`} className="btn-secondary flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            {t('agent.try_agent')}
          </Link>
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
              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans bg-surface-overlay rounded-lg p-3">
                {agent.systemPrompt}
              </pre>
              {!promptExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-surface-raised to-transparent" />
              )}
            </div>
            <button
              onClick={() => setPromptExpanded(!promptExpanded)}
              className="flex items-center gap-1 text-brand-accent text-sm mt-2 hover:underline"
            >
              {promptExpanded ? <><ChevronUp className="w-4 h-4" />收起</> : <><ChevronDown className="w-4 h-4" />展开全部</>}
            </button>
          </div>

          {/* MCP Config */}
          {agent.mcpConfig && (
            <div className="card">
              <h2 className="font-semibold text-white mb-3">{t('agent.mcp_config')}</h2>
              <pre className="text-slate-300 text-sm bg-surface-overlay rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(agent.mcpConfig, null, 2)}
              </pre>
            </div>
          )}

          {/* Reviews */}
          <div className="card">
            <h2 className="font-semibold text-white mb-4">{t('agent.reviews')}</h2>
            {user && (
              <div className="mb-6 p-4 bg-surface-overlay rounded-lg">
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
                <button onClick={handleSubmitReview} disabled={!rating || submittingReview} className="btn-primary">
                  {t('agent.submit_review')}
                </button>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="text-slate-500 text-sm">{t('agent.no_reviews')}</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-surface-border pb-4 last:border-0">
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
                  <span key={tag} className="badge bg-surface-overlay text-slate-400 text-xs">{tag}</span>
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
                  <span key={l} className="badge bg-surface-overlay text-slate-400 text-xs">{l}</span>
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
                  <div key={m} className="text-xs text-slate-400 font-mono bg-surface-overlay px-2 py-1 rounded">{m}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
