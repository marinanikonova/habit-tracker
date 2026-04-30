const API_BASE = 'https://gatewayapi.telegram.org'

function getToken(): string {
  const token = process.env.TELEGRAM_GATEWAY_TOKEN
  if (!token) throw new Error('TELEGRAM_GATEWAY_TOKEN is not configured')
  return token
}

export async function sendVerificationMessage(phoneNumber: string): Promise<{ requestId: string }> {
  const res = await fetch(`${API_BASE}/sendVerificationMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone_number: phoneNumber, code_length: 5, ttl: 300 }),
  })

  const data = await res.json()

  if (!data.ok) {
    const msg: string = data.error?.message ?? 'Telegram Gateway error'
    const code: number | undefined = data.error?.code
    throw Object.assign(new Error(msg), { code, isTelegramError: true })
  }

  return { requestId: data.result.request_id as string }
}

export type VerificationStatus =
  | 'code_valid'
  | 'code_invalid'
  | 'code_expired'
  | 'exceeded'
  | 'no_active_request'

export async function checkVerificationStatus(
  requestId: string,
  code: string,
): Promise<VerificationStatus> {
  const res = await fetch(`${API_BASE}/checkVerificationStatus`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ request_id: requestId, code }),
  })

  const data = await res.json()

  if (!data.ok) {
    const msg: string = data.error?.message ?? 'Telegram Gateway error'
    throw Object.assign(new Error(msg), { isTelegramError: true })
  }

  return data.result.verification_status.status as VerificationStatus
}
