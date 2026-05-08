import { NextResponse } from 'next/server'
import { ensureSchema, verifyLoginToken } from '@/lib/db'

const token = () => process.env.TELEGRAM_BOT_TOKEN!

async function tg(method: string, body: object) {
  await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function POST(req: Request) {
  try {
    const update = await req.json()

    // /start LOGIN_TOKEN
    const text: string = update.message?.text ?? ''
    if (text.startsWith('/start ')) {
      const loginToken = text.slice(7).trim()
      const chat = update.message.chat.id
      const user = update.message.from

      if (!loginToken) {
        await tg('sendMessage', {
          chat_id: chat,
          text: 'Открой приложение «Мои привычки» и нажми кнопку входа.',
        })
        return NextResponse.json({ ok: true })
      }

      await tg('sendMessage', {
        chat_id: chat,
        text: `👋 Привет, ${user.first_name}!\n\nПодтверди вход в приложение *Мои привычки*:`,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Подтвердить вход', callback_data: `confirm:${loginToken}` },
          ]],
        },
      })
      return NextResponse.json({ ok: true })
    }

    // Inline button press
    const cq = update.callback_query
    if (cq?.data?.startsWith('confirm:')) {
      const loginToken: string = cq.data.slice(8)
      const user = cq.from

      await ensureSchema()
      await verifyLoginToken(loginToken, {
        telegramId: user.id,
        firstName: user.first_name ?? '',
        lastName: user.last_name,
        username: user.username,
      })

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ritualr.vercel.app'

      await tg('answerCallbackQuery', {
        callback_query_id: cq.id,
        text: '✅ Вход подтверждён!',
      })
      await tg('editMessageText', {
        chat_id: cq.message.chat.id,
        message_id: cq.message.message_id,
        text: '✅ Вход в *Мои привычки* подтверждён!',
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🌱 Открыть приложение', url: `${appUrl}/login?token=${loginToken}` },
          ]],
        },
      })
    }
  } catch (err) {
    console.error('[bot/webhook]', err)
  }

  return NextResponse.json({ ok: true })
}
