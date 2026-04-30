import { SignJWT, jwtVerify } from 'jose'

export interface SessionPayload {
  userId: number
  phone: string
}

const COOKIE_NAME = 'session'
const MAX_AGE = 30 * 24 * 60 * 60 // 30 days

function secret() {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET is not configured')
  return new TextEncoder().encode(s)
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret())
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function getUserFromRequest(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)
  if (!match) return null
  try {
    return await verifyToken(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export function makeSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production'
  return [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Max-Age=${MAX_AGE}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
  ].join('; ')
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
}

export { COOKIE_NAME }
