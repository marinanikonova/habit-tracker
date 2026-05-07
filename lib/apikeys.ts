import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { ensureSchema, getApiKeyByPrefix, updateApiKeyLastUsed } from './db'

const KEY_PREFIX = 'ht_'
/** Number of characters we store as the lookup prefix (e.g. "ht_Ab3xYz9Qr1") */
const PREFIX_LEN = 12

// ── Generation ────────────────────────────────────────────────────────────────

/** Returns a cryptographically random API key like "ht_<base64url(32 bytes)>" */
export function generateRawKey(): string {
  return KEY_PREFIX + crypto.randomBytes(32).toString('base64url')
}

/** First PREFIX_LEN chars of the key — used for fast DB lookup */
export function getKeyPrefix(rawKey: string): string {
  return rawKey.slice(0, PREFIX_LEN)
}

/** bcrypt hash of the full raw key (cost 10) */
export async function hashApiKey(rawKey: string): Promise<string> {
  return bcrypt.hash(rawKey, 10)
}

// ── Resolution ────────────────────────────────────────────────────────────────

/**
 * Given a raw API key from a request header:
 * 1. Sanity-check it starts with the expected prefix
 * 2. Look up the api_keys row by the short prefix
 * 3. bcrypt.compare the full key against the stored hash
 * 4. Fire-and-forget last_used_at update
 * 5. Return { userId, keyId } or null
 */
export async function resolveUserFromApiKey(
  rawKey: string,
): Promise<{ userId: number; keyId: number } | null> {
  if (!rawKey.startsWith(KEY_PREFIX)) return null

  await ensureSchema()
  const prefix = getKeyPrefix(rawKey)
  const row = await getApiKeyByPrefix(prefix)
  if (!row) return null

  const valid = await bcrypt.compare(rawKey, row.keyHash)
  if (!valid) return null

  // Update last_used_at without blocking the response
  updateApiKeyLastUsed(row.id).catch(() => {})

  return { userId: row.userId, keyId: row.id }
}
