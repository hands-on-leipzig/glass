<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Dokument wird geladen…' },
  fileName: { type: String, default: '' },
})
</script>

<template>
  <Teleport to="body">
    <Transition name="docs-opening-fade">
      <div
        v-if="open"
        class="docs-opening"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="docs-opening__inner liquid-surface liquid-surface--accent">
          <i class="bi bi-arrow-repeat docs-opening__spin" aria-hidden="true" />
          <p class="docs-opening__title">{{ title }}</p>
          <p v-if="fileName" class="docs-opening__name">{{ fileName }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.docs-opening {
  position: fixed;
  inset: 0;
  z-index: 10100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: color-mix(in srgb, var(--color-bg) 45%, transparent);
  backdrop-filter: blur(2px);
}
.docs-opening__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  max-width: 16rem;
  padding: 1.1rem 1.25rem;
  text-align: center;
}
.docs-opening__spin {
  font-size: 1.65rem;
  color: var(--color-accent);
  animation: docs-opening-spin 0.8s linear infinite;
}
.docs-opening__title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 600;
}
.docs-opening__name {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.docs-opening-fade-enter-active,
.docs-opening-fade-leave-active {
  transition: opacity 0.15s ease;
}
.docs-opening-fade-enter-from,
.docs-opening-fade-leave-to {
  opacity: 0;
}
@keyframes docs-opening-spin {
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .docs-opening__spin {
    animation-duration: 1.6s;
  }
}
</style>
