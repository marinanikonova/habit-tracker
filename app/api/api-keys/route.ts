import { NextResponse } from 'next/server'
import { ensureSchema, createApiKey, getApiKeysByUser } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { generateRawKey, getKeyPrefix, hashApiKey } from '@/lib/apikeys'

// GET /api/api-keys — list current user's keys (hash never returned)
export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await ensureSchema()
    const keys = await getApiKeysByUser(user.userId)
    return NextResponse.json(keys)
  } catch (e) {
    console.error('[GET /api/api-keys]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// POST /api/api-keys — create a new key
// Body: { name: string }
// Returns: key row + fullKey (ONLY TIME it's returned — store it now!)
export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const name = (body?.name ?? '').trim()
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    await ensureSchema()

    const rawKey = generateRawKey()
    const keyPrefix = getKeyPrefix(rawKey)
    const keyHash = await hashApiKey(rawKey)
    const { id } = await createApiKey(user.userId, name, keyHash, keyPrefix)

    return NextResponse.json({
      id,
      name,
      key_prefix: keyPrefix,
      last_used_at: null,
      revoked_at: null,
      created_at: new Date().toISOString(),
      // Full key — returned ONCE, never stored in DB
      full_key: rawKey,
    })
  } catch (e) {
    console.error('[POST /api/api-keys]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
