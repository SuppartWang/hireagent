import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot, TrendingUp, Star, Download, ArrowRight } from 'lucide-react'
import { AgentListItem } from '@hireagent/shared'
import { agentsApi } from '../../api'
import { AgentCard } from '../../components/agent/AgentCard'

interface PlatformStats {
  total_agents: number
  total_users: number
  total_hires: number
}

export function HomePage() {
  const { t } = useTranslation()
  const [featured, setFeatured] = useState<AgentListItem[]>([])
  const [trending, setTrending] = useState<AgentListItem[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      agentsApi.featured(),
      agentsApi.trending(),
      agentsApi.platformStats(),
    ]).then(([featRes, trendRes, statsRes]) => {
      setFeatured(featRes.data)
      setTrending(trendRes.data)
      setStats(statsRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-primary/25">
            <Bot className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t('home.hero_title')}
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            {t('home.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/marketplace" className="btn-primary px-6 py-3 text-base flex items-center gap-2 justify-center">
              {t('home.explore_btn')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/upload" className="btn-secondary px-6 py-3 text-base">
              {t('home.publish_btn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="pb-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: stats.total_agents, label: t('home.stats_agents'), icon: Bot },
                { value: stats.total_users, label: t('home.stats_users'), icon: Star },
                { value: stats.total_hires, label: t('home.stats_hires'), icon: Download },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="card text-center">
                  <Icon className="w-5 h-5 mx-auto mb-2 text-brand-accent" />
                  <div className="text-2xl font-bold text-white">{value?.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                {t('home.featured')}
              </h2>
              <Link to="/marketplace?sort=ranking" className="text-brand-accent text-sm hover:underline flex items-center gap-1">
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(agent => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-accent" />
                {t('home.trending')}
              </h2>
              <Link to="/marketplace?sort=trending" className="text-brand-accent text-sm hover:underline flex items-center gap-1">
                查看全部 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trending.slice(0, 8).map(agent => <AgentCard key={agent.id} agent={agent} compact />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
