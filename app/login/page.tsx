'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Status = 'idle' | 'link-ready' | 'waiting' | 'error'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('idle')
  const [botLink, setBotLink] = useState('')
  const [googleError, setGoogleError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval>>()
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  // Redirect if already logged in
  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (r.ok) router.replace('/') })
  }, [router])

  // Show error from Google OAuth redirect
  useEffect(() => {
    const err = searchParams.get('error')
    if (err) setGoogleError('Не удалось войти через Google. Попробуй ещё раз.')
  }, [searchParams])

  // If opened from bot with ?token= — immediately verify and enter
  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) return
    setStatus('waiting')
    fetch('/api/auth/check-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async r => {
      if (r.status === 200) {
        window.location.href = '/'
      } else if (r.status === 202) {
        // Confirmed in Telegram but server hasn't caught up — retry a few times
        let tries = 0
        const retry = setInterval(async () => {
          tries++
          const r2 = await fetch('/api/auth/check-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(() => null)
          if (r2?.status === 200) { clearInterval(retry); window.location.href = '/' }
          if (tries >= 10) { clearInterval(retry); setStatus('idle') }
        }, 1500)
      } else {
        // Token expired or not found — go back to idle so user can try again
        setStatus('idle')
      }
    }).catch(() => setStatus('idle'))
  }, [searchParams])

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
      style={{ backgroundColor: '#EDE9FF' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white text-3xl font-bold mb-4"
            style={{ background: 'linear-gradient(135deg, #101585 0%, #2D22C4 100%)' }}
          >
            R
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#101585' }}>Ritualr</h1>
          <p className="text-sm mt-1" style={{ color: '#A78BFA' }}>Войди, чтобы сохранять историю на всех устройствах</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3" style={{ border: '1px solid rgba(167,139,250,0.25)' }}>

          {/* ── Google error ── */}
          {googleError && (
            <p className="text-xs text-rose-500 bg-rose-50 rounded-xl px-3 py-2 text-center">
              {googleError}
            </p>
          )}

          {/* ── Google ── */}
          <a
            href="/api/auth/google"
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-all hover:shadow-md"
            style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.12)', color: '#3c4043' }}
          >
            <GoogleIcon />
            Войти через Google
          </a>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(167,139,250,0.2)' }} />
            <span className="text-xs" style={{ color: '#A78BFA' }}>или</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(167,139,250,0.2)' }} />
          </div>

          {/* ── Telegram ── */}
          {status === 'idle' && (
            <>
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
                style={{ backgroundColor: '#2AABEE', display: 'flex' }}
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
                className="text-sm font-medium transition-colors"
                style={{ color: '#2D22C4' }}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
    </svg>
  )
}
