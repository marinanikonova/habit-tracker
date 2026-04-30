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

  // Migrate existing phone-only schema — add telegram columns if missing
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id   BIGINT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name    TEXT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name     TEXT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username      TEXT`.catch(() => {})
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url     TEXT`.catch(() => {})
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_telegram_id_idx
    ON users(telegram_id) WHERE telegram_id IS NOT NULL
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
    CREATE TABLE IF NOT EXISTS rate_limits (
      key          TEXT PRIMARY KEY,
      count        INTEGER NOT NULL DEFAULT 1,
      window_start TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
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
