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
  /**
   * Submenu entries: { id?, label, icon?, active?, warning?, disabled? }
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
})

const emit = defineEmits(['select', 'select-child', 'update:submenuOpen'])

const collapsedRef = inject('glassSidebarCollapsed', ref(false))
const isCollapsed = computed(() => !!collapsedRef.value)

const hasChildren = computed(() => Array.isArray(props.children) && props.children.length > 0)
const childActive = computed(() => hasChildren.value && props.children.some((c) => c?.active))
const itemActive = computed(() => props.active || childActive.value)

const internalOpen = ref(false)

watch(
  () => [childActive.value, props.submenuOpen],
  () => {
    if (props.submenuOpen !== undefined) return
    if (childActive.value) internalOpen.value = true
  },
  { immediate: true }
)

const isSubmenuOpen = computed({
  get() {
    if (props.submenuOpen !== undefined) return props.submenuOpen
    return internalOpen.value
  },
  set(value) {
    if (props.submenuOpen !== undefined) {
      emit('update:submenuOpen', value)
    } else {
      internalOpen.value = value
    }
  },
})

function onItemClick() {
  if (props.disabled) return
  if (hasChildren.value && !isCollapsed.value) {
    isSubmenuOpen.value = !isSubmenuOpen.value
    return
  }
  emit('select')
}

function onChildClick(child) {
  if (child?.disabled) return
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
      :class="{ 'glass-sidebar__item--active': itemActive }"
      :disabled="disabled"
      :aria-current="itemActive && !hasChildren ? 'page' : undefined"
      :aria-expanded="hasChildren ? isSubmenuOpen : undefined"
      :title="isCollapsed ? label : undefined"
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
      <i
        v-if="hasChildren"
        class="bi bi-chevron-down glass-sidebar__chevron"
        aria-hidden="true"
      />
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
        <span v-if="child.icon" class="glass-sidebar__subitem-icon">
          <i class="bi" :class="child.icon" aria-hidden="true" />
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
          <i v-if="child.icon" class="bi" :class="child.icon" aria-hidden="true" />
          <span>{{ child.label }}</span>
          <span v-if="child.warning" class="glass-sidebar__warning" />
        </button>
      </template>
    </div>
  </div>
</template>
