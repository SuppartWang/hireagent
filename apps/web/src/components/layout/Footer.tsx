import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot, Github, Twitter } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.04] bg-background/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center shadow-lg shadow-brand-primary/20 ring-1 ring-white/10">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">HireAgent</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/marketplace" className="hover:text-white transition-colors">{t('nav.marketplace')}</Link>
            <Link to="/upload" className="hover:text-white transition-colors">{t('nav.upload')}</Link>
            <a href="https://github.com/SuppartWang/hireagent" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          <div className="text-sm text-slate-600">
            © {year} HireAgent. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
