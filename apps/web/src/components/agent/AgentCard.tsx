import { Link } from 'react-router-dom'
import { Star, Download, Heart, Share2, Bot, Code, MessageSquare, Image, PenTool, BarChart, Database, Cpu, Layers } from 'lucide-react'
import type { AgentListItem } from '@hireagent/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: AgentListItem
  compact?: boolean
}

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

const categoryIcons: Record<string, any> = {
  'coding': Code,
  'writing': PenTool,
  'research': MessageSquare,
  'data_analysis': BarChart,
  'customer_service': Layers,
  'education': Database,
  'creative': Image,
  'productivity': Cpu,
  'legal': Bot,
  'finance': BarChart,
  'other': Bot,
}

function getInitials(name?: string | null) {
  if (!name) return 'AI'
  return name.slice(0, 2).toUpperCase()
}

function getName(agent: AgentListItem) {
  return agent.nameZh || agent.nameEn || '未命名'
}

function getTagline(agent: AgentListItem) {
  return agent.taglineZh || agent.taglineEn || ''
}

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const { openExportModal } = useUIStore()

  const categoryLabel = agent.category || 'other'
  const categoryStyle = categoryColors[categoryLabel] || categoryColors.other
  const CategoryIcon = categoryIcons[categoryLabel] || Bot
  const name = getName(agent)
  const avg = Number(agent.ratingAvg || 0).toFixed(1)

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.03]',
        'backdrop-blur-md overflow-hidden transition-all duration-300',
        'hover:border-white/[0.14] hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-primary/10'
      )}
    >
      {/* Shine sweep on hover */}
      <div
        className="absolute -inset-[200%] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"
        style={{
          background:
            'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)',
          transform: 'translateX(-30%)',
        }}
      />

      {/* Header image / gradient placeholder */}
      <div className="relative h-36 bg-gradient-to-br from-slate-800/60 to-slate-900/80 overflow-hidden">
        {agent.avatarUrl ? (
          <img src={agent.avatarUrl} alt={name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <CategoryIcon className="w-16 h-16 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/80 via-transparent to-transparent" />

        {agent.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-yellow-400/40 bg-yellow-500/15 text-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.25)]">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            精选
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/30 to-brand-secondary/20 border border-white/10 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              {getInitials(name)}
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1">{name}</h3>
              <span className="text-[11px] text-slate-400">{agent.creatorDisplayName || agent.creatorUsername || '官方'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col gap-3 relative">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn('text-[11px] font-medium rounded-full px-2.5 py-0.5 border', categoryStyle)}>
            {categoryLabel}
          </Badge>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              {avg}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-brand-accent" />
              {agent.hireCount || 0}
            </span>
          </div>
        </div>

        <p className={cn('text-sm text-slate-400 leading-relaxed', compact ? 'line-clamp-2' : 'line-clamp-3')}>
          {getTagline(agent) || '暂无描述'}
        </p>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 rounded-full text-sm font-medium bg-gradient-to-r from-brand-primary to-blue-500 text-white hover:from-blue-500 hover:to-brand-primary shadow-lg shadow-brand-primary/20 transition-all duration-200"
            asChild
          >
            <Link to={`/marketplace/${agent.slug}`}>查看详情</Link>
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
            onClick={() => openExportModal(agent.id, name)}
          >
            <Share2 className="w-4 h-4 text-slate-300" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="rounded-full border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all"
          >
            <Heart className="w-4 h-4 text-slate-300" />
          </Button>
        </div>
      </div>
    </div>
  )
}
