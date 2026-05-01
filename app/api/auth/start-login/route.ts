import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { ensureSchema, createLoginToken } from '@/lib/db'

export async function POST() {
  await ensureSchema()
  const token = crypto.randomBytes(16).toString('hex')
  await createLoginToken(token)
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
  return NextResponse.json({
    token,
    botLink: `https://t.me/${botUsername}?start=${token}`,
  })
}
