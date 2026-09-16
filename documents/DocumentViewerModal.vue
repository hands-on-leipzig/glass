<script setup>
import { ref } from 'vue'
import { useModalDismiss } from '../venues/useModalDismiss.js'

const props = defineProps({
  show: { type: Boolean, default: false },
  url: { type: String, default: '' },
  title: { type: String, default: '' },
  mode: { type: String, default: 'pdf' },
  closeLabel: { type: String, default: 'Schließen' },
  emptyText: { type: String, default: 'Kein Dokument verfügbar.' },
})

const emit = defineEmits(['close'])

const dialogEl = ref(null)

function onBackdropClick(e) {
  if (e.target === e.currentTarget) emit('close')
}

useModalDismiss(() => props.show, {
  dialogRef: dialogEl,
  onClose: () => emit('close'),
})
</script>

<template>
  <Teleport to="body">
    <Transition name="docs-viewer">
      <div
        v-if="show"
        class="docs-viewer-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-label="title || closeLabel"
        @click="onBackdropClick"
      >
        <div ref="dialogEl" class="docs-viewer-box" tabindex="-1">
          <div class="docs-viewer-header">
            <span v-if="title" class="docs-viewer-title">{{ title }}</span>
            <button
              type="button"
              class="docs-viewer-close"
              :aria-label="closeLabel"
              @click="emit('close')"
            >
              <i class="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>
          <div class="docs-viewer-body">
            <iframe
              v-if="url && mode === 'pdf'"
              :src="url"
              class="docs-viewer-frame"
              :title="title || 'PDF'"
            />
            <img
              v-else-if="url && mode === 'image'"
              :src="url"
              :alt="title"
              class="docs-viewer-image"
            >
            <p v-else class="docs-viewer-empty">{{ emptyText }}</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.docs-viewer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10100;
  display: flex;
  flex-direction: column;
  padding:
    env(safe-area-inset-top, 0)
    env(safe-area-inset-right, 0)
    env(safe-area-inset-bottom, 0)
    env(safe-area-inset-left, 0);
  background: var(--liquid-modal-scrim-bg);
}
@media (min-width: 640px) {
  .docs-viewer-backdrop {
    padding: 2rem;
  }
}
.docs-viewer-box {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--color-bg);
  overflow: hidden;
}
@media (min-width: 640px) {
  .docs-viewer-box {
    border-radius: var(--radius-lg);
    box-shadow: var(--liquid-shadow);
  }
}
.docs-viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--liquid-border);
  flex-shrink: 0;
}
.docs-viewer-title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.docs-viewer-close {
  margin-left: auto;
  width: var(--touch);
  height: var(--touch);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}
.docs-viewer-close:hover {
  color: var(--color-text);
  background: var(--color-bg-muted);
}
.docs-viewer-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-muted);
}
.docs-viewer-frame {
  flex: 1;
  width: 100%;
  min-height: 0;
  border: 0;
  background: #fff;
}
.docs-viewer-image {
  flex: 1;
  width: 100%;
  min-height: 0;
  object-fit: contain;
}
.docs-viewer-empty {
  margin: auto;
  padding: 2rem;
  color: var(--color-text-muted);
}
.docs-viewer-enter-active,
.docs-viewer-leave-active {
  transition: opacity 0.2s ease;
}
.docs-viewer-enter-from,
.docs-viewer-leave-to {
  opacity: 0;
}
</style>
