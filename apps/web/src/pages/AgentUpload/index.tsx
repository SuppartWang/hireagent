import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ChevronLeft, Eye } from 'lucide-react'
import { AgentCategory, AgentCapability, CATEGORY_LABELS, CAPABILITY_LABELS } from '@hireagent/shared'
import { agentsApi } from '../../api'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/cn'

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  nameZh: string; nameEn: string
  taglineZh: string; taglineEn: string
  descriptionZh: string; descriptionEn: string
  category: AgentCategory; avatarUrl: string
  systemPrompt: string; systemPromptLang: string
  mcpConfigRaw: string; mcpConfigValid: boolean
  capabilities: AgentCapability[]
  tags: string; supportedModels: string; languageSupport: string[]
}

const INITIAL: FormData = {
  nameZh: '', nameEn: '', taglineZh: '', taglineEn: '',
  descriptionZh: '', descriptionEn: '',
  category: 'other', avatarUrl: '',
  systemPrompt: '', systemPromptLang: 'zh-CN',
  mcpConfigRaw: '', mcpConfigValid: true,
  capabilities: [], tags: '',
  supportedModels: 'claude-3-5-sonnet-20241022',
  languageSupport: ['zh-CN'],
}

const ALL_CAPABILITIES: AgentCapability[] = [
  'web_search', 'code_execution', 'image_generation', 'file_reading',
  'database_query', 'email_send', 'calendar_access', 'browser_control', 'memory', 'multi_agent',
]

export function AgentUploadPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { slug } = useParams<{ slug?: string }>()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(!!slug)
  const [agentId, setAgentId] = useState<string>('')
  const lang = i18n.language

  if (!user) { navigate('/login'); return null }

  useEffect(() => {
    if (!slug) return
    agentsApi.getBySlug(slug)
      .then(res => {
        const a = res.data
        setAgentId(a.id)
        setForm({
          nameZh: a.nameZh || '',
          nameEn: a.nameEn || '',
          taglineZh: a.taglineZh || '',
          taglineEn: a.taglineEn || '',
          descriptionZh: a.descriptionZh || '',
          descriptionEn: a.descriptionEn || '',
          category: a.category || 'other',
          avatarUrl: a.avatarUrl || '',
          systemPrompt: a.systemPrompt || '',
          systemPromptLang: a.systemPromptLang || 'zh-CN',
          mcpConfigRaw: a.mcpConfig ? JSON.stringify(a.mcpConfig, null, 2) : '',
          mcpConfigValid: true,
          capabilities: a.capabilities || [],
          tags: (a.tags || []).join(', '),
          supportedModels: (a.supportedModels || []).join(', '),
          languageSupport: a.languageSupport || ['zh-CN'],
        })
      })
      .catch(err => setError(err.response?.data?.error || t('common.error')))
      .finally(() => setLoading(false))
  }, [slug, t])

  const set = (key: keyof FormData, val: any) => setForm(f => ({ ...f, [key]: val }))

  const toggleCapability = (cap: AgentCapability) => {
    set('capabilities', form.capabilities.includes(cap)
      ? form.capabilities.filter(c => c !== cap)
      : [...form.capabilities, cap])
  }

  const parseMCPConfig = () => {
    if (!form.mcpConfigRaw.trim()) return null
    try { return JSON.parse(form.mcpConfigRaw) }
    catch { return null }
  }

  const handleMCPChange = (raw: string) => {
    let valid = true
    if (raw.trim()) {
      try { JSON.parse(raw) } catch { valid = false }
    }
    setForm(f => ({ ...f, mcpConfigRaw: raw, mcpConfigValid: valid }))
  }

  const save = async (publish = false) => {
    setSaving(true); setError('')
    try {
      const payload = {
        nameZh: form.nameZh, nameEn: form.nameEn || undefined,
        taglineZh: form.taglineZh, taglineEn: form.taglineEn || undefined,
        descriptionZh: form.descriptionZh, descriptionEn: form.descriptionEn || undefined,
        category: form.category, avatarUrl: form.avatarUrl || undefined,
        systemPrompt: form.systemPrompt, systemPromptLang: form.systemPromptLang as 'zh-CN' | 'en',
        mcpConfig: parseMCPConfig(),
        capabilities: form.capabilities,
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        supportedModels: form.supportedModels.split(',').map(s => s.trim()).filter(Boolean),
        languageSupport: form.languageSupport,
      }
      const { data } = slug ? await agentsApi.update(agentId, payload) : await agentsApi.create(payload)
      if (publish) await agentsApi.publish(data.id)
      navigate(`/agents/${data.slug}`)
    } catch (err: any) {
      setError(err.response?.data?.error || t('common.error'))
    } finally { setSaving(false) }
  }

  const steps = [
    t('upload.step1'), t('upload.step2'), t('upload.step3'),
    t('upload.step4'), t('upload.step5'),
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">{slug ? t('upload.edit_title') : t('upload.title')}</h1>

      {loading && <div className="text-slate-400 mb-4">{t('common.loading')}</div>}

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
              step > i + 1 ? 'bg-green-500 text-white'
                : step === i + 1 ? 'bg-brand-primary text-white'
                : 'bg-surface-overlay text-slate-500'
            )}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={cn('text-xs truncate hidden sm:block', step === i + 1 ? 'text-white' : 'text-slate-500')}>
              {label}
            </span>
            {i < 4 && <div className={cn('h-px flex-1 hidden sm:block', step > i + 1 ? 'bg-green-500' : 'bg-surface-border')} />}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm mb-4">{error}</div>}

      <div className="card space-y-4">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('upload.name_zh')} *</label>
              <input className="input w-full" value={form.nameZh} onChange={e => set('nameZh', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('upload.name_en')}</label>
              <input className="input w-full" value={form.nameEn} onChange={e => set('nameEn', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('upload.tagline_zh')}</label>
              <input className="input w-full" value={form.taglineZh} onChange={e => set('taglineZh', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('upload.description_zh')} *</label>
              <textarea className="input w-full h-24 resize-none" value={form.descriptionZh} onChange={e => set('descriptionZh', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('upload.category')}</label>
              <select className="input w-full" value={form.category} onChange={e => set('category', e.target.value as AgentCategory)}>
                {Object.entries(CATEGORY_LABELS).map(([key, labels]) => (
                  <option key={key} value={key}>{lang === 'zh-CN' ? labels.zh : labels.en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('upload.avatar_url')}</label>
              <input className="input w-full" type="url" value={form.avatarUrl} onChange={e => set('avatarUrl', e.target.value)} />
            </div>
          </>
        )}

        {/* Step 2: System Prompt */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('agent.system_prompt')} *</label>
              <textarea
                className="input w-full h-64 resize-none font-mono text-sm"
                value={form.systemPrompt}
                onChange={e => set('systemPrompt', e.target.value)}
                placeholder={t('upload.system_prompt_placeholder')}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">提示词语言</label>
              <select className="input w-full" value={form.systemPromptLang} onChange={e => set('systemPromptLang', e.target.value)}>
                <option value="zh-CN">中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </>
        )}

        {/* Step 3: MCP Config */}
        {step === 3 && (
          <div>
            <label className="block text-sm text-slate-400 mb-1">{t('upload.mcp_config_label')}</label>
            <textarea
              className={cn('input w-full h-48 resize-none font-mono text-sm', !form.mcpConfigValid && 'border-red-500/50 focus:ring-red-500')}
              value={form.mcpConfigRaw}
              onChange={e => handleMCPChange(e.target.value)}
              placeholder={t('upload.mcp_config_placeholder')}
            />
            {!form.mcpConfigValid && <p className="text-red-400 text-xs mt-1">JSON 格式错误</p>}
            <p className="text-slate-500 text-xs mt-2">如无 MCP 配置，可跳过此步骤</p>
          </div>
        )}

        {/* Step 4: Capabilities & Tags */}
        {step === 4 && (
          <>
            <div>
              <label className="block text-sm text-slate-400 mb-2">{t('upload.capabilities_label')}</label>
              <div className="flex flex-wrap gap-2">
                {ALL_CAPABILITIES.map(cap => (
                  <button
                    key={cap}
                    onClick={() => toggleCapability(cap)}
                    type="button"
                    className={cn('badge cursor-pointer transition-colors', form.capabilities.includes(cap)
                      ? 'bg-brand-secondary text-white'
                      : 'bg-surface-overlay text-slate-400 hover:text-white')}
                  >
                    {lang === 'zh-CN' ? CAPABILITY_LABELS[cap].zh : CAPABILITY_LABELS[cap].en}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('upload.tags_label')}</label>
              <input className="input w-full" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Python, 数据分析, 可视化" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">{t('upload.supported_models_label')}</label>
              <input className="input w-full" value={form.supportedModels} onChange={e => set('supportedModels', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">{t('upload.language_support_label')}</label>
              <div className="flex gap-3">
                {['zh-CN', 'en'].map(l => (
                  <label key={l} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.languageSupport.includes(l)}
                      onChange={e => set('languageSupport', e.target.checked ? [...form.languageSupport, l] : form.languageSupport.filter(x => x !== l))}
                      className="rounded" />
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
            <h3 className="font-medium text-white mb-4 flex items-center gap-2"><Eye className="w-4 h-4" />{t('upload.preview')}</h3>
            <div className="bg-surface-overlay rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-border flex items-center justify-center text-2xl">
                  {form.avatarUrl ? <img src={form.avatarUrl} className="w-full h-full rounded-xl object-cover" alt="" /> : '🤖'}
                </div>
                <div>
                  <div className="font-semibold text-white">{form.nameZh || '智能体名称'}</div>
                  <div className="text-xs text-slate-400">{CATEGORY_LABELS[form.category]?.zh}</div>
                </div>
              </div>
              {form.taglineZh && <p className="text-sm text-slate-300">{form.taglineZh}</p>}
              {form.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {form.capabilities.map(c => <span key={c} className="badge bg-brand-secondary/20 text-purple-300 text-xs">{CAPABILITY_LABELS[c].zh}</span>)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setStep(s => (s - 1) as Step)}
          disabled={step === 1}
          className="btn-secondary flex items-center gap-1 disabled:opacity-0"
        >
          <ChevronLeft className="w-4 h-4" />{t('upload.prev')}
        </button>
        <div className="flex gap-2">
          {step === 5 ? (
            <>
              <button onClick={() => save(false)} disabled={saving} className="btn-secondary">
                {t('upload.save_draft')}
              </button>
              <button onClick={() => save(true)} disabled={saving || !form.nameZh || !form.descriptionZh || !form.systemPrompt} className="btn-primary">
                {saving ? t('common.loading') : t('upload.publish')}
              </button>
            </>
          ) : (
            <button onClick={() => setStep(s => (s + 1) as Step)} className="btn-primary flex items-center gap-1">
              {t('upload.next')}<ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
