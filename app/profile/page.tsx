'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'

interface ApiKey {
  id: number
  name: string
  key_prefix: string
  last_used_at: string | null
  revoked_at: string | null
  created_at: string
}

interface User {
  userId: number
  telegramId: number
  firstName: string
}

interface CreatedKey extends ApiKey {
  full_key: string
}

// ── helpers ───────────────────────────────────────────────────────────────────

function maskPrefix(prefix: string): string {
  // Show the first 7 chars (e.g. "ht_Ab3x") then "••••••"
  return prefix.slice(0, 7) + '••••••'
}

function formatDate(iso: string | null, lang: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function NewKeyModal({
  createdKey,
  origin,
  onClose,
}: {
  createdKey: CreatedKey
  origin: string
  onClose: () => void
}) {
  const { t } = useLanguage()
  const [copiedKey, setCopiedKey]    = useState(false)
  const [copiedCfg, setCopiedCfg]    = useState(false)

  const mcpConfig = JSON.stringify(
    {
      'habit-tracker': {
        type: 'http',
        url: `${origin}/api/mcp`,
        headers: { 'x-api-key': createdKey.full_key },
      },
    },
    null,
    2,
  )

  async function copyText(text: string, setCopied: (v: boolean) => void) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="text-2xl mb-1">🔑</div>
          <h2 className="text-xl font-bold text-slate-800">{t('keyCreated')}</h2>
          <p className="text-sm text-rose-500 font-medium mt-1">
            {t('saveKeyWarning')}
          </p>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Full key */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {t('apiKeyLabel')}
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 break-all">
                {createdKey.full_key}
              </code>
              <button
                onClick={() => copyText(createdKey.full_key, setCopiedKey)}
                className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: copiedKey ? '#10b981' : '#f43f5e',
                  color: '#fff',
                }}
              >
                {copiedKey ? t('copied') : t('copy')}
              </button>
            </div>
          </div>

          {/* MCP config */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {t('mcpConfigLabel')}
            </p>
            <div className="relative">
              <pre className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap break-all">
                {mcpConfig}
              </pre>
              <button
                onClick={() => copyText(mcpConfig, setCopiedCfg)}
                className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: copiedCfg ? '#10b981' : '#6366f1',
                  color: '#fff',
                }}
              >
                {copiedCfg ? '✓' : t('copy')}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {t('mcpConfigHint')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-colors"
            style={{ backgroundColor: '#101585' }}
          >
            {t('savedClose')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const { t, lang } = useLanguage()

  const [user, setUser]           = useState<User | null>(null)
  const [keys, setKeys]           = useState<ApiKey[]>([])
  const [loading, setLoading]     = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating]   = useState(false)
  const [revoking, setRevoking]   = useState<number | null>(null)
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null)
  const [origin, setOrigin]       = useState('')
  const inputRef                  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  // Load user + keys
  useEffect(() => {
    async function load() {
      const [meRes, keysRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/api-keys'),
      ])
      if (!meRes.ok) {
        router.replace('/login')
        return
      }
      setUser(await meRes.json())
      setKeys(keysRes.ok ? await keysRes.json() : [])
      setLoading(false)
    }
    load()
  }, [router])

  async function handleCreateKey(e: React.FormEvent) {
    e.preventDefault()
    const name = newKeyName.trim()
    if (!name) return
    setCreating(true)
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('Failed')
      const created: CreatedKey = await res.json()
      setKeys(prev => [created, ...prev])
      setCreatedKey(created)
      setNewKeyName('')
    } catch {
      alert(t('failedCreateKey'))
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: number) {
    setRevoking(id)
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setKeys(prev =>
        prev.map(k =>
          k.id === id ? { ...k, revoked_at: new Date().toISOString() } : k,
        ),
      )
    } catch {
      alert(t('failedRevokeKey'))
    } finally {
      setRevoking(null)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDE9FF' }}>
        <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
      </main>
    )
  }

  const activeKeys  = keys.filter(k => !k.revoked_at)
  const revokedKeys = keys.filter(k => k.revoked_at)

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: '#EDE9FF' }}>
      {/* Nav */}
      <nav className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold" style={{ color: '#101585' }}>
          Ritualr
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/"
            className="text-sm font-semibold transition-colors"
            style={{ color: '#A78BFA' }}
          >
            {t('backToTracker')}
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 space-y-6">

        {/* User card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #101585 0%, #2D22C4 100%)' }}
            >
              {user?.firstName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#101585' }}>{user?.firstName}</p>
              <p className="text-sm" style={{ color: '#A78BFA' }}>{t('telegramId')}: {user?.telegramId}</p>
            </div>
          </div>
        </div>

        {/* MCP intro */}
        <div className="rounded-3xl p-6" style={{ backgroundColor: 'rgba(45,34,196,0.06)', border: '1px solid rgba(45,34,196,0.12)' }}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="font-semibold mb-1" style={{ color: '#101585' }}>{t('mcpServer')}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#2D22C4' }}>
                {t('mcpDesc')}{' '}
                <strong>Claude Code</strong> {t('mcpDescEnd')} <strong>Claude Desktop</strong>.{' '}
                {t('mcpAddress')}{' '}
                <code className="bg-indigo-100 px-1 py-0.5 rounded text-xs font-mono">
                  {origin}/api/mcp
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* Create key */}
        <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#101585' }}>{t('createApiKey')}</h2>
          <form onSubmit={handleCreateKey} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder={t('keyNamePlaceholder')}
              maxLength={64}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm placeholder-slate-400 focus:outline-none"
              style={{ border: '1px solid rgba(167,139,250,0.3)', color: '#101585' }}
            />
            <button
              type="submit"
              disabled={creating || !newKeyName.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: '#101585' }}
            >
              {creating ? t('creating') : t('create')}
            </button>
          </form>
        </div>

        {/* Active keys */}
        {activeKeys.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: '#101585' }}>
              {t('activeKeys')}
              <span className="ml-2 text-sm font-normal" style={{ color: '#A78BFA' }}>({activeKeys.length})</span>
            </h2>
            <div className="space-y-3">
              {activeKeys.map(k => (
                <div
                  key={k.id}
                  className="flex items-start justify-between gap-4 py-3 last:border-0"
                  style={{ borderBottom: '1px solid rgba(167,139,250,0.1)' }}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: '#101585' }}>{k.name}</p>
                    <p className="text-xs font-mono mt-0.5" style={{ color: '#A78BFA' }}>
                      {maskPrefix(k.key_prefix)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#A78BFA' }}>
                      {t('createdAt')} {formatDate(k.created_at, lang)}
                      {k.last_used_at && ` · ${t('usedAt')} ${formatDate(k.last_used_at, lang)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(k.id)}
                    disabled={revoking === k.id}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    style={{ border: '1px solid rgba(244,63,94,0.25)' }}
                  >
                    {revoking === k.id ? t('revoking') : t('revoke')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {activeKeys.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: '#A78BFA' }}>
            {t('noActiveKeys')}
          </div>
        )}

        {/* Revoked keys (collapsed) */}
        {revokedKeys.length > 0 && (
          <details className="bg-white rounded-3xl shadow-sm overflow-hidden" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>
            <summary className="px-6 py-4 cursor-pointer text-sm font-semibold list-none flex items-center justify-between" style={{ color: '#A78BFA' }}>
              <span>{t('revokedKeys')} ({revokedKeys.length})</span>
              <span style={{ color: 'rgba(167,139,250,0.4)' }}>▾</span>
            </summary>
            <div className="px-6 pb-5 space-y-3">
              {revokedKeys.map(k => (
                <div
                  key={k.id}
                  className="flex items-start gap-4 py-3 border-b border-slate-50 last:border-0 opacity-50"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-500 text-sm line-through truncate">{k.name}</p>
                    <p className="text-xs font-mono text-slate-300 mt-0.5">
                      {maskPrefix(k.key_prefix)}
                    </p>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {t('revokedAt')} {formatDate(k.revoked_at, lang)}
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-400">
                    {t('revokedLabel')}
                  </span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* New key modal */}
      {createdKey && (
        <NewKeyModal
          createdKey={createdKey}
          origin={origin}
          onClose={() => setCreatedKey(null)}
        />
      )}
    </main>
  )
}
