<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatVenueDayParts,
  OFFER_COLORS,
  venueCapacityLabel,
  venueDisplayName,
  venueProgramKey,
} from './venueFilters.js'

const props = defineProps({
  venue: { type: Object, required: true },
  showCountry: { type: Boolean, default: true },
  showProgram: { type: Boolean, default: true },
  /** Detail page URL; renders the row as a link so it can be opened in a new tab. */
  href: { type: String, default: '' },
})

const emit = defineEmits(['select'])

function onClick(event) {
  if (props.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return
  event.preventDefault()
  emit('select', props.venue)
}

const { t, locale } = useI18n()

const name = computed(() => venueDisplayName(props.venue, locale.value))
const dayParts = computed(() => formatVenueDayParts(props.venue.date, locale.value))
const programKey = computed(() => venueProgramKey(props.venue))
const programLabel = computed(() => {
  const key = programKey.value
  if (key === 'other') return ''
  return t(`venues.offerShort.${key}`)
})
const chipStyle = computed(() => ({
  '--chip-color': OFFER_COLORS[programKey.value] || OFFER_COLORS.other,
}))
const capacity = computed(() => venueCapacityLabel(props.venue, t))
const countryCode = computed(() => String(props.venue.country || '').toUpperCase())
</script>

<template>
  <div class="venue-row">
    <component
      :is="href ? 'a' : 'button'"
      :href="href || undefined"
      :type="href ? undefined : 'button'"
      class="venue-row__hit"
      @click="onClick"
    >
      <time class="venue-row__date" :datetime="venue.date || undefined">
        <template v-if="dayParts">
          <span class="venue-row__weekday">{{ dayParts.weekday }}</span>
          <span class="venue-row__day">{{ dayParts.day }}</span>
          <span class="venue-row__mon">{{ dayParts.month }}</span>
        </template>
        <i v-else class="bi bi-calendar-x venue-row__date-empty" aria-hidden="true" />
      </time>
      <span class="venue-row__name">{{ name }}</span>
      <span class="venue-row__meta">
        <span v-if="showCountry && countryCode" class="venue-row__code">{{ countryCode }}</span>
        <span v-if="capacity">{{ capacity }}</span>
        <span v-if="venue.program === 'future5'">{{ t('venues.futureTrack5') }}</span>
      </span>
      <span
        v-if="showProgram && programLabel"
        class="venue-row__chip"
        :style="chipStyle"
      >{{ programLabel }}</span>
    </component>
    <div class="venue-row__extra">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.venue-row {
  width: 100%;
}
.venue-row:hover {
  background: var(--color-bg-muted);
}
/* One real grid per row: date | name (grows to fill the space) | meta | chip. Because name
   is the only flexible (1fr) track, meta and chip always land flush against the row's right
   edge — no extra alignment tricks needed, and the name gets whatever width is left over
   instead of being force-truncated. */
.venue-row__hit {
  width: 100%;
  margin: 0;
  padding: 0.85rem 1rem 0.35rem;
  border: none;
  border-radius: 0;
  background: transparent;
  display: grid;
  grid-template-columns: 3.4rem minmax(0, 1fr) minmax(0, auto) auto;
  align-items: center;
  gap: 0.5rem 1rem;
  text-align: left;
  color: inherit;
  font: inherit;
  text-decoration: none;
  cursor: pointer;
}
.venue-row:not(:has(.venue-row__extra > *)) .venue-row__hit {
  padding-bottom: 0.85rem;
}
.venue-row__hit:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
.venue-row__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 3.9rem;
  padding: 0.3rem 0.2rem;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--color-text-muted) 9%, transparent);
}
.venue-row__weekday {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.venue-row__day {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
}
.venue-row__mon {
  margin-top: 0.1rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
.venue-row__date-empty {
  font-size: 1.1rem;
  color: var(--color-text-muted);
}
.venue-row__name {
  min-width: 0;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.venue-row__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.3rem 0.65rem;
  font-size: var(--text-base);
  color: var(--color-text-muted);
  text-align: right;
}
.venue-row__code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  padding: 0.08rem 0.4rem;
  border-radius: var(--radius);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
}
.venue-row__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  background: var(--chip-color);
  white-space: nowrap;
}
.venue-row__extra:empty,
.venue-row__extra:not(:has(*)) {
  display: none;
}
.venue-row__extra {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding: 0 1rem 0.85rem calc(3.4rem + 2rem);
}
@media (max-width: 720px) {
  /* Not enough width for 4 side-by-side columns: date stays a sidebar spanning the stacked
     name / chip / meta rows next to it. */
  .venue-row__hit {
    grid-template-columns: 3.4rem minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    row-gap: 0.3rem;
  }
  .venue-row__date {
    grid-column: 1;
    grid-row: 1 / span 3;
  }
  .venue-row__name {
    grid-column: 2;
    grid-row: 1;
  }
  .venue-row__chip {
    grid-column: 2;
    grid-row: 2;
    justify-self: start;
  }
  .venue-row__meta {
    grid-column: 2;
    grid-row: 3;
    justify-content: flex-start;
    text-align: left;
  }
}
</style>
