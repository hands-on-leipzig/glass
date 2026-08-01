<script setup>
/**
 * Shared JOIN / FLOW app chrome: liquid sidebar + main column.
 * App-specific nav, brand assets, and footer actions go into slots.
 */
defineProps({
  /** Mobile drawer open */
  open: {
    type: Boolean,
    default: false,
  },
  menuAriaLabel: {
    type: String,
    default: 'Menu',
  },
})

const emit = defineEmits(['update:open', 'toggle'])

function onToggle() {
  emit('toggle')
}

function onClose() {
  emit('update:open', false)
}
</script>

<template>
  <div class="glass-app liquid-surface-scope">
    <button
      type="button"
      class="glass-app__menu-toggle"
      :aria-label="menuAriaLabel"
      :aria-expanded="open"
      @click="onToggle"
    >
      <i class="bi bi-list" aria-hidden="true" />
    </button>

    <div
      v-if="open"
      class="glass-app__backdrop"
      aria-hidden="true"
      @click="onClose"
    />

    <aside
      class="glass-sidebar liquid-surface"
      :class="{ 'glass-sidebar--open': open }"
    >
      <slot name="brand" />

      <nav class="glass-sidebar__nav">
        <slot name="nav" />
      </nav>

      <div class="glass-sidebar__lower">
        <slot name="lower" />
      </div>
    </aside>

    <main class="glass-app__main">
      <slot />
    </main>
  </div>
</template>
