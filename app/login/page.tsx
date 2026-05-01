'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'idle' | 'link-ready' | 'waiting' | 'error'

export default function LoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [botLink, setBotLink] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval>>()
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (r.ok) router.replace('/') })
  }, [router])

  useEffect(() => {
    return () => {
      clearInterval(pollRef.current)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  async function handleLogin() {
    try {
      const res = await fetch('/api/auth/start-login', { method: 'POST' })
      const data = await res.json()
      setBotLink(data.botLink)
      setStatus('link-ready')
      startPolling(data.token)
    } catch {
      setStatus('error')
    }
  }

  function startPolling(token: string) {
    clearInterval(pollRef.current)
    clearTimeout(timeoutRef.current)

    const check = async () => {
      const r = await fetch('/api/auth/check-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => null)
      if (!r) return
      if (r.status === 200) {
        clearInterval(pollRef.current)
        clearTimeout(timeoutRef.current)
        window.location.href = '/'
      } else if (r.status === 400) {
        clearInterval(pollRef.current)
        setStatus('error')
      }
    }

    pollRef.current = setInterval(check, 2000)

    // Also check immediately when user returns to this tab
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)

    timeoutRef.current = setTimeout(() => {
      clearInterval(pollRef.current)
      document.removeEventListener('visibilitychange', onVisible)
      setStatus('error')
    }, 5 * 60 * 1000)
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#fff0f5' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold text-slate-800">Мои привычки</h1>
          <p className="text-sm text-slate-500 mt-1">Войди через Telegram, чтобы сохранять историю</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
          {status === 'idle' && (
            <>
              <p className="text-sm text-slate-500 mb-5 text-center">
                Нажми кнопку — откроется Telegram, там нужно нажать «Подтвердить вход»
              </p>
              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: '#2AABEE' }}
              >
                <TelegramIcon />
                Войти через Telegram
              </button>
            </>
          )}

          {status === 'link-ready' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 text-center">
                Нажми кнопку — бот пришлёт сообщение с подтверждением
              </p>
              <a
                href={botLink}
                onClick={() => setStatus('waiting')}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                style={{ backgroundColor: '#2AABEE' }}
              >
                <TelegramIcon />
                Открыть Telegram
              </a>
            </div>
          )}

          {status === 'waiting' && (
            <div className="text-center py-2 space-y-4">
              <div className="flex items-center gap-2 justify-center">
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin shrink-0"
                  style={{ borderColor: '#2AABEE', borderTopColor: 'transparent' }}
                />
                <span className="text-sm text-slate-600">Ожидаем подтверждения…</span>
              </div>
              <p className="text-xs text-slate-400">
                Нажми «Подтвердить вход» в сообщении от бота, затем вернись сюда
              </p>
              {botLink && (
                <a href={botLink} className="text-xs font-medium" style={{ color: '#2AABEE' }}>
                  Открыть Telegram ещё раз →
                </a>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <p className="text-sm text-rose-500 bg-rose-50 rounded-xl px-3 py-2 mb-4">
                Время вышло или произошла ошибка. Попробуй ещё раз.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="text-sm text-pink-500 hover:text-pink-600 font-medium transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
    </svg>
  )
}
