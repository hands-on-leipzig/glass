/**
 * Brand spelling: *FIRST* (all caps, italic) LEGO (all caps) League.
 * Matches any casing of "first lego league" so copy with a wrong casing still renders right.
 */
const FLL_PATTERN = /\bfirst(\s+)lego(\s+)league\b/gi

/**
 * Split text into plain and italic segments; every "FIRST LEGO League" yields
 * `{ text: 'FIRST', italic: true }` followed by `' LEGO League'`.
 *
 * @param {string} text
 * @returns {Array<{ text: string, italic: boolean }>}
 */
export function splitFllBrand(text) {
  const source = String(text ?? '')
  const parts = []
  let last = 0
  for (const match of source.matchAll(FLL_PATTERN)) {
    if (match.index > last) parts.push({ text: source.slice(last, match.index), italic: false })
    parts.push({ text: 'FIRST', italic: true })
    parts.push({ text: `${match[1]}LEGO${match[2]}League`, italic: false })
    last = match.index + match[0].length
  }
  if (last < source.length) parts.push({ text: source.slice(last), italic: false })
  return parts
}

/** Plain text with the brand casing fixed (for alt, title, aria-label). */
export function normalizeFllBrand(text) {
  return String(text ?? '').replace(FLL_PATTERN, (_, a, b) => `FIRST${a}LEGO${b}League`)
}
