/**
 * Path of a public event URL (handson.tools/aachen or …/2025/aachen).
 *
 * @param {string} url
 * @returns {string}
 */
export function publicEventPathFromUrl(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  try {
    const parsed = new URL(raw)
    return parsed.pathname.replace(/^\/+/, '').replace(/\/+$/, '')
  } catch {
    return raw.replace(/^https?:\/\/[^/]+\//i, '').replace(/^\/+/, '').replace(/\/+$/, '')
  }
}

/**
 * @param {string} url
 * @returns {string}
 */
export function publicEventEmbedSrc(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  const sep = raw.includes('?') ? '&' : '?'
  return `${raw}${sep}embed=1`
}

/**
 * @param {string} url Absolute URL, path, or slug
 * @param {string} [base]
 * @returns {string}
 */
export function publicEventAbsoluteUrl(url, base = 'https://handson.tools') {
  const raw = String(url || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return ''
  const path = raw.replace(/^\/+/, '')
  return path ? `${String(base).replace(/\/+$/, '')}/${path}` : ''
}
