<script setup>
import { computed } from 'vue'
import { documentFileIconBiSuffix, documentFileVisualKind } from './sharePointHost.js'

const props = defineProps({
  configured: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  openingFile: { type: Boolean, default: false },
  error: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  breadcrumbs: { type: Array, default: () => [] },
  folderWebUrl: { type: String, default: '' },
  locale: { type: String, default: 'de' },
  notConfiguredText: { type: String, default: 'Noch keine Dokumentenablage konfiguriert.' },
  loadingText: { type: String, default: 'Lade Dokumente…' },
  emptyFolderText: { type: String, default: 'Dieser Ordner ist leer.' },
  rootLabel: { type: String, default: 'Start' },
  goUpLabel: { type: String, default: 'Eine Ebene höher' },
  openFolderTabLabel: { type: String, default: 'SharePoint im neuen Tab öffnen' },
})

const emit = defineEmits(['open-folder', 'open-file', 'navigate', 'go-up', 'go-root'])

const canGoUp = computed(() => props.breadcrumbs.length > 1)

const folders = computed(() =>
  (props.items || []).filter((item) => item?.type === 'folder'),
)
const files = computed(() =>
  (props.items || []).filter((item) => item?.type !== 'folder'),
)

function onNavigate(crumb, index) {
  if (index === props.breadcrumbs.length - 1) return
  emit('navigate', crumb, index)
}
</script>

<template>
  <div class="docs-folder">
    <p v-if="!configured && !loading" class="docs-folder__muted">
      {{ notConfiguredText }}
    </p>

    <template v-else>
      <div v-if="breadcrumbs.length" class="docs-folder__crumbs">
        <button
          type="button"
          class="docs-folder__crumb"
          :disabled="loading"
          @click="emit('go-root')"
        >
          {{ rootLabel }}
        </button>
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
          <span class="docs-folder__sep" aria-hidden="true">/</span>
          <button
            v-if="index < breadcrumbs.length - 1"
            type="button"
            class="docs-folder__crumb"
            :disabled="loading"
            @click="onNavigate(crumb, index)"
          >
            {{ crumb.name }}
          </button>
          <span v-else class="docs-folder__current">{{ crumb.name }}</span>
        </template>
        <button
          v-if="canGoUp"
          type="button"
          class="docs-folder__up"
          :disabled="loading"
          @click="emit('go-up')"
        >
          ↑ {{ goUpLabel }}
        </button>
      </div>

      <p v-if="error" class="docs-folder__error">{{ error }}</p>

      <p v-if="loading" class="docs-folder__muted docs-folder__loading">
        <i class="bi bi-arrow-repeat docs-folder__spin" aria-hidden="true" />
        <span>{{ loadingText }}</span>
      </p>

      <p
        v-else-if="!items.length && !error"
        class="docs-folder__muted"
      >
        {{ emptyFolderText }}
      </p>

      <div v-else-if="!loading" class="docs-folder__body">
        <div v-if="folders.length" class="docs-folder__folders">
          <button
            v-for="item in folders"
            :key="item.id"
            type="button"
            class="docs-folder__folder"
            @click="emit('open-folder', item)"
          >
            <i class="bi bi-folder2 docs-folder__folder-icon" aria-hidden="true" />
            <span class="docs-folder__folder-name">{{ item.name }}</span>
            <span v-if="item.count != null" class="docs-folder__count">{{ item.count }}</span>
            <i class="bi bi-chevron-right docs-folder__folder-chevron" aria-hidden="true" />
          </button>
        </div>

        <div v-if="files.length" class="docs-folder__files">
          <ul class="docs-folder__file-list">
            <li v-for="item in files" :key="item.id">
              <button
                type="button"
                class="docs-folder__file"
                :disabled="openingFile"
                @click="emit('open-file', item)"
              >
                <span
                  class="docs-folder__file-icon-wrap"
                  :class="'docs-folder__file-icon-wrap--' + documentFileVisualKind(item)"
                  aria-hidden="true"
                >
                  <i :class="['bi', 'bi-' + documentFileIconBiSuffix(item)]" />
                </span>
                <span class="docs-folder__file-name">{{ item.name }}</span>
                <i class="bi bi-box-arrow-up-right docs-folder__file-external" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <p v-if="folderWebUrl && !loading" class="docs-folder__sharepoint">
        <a
          :href="folderWebUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ openFolderTabLabel }}
          <i class="bi bi-box-arrow-up-right" aria-hidden="true" />
        </a>
      </p>
    </template>
  </div>
</template>

<style scoped>
.docs-folder {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.docs-folder__muted {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.docs-folder__loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
}
.docs-folder__spin {
  animation: docs-folder-spin 0.8s linear infinite;
}
.docs-folder__error {
  margin: 0;
  font-size: var(--text-sm);
  color: #b91c1c;
}
.docs-folder__crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.docs-folder__crumb {
  border: none;
  background: none;
  padding: 0;
  color: var(--color-accent);
  font: inherit;
  cursor: pointer;
}
.docs-folder__crumb:hover {
  text-decoration: underline;
}
.docs-folder__crumb:disabled {
  opacity: 0.6;
  cursor: default;
}
.docs-folder__current {
  font-weight: 600;
  color: var(--color-text);
}
.docs-folder__up {
  margin-left: 0.5rem;
  border: none;
  background: none;
  padding: 0;
  font-size: 0.75rem;
  color: var(--color-text-subtle);
  cursor: pointer;
}
.docs-folder__up:hover {
  color: var(--color-text-muted);
}
.docs-folder__body {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.docs-folder__folders {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.docs-folder__folder {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  margin: 0;
  padding: 0.6rem 0.7rem;
  border: 1px solid color-mix(in srgb, #b45309 28%, var(--color-border));
  border-left: 4px solid #b45309;
  border-radius: var(--radius);
  background: color-mix(in srgb, #f59e0b 11%, var(--liquid-tile-bg-inner));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 1px 2px rgba(180, 83, 9, 0.07);
  color: var(--color-text);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.docs-folder__folder:hover {
  background: color-mix(in srgb, #f59e0b 22%, var(--color-bg-hover));
}
.docs-folder__folder-icon {
  flex-shrink: 0;
  font-size: 1.15rem;
  color: #b45309;
}
.docs-folder__folder-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.docs-folder__count {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  color: color-mix(in srgb, #92400e 55%, var(--color-text-muted));
  background: color-mix(in srgb, #fef3c7 55%, var(--color-bg-muted));
  border: 1px solid color-mix(in srgb, #b45309 22%, var(--color-border));
  border-radius: var(--radius-full);
  padding: 0.12rem 0.5rem;
}
.docs-folder__folder-chevron {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: color-mix(in srgb, #b45309 75%, var(--color-text-muted));
}
.docs-folder__files {
  padding: 0.5rem 0.55rem 0.55rem 0.65rem;
  border-radius: var(--radius);
  border: 1px solid color-mix(in srgb, #2563eb 26%, var(--color-border));
  border-left: 4px solid #2563eb;
  background: color-mix(in srgb, #2563eb 9%, var(--color-bg));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.docs-folder__file-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.docs-folder__file {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  margin: 0;
  padding: 0.5rem 0.65rem;
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  text-align: left;
  background: var(--liquid-tile-bg-strong, var(--liquid-tile-bg-inner));
  border-radius: var(--radius);
  border: 1px solid color-mix(in srgb, #2563eb 14%, var(--color-border));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.22),
    0 1px 0 rgba(0, 0, 0, 0.03);
  cursor: pointer;
}
.docs-folder__file:hover:not(:disabled) {
  border-color: color-mix(in srgb, #2563eb 45%, var(--color-border));
  background: color-mix(in srgb, var(--liquid-tile-bg-inner) 82%, var(--color-accent-soft));
}
.docs-folder__file:disabled {
  opacity: 0.65;
  cursor: default;
}
.docs-folder__file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.docs-folder__file-external {
  flex-shrink: 0;
  font-size: 0.72rem;
  opacity: 0.38;
}
.docs-folder__file:hover:not(:disabled) .docs-folder__file-external {
  opacity: 0.65;
}
.docs-folder__file-icon-wrap {
  width: 2.375rem;
  height: 2.375rem;
  border-radius: var(--radius);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--liquid-tile-bg-inner) 92%, var(--color-bg-muted));
  font-size: 1.35rem;
}
.docs-folder__file-icon-wrap--pdf {
  border-color: color-mix(in srgb, #ef4444 38%, var(--color-border));
  background: color-mix(in srgb, #ef4444 14%, var(--liquid-tile-bg-inner));
  color: #dc2626;
}
.docs-folder__file-icon-wrap--video {
  border-color: color-mix(in srgb, #6366f1 38%, var(--color-border));
  background: color-mix(in srgb, #6366f1 14%, var(--liquid-tile-bg-inner));
  color: #4f46e5;
}
.docs-folder__file-icon-wrap--audio {
  border-color: color-mix(in srgb, #a855f7 38%, var(--color-border));
  background: color-mix(in srgb, #a855f7 12%, var(--liquid-tile-bg-inner));
  color: #9333ea;
}
.docs-folder__file-icon-wrap--image {
  border-color: color-mix(in srgb, #10b981 38%, var(--color-border));
  background: color-mix(in srgb, #10b981 12%, var(--liquid-tile-bg-inner));
  color: #059669;
}
.docs-folder__file-icon-wrap--sheet {
  border-color: color-mix(in srgb, #16a34a 32%, var(--color-border));
  background: color-mix(in srgb, #16a34a 10%, var(--liquid-tile-bg-inner));
  color: #15803d;
}
.docs-folder__file-icon-wrap--slide {
  border-color: color-mix(in srgb, #ea580c 34%, var(--color-border));
  background: color-mix(in srgb, #ea580c 11%, var(--liquid-tile-bg-inner));
  color: #c2410c;
}
.docs-folder__file-icon-wrap--archive {
  border-color: color-mix(in srgb, #78716c 40%, var(--color-border));
  background: color-mix(in srgb, #78716c 10%, var(--liquid-tile-bg-inner));
  color: #57534e;
}
.docs-folder__file-icon-wrap--doc {
  border-color: color-mix(in srgb, #2563eb 34%, var(--color-border));
  background: color-mix(in srgb, #2563eb 11%, var(--liquid-tile-bg-inner));
  color: #1d4ed8;
}
.docs-folder__file-icon-wrap--text {
  border-color: color-mix(in srgb, #64748b 34%, var(--color-border));
  background: color-mix(in srgb, #64748b 9%, var(--liquid-tile-bg-inner));
  color: #475569;
}
.docs-folder__file-icon-wrap--file {
  color: var(--color-accent);
}
.docs-folder__sharepoint {
  margin: 0.2rem 0 0;
  font-size: var(--text-sm);
}
.docs-folder__sharepoint a {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
@keyframes docs-folder-spin {
  to { transform: rotate(360deg); }
}
</style>

<style>
html[data-theme='dark'] .docs-folder__count {
  background: color-mix(in srgb, #b45309 18%, var(--color-bg-muted));
  color: var(--color-text-muted);
  border-color: color-mix(in srgb, #f59e0b 28%, var(--color-border));
}
html[data-theme='dark'] .docs-folder__folder {
  background: color-mix(in srgb, #f59e0b 8%, var(--liquid-tile-bg-inner));
}
html[data-theme='dark'] .docs-folder__folder:hover {
  background: color-mix(in srgb, #f59e0b 14%, var(--color-bg-hover));
}
</style>
