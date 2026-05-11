import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const sql = getDb()
    const rows = await sql`
      SELECT COUNT(*) as count FROM user_data WHERE key = 'habits'
    `
    // Also count localStorage users approximately by checking total habit entries
    const habitRows = await sql`
      SELECT SUM(jsonb_array_length(value)) as total
      FROM user_data
      WHERE key = 'habits' AND jsonb_array_length(value) > 0
    `
    const total = Number(habitRows[0]?.total ?? 0)
    return NextResponse.json({ habitCount: total > 0 ? total : null })
  } catch {
    return NextResponse.json({ habitCount: null })
  }
}
