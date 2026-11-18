<script setup>
import { ref, watch, onMounted, onUnmounted, shallowRef, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { OFFER_COLORS } from './venueFilters.js'

const props = defineProps({
  lat: { type: Number, default: null },
  lon: { type: Number, default: null },
  /** Full address text (Straße + Hausnummer + Ort) for precise pin placement */
  address: { type: String, default: '' },
  /** Postal code – used together with address for geocoding */
  zip: { type: String, default: '' },
  /** ISO country code (de, at, ch) – used for countrycodes= filter */
  country: { type: String, default: '' },
  pinColor: { type: String, default: OFFER_COLORS.other },
})

const { t } = useI18n()

const mapRoot = ref(null)
const mapInstance = shallowRef(null)
const markerLayer = shallowRef(null)
let resizeObserver = null

/** Resolved coordinates: start with stored lat/lon, overwritten by geocoding if available */
const resolvedLat = ref(null)
const resolvedLon = ref(null)
let geocodeAbort = null

const hasCoords = () => {
  const lat = Number(resolvedLat.value)
  const lon = Number(resolvedLon.value)
  return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180
}

/**
 * Extract the street line from a multi-line address block like:
 *   "Technische Hochschule Mannheim\nPaul-Wittsack-Straße 10\n68163 Mannheim"
 *
 * Returns the first line that looks like "Straßenname Hausnummer"
 * (contains letters followed by digits, but does NOT start with a ZIP code).
 * An institution name without a house number is left out, so the search uses the postal code.
 */
function extractStreetLine(text) {
  if (!text) return ''
  const lines = text.split(/[\n\r;,]+/).map((l) => l.trim()).filter(Boolean)
  // A street line has at least one letter AND at least one digit, and does not
  // start with a 4–5-digit postal code (those are ZIP+city lines).
  const streetLine = lines.find(
    (l) => /[a-zA-ZäöüÄÖÜßàáâãèéêëìíîïòóôõùúûýÿ]/.test(l) &&
           /\d/.test(l) &&
           !/^\d{4,5}/.test(l),
  )
  return streetLine || ''
}

/**
 * OSM result types that indicate a precise street/building match.
 * so the zoom only increases when we really found the right address.
 */
const PRECISE_TYPES = new Set([
  'house', 'building', 'amenity', 'office', 'shop', 'leisure',
  'tourism', 'school', 'university', 'college', 'sports_centre',
  'stadium', 'theatre', 'cinema', 'place_of_worship', 'hospital',
  'hall', 'community_centre', 'museum', 'library', 'marketplace',
])

function syncMarker(precise = false) {
  const map = mapInstance.value
  const layer = markerLayer.value
  if (!map || !layer) return
  layer.clearLayers()
  if (!hasCoords()) return
  const lat = Number(resolvedLat.value)
  const lon = Number(resolvedLon.value)
  const marker = L.circleMarker([lat, lon], {
    radius: 14,
    color: '#fff',
    weight: 2,
    fillColor: props.pinColor || OFFER_COLORS.other,
    fillOpacity: 0.92,
  })
  marker.addTo(layer)
  // Only zoom to street level (16) when Nominatim returned a genuine address hit.
  // For ZIP-centre coords (fallback), keep zoom 14 so the inaccuracy isn't obvious.
  map.setView([lat, lon], precise ? 16 : 14, { animate: false })
  nextTick(() => map.invalidateSize({ animate: false }))
}

/**
 * Client-side Nominatim geocoding using the venue address (Straße + Hausnummer, PLZ, Land).
 * Improves pin precision beyond the postal-code centre stored in the DB.
 * Falls back to stored lat/lon silently if geocoding fails or is imprecise.
 */
/** DE and FR use 5 digits. AT and CH use 4. A leading CH- or A- is not part of the code. */
function postalCodeForCountry(rawZip, country) {
  const stripped = String(rawZip || '').trim().replace(/^(?:CH|A|D)[-\s]*/i, '')
  const match = stripped.match(/\d{4,5}/)
  const code = match ? match[0] : ''
  if (!code) return ''
  if ((country === 'de' || country === 'fr') && code.length !== 5) return ''
  if ((country === 'at' || country === 'ch') && code.length !== 4) return ''
  return code
}

function hitMatchesCountry(hit, country) {
  if (!country) return true
  const code = String(hit?.address?.country_code || '').toLowerCase()
  return code === '' || code === country
}

async function searchNominatim(params) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { signal: geocodeAbort.signal },
  )
  if (!res.ok) return null
  const list = await res.json()
  return Array.isArray(list) ? list[0] : null
}

async function geocodeAddress() {
  if (geocodeAbort) geocodeAbort.abort()
  geocodeAbort = new AbortController()

  const rawAddr = (props.address || '').trim()
  const cc = (props.country || '').toLowerCase().trim()
  const zipText = postalCodeForCountry(props.zip || '', cc)
  const streetLine = extractStreetLine(rawAddr)

  const queries = []
  if (zipText) {
    if (streetLine) {
      const precise = new URLSearchParams({ format: 'json', limit: '1', addressdetails: '1' })
      precise.set('street', streetLine)
      precise.set('postalcode', zipText)
      if (cc) precise.set('countrycodes', cc)
      queries.push(precise)
    }
    const postal = new URLSearchParams({ format: 'json', limit: '1', addressdetails: '1' })
    postal.set('postalcode', zipText)
    if (cc) postal.set('countrycodes', cc)
    queries.push(postal)
  }

  try {
    for (const params of queries) {
      const hit = await searchNominatim(params)
      if (!hit?.lat || !hitMatchesCountry(hit, cc)) continue
      const type = hit.type || ''
      const cls = hit.class || ''
      const isPrecise = PRECISE_TYPES.has(type) || cls === 'highway' ||
        (cls === 'place' && !['postcode', 'city', 'town', 'village', 'county', 'state', 'country'].includes(type))
      resolvedLat.value = parseFloat(hit.lat)
      resolvedLon.value = parseFloat(hit.lon)
      syncMarker(isPrecise)
      return
    }
  } catch (_) { /* aborted or network error – fall through to stored coords */ }

  // Fallback: use stored lat/lon (postal-code centre, zoom 14)
  resolvedLat.value = props.lat
  resolvedLon.value = props.lon
  syncMarker(false)
}

onMounted(() => {
  if (!mapRoot.value) return

  // Seed with stored coords immediately so the map shows something while geocoding
  resolvedLat.value = props.lat
  resolvedLon.value = props.lon

  const map = L.map(mapRoot.value, {
    scrollWheelZoom: true,
    attributionControl: true,
  })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)
  markerLayer.value = L.layerGroup().addTo(map)
  mapInstance.value = map

  if (!hasCoords()) {
    map.setView([51.1, 10.4], 5)
  } else {
    syncMarker(false)
  }

  // Kick off precise geocoding
  geocodeAddress()

  resizeObserver = new ResizeObserver(() => {
    map.invalidateSize({ animate: false })
    if (hasCoords()) syncMarker()
  })
  if (mapRoot.value?.parentElement) resizeObserver.observe(mapRoot.value.parentElement)
})

watch(
  () => [props.lat, props.lon, props.address, props.zip, props.country],
  () => {
    resolvedLat.value = props.lat
    resolvedLon.value = props.lon
    syncMarker(false)
    geocodeAddress()
  },
)

watch(
  () => props.pinColor,
  () => syncMarker(false),
)

onUnmounted(() => {
  geocodeAbort?.abort()
  geocodeAbort = null
  resizeObserver?.disconnect()
  resizeObserver = null
  mapInstance.value?.remove()
  mapInstance.value = null
  markerLayer.value = null
})
</script>

<template>
  <div class="venue-detail-map-wrap liquid-surface-inner">
    <div
      v-if="hasCoords() || address || zip"
      ref="mapRoot"
      class="venue-detail-map"
      role="img"
      :aria-label="t('venues.detailMapLabel')"
    />
    <p v-else class="venue-detail-map-empty">
      {{ t('venues.detailNoMapCoords') }}
    </p>
  </div>
</template>

<style scoped>
.venue-detail-map-wrap {
  position: relative;
  width: 100%;
  min-height: 220px;
  height: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.venue-detail-map {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.venue-detail-map-empty {
  margin: 0;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>
