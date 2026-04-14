import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Star, Download, Zap } from 'lucide-react'
import { AgentListItem } from '@hireagent/shared'
import { cn } from '../../utils/cn'
import { useUIStore } from '../../store/uiStore'

interface AgentCardProps {
  agent: AgentListItem
  compact?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  coding: 'bg-blue-500/20 text-blue-300',
  writing: 'bg-purple-500/20 text-purple-300',
  research: 'bg-cyan-500/20 text-cyan-300',
  data_analysis: 'bg-green-500/20 text-green-300',
  customer_service: 'bg-orange-500/20 text-orange-300',
  education: 'bg-yellow-500/20 text-yellow-300',
  creative: 'bg-pink-500/20 text-pink-300',
  productivity: 'bg-indigo-500/20 text-indigo-300',
  legal: 'bg-red-500/20 text-red-300',
  finance: 'bg-emerald-500/20 text-emerald-300',
  other: 'bg-slate-500/20 text-slate-300',
}

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const { t, i18n } = useTranslation()
  const { openExportModal } = useUIStore()
  const lang = i18n.language

  const name = lang === 'zh-CN' ? agent.nameZh : (agent.nameEn || agent.nameZh)
  const tagline = lang === 'zh-CN' ? agent.taglineZh : (agent.taglineEn || agent.taglineZh)

  return (
    <div className={cn(
      'card group hover:border-brand-primary/50 hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-200 flex flex-col',
      compact ? 'p-3' : 'p-5'
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'flex-shrink-0 rounded-xl flex items-center justify-center text-2xl bg-surface-overlay border border-surface-border',
          compact ? 'w-10 h-10 text-base' : 'w-14 h-14'
        )}>
          {agent.avatarUrl ? (
            <img src={agent.avatarUrl} alt={name} className="w-full h-full rounded-xl object-cover" />
          ) : (
            <span>{agent.nameZh?.[0] || '🤖'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white truncate group-hover:text-brand-accent transition-colors">
              {name}
            </h3>
            {agent.isFeatured && (
              <span className="badge bg-brand-primary/20 text-brand-accent">
                <Zap className="w-3 h-3 mr-0.5" />精选
              </span>
            )}
          </div>
          <span className={cn('badge mt-1', CATEGORY_COLORS[agent.category] || CATEGORY_COLORS.other)}>
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
            <span key={tag} className="badge bg-surface-overlay text-slate-400 text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className="text-slate-300 font-medium">{agent.ratingAvg?.toFixed(1) || '–'}</span>
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
