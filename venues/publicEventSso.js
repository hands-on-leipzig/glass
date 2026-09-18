/**
 * Handshake between JOIN/HERO (`PublicEventFrame`) and the FLOW public event iframe.
 * The parent posts a Keycloak access token; FLOW uses the email claim and the
 * backend verifies the JWT so Dateneingabe can skip OTP.
 */

export const PUBLIC_EVENT_SSO_SOURCE = 'hands-on-public-event'

export function publicEventSsoRequestMessage() {
  return { source: PUBLIC_EVENT_SSO_SOURCE, type: 'sso-request' }
}

export function publicEventSsoMessage(token) {
  return { source: PUBLIC_EVENT_SSO_SOURCE, type: 'sso', token: String(token || '') }
}

export function isPublicEventSsoRequest(data) {
  return !!data && data.source === PUBLIC_EVENT_SSO_SOURCE && data.type === 'sso-request'
}

export function tokenFromPublicEventSsoMessage(data) {
  if (!data || data.source !== PUBLIC_EVENT_SSO_SOURCE || data.type !== 'sso') return ''
  return String(data.token || '')
}

/**
 * Read `email` from a JWT payload without verifying the signature.
 * The API still verifies the token; this is only for prefilling the public form.
 *
 * @param {string} token
 * @returns {string}
 */
export function emailFromAccessToken(token) {
  const raw = String(token || '').trim()
  const parts = raw.split('.')
  if (parts.length < 2) return ''
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=')
    const json = atob(padded)
    const payload = JSON.parse(json)
    return String(payload?.email || '').trim().toLowerCase()
  } catch {
    return ''
  }
}

export function resolveSsoToken(ssoToken) {
  if (typeof ssoToken === 'function') {
    try {
      return String(ssoToken() || '')
    } catch {
      return ''
    }
  }
  return String(ssoToken || '')
}
