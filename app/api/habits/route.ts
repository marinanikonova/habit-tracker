import { NextResponse } from 'next/server'
import { ensureSchema, getData, setData } from '@/lib/db'

export async function GET() {
  try {
    await ensureSchema()
    return NextResponse.json(await getData('habits'))
  } catch (e) {
    console.error('[GET /api/habits]', e)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    await ensureSchema()
    await setData('habits', await req.json())
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/habits]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
