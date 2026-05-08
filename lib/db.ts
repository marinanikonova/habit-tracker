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
      telegram_id   BIGINT UNIQUE,
      phone_number  TEXT UNIQUE,
      first_name    TEXT,
      last_name     TEXT,
      username      TEXT,
      photo_url     TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id   BIGINT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name    TEXT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name     TEXT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username      TEXT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url     TEXT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id     TEXT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS email         TEXT`.catch(() => {})
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_telegram_id_idx
    ON users(telegram_id) WHERE telegram_id IS NOT NULL
  `.catch(() => {})
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx
    ON users(google_id) WHERE google_id IS NOT NULL
  `.catch(() => {})

  await sql`
    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key     TEXT NOT NULL,
      value   JSONB NOT NULL DEFAULT '[]',
      PRIMARY KEY (user_id, key)
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS login_tokens (
      token       TEXT PRIMARY KEY,
      telegram_id BIGINT,
      first_name  TEXT,
      last_name   TEXT,
      username    TEXT,
      status      TEXT NOT NULL DEFAULT 'pending',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id           SERIAL PRIMARY KEY,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name         TEXT NOT NULL,
      key_hash     TEXT NOT NULL,
      key_prefix   TEXT NOT NULL,
      last_used_at TIMESTAMPTZ,
      revoked_at   TIMESTAMPTZ,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS api_keys_prefix_active_idx
    ON api_keys(key_prefix) WHERE revoked_at IS NULL
  `.catch(() => {})
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function upsertTelegramUser(data: {
  telegramId: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
}): Promise<{ id: number }> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO users (telegram_id, first_name, last_name, username, photo_url)
    VALUES (
      ${data.telegramId},
      ${data.firstName},
      ${data.lastName ?? null},
      ${data.username ?? null},
      ${data.photoUrl ?? null}
    )
    ON CONFLICT (telegram_id) DO UPDATE SET
      first_name    = EXCLUDED.first_name,
      last_name     = EXCLUDED.last_name,
      username      = EXCLUDED.username,
      photo_url     = EXCLUDED.photo_url,
      last_login_at = NOW()
    RETURNING id
  `
  return { id: rows[0].id as number }
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

// ── Login tokens (bot-based auth) ─────────────────────────────────────────────

export async function createLoginToken(token: string): Promise<void> {
  const sql = getDb()
  await sql`INSERT INTO login_tokens (token) VALUES (${token})`
  // Clean up expired tokens in the background
  sql`DELETE FROM login_tokens WHERE created_at < NOW() - INTERVAL '30 minutes'`.catch(() => {})
}

export async function verifyLoginToken(
  token: string,
  user: { telegramId: number; firstName: string; lastName?: string; username?: string },
): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE login_tokens SET
      telegram_id = ${user.telegramId},
      first_name  = ${user.firstName},
      last_name   = ${user.lastName ?? null},
      username    = ${user.username ?? null},
      status      = 'verified'
    WHERE token = ${token} AND status = 'pending'
  `
}

export async function getLoginToken(token: string): Promise<{
  status: string
  telegram_id: number
  first_name: string
  last_name: string | null
  username: string | null
} | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT status, telegram_id, first_name, last_name, username
    FROM login_tokens
    WHERE token = ${token} AND created_at > NOW() - INTERVAL '30 minutes'
  `
  return rows.length > 0 ? (rows[0] as ReturnType<typeof getLoginToken> extends Promise<infer T> ? NonNullable<T> : never) : null
}

export async function deleteLoginToken(token: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM login_tokens WHERE token = ${token}`
}

// ── API Keys ──────────────────────────────────────────────────────────────────

export interface ApiKeyRow {
  id: number
  name: string
  key_prefix: string
  last_used_at: string | null
  revoked_at: string | null
  created_at: string
}

export async function createApiKey(
  userId: number,
  name: string,
  keyHash: string,
  keyPrefix: string,
): Promise<{ id: number }> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
    VALUES (${userId}, ${name}, ${keyHash}, ${keyPrefix})
    RETURNING id
  `
  return { id: rows[0].id as number }
}

export async function getApiKeysByUser(userId: number): Promise<ApiKeyRow[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, name, key_prefix, last_used_at, revoked_at, created_at
    FROM api_keys
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return rows as unknown as ApiKeyRow[]
}

export async function getApiKeyByPrefix(keyPrefix: string): Promise<{
  id: number
  userId: number
  keyHash: string
} | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, user_id, key_hash
    FROM api_keys
    WHERE key_prefix = ${keyPrefix} AND revoked_at IS NULL
  `
  if (rows.length === 0) return null
  return {
    id: rows[0].id as number,
    userId: rows[0].user_id as number,
    keyHash: rows[0].key_hash as string,
  }
}

export async function updateApiKeyLastUsed(id: number): Promise<void> {
  const sql = getDb()
  await sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${id}`
}

export async function revokeApiKey(id: number, userId: number): Promise<void> {
  const sql = getDb()
  await sql`
    UPDATE api_keys SET revoked_at = NOW()
    WHERE id = ${id} AND user_id = ${userId} AND revoked_at IS NULL
  `
}

// ── Google users ──────────────────────────────────────────────────────────────

export async function upsertGoogleUser(data: {
  googleId: string
  email: string
  firstName: string
  lastName?: string
  photoUrl?: string
}): Promise<{ id: number }> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO users (google_id, email, first_name, last_name, photo_url)
    VALUES (
      ${data.googleId},
      ${data.email},
      ${data.firstName},
      ${data.lastName ?? null},
      ${data.photoUrl ?? null}
    )
    ON CONFLICT (google_id) WHERE google_id IS NOT NULL DO UPDATE SET
      email         = EXCLUDED.email,
      first_name    = EXCLUDED.first_name,
      last_name     = EXCLUDED.last_name,
      photo_url     = EXCLUDED.photo_url,
      last_login_at = NOW()
    RETURNING id
  `
  return { id: rows[0].id as number }
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
    // app_data doesn't exist — skip
  }
}
