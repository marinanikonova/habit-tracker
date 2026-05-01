import { NextResponse } from 'next/server'
import { ensureSchema, getLoginToken, upsertTelegramUser, deleteLoginToken } from '@/lib/db'
import { createToken, makeSessionCookie } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    await ensureSchema()
    const record = await getLoginToken(token)

    if (!record) {
      return NextResponse.json({ status: 'expired' }, { status: 400 })
    }

    if (record.status === 'pending') {
      return NextResponse.json({ status: 'pending' }, { status: 202 })
    }

    // Verified — create user and issue session
    const { id } = await upsertTelegramUser({
      telegramId: record.telegram_id,
      firstName: record.first_name,
      lastName: record.last_name ?? undefined,
      username: record.username ?? undefined,
    })

    const jwt = await createToken({
      userId: id,
      telegramId: record.telegram_id,
      firstName: record.first_name,
    })

    await deleteLoginToken(token)

    const res = NextResponse.json({ status: 'ok' })
    res.headers.set('Set-Cookie', makeSessionCookie(jwt))
    return res
  } catch (err) {
    console.error('[check-login]', err)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
