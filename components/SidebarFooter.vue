<script setup>
import { computed, onMounted, onUnmounted, provide, ref } from 'vue'

defineProps({
  /** Replace icon bar with guest slot content (login etc.) */
  guest: {
    type: Boolean,
    default: false,
  },
  identityAriaLabel: {
    type: String,
    default: 'Account',
  },
  settingsAriaLabel: {
    type: String,
    default: 'Settings',
  },
  hideIdentity: {
    type: Boolean,
    default: false,
  },
  hideSettings: {
    type: Boolean,
    default: false,
  },
})

const openMenu = ref(null) // 'identity' | 'settings' | null
const rootEl = ref(null)

const identityOpen = computed(() => openMenu.value === 'identity')
const settingsOpen = computed(() => openMenu.value === 'settings')
const anyOpen = computed(() => openMenu.value != null)

function closeMenus() {
  openMenu.value = null
}

function toggleMenu(name) {
  openMenu.value = openMenu.value === name ? null : name
}

function onDocumentPointerDown(event) {
  if (!openMenu.value || !rootEl.value) return
  if (rootEl.value.contains(event.target)) return
  closeMenus()
}

function onKeydown(event) {
  if (event.key === 'Escape') closeMenus()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onKeydown)
})

provide('glassSidebarFooter', { closeMenus })

defineExpose({ closeMenus, toggleMenu })
</script>

<template>
  <div
    ref="rootEl"
    class="glass-sidebar-footer"
    :class="{ 'glass-sidebar-footer--menu-open': anyOpen }"
  >
    <div v-if="$slots.prepend" class="glass-sidebar-footer__prepend">
      <slot name="prepend" />
    </div>

    <div v-if="guest" class="glass-sidebar__footer">
      <slot name="guest" />
    </div>

    <div v-else class="glass-sidebar-footer__bar">
      <div
        v-if="!hideIdentity && $slots.identity"
        class="glass-sidebar-footer__slot glass-sidebar-footer__slot--identity"
      >
        <button
          type="button"
          class="glass-sidebar-footer__icon-btn"
          :class="{ 'glass-sidebar-footer__icon-btn--active': identityOpen }"
          :aria-label="identityAriaLabel"
          aria-haspopup="true"
          :aria-expanded="identityOpen"
          @click="toggleMenu('identity')"
        >
          <i class="bi bi-person-fill" aria-hidden="true" />
        </button>
      </div>

      <div
        v-if="!hideSettings && $slots.settings"
        class="glass-sidebar-footer__slot glass-sidebar-footer__slot--settings"
      >
        <button
          type="button"
          class="glass-sidebar-footer__icon-btn"
          :class="{ 'glass-sidebar-footer__icon-btn--active': settingsOpen }"
          :aria-label="settingsAriaLabel"
          aria-haspopup="true"
          :aria-expanded="settingsOpen"
          @click="toggleMenu('settings')"
        >
          <i class="bi bi-gear-fill" aria-hidden="true" />
        </button>
      </div>

      <div
        v-if="$slots.extra"
        class="glass-sidebar-footer__slot glass-sidebar-footer__slot--extra"
      >
        <slot name="extra" :close="closeMenus" />
      </div>

      <!-- Full-width popovers anchored to the bar, not the tiny icon buttons -->
      <Transition name="glass-sidebar-footer-menu">
        <div
          v-if="identityOpen"
          class="glass-sidebar-footer__menu"
          role="menu"
          :aria-label="identityAriaLabel"
        >
          <slot name="identity" :close="closeMenus" />
        </div>
      </Transition>

      <Transition name="glass-sidebar-footer-menu">
        <div
          v-if="settingsOpen"
          class="glass-sidebar-footer__menu"
          role="menu"
          :aria-label="settingsAriaLabel"
        >
          <slot name="settings" :close="closeMenus" />
        </div>
      </Transition>
    </div>

    <div v-if="$slots.partners" class="glass-sidebar__partners">
      <slot name="partners" />
    </div>
  </div>
</template>
