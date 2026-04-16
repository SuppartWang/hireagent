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
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Aurora gradient orbs */}
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-[10%] right-1/4 w-[500px] h-[500px] bg-brand-secondary/15 rounded-full blur-[100px] animate-float animation-delay-2000" />
        <div className="absolute bottom-[10%] left-1/3 w-[400px] h-[400px] bg-brand-accent/10 rounded-full blur-[90px] animate-float animation-delay-4000" />
      </div>

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400 mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {t('home.hero_subtitle').split('，')[0]}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in animation-delay-200">
            <span className="glow-text">{t('home.hero_title')}</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
            {t('home.hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in animation-delay-200">
            <Link
              to="/marketplace"
              className="btn-primary px-8 py-3 text-base"
            >
              {t('home.explore_btn')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/upload"
              className="btn-secondary px-8 py-3 text-base"
            >
              {t('home.publish_btn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="pb-12 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: stats.totalAgents, label: t('home.stats_agents'), icon: Bot },
                { value: stats.totalUsers, label: t('home.stats_users'), icon: Star },
                { value: stats.totalHires, label: t('home.stats_hires'), icon: Download },
              ].map(({ value, label, icon: Icon }, idx) => (
                <div
                  key={label}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 text-center
                             transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04] hover:-translate-y-0.5 animate-fade-in"
                  style={{ animationDelay: `${300 + idx * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                  <Icon className="w-5 h-5 mx-auto mb-2 text-brand-accent relative z-10" />
                  <div className="text-3xl font-bold glow-number relative z-10 tabular-nums">{value?.toLocaleString()}</div>
                  <div className="text-sm text-slate-500 relative z-10 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured */}
      {featuredLoading ? (
        <section className="py-10 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          </div>
        </section>
      ) : featured && featured.length > 0 ? (
        <section className="py-10 px-4 relative z-10 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                {t('home.featured')}
              </h2>
              <Link to="/marketplace?sort=ranking" className="group text-sm text-brand-accent hover:text-brand-accent/80 flex items-center gap-1 transition-colors">
                {t('home.view_all')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Trending */}
      {trendingLoading ? (
        <section className="py-10 px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl" />
              ))}
            </div>
          </div>
        </section>
      ) : trending && trending.length > 0 ? (
        <section className="py-10 px-4 relative z-10 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-accent" />
                {t('home.trending')}
              </h2>
              <Link to="/marketplace?sort=trending" className="group text-sm text-brand-accent hover:text-brand-accent/80 flex items-center gap-1 transition-colors">
                {t('home.view_all')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trending.slice(0, 8).map((agent) => (
                <AgentCard key={agent.id} agent={agent} compact />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
