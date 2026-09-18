<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { publicEventEmbedSrc } from './publicEventUrl.js'
import {
  isPublicEventSsoRequest,
  publicEventSsoMessage,
  resolveSsoToken,
} from './publicEventSso.js'

const props = defineProps({
  src: { type: String, default: '' },
  title: { type: String, default: '' },
  /** Keycloak access token, or a getter so JOIN/HERO can pass a fresh token. */
  ssoToken: { type: [String, Function], default: '' },
  /** Flip true when SSO is ready (HERO silent check finishes after the iframe loads). */
  ssoReady: { type: Boolean, default: false },
})

const emit = defineEmits(['back'])

const { t } = useI18n()
const iframeRef = ref(null)

const iframeSrc = computed(() => publicEventEmbedSrc(props.src))
const frameTitle = computed(() => props.title || t('venues.publicFrameLabel'))

function iframeOrigin() {
  try {
    return new URL(iframeSrc.value).origin
  } catch {
    return ''
  }
}

function postSsoToIframe(targetOrigin) {
  const win = iframeRef.value?.contentWindow
  const token = resolveSsoToken(props.ssoToken)
  if (!win || !token) return
  const origin = targetOrigin || iframeOrigin()
  if (!origin) return
  win.postMessage(publicEventSsoMessage(token), origin)
}

function onMessage(event) {
  if (event.source !== iframeRef.value?.contentWindow) return
  const origin = iframeOrigin()
  if (origin && event.origin !== origin) return
  if (!isPublicEventSsoRequest(event.data)) return
  postSsoToIframe(event.origin)
}

function onIframeLoad() {
  postSsoToIframe()
}

watch(
  () => props.ssoReady,
  (ready) => {
    if (ready) postSsoToIframe()
  },
)

onMounted(() => window.addEventListener('message', onMessage))
onUnmounted(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <div class="public-event-frame">
    <header class="public-event-frame__bar">
      <button type="button" class="public-event-frame__back" @click="emit('back')">
        <i class="bi bi-arrow-left" aria-hidden="true" />
        {{ t('venues.backToOverview') }}
      </button>
      <span v-if="title" class="public-event-frame__title">{{ title }}</span>
    </header>
    <iframe
      v-if="iframeSrc"
      ref="iframeRef"
      class="public-event-frame__iframe"
      :src="iframeSrc"
      :title="frameTitle"
      referrerpolicy="no-referrer-when-downgrade"
      @load="onIframeLoad"
    />
    <p v-else class="public-event-frame__empty">
      {{ t('venues.noPublicPage') }}
    </p>
  </div>
</template>

<style scoped>
.public-event-frame {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  background: var(--liquid-tile-bg, #fff);
}
.public-event-frame__bar {
  display: flex;
  align-items: center;
  gap: 0.75rem 1rem;
  flex-shrink: 0;
  padding: 0.65rem 1rem;
  border-bottom: 1px solid var(--color-border, var(--liquid-border));
}
.public-event-frame__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  padding: 0.35rem 0.15rem;
  border: none;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
}
.public-event-frame__back:hover {
  color: var(--color-accent);
}
.public-event-frame__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}
.public-event-frame__iframe {
  flex: 1;
  width: 100%;
  min-height: 0;
  border: 0;
  background: #fff;
}
.public-event-frame__empty {
  margin: 2rem 1.25rem;
  color: var(--color-text-muted);
}
</style>
