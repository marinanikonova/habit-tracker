import { NextResponse } from 'next/server'
import { ensureSchema, upsertGoogleUser } from '@/lib/db'
import { createToken, makeSessionCookie } from '@/lib/auth'

// GET /api/auth/google/callback — Google redirects here with ?code=&state=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl      = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ritualr.vercel.app'
  const redirectUri = `${appUrl}/api/auth/google/callback`

  // User denied access
  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`)
  }

  // Validate CSRF state
  const cookieHeader = req.headers.get('cookie') ?? ''
  const storedState  = cookieHeader.match(/(?:^|;\s*)google_oauth_state=([^;]+)/)?.[1]
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=state_mismatch`)
  }

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      console.error('[Google OAuth] Token exchange failed:', await tokenRes.text())
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange`)
    }

    const tokens = await tokenRes.json() as { access_token: string; id_token?: string }

    // 2. Fetch user profile from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!profileRes.ok) {
      console.error('[Google OAuth] Profile fetch failed:', await profileRes.text())
      return NextResponse.redirect(`${appUrl}/login?error=profile_fetch`)
    }

    const profile = await profileRes.json() as {
      id: string
      email: string
      given_name: string
      family_name?: string
      picture?: string
    }

    // 3. Upsert user in DB
    await ensureSchema()
    const { id: userId } = await upsertGoogleUser({
      googleId:  profile.id,
      email:     profile.email,
      firstName: profile.given_name,
      lastName:  profile.family_name,
      photoUrl:  profile.picture,
    })

    // 4. Create our JWT session (same format as Telegram auth)
    const token = await createToken({
      userId,
      telegramId: 0,       // no Telegram for Google users
      firstName:  profile.given_name,
    })

    // 5. Set session cookie + clear state cookie + redirect to app
    const res = NextResponse.redirect(appUrl, { status: 302 })
    res.headers.append('Set-Cookie', makeSessionCookie(token))
    res.headers.append(
      'Set-Cookie',
      `google_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    )
    return res

  } catch (e) {
    console.error('[Google OAuth] Unexpected error:', e)
    return NextResponse.redirect(`${appUrl}/login?error=server_error`)
  }
}
