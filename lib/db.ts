import { neon } from '@neondatabase/serverless'

export function getDb() {
  return neon(process.env.DATABASE_URL!)
}

// ── Schema ────────────────────────────────────────────────────────────────────

export async function ensureSchema() {
  const sql = getDb()

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      phone_number  TEXT UNIQUE NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key     TEXT NOT NULL,
      value   JSONB NOT NULL DEFAULT '[]',
      PRIMARY KEY (user_id, key)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key          TEXT PRIMARY KEY,
      count        INTEGER NOT NULL DEFAULT 1,
      window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS pending_verifications (
      phone_number TEXT PRIMARY KEY,
      request_id   TEXT NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function upsertUser(
  phoneNumber: string,
): Promise<{ id: number; isNew: boolean }> {
  const sql = getDb()
  const existing = await sql`
    SELECT id FROM users WHERE phone_number = ${phoneNumber}
  `
  if (existing.length > 0) {
    await sql`
      UPDATE users SET last_login_at = NOW(), updated_at = NOW()
      WHERE phone_number = ${phoneNumber}
    `
    return { id: existing[0].id as number, isNew: false }
  }
  const rows = await sql`
    INSERT INTO users (phone_number) VALUES (${phoneNumber}) RETURNING id
  `
  return { id: rows[0].id as number, isNew: true }
}

// ── App data (per-user) ───────────────────────────────────────────────────────

export async function getData(userId: number, key: string): Promise<unknown[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT value FROM user_data WHERE user_id = ${userId} AND key = ${key}
  `
  return rows.length > 0 ? (rows[0].value as unknown[]) : []
}

export async function setData(
  userId: number,
  key: string,
  value: unknown[],
): Promise<void> {
  const sql = getDb()
  const json = JSON.stringify(value)
  await sql`
    INSERT INTO user_data (user_id, key, value)
    VALUES (${userId}, ${key}, ${json}::jsonb)
    ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value
  `
}

// ── One-time migration: old anonymous app_data → user_data ───────────────────

export async function migrateAnonymousData(userId: number): Promise<void> {
  const sql = getDb()
  try {
    const rows = await sql`SELECT key, value FROM app_data LIMIT 100`
    if (rows.length === 0) return
    for (const row of rows) {
      await sql`
        INSERT INTO user_data (user_id, key, value)
        VALUES (${userId}, ${row.key as string}, ${JSON.stringify(row.value)}::jsonb)
        ON CONFLICT (user_id, key) DO NOTHING
      `
    }
    await sql`DELETE FROM app_data`
  } catch {
    // app_data doesn't exist or has incompatible schema — skip
  }
}

// ── Pending verifications ─────────────────────────────────────────────────────

export async function storePendingVerification(
  phoneNumber: string,
  requestId: string,
): Promise<void> {
  const sql = getDb()
  await sql`
    INSERT INTO pending_verifications (phone_number, request_id)
    VALUES (${phoneNumber}, ${requestId})
    ON CONFLICT (phone_number)
    DO UPDATE SET request_id = EXCLUDED.request_id, created_at = NOW()
  `
}

export async function getPendingVerification(
  phoneNumber: string,
): Promise<string | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT request_id FROM pending_verifications
    WHERE phone_number = ${phoneNumber}
      AND created_at > NOW() - INTERVAL '10 minutes'
  `
  return rows.length > 0 ? (rows[0].request_id as string) : null
}

export async function deletePendingVerification(phoneNumber: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM pending_verifications WHERE phone_number = ${phoneNumber}`
}

// ── Rate limiting ─────────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const sql = getDb()
  const windowSec = Math.floor(windowMs / 1000)

  const rows = await sql`
    SELECT count, window_start FROM rate_limits WHERE key = ${key}
  `

  if (rows.length === 0) {
    await sql`INSERT INTO rate_limits (key, count, window_start) VALUES (${key}, 1, NOW())`
    return { allowed: true }
  }

  const elapsed = (Date.now() - new Date(rows[0].window_start as string).getTime()) / 1000

  if (elapsed >= windowSec) {
    await sql`UPDATE rate_limits SET count = 1, window_start = NOW() WHERE key = ${key}`
    return { allowed: true }
  }

  if ((rows[0].count as number) >= maxAttempts) {
    return { allowed: false, retryAfter: Math.ceil(windowSec - elapsed) }
  }

  await sql`UPDATE rate_limits SET count = count + 1 WHERE key = ${key}`
  return { allowed: true }
}
