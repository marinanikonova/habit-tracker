import { NextResponse } from 'next/server'
import { ensureSchema, revokeApiKey } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// DELETE /api/api-keys/:id — soft-revoke a key (scoped to current user)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const keyId = parseInt(id, 10)
  if (isNaN(keyId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    await ensureSchema()
    await revokeApiKey(keyId, user.userId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[DELETE /api/api-keys/:id]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
