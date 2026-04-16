import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-md flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">HireAgent</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link to="/marketplace" className="hover:text-white transition-colors">{t('nav.marketplace')}</Link>
            <Link to="/upload" className="hover:text-white transition-colors">{t('nav.upload')}</Link>
          </div>
          <p className="text-slate-500 text-sm">© 2026 HireAgent. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
