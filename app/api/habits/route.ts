import { NextResponse } from 'next/server'
import { ensureSchema, getData, setData } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await ensureSchema()
    return NextResponse.json(await getData(user.userId, 'habits'))
  } catch (e) {
    console.error('[GET /api/habits]', e)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    await ensureSchema()
    await setData(user.userId, 'habits', await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/habits]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
