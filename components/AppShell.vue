<script setup>
/**
 * Shared JOIN / FLOW app chrome: liquid sidebar + main column.
 * App-specific nav, brand assets, and footer actions go into slots.
 *
 * Desktop: sidebar can collapse to an icon rail (`collapsed`).
 * Mobile:
 *   - Default: floating hamburger (FLOW-compatible)
 *   - With `#mobile-tabs` slot: app-style top bar + bottom tab bar; drawer via toggle
 *     (bottom sheet, swipe-down to dismiss)
 */
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, useSlots, watch } from 'vue'

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
const sidebarEl = ref(null)

/** Bottom-sheet drag state (mobile-tabs only). */
const sheetDragY = ref(0)
const sheetDragging = ref(false)
let sheetTouchStartY = 0
let sheetTouchStartX = 0
let sheetDragActive = false
let sheetIgnoreScroll = false

onMounted(() => {
  if (props.collapsed !== undefined) return
  if (!props.collapsedStorageKey || typeof localStorage === 'undefined') return
  try {
    internalCollapsed.value = localStorage.getItem(props.collapsedStorageKey) === '1'
  } catch {
    /* ignore */
  }
})

const tabsEl = ref(null)
const tabBubble = ref({ on: false, x: 0, y: 0, width: 0, height: 0, swoosh: false })
let tabObserver = null
let tabResize = null
let tabSwooshTimer = 0
let tabBubblePlaced = false

function placeTabBubble() {
  const nav = tabsEl.value
  if (!nav) return
  const marked = nav.querySelectorAll('.glass-app__mobile-tab--active')
  const active = marked.length ? marked[marked.length - 1] : null
  if (!active) {
    tabBubblePlaced = false
    tabBubble.value = { ...tabBubble.value, on: false, swoosh: false }
    return
  }
  const navBox = nav.getBoundingClientRect()
  const box = active.getBoundingClientRect()
  const x = box.left - navBox.left
  const y = box.top - navBox.top
  const moved = tabBubblePlaced && Math.abs(x - tabBubble.value.x) > 1
  if (tabBubblePlaced && !moved && Math.abs(box.width - tabBubble.value.width) < 1) return
  tabBubble.value = {
    on: true,
    x,
    y,
    width: box.width,
    height: box.height,
    swoosh: moved,
  }
  tabBubblePlaced = true
  if (!moved) return
  window.clearTimeout(tabSwooshTimer)
  tabSwooshTimer = window.setTimeout(() => {
    tabBubble.value = { ...tabBubble.value, swoosh: false }
  }, 280)
}

function watchTabBubble() {
  const nav = tabsEl.value
  if (!nav || tabObserver) return
  tabObserver = new MutationObserver(() => {
    nextTick(() => placeTabBubble())
  })
  tabObserver.observe(nav, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class'],
  })
  if (typeof ResizeObserver !== 'undefined') {
    tabResize = new ResizeObserver(() => placeTabBubble())
    tabResize.observe(nav)
  }
  nextTick(() => placeTabBubble())
}

watch(hasMobileTabs, (on) => {
  if (on) nextTick(() => watchTabBubble())
}, { immediate: true })

onBeforeUnmount(() => {
  tabObserver?.disconnect()
  tabResize?.disconnect()
  window.clearTimeout(tabSwooshTimer)
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

watch(
  () => props.open,
  (open) => {
    if (!open) {
      sheetDragY.value = 0
      sheetDragging.value = false
      sheetDragActive = false
    }
  },
)

provide('glassSidebarCollapsed', isCollapsed)

/** Only one expanded-sidebar submenu open at a time (accordion). */
const openSubmenuId = ref(null)
provide('glassSidebarSubmenuAccordion', {
  isOpen: (id) => openSubmenuId.value === id,
  setOpen: (id, open) => {
    if (open) openSubmenuId.value = id
    else if (openSubmenuId.value === id) openSubmenuId.value = null
  },
  closeAll: () => {
    openSubmenuId.value = null
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

function isMobileSheetMode() {
  return (
    hasMobileTabs.value
    && typeof window !== 'undefined'
    && window.matchMedia('(max-width: 768px)').matches
  )
}

function onSheetTouchStart(event, { fromHandle = false } = {}) {
  if (!props.open || !isMobileSheetMode()) return
  const touch = event.changedTouches?.[0] || event.touches?.[0]
  if (!touch) return
  sheetTouchStartY = touch.clientY
  sheetTouchStartX = touch.clientX
  sheetDragActive = false
  sheetDragging.value = false
  sheetIgnoreScroll = !fromHandle
  if (fromHandle) {
    sheetDragActive = true
    sheetDragging.value = true
  }
}

function onSheetTouchMove(event) {
  if (!props.open || !isMobileSheetMode()) return
  const touch = event.changedTouches?.[0] || event.touches?.[0]
  if (!touch) return
  const dy = touch.clientY - sheetTouchStartY
  const dx = touch.clientX - sheetTouchStartX

  if (!sheetDragActive) {
    if (sheetIgnoreScroll) {
      // Only start drag when pulling down from the top of the scrollable sheet.
      const nav = sidebarEl.value?.querySelector?.('.glass-sidebar__nav')
      const scrollTop = nav ? nav.scrollTop : 0
      if (dy < 8 || Math.abs(dx) > Math.abs(dy) || scrollTop > 0) return
    }
    if (dy < 8) return
    sheetDragActive = true
    sheetDragging.value = true
  }

  if (dy <= 0) {
    sheetDragY.value = 0
    return
  }
  sheetDragY.value = dy
  if (event.cancelable) event.preventDefault()
}

function onSheetTouchEnd() {
  if (!sheetDragActive) {
    sheetDragging.value = false
    sheetDragY.value = 0
    return
  }
  const dismiss = sheetDragY.value > 96
  sheetDragging.value = false
  sheetDragActive = false
  if (dismiss) {
    sheetDragY.value = 0
    onClose()
    return
  }
  sheetDragY.value = 0
}

const sheetStyle = computed(() => {
  if (!hasMobileTabs.value || sheetDragY.value <= 0) return undefined
  return {
    transform: `translateY(${sheetDragY.value}px)`,
    transition: sheetDragging.value ? 'none' : undefined,
  }
})
</script>

<template>
  <div
    class="glass-app liquid-surface-scope"
    :class="{
      'glass-app--sidebar-collapsed': isCollapsed,
      'glass-app--mobile-tabs': hasMobileTabs,
      'glass-app--sheet-dragging': sheetDragging,
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
      ref="sidebarEl"
      class="glass-sidebar liquid-surface"
      :class="{
        'glass-sidebar--open': open,
        'glass-sidebar--collapsed': isCollapsed,
        'glass-sidebar--dragging': sheetDragging,
      }"
      :style="sheetStyle"
      @touchstart.passive="onSheetTouchStart($event, { fromHandle: false })"
      @touchmove="onSheetTouchMove"
      @touchend="onSheetTouchEnd"
      @touchcancel="onSheetTouchEnd"
    >
      <button
        v-if="hasMobileTabs"
        type="button"
        class="glass-sidebar__sheet-handle"
        :aria-label="menuAriaLabel"
        @touchstart.passive="onSheetTouchStart($event, { fromHandle: true })"
        @click="onClose"
      >
        <span class="glass-sidebar__sheet-handle-bar" aria-hidden="true" />
      </button>

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

      <div
        v-if="$slots['nav-pinned']"
        class="glass-sidebar__nav-pinned"
      >
        <slot name="nav-pinned" :collapsed="isCollapsed" />
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
      ref="tabsEl"
      class="glass-app__mobile-tabs"
      aria-label="Primary"
    >
      <span
        v-show="tabBubble.on"
        class="glass-app__tab-bubble"
        :class="{ 'is-swoosh': tabBubble.swoosh }"
        :style="{
          width: `${tabBubble.width}px`,
          height: `${tabBubble.height}px`,
          transform: `translate(${tabBubble.x}px, ${tabBubble.y}px)`,
        }"
        aria-hidden="true"
      >
        <span class="glass-app__tab-bubble-lens" />
      </span>
      <slot name="mobile-tabs" :open="open" :toggle="onToggle" />
    </nav>
  </div>
</template>
