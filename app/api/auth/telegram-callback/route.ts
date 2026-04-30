import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { ensureSchema, upsertTelegramUser } from '@/lib/db'
import { createToken, makeSessionCookie } from '@/lib/auth'

function verifyTelegramHash(params: Record<string, string>): boolean {
  const { hash, ...data } = params
  if (!hash) return false

  // Reject auth data older than 24 hours
  const authDate = parseInt(data.auth_date ?? '0', 10)
  if (Date.now() / 1000 - authDate > 86400) return false

  const checkString = Object.keys(data)
    .sort()
    .map(k => `${k}=${data[k]}`)
    .join('\n')

  const secretKey = crypto
    .createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest()

  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex')

  return expected === hash
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const params = Object.fromEntries(url.searchParams.entries())

    if (!verifyTelegramHash(params)) {
      return NextResponse.redirect(new URL('/login?error=1', req.url))
    }

    await ensureSchema()

    const { id } = await upsertTelegramUser({
      telegramId: parseInt(params.id, 10),
      firstName: params.first_name ?? '',
      lastName: params.last_name,
      username: params.username,
      photoUrl: params.photo_url,
    })

    const token = await createToken({
      userId: id,
      telegramId: parseInt(params.id, 10),
      firstName: params.first_name ?? '',
    })

    const response = NextResponse.redirect(new URL('/', req.url))
    response.headers.set('Set-Cookie', makeSessionCookie(token))
    return response
  } catch (err) {
    console.error('[telegram-callback]', err)
    return NextResponse.redirect(new URL('/login?error=1', req.url))
  }
}
