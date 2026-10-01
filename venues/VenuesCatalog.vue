<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VenuesMap from './VenuesMap.vue'
import VenueDetailModal from './VenueDetailModal.vue'
import VenueEventRow from './VenueEventRow.vue'
import {
  clusterVenuesForMap,
  formatVenueMonthHeading,
  sortVenues,
  venueMatchesFilters,
  venueMatchesSearch,
  venueMonthKey,
  venueNameGroupKey,
} from './venueFilters.js'

const props = defineProps({
  venues: { type: Array, default: () => [] },
  selectedVenue: { type: Object, default: null },
  /** Keeps filters, sort and scroll position in sessionStorage under this key (empty = off). */
  stateKey: { type: String, default: '' },
  /** `(venue) => string` detail URL per row; rows without one stay buttons. */
  eventHref: { type: Function, default: null },
})

const emit = defineEmits(['select', 'close'])

const { t, locale } = useI18n()

const SORT_COLUMNS = ['date', 'name']

function readSavedState() {
  if (!props.stateKey || typeof sessionStorage === 'undefined') return {}
  try {
    const saved = JSON.parse(sessionStorage.getItem(props.stateKey) || '{}')
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

const saved = readSavedState()

const countries = ref({ de: true, at: true, ch: true, ...saved.countries })
const offers = ref({ future: true, exhibition: true, competition: true, ...saved.offers })
/** Active sort column; the date/name column headers above the list toggle this. */
const sortBy = ref(SORT_COLUMNS.includes(saved.sortBy) ? saved.sortBy : 'name')
/** Reversed by clicking the already-active column header again. */
const sortDir = ref(saved.sortDir === 'desc' ? 'desc' : 'asc')
/** Free-text filter across name / English name / address, on top of the map filters. */
const searchQuery = ref(typeof saved.searchQuery === 'string' ? saved.searchQuery : '')
const rootEl = ref(null)
let scrollTop = Number(saved.scrollTop) || 0

/**
 * The search bar sticks first; the list's column-header row sticks right below it. Measured
 * instead of hardcoded so it stays correct across locales/font sizes/zoom — two `top: 0` sticky
 * elements would otherwise just overlap.
 */
const searchBarEl = ref(null)
const searchBarHeight = ref(0)
let searchBarResizeObserver = null

function writeState() {
  if (!props.stateKey || typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(props.stateKey, JSON.stringify({
      countries: countries.value,
      offers: offers.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value,
      searchQuery: searchQuery.value,
      scrollTop,
    }))
  } catch {
    /* storage full or blocked */
  }
}

watch([countries, offers, sortBy, sortDir, searchQuery], writeState, { deep: true })

/** Clicking the active column reverses it; clicking the other column switches and starts ascending. */
function setSort(column) {
  if (sortBy.value === column) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortBy.value = column
    sortDir.value = 'asc'
  }
}

function clearSearch() {
  searchQuery.value = ''
}

function scrollContainer() {
  let el = rootEl.value?.parentElement
  while (el && el !== document.body) {
    const { overflowY } = getComputedStyle(el)
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return el
    el = el.parentElement
  }
  return document.scrollingElement || document.documentElement
}

onMounted(async () => {
  if (searchBarEl.value && typeof ResizeObserver !== 'undefined') {
    searchBarResizeObserver = new ResizeObserver(([entry]) => {
      searchBarHeight.value = Math.round(entry.contentRect.height)
    })
    searchBarResizeObserver.observe(searchBarEl.value)
  }

  if (!props.stateKey || !scrollTop) return
  await nextTick()
  requestAnimationFrame(() => {
    scrollContainer().scrollTop = scrollTop
  })
})

onBeforeUnmount(() => {
  searchBarResizeObserver?.disconnect()
  searchBarResizeObserver = null

  if (!props.stateKey || !rootEl.value) return
  scrollTop = scrollContainer().scrollTop
  writeState()
})

const COUNTRY_KEYS = ['de', 'at', 'ch']

const activeFilters = computed(() => ({
  countries: new Set(COUNTRY_KEYS.filter((c) => countries.value[c])),
  offers: new Set(Object.keys(offers.value).filter((o) => offers.value[o])),
}))

const filteredVenues = computed(() =>
  props.venues.filter(
    (v) => venueMatchesFilters(v, activeFilters.value) && venueMatchesSearch(v, searchQuery.value),
  ),
)

const mapClusters = computed(() => clusterVenuesForMap(filteredVenues.value))

const sortedVenues = computed(() =>
  sortVenues(filteredVenues.value, locale.value, sortBy.value, sortDir.value),
)

/**
 * Flat, always-open list: date sort gets subtle month dividers, name sort gets A–Z letter
 * dividers — orientation only, not a second click target.
 */
const listItems = computed(() => {
  const items = []
  let lastKey = null
  for (const venue of sortedVenues.value) {
    const key = sortBy.value === 'name' ? venueNameGroupKey(venue, locale.value) : venueMonthKey(venue)
    if (key !== lastKey) {
      items.push({
        type: 'divider',
        id: `divider-${key}`,
        label: sortBy.value === 'name' ? key : formatVenueMonthHeading(key, locale.value, t('venues.dateTbd')),
      })
      lastKey = key
    }
    items.push({ type: 'venue', id: venue.id, venue })
  }
  return items
})

function sortAriaLabel(column, label) {
  if (sortBy.value !== column) return label
  const dirText = sortDir.value === 'desc' ? t('venues.sortDirDesc') : t('venues.sortDirAsc')
  return `${label}: ${dirText}`
}

/** Both headers always show an arrow — active one points with the current direction, the
 *  other stays a neutral "sortable" hint so the row never jumps when switching columns. */
function sortArrowIcon(column) {
  if (sortBy.value !== column) return 'bi-chevron-expand'
  return sortDir.value === 'desc' ? 'bi-caret-down-fill' : 'bi-caret-up-fill'
}

function openVenueDetail(venue) {
  if (!venue?.id) return
  emit('select', venue)
}

function onMapVenueSelect(venue) {
  if (!venue?.id) return
  const full = props.venues.find((v) => v.id === venue.id)
  openVenueDetail(full || venue)
}
</script>

<template>
  <div ref="rootEl" class="venues-catalog">
    <section class="venues-map-section liquid-surface liquid-surface--accent liquid-surface--accent-blue">
      <VenuesMap
        v-model:countries="countries"
        v-model:offers="offers"
        :clusters="mapClusters"
        :result-count="filteredVenues.length"
        @venue-select="onMapVenueSelect"
      />
    </section>

    <div ref="searchBarEl" class="venues-search-bar">
      <div class="venues-search">
        <i class="bi bi-search venues-search-icon" aria-hidden="true"></i>
        <input
          v-model="searchQuery"
          type="search"
          class="venues-search-input"
          :placeholder="t('venues.searchPlaceholder')"
          :aria-label="t('venues.searchPlaceholder')"
        >
        <button
          v-if="searchQuery"
          type="button"
          class="venues-search-clear"
          :aria-label="t('venues.clearSearch')"
          @click="clearSearch"
        >
          <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <p v-if="venues.length && filteredVenues.length === 0" class="venues-hint">
      <i class="bi bi-funnel"></i>
      {{ searchQuery ? t('venues.noSearchResults') : t('venues.noFilterResults') }}
    </p>

    <p v-if="filteredVenues.length" class="venues-toolbar-count">
      {{ t('venues.resultsCount', { count: filteredVenues.length }) }}
    </p>

    <div v-if="filteredVenues.length" class="venues-list liquid-surface liquid-surface--radius-lg">
      <div class="venues-list-head" :style="{ top: `${searchBarHeight}px` }">
        <button
          type="button"
          class="venues-col-btn venues-col-btn--date"
          :class="{ 'is-active': sortBy === 'date' }"
          :aria-label="sortAriaLabel('date', t('venues.colDate'))"
          @click="setSort('date')"
        >
          <span>{{ t('venues.colDate') }}</span>
          <i class="bi venues-col-arrow" :class="sortArrowIcon('date')" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class="venues-col-btn venues-col-btn--name"
          :class="{ 'is-active': sortBy === 'name' }"
          :aria-label="sortAriaLabel('name', t('venues.colName'))"
          @click="setSort('name')"
        >
          <span>{{ t('venues.colName') }}</span>
          <i class="bi venues-col-arrow" :class="sortArrowIcon('name')" aria-hidden="true"></i>
        </button>
      </div>
      <ul class="venues-list-body">
        <template v-for="item in listItems" :key="item.id">
          <li v-if="item.type === 'divider'" class="venues-list-divider" role="presentation">
            {{ item.label }}
          </li>
          <li v-else>
            <VenueEventRow
              :venue="item.venue"
              :href="eventHref ? eventHref(item.venue) || '' : ''"
              @select="openVenueDetail"
            >
              <slot name="event-extra" :venue="item.venue" />
            </VenueEventRow>
          </li>
        </template>
      </ul>
    </div>

    <VenueDetailModal
      :show="!!selectedVenue"
      :venue="selectedVenue"
      @close="emit('close')"
    >
      <template #extra="slotProps">
        <slot name="detail-extra" v-bind="slotProps" />
      </template>
      <template #links="slotProps">
        <slot name="detail-links" v-bind="slotProps" />
      </template>
    </VenueDetailModal>
  </div>
</template>

<style scoped>
.venues-map-section {
  position: relative;
  --venues-map-height: min(46vh, 400px);
  margin-bottom: 1.35rem;
  min-height: var(--venues-map-height);
  height: var(--venues-map-height);
  overflow: hidden;
}
@media (min-width: 900px) {
  .venues-map-section {
    --venues-map-height: 380px;
  }
}
.venues-map-section :deep(.venues-map-wrap) {
  position: absolute;
  inset: 0;
}
.venues-hint {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  margin: 0 0 1.25rem;
  border-radius: var(--radius-lg);
  background: var(--liquid-tile-bg);
  backdrop-filter: blur(calc(var(--liquid-blur) * 0.48)) saturate(calc(var(--liquid-saturate) * 0.88));
  -webkit-backdrop-filter: blur(calc(var(--liquid-blur) * 0.48)) saturate(calc(var(--liquid-saturate) * 0.88));
  border: 1px solid var(--liquid-border);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}
.venues-search-bar {
  position: sticky;
  top: 0;
  z-index: 3;
  padding-bottom: 1rem;
  /* Same opaque "strong" sticky-bar treatment used for the app shell's own sticky header/
     footer — a translucent background here looked odd with rows scrolling underneath. */
  background: color-mix(in srgb, var(--liquid-tile-bg-strong, var(--liquid-tile-bg)) 94%, transparent);
  backdrop-filter: blur(20px) saturate(var(--liquid-saturate, 1.2));
  -webkit-backdrop-filter: blur(20px) saturate(var(--liquid-saturate, 1.2));
}
.venues-search {
  position: relative;
  display: flex;
  align-items: center;
}
.venues-search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  pointer-events: none;
}
.venues-search-input {
  width: 100%;
  padding: 0.65rem 2.4rem 0.65rem 2.35rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--liquid-border);
  background: var(--liquid-tile-bg);
  backdrop-filter: blur(calc(var(--liquid-blur) * 0.48)) saturate(calc(var(--liquid-saturate) * 0.88));
  -webkit-backdrop-filter: blur(calc(var(--liquid-blur) * 0.48)) saturate(calc(var(--liquid-saturate) * 0.88));
  color: var(--color-text);
  font: inherit;
  font-size: var(--text-sm);
}
.venues-search-input::placeholder {
  color: var(--color-text-muted);
}
.venues-search-input::-webkit-search-cancel-button {
  display: none;
}
.venues-search-clear {
  position: absolute;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  cursor: pointer;
}
.venues-search-clear:hover {
  background: var(--color-bg-muted);
  color: var(--color-text);
}
.venues-toolbar-count {
  margin: 0 0 0.6rem;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}
.venues-list {
  /* `clip` (not `hidden`) keeps the rounded corners without turning this box into a
     scroll container — that would break `position: sticky` on the head row below. */
  overflow: clip;
}
.venues-list-head {
  position: sticky;
  z-index: 2;
  display: grid;
  grid-template-columns: 3.4rem minmax(0, 1fr);
  gap: 0.85rem 1rem;
  padding: 0 1rem;
  /* Same opaque "strong" sticky-bar treatment as `.venues-search-bar` above it — needs to be
     solid, not just frosted, or rows scrolling underneath show through oddly. */
  background: color-mix(in srgb, var(--liquid-tile-bg-strong, var(--liquid-tile-bg)) 94%, transparent);
  backdrop-filter: blur(20px) saturate(var(--liquid-saturate, 1.2));
  -webkit-backdrop-filter: blur(20px) saturate(var(--liquid-saturate, 1.2));
  border-bottom: 1px solid var(--color-border);
}
.venues-col-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.65rem 0;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  cursor: pointer;
  text-align: left;
}
.venues-col-btn:hover {
  color: var(--color-text);
}
.venues-col-btn.is-active {
  color: var(--color-accent);
}
.venues-col-arrow {
  font-size: 0.6rem;
}
.venues-col-btn:not(.is-active) .venues-col-arrow {
  opacity: 0.45;
}
.venues-list-body {
  list-style: none;
  margin: 0;
  padding: 0;
}
.venues-list-body > li:not(.venues-list-divider) + li:not(.venues-list-divider) {
  border-top: 1px solid var(--color-border);
}
.venues-list-divider {
  padding: 0.55rem 1rem 0.3rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  background: color-mix(in srgb, var(--color-text-muted) 5%, transparent);
}
</style>
