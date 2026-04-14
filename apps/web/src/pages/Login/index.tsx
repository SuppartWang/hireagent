import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'

export function LoginPage() {
  const { t } = useTranslation()
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'))
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">{t('auth.login_title')}</h1>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('auth.email')}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input w-full" required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('auth.password')}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input w-full" required />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
            {isLoading ? t('common.loading') : t('auth.login_btn')}
          </button>
          <p className="text-center text-sm text-slate-400">
            <Link to="/register" className="text-brand-accent hover:underline">{t('auth.no_account')}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
