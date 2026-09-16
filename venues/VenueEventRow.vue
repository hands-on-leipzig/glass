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
})

const emit = defineEmits(['select'])

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
  <button type="button" class="venue-row" @click="emit('select', venue)">
    <time class="venue-row__date" :datetime="venue.date || undefined">
      <template v-if="dayParts">
        <span class="venue-row__day">{{ dayParts.day }}</span>
        <span class="venue-row__mon">{{ dayParts.month }}</span>
      </template>
      <i v-else class="bi bi-calendar-x venue-row__date-empty" aria-hidden="true" />
    </time>
    <span class="venue-row__body">
      <span class="venue-row__title-line">
        <span class="venue-row__name">{{ name }}</span>
        <span
          v-if="showProgram && programLabel"
          class="venue-row__chip"
          :style="chipStyle"
        >{{ programLabel }}</span>
      </span>
      <span class="venue-row__meta">
        <span v-if="showCountry && countryCode" class="venue-row__code">{{ countryCode }}</span>
        <span v-if="capacity">{{ capacity }}</span>
        <span v-if="venue.program === 'future5'">{{ t('venues.futureTrack5') }}</span>
      </span>
      <span class="venue-row__extra">
        <slot />
      </span>
    </span>
  </button>
</template>

<style scoped>
.venue-row {
  width: 100%;
  margin: 0;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 0;
  background: transparent;
  display: grid;
  grid-template-columns: 3.4rem minmax(0, 1fr);
  gap: 0.85rem 1rem;
  align-items: start;
  text-align: left;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.venue-row:hover {
  background: var(--color-bg-muted);
}
.venue-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
.venue-row__date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 3.4rem;
  padding: 0.35rem 0.2rem;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--color-text-muted) 9%, transparent);
}
.venue-row__day {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
}
.venue-row__mon {
  margin-top: 0.2rem;
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
.venue-row__body {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  min-width: 0;
  padding-top: 0.15rem;
}
.venue-row__title-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.55rem;
}
.venue-row__name {
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.venue-row__chip {
  display: inline-flex;
  align-items: center;
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  background: var(--chip-color);
}
.venue-row__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.venue-row__code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.6rem;
  padding: 0.05rem 0.35rem;
  border-radius: var(--radius);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text);
  background: color-mix(in srgb, var(--color-text-muted) 12%, transparent);
}
.venue-row__extra:empty {
  display: none;
}
.venue-row__extra {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
</style>
