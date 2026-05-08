import { NextResponse } from 'next/server'
import crypto from 'crypto'

// GET /api/auth/google — redirect to Google OAuth consent screen
export async function GET() {
  const clientId     = process.env.GOOGLE_CLIENT_ID!
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ritualr.vercel.app'
  const redirectUri  = `${appUrl}/api/auth/google/callback`

  // CSRF protection: random state stored in a short-lived cookie
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    state,
    access_type:   'online',
    prompt:        'select_account',
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

  return NextResponse.redirect(url, {
    headers: {
      // Store state in a secure, short-lived cookie (10 min)
      'Set-Cookie': `google_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    },
  })
}
