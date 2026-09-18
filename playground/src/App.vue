<script setup>
import { stories } from './stories.js'
import { theme, toggleTheme } from '../../theme/index.js'
</script>

<template>
  <div class="catalog">
    <header class="catalog__hero liquid-surface liquid-surface--accent">
      <p class="catalog__kicker">@hands-on/glass</p>
      <h1>Stories</h1>
      <p>
        Lokale Vorschau für Design-Gespräche. CSS kommt direkt aus dem Paket — Änderungen an
        <code>styles/</code> sind nach Reload sichtbar.
      </p>
      <button type="button" class="glass-btn-secondary" @click="toggleTheme">
        {{ theme === 'dark' ? 'Hell' : 'Dunkel' }}
      </button>
    </header>

    <ul class="catalog__list">
      <li v-for="story in stories" :key="story.id">
        <a class="catalog__card liquid-surface" :href="story.href">
          <span class="catalog__title">{{ story.title }}</span>
          <span class="catalog__summary">{{ story.summary }}</span>
          <span class="catalog__open">Story öffnen</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.catalog {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 4rem;
}

.catalog__hero {
  padding: 1.35rem 1.4rem 1.25rem;
  margin-bottom: 1rem;
}

.catalog__kicker {
  margin: 0 0 0.2rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.catalog__hero h1 {
  margin: 0 0 0.4rem;
  font-size: var(--text-3xl);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.catalog__hero p {
  margin: 0 0 0.9rem;
  color: var(--color-text-muted);
}

.catalog__hero code {
  font-size: 0.85em;
}

.catalog__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.catalog__card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  padding: 1.05rem 1.1rem 1rem;
  text-decoration: none;
  color: inherit;
  font-weight: 400;
}

.catalog__card:hover {
  border-color: color-mix(in srgb, var(--color-accent) 45%, var(--liquid-border));
}

.catalog__title {
  font-size: 1.15rem;
  font-weight: 700;
}

.catalog__summary {
  color: var(--color-text-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}

.catalog__open {
  margin-top: 0.35rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-accent);
}
</style>
