import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'

export function RegisterPage() {
  const { t } = useTranslation()
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', username: '', displayName: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(form.email, form.password, form.username, form.displayName)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'))
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">{t('auth.register_title')}</h1>
        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('auth.email')}</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input w-full" required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('auth.username')}</label>
            <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="input w-full" required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('auth.display_name')}</label>
            <input type="text" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('auth.password')}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input w-full" required minLength={8} />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary w-full py-2.5">
            {isLoading ? t('common.loading') : t('auth.register_btn')}
          </button>
          <p className="text-center text-sm text-slate-400">
            <Link to="/login" className="text-brand-accent hover:underline">{t('auth.has_account')}</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
