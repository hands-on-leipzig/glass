<script setup>
/**
 * Tertiary (level-3) in-page tabs.
 *
 * Navigation levels:
 * 1. Primary – sidebar main
 * 2. Secondary – sidebar children
 * 3. Tertiary – these page tabs
 */
defineProps({
  /** @type {{ id: string|number, label: string, icon?: string, disabled?: boolean, active?: boolean }[]} */
  tabs: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: null,
  },
  ariaLabel: {
    type: String,
    default: 'Tabs',
  },
  compact: {
    type: Boolean,
    default: false,
  },
  /** Sit flush on a `.glass-page-panel` so the accent line is the panel top edge. */
  attached: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'select'])

function isActive(tab, modelValue) {
  if (modelValue != null && modelValue !== '') {
    return tab.id === modelValue
  }
  return !!tab.active
}

function onSelect(tab) {
  if (tab.disabled) return
  emit('update:modelValue', tab.id)
  emit('select', tab)
}
</script>

<template>
  <nav
      class="glass-page-tabs"
      :class="{
        'glass-page-tabs--compact': compact,
        'glass-page-tabs--attached': attached,
      }"
      :aria-label="ariaLabel"
      role="tablist"
  >
    <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="glass-page-tab"
        :class="{ 'glass-page-tab--active': isActive(tab, modelValue) }"
        :aria-selected="isActive(tab, modelValue)"
        :disabled="tab.disabled"
        @click="onSelect(tab)"
    >
      <i v-if="tab.icon" class="bi" :class="tab.icon" aria-hidden="true"/>
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>
