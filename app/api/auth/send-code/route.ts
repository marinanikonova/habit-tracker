import { NextResponse } from 'next/server'
import { ensureSchema, storePendingVerification, checkRateLimit } from '@/lib/db'
import { sendVerificationMessage } from '@/lib/telegram'

const PHONE_RE = /^\+[1-9]\d{6,14}$/

export async function POST(req: Request) {
  try {
    await ensureSchema()

    const body = await req.json()
    const phone: string = (body.phone ?? '').replace(/[\s\-\(\)]/g, '')

    if (!PHONE_RE.test(phone)) {
      return NextResponse.json(
        { error: 'Неверный формат номера. Используй формат +79991234567' },
        { status: 400 },
      )
    }

    const { allowed, retryAfter } = await checkRateLimit(
      `send_code:${phone}`,
      3,
      60 * 60 * 1000, // 3 attempts per hour
    )

    if (!allowed) {
      const minutes = Math.ceil((retryAfter ?? 60) / 60)
      return NextResponse.json(
        { error: `Слишком много попыток. Попробуй через ${minutes} мин.` },
        { status: 429 },
      )
    }

    const { requestId } = await sendVerificationMessage(phone)
    await storePendingVerification(phone, requestId)

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    if ((err as { isTelegramError?: boolean }).isTelegramError) {
      return NextResponse.json(
        { error: 'Не удалось отправить код. Проверь номер или попробуй позже.' },
        { status: 502 },
      )
    }
    console.error('[send-code]', err)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
