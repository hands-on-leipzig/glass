<script setup>
/**
 * Sidebar nav item with optional submenu.
 * Expanded: accordion under the item.
 * Collapsed (icon rail): hover/focus flyout to the right with label + children.
 */
import { computed, inject, ref, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  /** Bootstrap Icons class, e.g. bi-house-door */
  icon: {
    type: String,
    default: '',
  },
  active: {
    type: Boolean,
    default: false,
  },
  warning: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  /**
   * Submenu entries: { id?, label, icon?, iconSrc?, active?, warning?, disabled? }
   * `icon` is a Bootstrap Icons class; `iconSrc` is an image URL (program logos).
   * Emit `select-child` with the entry when clicked.
   */
  children: {
    type: Array,
    default: () => [],
  },
  /** Force submenu open (expanded sidebar). Auto-opens when a child is active. */
  submenuOpen: {
    type: Boolean,
    default: undefined,
  },
  /** Stable key for accordion coordination (defaults to label). */
  submenuKey: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['select', 'select-child', 'update:submenuOpen'])

const collapsedRef = inject('glassSidebarCollapsed', ref(false))
const isCollapsed = computed(() => !!collapsedRef.value)
const accordion = inject('glassSidebarSubmenuAccordion', null)

const hasChildren = computed(() => Array.isArray(props.children) && props.children.length > 0)
const childActive = computed(() => hasChildren.value && props.children.some((c) => c?.active))
const itemActive = computed(() => props.active || childActive.value)
const accordionKey = computed(() => props.submenuKey || props.label)

const internalOpen = ref(false)

function setSubmenuOpen(value) {
  if (props.submenuOpen !== undefined) {
    emit('update:submenuOpen', value)
    return
  }
  if (accordion) {
    accordion.setOpen(accordionKey.value, value)
    return
  }
  internalOpen.value = value
}

// Open when a child becomes active; do not force-reopen on every render.
watch(
  () => childActive.value,
  (active, wasActive) => {
    if (props.submenuOpen !== undefined) return
    if (active && !wasActive) setSubmenuOpen(true)
    if (active && wasActive === undefined) setSubmenuOpen(true)
  },
  { immediate: true }
)

const isSubmenuOpen = computed({
  get() {
    if (props.submenuOpen !== undefined) return props.submenuOpen
    if (accordion) return accordion.isOpen(accordionKey.value)
    return internalOpen.value
  },
  set(value) {
    setSubmenuOpen(value)
  },
})

function onItemClick() {
  if (props.disabled) return
  if (hasChildren.value && !isCollapsed.value) {
    // Open submenu if closed; if already open, go to section default route.
    if (!isSubmenuOpen.value) {
      isSubmenuOpen.value = true
    }
    emit('select')
    return
  }
  emit('select')
}

function onChevronClick(event) {
  if (props.disabled || !hasChildren.value || isCollapsed.value) return
  event.preventDefault()
  event.stopPropagation()
  isSubmenuOpen.value = !isSubmenuOpen.value
}

function onChildClick(child) {
  if (child?.disabled) return
  // Keep submenu open while switching between children
  if (!isCollapsed.value) isSubmenuOpen.value = true
  emit('select-child', child)
}

function onFlyoutParentClick() {
  if (props.disabled) return
  emit('select')
}
</script>

<template>
  <div
    class="glass-sidebar__nav-item"
    :class="{
      'glass-sidebar__nav-item--active': itemActive,
      'glass-sidebar__nav-item--open': isSubmenuOpen && hasChildren && !isCollapsed,
      'glass-sidebar__nav-item--has-children': hasChildren,
    }"
  >
    <button
      type="button"
      class="glass-sidebar__item"
      :class="{
        'glass-sidebar__item--active': itemActive,
        'glass-sidebar__item--disabled': disabled,
      }"
      :disabled="disabled"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-current="itemActive && !hasChildren ? 'page' : undefined"
      :aria-expanded="hasChildren ? isSubmenuOpen : undefined"
      :title="title || (isCollapsed ? label : undefined)"
      @click="onItemClick"
    >
      <span class="glass-sidebar__item-icon">
        <slot name="icon">
          <i v-if="icon" class="bi" :class="icon" aria-hidden="true" />
        </slot>
      </span>
      <span class="glass-sidebar__item-label">{{ label }}</span>
      <span
        v-if="warning || childActive && children.some((c) => c.warning)"
        class="glass-sidebar__warning"
        title="Achtung: Es gibt offene Punkte in diesem Bereich"
      />
      <span
        v-if="hasChildren"
        class="glass-sidebar__chevron-hit"
        :title="isSubmenuOpen ? 'Untermenü schließen' : 'Untermenü öffnen'"
        @click="onChevronClick"
      >
        <i class="bi bi-chevron-down glass-sidebar__chevron" aria-hidden="true"/>
      </span>
    </button>

    <!-- Expanded sidebar: inline accordion -->
    <div
      v-if="hasChildren && !isCollapsed && isSubmenuOpen"
      class="glass-sidebar__submenu"
      role="group"
      :aria-label="label"
    >
      <button
        v-for="(child, idx) in children"
        :key="child.id ?? child.path ?? child.label ?? idx"
        type="button"
        class="glass-sidebar__subitem"
        :class="{ 'glass-sidebar__subitem--active': child.active }"
        :disabled="child.disabled"
        :aria-current="child.active ? 'page' : undefined"
        @click="onChildClick(child)"
      >
        <span v-if="child.iconSrc || child.icon" class="glass-sidebar__subitem-icon">
          <img v-if="child.iconSrc" :src="child.iconSrc" alt="" class="glass-sidebar__subitem-img"/>
          <i v-else class="bi" :class="child.icon" aria-hidden="true"/>
        </span>
        <span class="glass-sidebar__subitem-label">{{ child.label }}</span>
        <span v-if="child.warning" class="glass-sidebar__warning" />
      </button>
    </div>

    <!-- Collapsed rail: flyout on hover / focus-within -->
    <div
      v-if="isCollapsed"
      class="glass-sidebar__flyout"
      role="menu"
      :aria-label="label"
    >
      <button
        type="button"
        class="glass-sidebar__flyout-title"
        role="menuitem"
        :disabled="disabled || hasChildren"
        @click="onFlyoutParentClick"
      >
        {{ label }}
      </button>
      <template v-if="hasChildren">
        <button
          v-for="(child, idx) in children"
          :key="'fly-' + (child.id ?? child.path ?? child.label ?? idx)"
          type="button"
          class="glass-sidebar__flyout-item"
          :class="{ 'glass-sidebar__flyout-item--active': child.active }"
          role="menuitem"
          :disabled="child.disabled"
          @click="onChildClick(child)"
        >
          <span v-if="child.iconSrc || child.icon" class="glass-sidebar__subitem-icon">
            <img v-if="child.iconSrc" :src="child.iconSrc" alt="" class="glass-sidebar__subitem-img"/>
            <i v-else class="bi" :class="child.icon" aria-hidden="true"/>
          </span>
          <span>{{ child.label }}</span>
          <span v-if="child.warning" class="glass-sidebar__warning" />
        </button>
      </template>
    </div>
  </div>
</template>
