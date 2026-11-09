<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import AppSwitchMark from './AppSwitchMark.vue'

const props = defineProps({
  apps: { type: Array, default: () => [] },
})

const emit = defineEmits(['select'])

const open = ref(false)
const rootEl = ref(null)
const menuStyle = ref({})

const visible = computed(() => props.apps.length > 1)

function placeMenu() {
  const button = rootEl.value?.querySelector('.app-switch__btn')
  if (!(button instanceof HTMLElement)) return
  const width = 220
  const rect = button.getBoundingClientRect()
  const left = Math.min(rect.right - width, window.innerWidth - width - 12)
  menuStyle.value = {
    top: `${rect.bottom + 8}px`,
    left: `${Math.max(8, left)}px`,
    width: `${width}px`,
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) placeMenu()
}

function close() {
  open.value = false
}

function onPointer(event) {
  if (!open.value) return
  const target = event.target
  if (target instanceof Node && rootEl.value?.contains(target)) return
  close()
}

function onKey(event) {
  if (event.key === 'Escape') close()
}

watch(open, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', placeMenu)
  } else {
    document.removeEventListener('pointerdown', onPointer)
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', placeMenu)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointer)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', placeMenu)
})

function choose(app, event) {
  if (app.current || app.internal) event.preventDefault()
  close()
  if (!app.current && app.internal) emit('select', app)
}
</script>

<template>
  <div v-if="visible" ref="rootEl" class="app-switch">
    <button
      type="button"
      class="app-switch__btn"
      aria-label="App wechseln"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <AppSwitchMark />
    </button>
    <div
      v-if="open"
      class="app-switch__menu"
      :style="menuStyle"
      role="menu"
      aria-label="Apps"
    >
      <a
        v-for="app in apps"
        :key="app.id"
        class="app-switch__choice"
        :class="{ 'is-current': app.current }"
        role="menuitem"
        :href="app.current ? undefined : app.href"
        @click="choose(app, $event)"
      >
        <img class="app-switch__logo" :src="app.logo" :alt="app.label">
        <i v-if="app.current" class="bi bi-check-lg" aria-hidden="true" />
      </a>
    </div>
  </div>
</template>

<style>
.app-switch {
  position: relative;
  flex: none;
}

.app-switch__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.85rem;
  height: 2.15rem;
  padding: 0;
  border: 1px solid var(--liquid-border-soft);
  border-radius: 0.7rem;
  background: color-mix(in srgb, #fff 72%, transparent);
  color: var(--color-text);
  cursor: pointer;
}

.app-switch__btn:hover,
.app-switch__btn[aria-expanded='true'] {
  border-color: color-mix(in srgb, var(--color-border) 60%, var(--color-accent));
}

.app-switch__menu {
  position: fixed;
  z-index: 13000;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.45rem;
  border: 1px solid var(--liquid-border);
  border-radius: var(--radius-lg, 1rem);
  background: var(--liquid-popover-fill, #fff);
  box-shadow: var(--shadow-lg, 0 12px 32px rgba(15, 23, 42, 0.16));
}

.app-switch__choice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.35rem 0.55rem;
  border-radius: 0.7rem;
  color: inherit;
  text-decoration: none;
}

.app-switch__choice:hover,
.app-switch__choice:focus-visible {
  background: var(--color-bg-hover);
}

.app-switch__choice.is-current {
  background: color-mix(in srgb, var(--color-accent) 16%, transparent);
}

.app-switch__logo {
  display: block;
  height: 1.45rem;
  width: auto;
  max-width: 8.5rem;
  object-fit: contain;
  object-position: left center;
}

.app-switch__choice .bi {
  color: var(--color-accent);
  font-size: 1.1rem;
}
</style>
