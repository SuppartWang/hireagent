import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot } from 'lucide-react'

export function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <Bot className="w-16 h-16 text-slate-600 mb-4" />
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-slate-400 mb-6">{t('common.not_found')}</p>
      <Link to="/" className="btn-primary">{t('common.go_home')}</Link>
    </div>
  )
}
