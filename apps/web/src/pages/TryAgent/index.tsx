import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Send, Bot, User, Download } from 'lucide-react'
import { Agent, CATEGORY_LABELS, CAPABILITY_LABELS } from '@hireagent/shared'
import { agentsApi } from '../../api'
import { useUIStore } from '../../store/uiStore'
import { cn } from '../../utils/cn'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
}

export function TryAgentPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { openExportModal } = useUIStore()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [simulating, setSimulating] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lang = i18n.language

  useEffect(() => {
    if (!slug) return
    agentsApi.getBySlug(slug)
      .then(res => setAgent(res.data))
      .catch(() => setAgent(null))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !agent) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSimulating(true)

    // Simulate a delay for "thinking"
    await new Promise(r => setTimeout(r, 800))

    const caps = agent.capabilities
      ?.map(c => lang === 'zh-CN' ? CAPABILITY_LABELS[c]?.zh : CAPABILITY_LABELS[c]?.en)
      ?.filter(Boolean)
      ?.join(', ') || (lang === 'zh-CN' ? '通用能力' : 'general capabilities')

    const reply = t('agent.try_simulated_reply', {
      name: agent.nameZh,
      input: userMsg.content,
      capabilities: caps,
    })

    const agentMsg: Message = { id: (Date.now() + 1).toString(), role: 'agent', content: reply }
    setMessages(prev => [...prev, agentMsg])
    setSimulating(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-raised rounded w-1/3" />
          <div className="h-64 bg-surface-raised rounded" />
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg">{t('common.not_found')}</p>
        <Link to="/marketplace" className="btn-primary mt-4 inline-block">{t('common.go_home')}</Link>
      </div>
    )
  }

  const name = lang === 'zh-CN' ? agent.nameZh : (agent.nameEn || agent.nameZh)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t('common.back')}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300 hidden sm:inline">{t('agent.try_title', { name })}</span>
          <button
            onClick={() => openExportModal(agent.id, name)}
            className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            {t('agent.hire_now')}
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="card p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-overlay flex items-center justify-center text-xl">
          {agent.avatarUrl ? <img src={agent.avatarUrl} alt={name} className="w-full h-full rounded-xl object-cover" /> : agent.nameZh?.[0] || '🤖'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">{name}</div>
          <div className="text-xs text-slate-400 truncate">
            {lang === 'zh-CN' ? CATEGORY_LABELS[agent.category]?.zh : CATEGORY_LABELS[agent.category]?.en}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{t('agent.try_input_placeholder')}</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'agent' && (
              <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-brand-accent" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-brand-primary text-white rounded-br-md'
                  : 'bg-surface-raised text-slate-200 rounded-bl-md border border-surface-border'
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-surface-overlay flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
        ))}
        {simulating && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-brand-accent" />
            </div>
            <div className="bg-surface-raised text-slate-200 rounded-2xl rounded-bl-md border border-surface-border px-4 py-2.5 text-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Export hint */}
      {messages.length > 0 && (
        <div className="text-xs text-slate-500 text-center mb-2">
          {t('agent.try_export_hint')}{' '}
          <button onClick={() => openExportModal(agent.id, name)} className="text-brand-accent hover:underline">
            {t('agent.hire_now')}
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t('agent.try_input_placeholder')}
          className="input flex-1"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || simulating}
          className="btn-primary px-4 flex items-center gap-1 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{t('agent.try_simulate')}</span>
        </button>
      </div>
    </div>
  )
}
