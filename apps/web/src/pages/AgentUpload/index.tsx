import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronLeft, Eye, Bot } from 'lucide-react'
import { AgentCategory, AgentCapability, CATEGORY_LABELS, CAPABILITY_LABELS } from '@hireagent/shared'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { useAgent, useCreateAgent, useUpdateAgent, usePublishAgent } from '@/hooks/use-agents'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  nameZh: string
  nameEn: string
  taglineZh: string
  taglineEn: string
  descriptionZh: string
  descriptionEn: string
  category: AgentCategory
  avatarUrl: string
  systemPrompt: string
  systemPromptLang: string
  mcpConfigRaw: string
  mcpConfigValid: boolean
  capabilities: AgentCapability[]
  tags: string
  supportedModels: string
  languageSupport: string[]
}

const INITIAL: FormData = {
  nameZh: '',
  nameEn: '',
  taglineZh: '',
  taglineEn: '',
  descriptionZh: '',
  descriptionEn: '',
  category: 'other',
  avatarUrl: '',
  systemPrompt: '',
  systemPromptLang: 'zh-CN',
  mcpConfigRaw: '',
  mcpConfigValid: true,
  capabilities: [],
  tags: '',
  supportedModels: 'claude-3-5-sonnet-20241022',
  languageSupport: ['zh-CN'],
}

const ALL_CAPABILITIES: AgentCapability[] = [
  'web_search',
  'code_execution',
  'image_generation',
  'file_reading',
  'database_query',
  'email_send',
  'calendar_access',
  'browser_control',
  'memory',
  'multi_agent',
]

export function AgentUploadPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { slug } = useParams<{ slug?: string }>()
  const { data: existingAgent, isLoading } = useAgent(slug || '')
  const { mutateAsync: createAgent, isPending: creating } = useCreateAgent()
  const { mutateAsync: updateAgent, isPending: updating } = useUpdateAgent()
  const { mutateAsync: publishAgent, isPending: publishing } = usePublishAgent()

  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [error, setError] = useState('')
  const [agentId, setAgentId] = useState<string>('')
  const lang = i18n.language

  if (!user) {
    navigate('/login')
    return null
  }

  useEffect(() => {
    if (!slug || !existingAgent) return
    setAgentId(existingAgent.id)
    setForm({
      nameZh: existingAgent.nameZh || '',
      nameEn: existingAgent.nameEn || '',
      taglineZh: existingAgent.taglineZh || '',
      taglineEn: existingAgent.taglineEn || '',
      descriptionZh: existingAgent.descriptionZh || '',
      descriptionEn: existingAgent.descriptionEn || '',
      category: existingAgent.category || 'other',
      avatarUrl: existingAgent.avatarUrl || '',
      systemPrompt: existingAgent.systemPrompt || '',
      systemPromptLang: existingAgent.systemPromptLang || 'zh-CN',
      mcpConfigRaw: existingAgent.mcpConfig ? JSON.stringify(existingAgent.mcpConfig, null, 2) : '',
      mcpConfigValid: true,
      capabilities: existingAgent.capabilities || [],
      tags: (existingAgent.tags || []).join(', '),
      supportedModels: (existingAgent.supportedModels || []).join(', '),
      languageSupport: existingAgent.languageSupport || ['zh-CN'],
    })
  }, [slug, existingAgent])

  const set = (key: keyof FormData, val: any) => setForm((f) => ({ ...f, [key]: val }))

  const toggleCapability = (cap: AgentCapability) => {
    set(
      'capabilities',
      form.capabilities.includes(cap) ? form.capabilities.filter((c) => c !== cap) : [...form.capabilities, cap]
    )
  }

  const parseMCPConfig = () => {
    if (!form.mcpConfigRaw.trim()) return null
    try {
      return JSON.parse(form.mcpConfigRaw)
    } catch {
      return null
    }
  }

  const handleMCPChange = (raw: string) => {
    let valid = true
    if (raw.trim()) {
      try {
        JSON.parse(raw)
      } catch {
        valid = false
      }
    }
    setForm((f) => ({ ...f, mcpConfigRaw: raw, mcpConfigValid: valid }))
  }

  const saving = creating || updating || publishing

  const save = async (publish = false) => {
    setError('')
    try {
      const payload = {
        nameZh: form.nameZh,
        nameEn: form.nameEn || undefined,
        taglineZh: form.taglineZh,
        taglineEn: form.taglineEn || undefined,
        descriptionZh: form.descriptionZh,
        descriptionEn: form.descriptionEn || undefined,
        category: form.category,
        avatarUrl: form.avatarUrl || undefined,
        systemPrompt: form.systemPrompt,
        systemPromptLang: form.systemPromptLang as 'zh-CN' | 'en',
        mcpConfig: parseMCPConfig(),
        capabilities: form.capabilities,
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        supportedModels: form.supportedModels.split(',').map((s) => s.trim()).filter(Boolean),
        languageSupport: form.languageSupport,
      }
      const data = slug ? await updateAgent({ id: agentId, payload }) : await createAgent(payload)
      if (publish) await publishAgent(data.id)
      navigate(`/marketplace/${data.slug}`)
      toast.success(t('common.success'))
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || t('common.error')
      setError(msg)
      toast.error(msg)
    }
  }

  const steps = [t('upload.step1'), t('upload.step2'), t('upload.step3'), t('upload.step4'), t('upload.step5')]

  return (
    <div className="relative min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="absolute top-[-10%] left-1/3 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="text-2xl font-bold text-white mb-2">{slug ? t('upload.edit_title') : t('upload.title')}</h1>
        <p className="text-slate-400 mb-6">{t('upload.subtitle')}</p>

        {isLoading && <div className="text-slate-400 mb-4">{t('common.loading')}</div>}

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border',
                  step > i + 1
                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                    : step === i + 1
                    ? 'bg-brand-primary/20 border-brand-primary/40 text-brand-accent'
                    : 'bg-white/[0.04] border-white/10 text-slate-500'
                )}
              >
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={cn('text-xs truncate hidden sm:block', step === i + 1 ? 'text-white' : 'text-slate-500')}>
                {label}
              </span>
              {i < 4 && <div className={cn('h-px flex-1 hidden sm:block', step > i + 1 ? 'bg-green-500/40' : 'bg-white/10')} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-6 space-y-5">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.name_zh')} *</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  value={form.nameZh}
                  onChange={(e) => set('nameZh', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.name_en')}</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  value={form.nameEn}
                  onChange={(e) => set('nameEn', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.tagline_zh')}</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  value={form.taglineZh}
                  onChange={(e) => set('taglineZh', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.description_zh')} *</label>
                <textarea
                  className="w-full h-24 resize-none rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  value={form.descriptionZh}
                  onChange={(e) => set('descriptionZh', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.category')}</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value as AgentCategory)}
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, labels]) => (
                    <option key={key} value={key}>
                      {lang === 'zh-CN' ? labels.zh : labels.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.avatar_url')}</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  type="url"
                  value={form.avatarUrl}
                  onChange={(e) => set('avatarUrl', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 2: System Prompt */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('agent.system_prompt')} *</label>
                <textarea
                  className="w-full h-64 resize-none rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all font-mono text-sm"
                  value={form.systemPrompt}
                  onChange={(e) => set('systemPrompt', e.target.value)}
                  placeholder={t('upload.system_prompt_placeholder')}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.prompt_language')}</label>
                <select
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  value={form.systemPromptLang}
                  onChange={(e) => set('systemPromptLang', e.target.value)}
                >
                  <option value="zh-CN">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            </>
          )}

          {/* Step 3: MCP Config */}
          {step === 3 && (
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">{t('upload.mcp_config_label')}</label>
              <textarea
                className={cn(
                  'w-full h-48 resize-none rounded-xl border bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:ring-1 outline-none transition-all font-mono text-sm',
                  !form.mcpConfigValid
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-white/10 focus:border-brand-accent/50 focus:ring-brand-accent/20'
                )}
                value={form.mcpConfigRaw}
                onChange={(e) => handleMCPChange(e.target.value)}
                placeholder={t('upload.mcp_config_placeholder')}
              />
              {!form.mcpConfigValid && <p className="text-red-400 text-xs mt-1">{t('upload.json_error')}</p>}
              <p className="text-slate-500 text-xs mt-2">{t('upload.mcp_skip_hint')}</p>
            </div>
          )}

          {/* Step 4: Capabilities & Tags */}
          {step === 4 && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-2">{t('upload.capabilities_label')}</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_CAPABILITIES.map((cap) => (
                    <button
                      key={cap}
                      onClick={() => toggleCapability(cap)}
                      type="button"
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                        form.capabilities.includes(cap)
                          ? 'bg-brand-secondary/20 border-brand-secondary/40 text-white'
                          : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
                      )}
                    >
                      {lang === 'zh-CN' ? CAPABILITY_LABELS[cap].zh : CAPABILITY_LABELS[cap].en}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.tags_label')}</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  value={form.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  placeholder="Python, 数据分析, 可视化"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">{t('upload.supported_models_label')}</label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-white px-4 py-2.5 placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/20 outline-none transition-all"
                  value={form.supportedModels}
                  onChange={(e) => set('supportedModels', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">{t('upload.language_support_label')}</label>
                <div className="flex gap-3">
                  {['zh-CN', 'en'].map((l) => (
                    <label key={l} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.languageSupport.includes(l)}
                        onChange={(e) =>
                          set(
                            'languageSupport',
                            e.target.checked ? [...form.languageSupport, l] : form.languageSupport.filter((x) => x !== l)
                          )
                        }
                        className="rounded border-white/20 bg-white/[0.04] text-brand-accent focus:ring-brand-accent/30"
                      />
                      <span className="text-sm text-slate-300">{l === 'zh-CN' ? '中文' : 'English'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 5: Preview */}
          {step === 5 && (
            <div>
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                {t('upload.preview')}
              </h3>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl font-semibold text-white">
                    {form.avatarUrl ? (
                      <img src={form.avatarUrl} className="w-full h-full rounded-xl object-cover" alt="" />
                    ) : (
                      (form.nameZh || '🤖').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{form.nameZh || t('upload.default_name')}</div>
                    <div className="text-xs text-slate-400">
                      {lang === 'zh-CN' ? CATEGORY_LABELS[form.category]?.zh : CATEGORY_LABELS[form.category]?.en}
                    </div>
                  </div>
                </div>
                {form.taglineZh && <p className="text-sm text-slate-300">{form.taglineZh}</p>}
                {form.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.capabilities.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-full bg-brand-secondary/15 text-brand-accent text-[11px] border border-brand-secondary/20">
                        {CAPABILITY_LABELS[c].zh}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setStep((s) => (s - 1) as Step)}
            disabled={step === 1}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('upload.prev')}
          </button>
          <div className="flex gap-2">
            {step === 5 ? (
              <>
                <button
                  onClick={() => save(false)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full text-sm font-medium bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 transition-all"
                >
                  {t('upload.save_draft')}
                </button>
                <button
                  onClick={() => save(true)}
                  disabled={saving || !form.nameZh || !form.descriptionZh || !form.systemPrompt}
                  className="px-5 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-brand-primary to-blue-500 text-white hover:from-blue-500 hover:to-brand-primary shadow-lg shadow-brand-primary/20 transition-all"
                >
                  {saving ? t('common.loading') : t('upload.publish')}
                </button>
              </>
            ) : (
              <button
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-brand-primary to-blue-500 text-white hover:from-blue-500 hover:to-brand-primary shadow-lg shadow-brand-primary/20 transition-all"
              >
                {t('upload.next')}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
