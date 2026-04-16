import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bot, Upload, User, LogOut, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import i18n from '@/i18n'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { lang, setLang } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
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

  const navLinks = [
    { to: '/marketplace', label: t('nav.marketplace') },
    ...(user ? [{ to: '/upload', label: t('nav.upload'), icon: Upload }] : []),
  ]

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20 ring-1 ring-white/10">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white group-hover:text-brand-accent transition-colors duration-300">
              HireAgent
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link: any) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                  isActive(link.to)
                    ? 'text-white bg-white/[0.10]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                )}
              >
                {link.icon && <link.icon className="w-3.5 h-3.5" />}
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-accent shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm px-3 py-2 rounded-full hover:bg-white/[0.08]"
            >
              <Globe className="w-4 h-4" />
              {lang === 'zh-CN' ? t('common.lang_en') : t('common.lang_zh')}
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.10]">
                <Link
                  to="/profile"
                  className={cn(
                    'flex items-center gap-2 text-sm px-3 py-2 rounded-full transition-all duration-200',
                    isActive('/profile')
                      ? 'text-white bg-white/[0.10]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                  )}
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.displayName || user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/[0.08]"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.10]">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-brand-primary to-blue-500 text-white hover:from-blue-500 hover:to-brand-primary shadow-lg shadow-brand-primary/20 transition-all duration-200"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.08]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-white/[0.08] space-y-1">
            {navLinks.map((link: any) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                  isActive(link.to) ? 'text-white bg-white/[0.10]' : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                )}
                onClick={() => setMenuOpen(false)}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium', isActive('/profile') ? 'text-white bg-white/[0.10]' : 'text-slate-400 hover:text-white hover:bg-white/[0.08]')}
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" /> {t('nav.profile')}
                </Link>
                <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-red-400 rounded-lg hover:bg-white/[0.08]">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <Link to="/login" className="flex-1 text-center px-4 py-2 rounded-full text-sm font-medium bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]" onClick={() => setMenuOpen(false)}>{t('nav.login')}</Link>
                <Link to="/register" className="flex-1 text-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-brand-primary to-blue-500 text-white" onClick={() => setMenuOpen(false)}>{t('nav.register')}</Link>
              </div>
            )}
            <button onClick={toggleLang} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white w-full">
              <Globe className="w-4 h-4" />
              {lang === 'zh-CN' ? t('common.lang_en') : t('common.lang_zh')}
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
