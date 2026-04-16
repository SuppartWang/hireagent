import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Loader2, Bot, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/authStore'
import { usersApi } from '@/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  displayName: z.string().min(1, '昵称不能为空'),
  bio: z.string().max(200, '简介最多200字'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function UserProfilePage() {
  const { t } = useTranslation()
  const { user, setUser } = useAuthStore()
  const [tab, setTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || user?.username || '',
      bio: user?.bio || '',
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true)
    try {
      const res = await usersApi.updateMe(data)
      if (res.data) setUser(res.data)
      toast.success(t('profile.save_success'))
    } catch (e: any) {
      toast.error(e?.response?.data?.message || t('profile.save_error'))
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">{t('profile.please_login')}</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-8">
      {/* aurora orbs */}
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-1/4 w-[400px] h-[400px] bg-brand-secondary/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="relative h-36 bg-gradient-to-r from-brand-primary/30 to-brand-secondary/20">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-brand-primary/20 ring-4 ring-[#0a0f1a]">
                {(user.displayName || user.username || 'U').slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="pt-12 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white">{user.displayName || user.username}</h1>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </span>
                  {user.isAdmin && (
                    <span className="flex items-center gap-1 text-brand-accent">
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="bg-white/[0.08] border border-white/[0.10] rounded-full p-1 mb-6">
                <TabsTrigger value="profile" className="rounded-full data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-1.5">
                  {t('profile.tab_profile')}
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-full data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-1.5">
                  {t('profile.tab_security')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-slate-300">{t('profile.display_name')}</Label>
                    <Input
                      id="displayName"
                      className="rounded-xl border-white/10 bg-white/[0.06] text-white focus:border-brand-accent/50 focus:ring-brand-accent/20"
                      {...register('displayName')}
                    />
                    {errors.displayName && <p className="text-xs text-red-400">{errors.displayName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-slate-300">{t('profile.bio')}</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      className={cn(
                        'w-full rounded-xl border border-white/10 bg-white/[0.06] text-white p-3 text-sm',
                        'placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none resize-none'
                      )}
                      {...register('bio')}
                    />
                    {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={saving || !isDirty}
                    className="rounded-full bg-gradient-to-r from-brand-primary to-blue-500 text-white hover:from-blue-500 hover:to-brand-primary shadow-lg shadow-brand-primary/20 transition-all"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {t('profile.save')}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="security">
                <div className="max-w-xl space-y-4">
                  <div className="p-4 rounded-2xl border border-white/[0.10] bg-white/[0.05]">
                    <h4 className="text-sm font-semibold text-white mb-1">{t('profile.password')}</h4>
                    <p className="text-xs text-slate-500 mb-3">{t('profile.password_desc')}</p>
                    <Button variant="outline" className="rounded-full border-white/10 hover:bg-white/[0.06]">
                      {t('profile.change_password')}
                    </Button>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/[0.10] bg-white/[0.05]">
                    <h4 className="text-sm font-semibold text-white mb-1">{t('profile.two_factor')}</h4>
                    <p className="text-xs text-slate-500 mb-3">{t('profile.two_factor_desc')}</p>
                    <Button disabled variant="outline" className="rounded-full border-white/10">
                      {t('profile.coming_soon')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
