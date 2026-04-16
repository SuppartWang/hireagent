import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Bot, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

const schema = z
  .object({
    username: z.string().min(2, '用户名至少2个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少6位'),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次密码不一致',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: authRegister } = useAuthStore()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await authRegister(data.email, data.password, data.username, data.username)
      toast.success(t('register.success'))
      navigate('/')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('register.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {/* aurora orbs */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-brand-secondary/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-secondary/20 ring-1 ring-white/10">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{t('register.title')}</h1>
            <p className="text-sm text-slate-400 mt-2">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">{t('register.username')}</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="your_name"
                className="rounded-xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20"
                {...register('username')}
              />
              {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">{t('register.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="rounded-xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">{t('register.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="rounded-xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">{t('register.confirm_password')}</Label>
              <Input
                id="confirmPassword"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                className="rounded-xl border-white/10 bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gradient-to-r from-brand-secondary to-brand-primary text-white hover:from-brand-primary hover:to-brand-secondary shadow-lg shadow-brand-secondary/20 transition-all mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {t('register.submit')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {t('register.have_account')}{' '}
            <Link to="/login" className="text-brand-accent hover:text-brand-accent/80 font-medium">
              {t('register.login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
