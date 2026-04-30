import { NextResponse } from 'next/server'
import {
  ensureSchema,
  upsertUser,
  getPendingVerification,
  deletePendingVerification,
  migrateAnonymousData,
  checkRateLimit,
} from '@/lib/db'
import { checkVerificationStatus } from '@/lib/telegram'
import { createToken, makeSessionCookie } from '@/lib/auth'

const STATUS_MESSAGES: Record<string, string> = {
  code_invalid:       'Неверный код. Попробуй ещё раз.',
  code_expired:       'Код истёк. Запроси новый.',
  exceeded:           'Превышено число попыток. Запроси новый код.',
  no_active_request:  'Код не найден или истёк. Запроси новый.',
}

export async function POST(req: Request) {
  try {
    await ensureSchema()

    const body = await req.json()
    const phone: string = (body.phone ?? '').replace(/[\s\-\(\)]/g, '')
    const code: string  = String(body.code ?? '').trim()

    if (!phone || !code) {
      return NextResponse.json({ error: 'Номер и код обязательны' }, { status: 400 })
    }

    const { allowed, retryAfter } = await checkRateLimit(
      `verify_code:${phone}`,
      5,
      60 * 60 * 1000, // 5 attempts per hour
    )

    if (!allowed) {
      const minutes = Math.ceil((retryAfter ?? 60) / 60)
      return NextResponse.json(
        { error: `Слишком много попыток. Попробуй через ${minutes} мин.` },
        { status: 429 },
      )
    }

    const requestId = await getPendingVerification(phone)
    if (!requestId) {
      return NextResponse.json(
        { error: 'Код не найден или истёк. Запроси новый.' },
        { status: 400 },
      )
    }

    const status = await checkVerificationStatus(requestId, code)

    if (status === 'code_valid') {
      await deletePendingVerification(phone)
      const { id: userId, isNew } = await upsertUser(phone)
      if (isNew) await migrateAnonymousData(userId)

      const token = await createToken({ userId, phone })
      const response = NextResponse.json({ ok: true })
      response.headers.set('Set-Cookie', makeSessionCookie(token))
      return response
    }

    return NextResponse.json(
      { error: STATUS_MESSAGES[status] ?? 'Неверный код' },
      { status: 400 },
    )
  } catch (err: unknown) {
    if ((err as { isTelegramError?: boolean }).isTelegramError) {
      return NextResponse.json(
        { error: 'Сервис Telegram временно недоступен. Попробуй позже.' },
        { status: 502 },
      )
    }
    console.error('[verify-code]', err)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
