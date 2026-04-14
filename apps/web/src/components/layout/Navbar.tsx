import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot, Upload, User, LogOut, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import i18n from '../../i18n'

export function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { lang, setLang } = useUIStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleLang = () => {
    const next = lang === 'zh-CN' ? 'en' : 'zh-CN'
    setLang(next)
    i18n.changeLanguage(next)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-surface-raised/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white group-hover:text-brand-accent transition-colors">
              HireAgent
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/marketplace" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              {t('nav.marketplace')}
            </Link>
            {user && (
              <Link to="/upload" className="text-slate-300 hover:text-white transition-colors text-sm font-medium flex items-center gap-1">
                <Upload className="w-4 h-4" />
                {t('nav.upload')}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm px-2 py-1 rounded-md hover:bg-surface-overlay"
            >
              <Globe className="w-4 h-4" />
              {lang === 'zh-CN' ? t('common.lang_en') : t('common.lang_zh')}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-surface-overlay"
                >
                  <User className="w-4 h-4" />
                  {user.displayName || user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-surface-overlay"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-surface-border space-y-2">
            <Link to="/marketplace" className="block px-3 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-surface-overlay" onClick={() => setMenuOpen(false)}>
              {t('nav.marketplace')}
            </Link>
            {user && (
              <Link to="/upload" className="block px-3 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-surface-overlay" onClick={() => setMenuOpen(false)}>
                {t('nav.upload')}
              </Link>
            )}
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-surface-overlay" onClick={() => setMenuOpen(false)}>
                  {t('nav.profile')}
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-400 rounded-lg hover:bg-surface-overlay">
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3">
                <Link to="/login" className="btn-secondary text-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary text-sm flex-1 text-center" onClick={() => setMenuOpen(false)}>{t('nav.register')}</Link>
              </div>
            )}
            <button onClick={toggleLang} className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-white w-full">
              <Globe className="w-4 h-4" />
              {lang === 'zh-CN' ? t('common.lang_en') : t('common.lang_zh')}
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
