import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, Download, Zap } from 'lucide-react'
import { AgentListItem } from '@hireagent/shared'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'

interface AgentCardProps {
  agent: AgentListItem
  compact?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  coding: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  writing: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  research: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  data_analysis: 'bg-green-500/15 text-green-300 border-green-500/20',
  customer_service: 'bg-orange-500/15 text-orange-300 border-orange-500/20',
  education: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20',
  creative: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  productivity: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  legal: 'bg-red-500/15 text-red-300 border-red-500/20',
  finance: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  other: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
}

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const { t, i18n } = useTranslation()
  const { openExportModal } = useUIStore()
  const lang = i18n.language

  const name = lang === 'zh-CN' ? agent.nameZh : (agent.nameEn || agent.nameZh)
  const tagline = lang === 'zh-CN' ? agent.taglineZh : (agent.taglineEn || agent.taglineZh)

  return (
    <div className={cn(
      'card group flex flex-col hover:-translate-y-0.5',
      compact ? 'p-3' : 'p-5'
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'flex-shrink-0 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br from-secondary to-card border border-border shadow-inner',
          compact ? 'w-10 h-10 text-base' : 'w-14 h-14'
        )}>
          {agent.avatarUrl ? (
            <img src={agent.avatarUrl} alt={name} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <span className="opacity-90">{agent.nameZh?.[0] || '🤖'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white truncate group-hover:text-brand-accent transition-colors">
              {name}
            </h3>
            {agent.isFeatured && (
              <span className="badge bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                <Zap className="w-3 h-3 mr-0.5" />{t('agent.featured')}
              </span>
            )}
          </div>
          <span className={cn('badge mt-1 border', CATEGORY_COLORS[agent.category] || CATEGORY_COLORS.other)}>
            {t(`categories.${agent.category}`)}
          </span>
        </div>
      </div>

      {/* Tagline */}
      {tagline && (
        <p className="text-slate-400 text-sm mb-3 line-clamp-2 flex-1">{tagline}</p>
      )}

      {/* Tags */}
      {!compact && agent.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {agent.tags.slice(0, 4).map(tag => (
            <span key={tag} className="badge bg-secondary/60 text-slate-400 text-xs border border-border/50">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-slate-300 font-medium">{Number(agent.ratingAvg || 0).toFixed(1) || '–'}</span>
          {agent.ratingCount > 0 && <span>({agent.ratingCount})</span>}
        </div>
        <div className="flex items-center gap-1">
          <Download className="w-3.5 h-3.5" />
          <span>{t('agent.hire_count', { count: agent.hireCount || 0 })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link
          to={`/agents/${agent.slug}`}
          className="btn-secondary text-xs py-1.5 flex-1 text-center"
        >
          {t('agent.view_detail')}
        </Link>
        <button
          onClick={() => openExportModal(agent.id, name)}
          className="btn-primary text-xs py-1.5 flex-1"
        >
          {t('agent.hire_now')}
        </button>
      </div>
    </div>
  )
}
