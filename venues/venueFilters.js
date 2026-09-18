/** @typedef {'de'|'at'|'ch'} VenueCountry */
/** @typedef {'exhibition'|'competition'|'future'|'other'} VenueOfferCategory */

/**
 * @param {object} venue
 * @param {{ countries: Set<string>, offers: Set<string> }} filters
 */
export function venueMatchesFilters(venue, filters) {
  if (!filters.countries.size || !filters.offers.size) return false
  if (!filters.countries.has(venue.country)) return false
  if (!filters.offers.has(venue.offerCategory)) return false
  return true
}

/** Future Edition regio venues (not shown on the public map — list/accordion only). */
export function isFutureEditionVenue(venue) {
  return (
    venue.offerCategory === 'future' ||
    venue.program === 'future5' ||
    venue.program === 'future8'
  )
}

/**
 * Cluster venues with coordinates for map markers.
 * @param {object[]} venues
 * @returns {Array<{ lat: number, lon: number, count: number, venues: object[], offerCategory: string }>}
 */
export function clusterVenuesForMap(venues) {
  /** @type {Map<string, { lat: number, lon: number, count: number, venues: object[], offerCategory: string }>} */
  const map = new Map()
  for (const v of venues) {
    if (v.lat == null || v.lon == null || !Number.isFinite(v.lat) || !Number.isFinite(v.lon)) continue
    const key = `${v.lat.toFixed(3)}:${v.lon.toFixed(3)}:${v.offerCategory}`
    const existing = map.get(key)
    if (existing) {
      existing.count += 1
      existing.venues.push(v)
    } else {
      map.set(key, {
        lat: v.lat,
        lon: v.lon,
        count: 1,
        venues: [v],
        offerCategory: v.offerCategory || 'other',
      })
    }
  }
  return [...map.values()]
}

/**
 * @param {object} venue
 * @param {string} locale
 */
export function venueDisplayName(venue, locale) {
  if (locale === 'en' && venue.nameEn?.trim()) return venue.nameEn.trim()
  return venue.name || ''
}

/**
 * @param {object} venue
 * @param {(key: string) => string} t
 */
export function venueCapacityLabel(venue, t) {
  const reg = venue.registered ?? 0
  const cap = venue.capacity
  if (cap != null && cap > 0) {
    return t('venues.capacityTeams', { registered: reg, capacity: cap })
  }
  if (reg > 0) {
    return t('venues.registeredTeams', { count: reg })
  }
  return ''
}

/**
 * @param {string} isoDate YYYY-MM-DD
 * @param {string} locale
 */
export function formatVenueDate(isoDate, locale) {
  if (!isoDate) return ''
  const d = new Date(isoDate + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Event date for venues list/detail; placeholder when no date is set yet.
 *
 * @param {string|null|undefined} isoDate
 * @param {string} locale
 * @param {string} [dateTbdText] i18n label, e.g. t('venues.dateTbd')
 */
export function formatVenueDateDisplay(isoDate, locale, dateTbdText = '') {
  const raw = isoDate != null ? String(isoDate).trim() : ''
  if (!raw) {
    if (dateTbdText) return dateTbdText
    return locale === 'de' ? 'wird noch bekannt gegeben' : 'To be announced'
  }
  return formatVenueDate(raw, locale)
}

/**
 * Return comments in given language
 *
 * @param {object} venue
 * @param {string} locale
 */
export function venueComments(venue, locale) {
  switch (locale) {
    case 'en':
      return venue.commentsEn
    case 'de':
      return venue.comments
  }
}

/** Keep in sync with styles/tokens.css --program-* (FLOW catalog hex). */
export const OFFER_COLORS = {
  future: '#51BFB4',
  exhibition: '#00A651',
  competition: '#ED1C24',
  other: '#64748b',
}

/** Display order: Future, then Explore, then Challenge. */
export const PROGRAM_ORDER = ['future', 'exhibition', 'competition']

/**
 * Map / chip key: exhibition (Explore), competition (Challenge), future.
 *
 * @param {object} venue
 * @returns {'exhibition'|'competition'|'future'|'other'}
 */
export function venueProgramKey(venue) {
  if (isFutureEditionVenue(venue)) return 'future'
  if (venue?.offerCategory === 'exhibition' || venue?.program === 'explore') return 'exhibition'
  if (venue?.offerCategory === 'competition' || venue?.program === 'challenge') return 'competition'
  return venue?.offerCategory || 'other'
}

/**
 * @param {object} venue
 * @returns {string} YYYY-MM or 'tbd'
 */
export function venueMonthKey(venue) {
  const raw = venue?.date != null ? String(venue.date).trim() : ''
  if (raw.length < 7) return 'tbd'
  return raw.slice(0, 7)
}

/**
 * @param {string} monthKey YYYY-MM or tbd
 * @param {string} locale
 * @param {string} [tbdText]
 */
export function formatVenueMonthHeading(monthKey, locale, tbdText = '') {
  if (!monthKey || monthKey === 'tbd') {
    return tbdText || (locale === 'de' ? 'Termin offen' : 'Date to be announced')
  }
  const [year, month] = monthKey.split('-').map(Number)
  if (!year || !month) return tbdText
  return new Date(year, month - 1, 1).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Compact calendar block for list rows.
 *
 * @param {string|null|undefined} isoDate
 * @param {string} locale
 * @returns {{ day: string, month: string } | null}
 */
export function formatVenueDayParts(isoDate, locale) {
  const raw = isoDate != null ? String(isoDate).trim() : ''
  if (!raw) return null
  const d = new Date(`${raw}T12:00:00`)
  if (Number.isNaN(d.getTime())) return null
  const loc = locale === 'de' ? 'de-DE' : 'en-GB'
  return {
    day: d.toLocaleDateString(loc, { day: '2-digit' }),
    month: d.toLocaleDateString(loc, { month: 'short' }).replace('.', ''),
  }
}

export function venueProgramRank(venue) {
  const key = venueProgramKey(venue)
  const index = PROGRAM_ORDER.indexOf(key)
  return index === -1 ? PROGRAM_ORDER.length : index
}

/**
 * @param {object} a
 * @param {object} b
 * @param {string} locale
 * @param {'name'|'date'} [sortBy]
 */
export function compareVenues(a, b, locale, sortBy = 'name') {
  if (sortBy === 'date') {
    const da = a?.date ? String(a.date) : ''
    const db = b?.date ? String(b.date) : ''
    if (da !== db) {
      if (!da) return 1
      if (!db) return -1
      return da < db ? -1 : 1
    }
  }
  const program = venueProgramRank(a) - venueProgramRank(b)
  if (program !== 0) return program
  return venueDisplayName(a, locale).localeCompare(venueDisplayName(b, locale), locale)
}

/**
 * @param {object[]} list
 * @param {string} locale
 * @param {'name'|'date'} [sortBy]
 */
export function sortVenues(list, locale, sortBy = 'name') {
  return list.slice().sort((a, b) => compareVenues(a, b, locale, sortBy))
}
