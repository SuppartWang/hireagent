import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot, TrendingUp, Star, Download, ArrowRight } from 'lucide-react'
import { AgentCard } from '@/components/agent/AgentCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeaturedAgents, useTrendingAgents, usePlatformStats } from '@/hooks/use-agents'

export function HomePage() {
  const { t } = useTranslation()
  const { data: featured, isLoading: featuredLoading } = useFeaturedAgents()
  const { data: trending, isLoading: trendingLoading } = useTrendingAgents()
  const { data: stats } = usePlatformStats()

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-radial from-brand-primary/15 via-brand-secondary/5 to-transparent opacity-60 pointer-events-none blur-3xl" />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/15 via-transparent to-brand-secondary/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-primary/30 ring-4 ring-brand-primary/10">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-300">
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
        <section className="pb-8 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: stats.totalAgents, label: t('home.stats_agents'), icon: Bot },
                { value: stats.totalUsers, label: t('home.stats_users'), icon: Star },
                { value: stats.totalHires, label: t('home.stats_hires'), icon: Download },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="card text-center hover:-translate-y-0.5">
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
      {featuredLoading ? (
        <section className="py-8 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </section>
      ) : featured && featured.length > 0 ? (
        <section className="py-8 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                {t('home.featured')}
              </h2>
              <Link to="/marketplace?sort=ranking" className="text-brand-accent text-sm hover:underline flex items-center gap-1">
                {t('home.view_all')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(agent => <AgentCard key={agent.id} agent={agent} />)}
            </div>
          </div>
        </section>
      ) : null}

      {/* Trending */}
      {trendingLoading ? (
        <section className="py-8 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          </div>
        </section>
      ) : trending && trending.length > 0 ? (
        <section className="py-8 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-accent" />
                {t('home.trending')}
              </h2>
              <Link to="/marketplace?sort=trending" className="text-brand-accent text-sm hover:underline flex items-center gap-1">
                {t('home.view_all')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trending.slice(0, 8).map(agent => <AgentCard key={agent.id} agent={agent} compact />)}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
