import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Download, Copy, Check } from 'lucide-react'
import { agentsApi } from '@/api'
import { cn } from '@/lib/utils'

type ExportTab = 'claude' | 'openclaw' | 'generic' | 'yaml' | 'prompt'

interface ExportModalProps {
  agentId: string
  agentName: string
  onClose: () => void
}

export function ExportModal({ agentId, agentName, onClose }: ExportModalProps) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ExportTab>('claude')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const downloadFile = async (type: ExportTab) => {
    setLoading(true)
    try {
      let res: any
      let filename: string
      let mimeType: string

      if (type === 'claude') {
        res = await agentsApi.exportClaude(agentId)
        filename = 'claude_desktop_config.json'
        mimeType = 'application/json'
      } else if (type === 'openclaw') {
        res = await agentsApi.exportOpenClaw(agentId)
        filename = `${agentName}_openclaw.json`
        mimeType = 'application/json'
      } else if (type === 'generic') {
        res = await agentsApi.exportGeneric(agentId)
        filename = `${agentName}_export.json`
        mimeType = 'application/json'
      } else if (type === 'yaml') {
        res = await agentsApi.exportYaml(agentId)
        filename = `${agentName}_export.yaml`
        mimeType = 'text/yaml'
      } else {
        res = await agentsApi.getPrompt(agentId)
        filename = `${agentName}_system_prompt.txt`
        mimeType = 'text/plain'
      }

      const blob = new Blob([res.data], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyContent = async (type: ExportTab) => {
    setLoading(true)
    try {
      const res = await (type === 'prompt' ? agentsApi.getPrompt(agentId) : agentsApi.exportGeneric(agentId))
      const text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2)
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  const tabs: { key: ExportTab; label: string }[] = [
    { key: 'claude', label: t('export.claude_tab') },
    { key: 'openclaw', label: t('export.openclaw_tab') },
    { key: 'generic', label: t('export.generic_tab') },
    { key: 'yaml', label: t('export.yaml_tab') },
    { key: 'prompt', label: t('export.prompt_tab') },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0b1120]/95 backdrop-blur-xl shadow-2xl animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="font-semibold text-white">{t('export.title')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/[0.04]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex border-b border-white/[0.06] px-5 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'py-3 px-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                tab === key
                  ? 'border-brand-accent text-white'
                  : 'border-transparent text-slate-400 hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 p-5">
          {tab === 'claude' && (
            <div>
              <p className="text-sm text-slate-400 mb-3">{t('export.claude_desc')}</p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs font-mono text-slate-300 mb-3">
                {`{\n  "mcpServers": { ... }\n}`}
              </div>
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3 mb-4">
                <p className="text-xs text-yellow-300">⚠️ {t('export.claude_note')}</p>
              </div>
            </div>
          )}

          {tab === 'openclaw' && (
            <div>
              <p className="text-sm text-slate-400 mb-4">{t('export.openclaw_desc')}</p>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-xs font-mono text-slate-300 mb-3">
                {`{\n  "openclaw_json": { ... },\n  "agent_md": "..."\n}`}
              </div>
            </div>
          )}

          {tab === 'generic' && (
            <div>
              <p className="text-sm text-slate-400 mb-4">{t('export.generic_desc')}</p>
            </div>
          )}

          {tab === 'prompt' && (
            <div>
              <p className="text-sm text-slate-400 mb-4">直接获取系统提示词原文，粘贴到任意 AI 工具的 System Prompt 设置中</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => downloadFile(tab)}
              disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t('export.download')}
            </button>
            {(tab === 'generic' || tab === 'prompt') && (
              <button
                onClick={() => copyContent(tab)}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? t('export.copied') : t('export.copy')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
