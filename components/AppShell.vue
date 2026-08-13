<script setup>
/**
 * Shared JOIN / FLOW app chrome: liquid sidebar + main column.
 * App-specific nav, brand assets, and footer actions go into slots.
 *
 * Desktop: sidebar can collapse to an icon rail (`collapsed`).
 * Mobile:
 *   - Default: floating hamburger (FLOW-compatible)
 *   - With `#mobile-tabs` slot: app-style top bar + bottom tab bar; drawer via toggle
 */
import { computed, onMounted, provide, ref, useSlots, watch } from 'vue'

const props = defineProps({
  /** Mobile drawer open */
  open: {
    type: Boolean,
    default: false,
  },
  /** Desktop icon-rail mode (v-model:collapsed) */
  collapsed: {
    type: Boolean,
    default: undefined,
  },
  menuAriaLabel: {
    type: String,
    default: 'Menu',
  },
  collapseAriaLabel: {
    type: String,
    default: 'Sidebar einklappen',
  },
  expandAriaLabel: {
    type: String,
    default: 'Sidebar ausklappen',
  },
  /** Persist collapsed state under this localStorage key (empty = off) */
  collapsedStorageKey: {
    type: String,
    default: 'hands-on-sidebar-collapsed',
  },
})

const emit = defineEmits(['update:open', 'toggle', 'update:collapsed'])

const slots = useSlots()
const hasMobileTabs = computed(() => typeof slots['mobile-tabs'] === 'function')

const internalCollapsed = ref(false)

onMounted(() => {
  if (props.collapsed !== undefined) return
  if (!props.collapsedStorageKey || typeof localStorage === 'undefined') return
  try {
    internalCollapsed.value = localStorage.getItem(props.collapsedStorageKey) === '1'
  } catch {
    /* ignore */
  }
})

const isCollapsed = computed({
  get() {
    return props.collapsed !== undefined ? props.collapsed : internalCollapsed.value
  },
  set(value) {
    if (props.collapsed !== undefined) {
      emit('update:collapsed', value)
    } else {
      internalCollapsed.value = value
    }
  },
})

watch(isCollapsed, (value) => {
  if (props.collapsedStorageKey && typeof localStorage !== 'undefined' && props.collapsed === undefined) {
    try {
      localStorage.setItem(props.collapsedStorageKey, value ? '1' : '0')
    } catch {
      /* ignore */
    }
  }
})

provide('glassSidebarCollapsed', isCollapsed)

/** Only one expanded-sidebar submenu open at a time (accordion). */
const openSubmenuId = ref(null)
provide('glassSidebarSubmenuAccordion', {
  isOpen: (id) => openSubmenuId.value === id,
  setOpen: (id, open) => {
    if (open) openSubmenuId.value = id
    else if (openSubmenuId.value === id) openSubmenuId.value = null
  },
})

function onToggle() {
  emit('toggle')
}

function onClose() {
  emit('update:open', false)
}

function onMenuToggleClick(event) {
  event?.stopPropagation?.()
  event?.preventDefault?.()
  onToggle()
}

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div
    class="glass-app liquid-surface-scope"
    :class="{
      'glass-app--sidebar-collapsed': isCollapsed,
      'glass-app--mobile-tabs': hasMobileTabs,
    }"
  >
    <!-- Legacy floating hamburger (FLOW / apps without mobile-tabs). -->
    <button
      v-if="!hasMobileTabs"
      type="button"
      class="glass-app__menu-toggle"
      :aria-label="menuAriaLabel"
      :aria-expanded="open"
      @click="onMenuToggleClick"
    >
      <i class="bi" :class="open ? 'bi-x-lg' : 'bi-list'" aria-hidden="true" />
    </button>

    <!-- App-style mobile top bar (JOIN when mobile-tabs is provided). -->
    <header v-if="hasMobileTabs" class="glass-app__mobile-top">
      <div class="glass-app__mobile-top-inner">
        <div class="glass-app__mobile-top-brand">
          <slot name="mobile-top">
            <slot name="brand" />
          </slot>
        </div>
        <div v-if="$slots['mobile-top-actions']" class="glass-app__mobile-top-actions">
          <slot name="mobile-top-actions" />
        </div>
      </div>
    </header>

    <div
      v-if="open"
      class="glass-app__backdrop"
      aria-hidden="true"
      @click="onClose"
    />

    <aside
      class="glass-sidebar liquid-surface"
      :class="{
        'glass-sidebar--open': open,
        'glass-sidebar--collapsed': isCollapsed,
      }"
    >
      <div class="glass-sidebar__brand-row">
        <div class="glass-sidebar__brand-slot">
          <slot name="brand" />
        </div>
        <button
          type="button"
          class="glass-sidebar__collapse-toggle no-touch-min"
          :aria-label="isCollapsed ? expandAriaLabel : collapseAriaLabel"
          :aria-pressed="isCollapsed"
          :title="isCollapsed ? expandAriaLabel : collapseAriaLabel"
          @click="toggleCollapsed"
        >
          <i
            class="bi"
            :class="isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"
            aria-hidden="true"
          />
        </button>
      </div>

      <nav class="glass-sidebar__nav">
        <slot name="nav" :collapsed="isCollapsed" />
      </nav>

      <div class="glass-sidebar__lower">
        <slot name="lower" :collapsed="isCollapsed" />
      </div>
    </aside>

    <main class="glass-app__main">
      <slot />
    </main>

    <!-- App-style bottom tabs (mobile only via CSS). -->
    <nav
      v-if="hasMobileTabs"
      class="glass-app__mobile-tabs"
      aria-label="Primary"
    >
      <slot name="mobile-tabs" :open="open" :toggle="onToggle" />
    </nav>
  </div>
</template>
