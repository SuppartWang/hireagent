import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot } from 'lucide-react'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center">
          <Bot className="w-10 h-10 text-slate-500" />
        </div>
        <h1 className="text-5xl font-bold glow-text mb-3">404</h1>
        <p className="text-slate-400 mb-8">{t('common.not_found')}</p>
        <Link to="/" className="btn-primary px-6">{t('common.go_home')}</Link>
      </div>
    </div>
  )
}
