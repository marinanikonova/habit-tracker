import { neon } from '@neondatabase/serverless'

export function getDb() {
  return neon(process.env.DATABASE_URL!)
}

export async function ensureSchema() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS app_data (
      key   TEXT PRIMARY KEY,
      value JSONB NOT NULL DEFAULT '[]'
    )
  `
}

export async function getData(key: string): Promise<unknown[]> {
  const sql = getDb()
  const rows = await sql`SELECT value FROM app_data WHERE key = ${key}`
  return rows.length > 0 ? (rows[0].value as unknown[]) : []
}

export async function setData(key: string, value: unknown[]): Promise<void> {
  const sql = getDb()
  const json = JSON.stringify(value)
  await sql`
    INSERT INTO app_data (key, value)
    VALUES (${key}, ${json}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `
}
