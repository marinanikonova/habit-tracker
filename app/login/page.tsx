'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const widgetRef = useRef<HTMLDivElement>(null)
  const hasError = searchParams.get('error') === '1'

  // Redirect if already logged in
  useEffect(() => {
    fetch('/api/auth/me').then(r => { if (r.ok) router.replace('/') })
  }, [router])

  // Mount Telegram Login Widget
  useEffect(() => {
    if (!widgetRef.current) return
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
    if (!botUsername) return

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botUsername)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-auth-url', `${window.location.origin}/api/auth/telegram-callback`)
    script.setAttribute('data-request-access', 'write')
    script.async = true

    widgetRef.current.appendChild(script)
  }, [])

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
          <p className="text-sm text-slate-500 mt-1">Войди через Telegram, чтобы сохранять историю</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
          {hasError && (
            <p className="text-sm text-rose-500 bg-rose-50 rounded-xl px-3 py-2 mb-4 text-center">
              Не удалось войти. Попробуй ещё раз.
            </p>
          )}

          <p className="text-sm text-slate-500 mb-5 text-center">
            Нажми кнопку и подтверди вход в приложении Telegram
          </p>

          {/* Widget renders here */}
          <div ref={widgetRef} className="flex justify-center min-h-[48px]" />
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
