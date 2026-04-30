'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

function isValidPhone(raw: string) {
  return /^\+[1-9]\d{6,14}$/.test(raw.replace(/[\s\-\(\)]/g, ''))
}

export default function LoginPage() {
  const router = useRouter()

  const [step, setStep]         = useState<'phone' | 'code'>('phone')
  const [phone, setPhone]       = useState('')
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [countdown, setCountdown] = useState(0)
  const codeRef = useRef<HTMLInputElement>(null)

  // Redirect if already logged in
  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.ok) router.replace('/')
    })
  }, [router])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Focus code input when step changes
  useEffect(() => {
    if (step === 'code') codeRef.current?.focus()
  }, [step])

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const clean = phone.replace(/[\s\-\(\)]/g, '')

    if (!isValidPhone(clean)) {
      setError('Формат: +79991234567 (страна + номер без пробелов)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Ошибка отправки'); return }
      setStep('code')
      setCountdown(60)
    } catch {
      setError('Нет соединения. Проверь интернет.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (code.length !== 5) { setError('Введи 5-значный код'); return }

    setLoading(true)
    try {
      const clean = phone.replace(/[\s\-\(\)]/g, '')
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Неверный код')
        setCode('')
        return
      }
      router.replace('/')
      router.refresh()
    } catch {
      setError('Нет соединения. Проверь интернет.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setCode('')
    setError('')
    setLoading(true)
    try {
      const clean = phone.replace(/[\s\-\(\)]/g, '')
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Ошибка отправки'); return }
      setCountdown(60)
    } catch {
      setError('Нет соединения.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#fff0f5' }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-slate-800">Мои привычки</h1>
          <p className="text-sm text-slate-500 mt-1">Войди, чтобы продолжить</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">

          {/* ── Step 1: Phone ── */}
          {step === 'phone' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError('') }}
                  placeholder="+79991234567"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Код придёт через Telegram на этот номер
                </p>
              </div>

              {error && (
                <p className="text-sm text-rose-500 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Spinner /> : (
                  <>
                    <TelegramIcon />
                    Получить код
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Step 2: Code ── */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Код из Telegram
                  </label>
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setCode(''); setError('') }}
                    className="text-xs text-slate-400 hover:text-pink-500 transition-colors"
                  >
                    ← Изменить номер
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  Отправили на <span className="font-medium text-slate-700">{phone.replace(/[\s\-\(\)]/g, '')}</span>
                </p>

                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 5)
                    setCode(v)
                    setError('')
                  }}
                  placeholder="12345"
                  maxLength={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-xl font-mono tracking-[0.4em] text-center placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-rose-500 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 5}
                className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <Spinner /> : 'Войти'}
              </button>

              {/* Resend */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-slate-400">
                    Отправить снова через <span className="font-semibold text-slate-600">{countdown}с</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-xs text-pink-500 hover:text-pink-600 font-medium transition-colors disabled:opacity-50"
                  >
                    Отправить код повторно
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
  )
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
    </svg>
  )
}
