<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VenuesMap from './VenuesMap.vue'
import VenueDetailModal from './VenueDetailModal.vue'
import VenueEventRow from './VenueEventRow.vue'
import {
  clusterVenuesForMap,
  formatVenueMonthHeading,
  PROGRAM_ORDER,
  sortVenues,
  venueMatchesFilters,
  venueMonthKey,
  venueProgramKey,
} from './venueFilters.js'

const props = defineProps({
  venues: { type: Array, default: () => [] },
  selectedVenue: { type: Object, default: null },
})

const emit = defineEmits(['select', 'close'])

const { t, locale } = useI18n()

const countries = ref({ de: true, at: true, ch: true })
const offers = ref({ future: true, exhibition: true, competition: true })
/** Timeline, by country, or by program. */
const viewMode = ref('date')
const openGroups = ref({})

const COUNTRY_KEYS = ['de', 'at', 'ch']

const activeFilters = computed(() => ({
  countries: new Set(COUNTRY_KEYS.filter((c) => countries.value[c])),
  offers: new Set(Object.keys(offers.value).filter((o) => offers.value[o])),
}))

const filteredVenues = computed(() =>
  props.venues.filter((v) => venueMatchesFilters(v, activeFilters.value)),
)

const mapClusters = computed(() => clusterVenuesForMap(filteredVenues.value))

const monthGroups = computed(() => {
  const sorted = sortVenues(filteredVenues.value, locale.value, 'date')
  /** @type {Map<string, object[]>} */
  const map = new Map()
  for (const venue of sorted) {
    const key = venueMonthKey(venue)
    const list = map.get(key) || []
    list.push(venue)
    map.set(key, list)
  }
  return [...map.entries()].map(([key, list]) => ({
    key,
    label: formatVenueMonthHeading(key, locale.value, t('venues.dateTbd')),
    venues: list,
  }))
})

const countryGroups = computed(() =>
  COUNTRY_KEYS
    .filter((c) => countries.value[c])
    .map((c) => ({
      key: c,
      label: t(`venues.country.${c}`),
      venues: sortVenues(
        filteredVenues.value.filter((v) => v.country === c),
        locale.value,
        'name',
      ),
    }))
    .filter((group) => group.venues.length > 0),
)

const PROGRAM_LABEL_KEYS = {
  exhibition: 'venues.sectionExplore',
  competition: 'venues.sectionChallenge',
  future: 'venues.sectionFuture',
}

const programGroups = computed(() =>
  PROGRAM_ORDER
    .filter((key) => offers.value[key])
    .map((key) => ({
      key,
      label: t(PROGRAM_LABEL_KEYS[key]),
      venues: sortVenues(
        filteredVenues.value.filter((v) => venueProgramKey(v) === key),
        locale.value,
        'date',
      ),
    }))
    .filter((group) => group.venues.length > 0),
)

const accordionGroups = computed(() => {
  if (viewMode.value === 'place') return countryGroups.value
  if (viewMode.value === 'program') return programGroups.value
  return monthGroups.value
})

function groupId(group) {
  return `${viewMode.value}-${group.key}`
}

watch(
  accordionGroups,
  (groups) => {
    const next = { ...openGroups.value }
    for (const group of groups) {
      const id = groupId(group)
      if (next[id] === undefined) next[id] = true
    }
    openGroups.value = next
  },
  { immediate: true },
)

function isGroupOpen(group) {
  return !!openGroups.value[groupId(group)]
}

function toggleGroup(group) {
  const id = groupId(group)
  openGroups.value = { ...openGroups.value, [id]: !openGroups.value[id] }
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
  <div class="venues-catalog">
    <section class="venues-map-section liquid-surface liquid-surface--accent liquid-surface--accent-blue">
      <VenuesMap
        v-model:countries="countries"
        v-model:offers="offers"
        :clusters="mapClusters"
        :result-count="filteredVenues.length"
        @venue-select="onMapVenueSelect"
      />
    </section>

    <p v-if="venues.length && filteredVenues.length === 0" class="venues-hint">
      <i class="bi bi-funnel"></i>
      {{ t('venues.noFilterResults') }}
    </p>

    <div
      v-if="filteredVenues.length"
      class="venues-toolbar"
    >
      <p class="venues-toolbar-count">
        {{ t('venues.resultsCount', { count: filteredVenues.length }) }}
      </p>
      <div class="venues-view" role="group" :aria-label="t('venues.sortBy')">
        <span class="venues-view-label">{{ t('venues.sortBy') }}</span>
        <button
          type="button"
          class="venues-view-btn"
          :class="{ 'is-active': viewMode === 'date' }"
          :aria-pressed="viewMode === 'date'"
          @click="viewMode = 'date'"
        >
          {{ t('venues.sortDate') }}
        </button>
        <button
          type="button"
          class="venues-view-btn"
          :class="{ 'is-active': viewMode === 'place' }"
          :aria-pressed="viewMode === 'place'"
          @click="viewMode = 'place'"
        >
          {{ t('venues.sortName') }}
        </button>
        <button
          type="button"
          class="venues-view-btn"
          :class="{ 'is-active': viewMode === 'program' }"
          :aria-pressed="viewMode === 'program'"
          @click="viewMode = 'program'"
        >
          {{ t('venues.sortProgram') }}
        </button>
      </div>
    </div>

    <section
      v-for="group in accordionGroups"
      :key="groupId(group)"
      class="venues-group"
    >
      <div class="venues-stack liquid-surface liquid-surface--radius-lg">
        <button
          type="button"
          class="venues-group-head"
          :aria-expanded="isGroupOpen(group)"
          @click="toggleGroup(group)"
        >
          <i
            class="bi"
            :class="isGroupOpen(group) ? 'bi-dash-lg' : 'bi-plus-lg'"
            aria-hidden="true"
          />
          {{ group.label }}
          <span class="venues-group-count">{{ group.venues.length }}</span>
        </button>
        <ul v-show="isGroupOpen(group)" class="venues-stack-body">
          <li v-for="ev in group.venues" :key="ev.id">
            <VenueEventRow
              :venue="ev"
              :show-country="viewMode !== 'place'"
              :show-program="viewMode !== 'program'"
              @select="openVenueDetail"
            >
              <slot name="event-extra" :venue="ev" />
            </VenueEventRow>
          </li>
        </ul>
      </div>
    </section>

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
.venues-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.25rem;
  margin: 0 0 1.35rem;
}
.venues-toolbar-count {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}
.venues-view {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}
.venues-view-label {
  margin-right: 0.2rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.venues-group {
  margin-bottom: 1.5rem;
}
.venues-stack {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.venues-stack-body > li + li {
  border-top: 1px solid var(--color-border);
}
.venues-stack-body {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid var(--color-border);
}
.venues-group-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border: none;
  background: transparent;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  color: var(--color-text);
}
.venues-group-count {
  margin-left: auto;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}
</style>
