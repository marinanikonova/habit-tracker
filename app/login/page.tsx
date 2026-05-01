'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'idle' | 'waiting' | 'error'

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
    setStatus('waiting')
    try {
      const res = await fetch('/api/auth/start-login', { method: 'POST' })
      const data = await res.json()
      setBotLink(data.botLink)
      window.open(data.botLink, '_blank')

      // Poll every 2s for confirmation
      pollRef.current = setInterval(async () => {
        const r = await fetch('/api/auth/check-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.token }),
        })
        if (r.status === 200) {
          clearInterval(pollRef.current)
          clearTimeout(timeoutRef.current)
          router.replace('/')
          router.refresh()
        } else if (r.status === 400) {
          clearInterval(pollRef.current)
          setStatus('error')
        }
      }, 2000)

      // Give up after 5 minutes
      timeoutRef.current = setTimeout(() => {
        clearInterval(pollRef.current)
        setStatus('error')
      }, 5 * 60 * 1000)
    } catch {
      setStatus('error')
    }
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

          {status === 'waiting' && (
            <div className="text-center py-2">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: '#2AABEE', borderTopColor: 'transparent' }}
              />
              <p className="text-sm font-semibold text-slate-700 mb-1">Ожидаем подтверждения</p>
              <p className="text-xs text-slate-400 mb-5">
                Открой Telegram и нажми кнопку «Подтвердить вход» в сообщении от бота
              </p>
              {botLink && (
                <a
                  href={botLink}
                  target="_blank"
                  className="text-xs font-medium"
                  style={{ color: '#2AABEE' }}
                >
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
