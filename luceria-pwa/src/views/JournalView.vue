<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'
import type { JournalEntry } from '../types'

const store = useDemoStore()
const router = useRouter()
const tab = ref<'mixes' | 'saved' | 'mine'>('mixes')
const toast = ref('')
let toastTimer: number | undefined

const entries = computed(() => store.journalEntries)
const week = computed(() => store.weekStats)
const limit = 7

function recipeName(slug: string) {
  return store.recipeBySlug(slug)?.name ?? slug
}

function dateLabel(entry: JournalEntry) {
  const date = new Date(`${entry.date}T12:00:00`)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diff = Math.round((today.getTime() - date.getTime()) / 86_400_000)
  if (diff === 0) return 'Tonight'
  if (diff === 1) return 'Yesterday'
  if (diff > 1 && diff < 7) return date.toLocaleDateString('en-GB', { weekday: 'long' })
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function showToast(message: string) {
  if (toastTimer) window.clearTimeout(toastTimer)
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
}

function chooseTab(value: 'mixes' | 'saved' | 'mine') {
  tab.value = value
  if (value !== 'mixes') showToast(value === 'saved' ? 'Saved recipes are coming next.' : 'My recipes are coming next.')
}

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="journal-page">
    <header class="page-head">
      <div>
        <h1>Journal</h1>
        <p class="sub">What you’ve mixed, saved and created</p>
      </div>
      <div class="head-actions">
        <div class="tabs">
          <button type="button" :class="{ active: tab === 'mixes' }" @click="chooseTab('mixes')">Mixes</button>
          <button type="button" :class="{ active: tab === 'saved' }" @click="chooseTab('saved')">Saved</button>
          <button type="button" :class="{ active: tab === 'mine' }" @click="chooseTab('mine')">My recipes</button>
        </div>
        <button class="new" type="button" @click="showToast('Recipe editor is coming next.')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New recipe
        </button>
      </div>
    </header>

    <div class="layout">
      <section class="list">
        <article v-for="entry in entries" :key="entry.id" class="entry">
          <span class="entry-art" :style="{ background: `radial-gradient(circle at 50% 40%, ${store.recipeBySlug(entry.recipeSlug)?.hue ?? '#2E1C1D'} 0%, var(--fill-1) 78%)` }">
            <svg width="30" height="34" viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
              <path d="M6 3h12l-1 5v13a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V8L6 3z" />
              <path d="M7 16h10" />
            </svg>
          </span>
          <span class="entry-copy">
            <span class="entry-title">
              {{ recipeName(entry.recipeSlug) }}
              <em>{{ dateLabel(entry) }}</em>
            </span>
            <span class="entry-note">{{ entry.note }}</span>
          </span>
          <span class="entry-stars" :aria-label="`${entry.rating} out of 5`">
            <span v-for="star in 5" :key="star" :class="{ on: star <= entry.rating }">★</span>
          </span>
        </article>

        <div v-if="!entries.length" class="empty">
          <h2>No mixes yet</h2>
          <p>Finish a drink and save it here.</p>
        </div>
      </section>

      <aside class="aside">
        <section class="stat-card">
          <p class="eyebrow">This week</p>
          <div class="big">
            {{ week.drinks }}
            <span>drinks · {{ week.nights }} nights</span>
          </div>
          <div class="bars">
            <span v-for="(value, index) in week.days" :key="index" class="bar-col">
              <span class="bar-track">
                <span
                  class="bar-fill"
                  :class="{ zero: value === 0 }"
                  :style="{ height: `${Math.max(8, (value / week.max) * 52)}px` }"
                />
              </span>
              <em>{{ week.labels[index] }}</em>
            </span>
          </div>
        </section>

        <section class="mindful">
          <p class="mind-title">
            <span>◔</span>
            Mindful drinking
          </p>
          <p class="mind-copy">Set a weekly limit. Once you reach it, Tonight suggests zero-proof drinks.</p>
          <div class="mind-progress">
            <i :style="{ width: `${Math.min(100, (week.drinks / limit) * 100)}%` }" />
          </div>
          <p class="mind-count">{{ week.drinks }} of {{ limit }} this week</p>
          <button type="button" @click="router.push('/settings')">Set a limit</button>
        </section>
      </aside>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.journal-page {
  height: 100%;
  overflow-y: auto;
  padding: 42px 40px 120px;
  background: var(--bg-base);
  color: var(--text-primary);
  scrollbar-width: none;
}

.journal-page::-webkit-scrollbar {
  display: none;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

h1 {
  margin: 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.sub {
  margin: 5px 0 0;
  font-size: calc(14px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tabs {
  display: flex;
  padding: 4px;
  border-radius: 999px;
  background: var(--fill-2);
}

.tabs button {
  height: 38px;
  padding: 0 17px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
}

.tabs button.active {
  background: var(--fill-3);
  color: var(--text-primary);
}

.new {
  height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  margin-top: 24px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.entry {
  min-height: 96px;
  padding: 12px 22px 12px 12px;
  border-radius: 999px;
  background: var(--fill-2);
  display: flex;
  align-items: center;
  gap: 16px;
}

.entry-art {
  width: 72px;
  height: 72px;
  flex: 0 0 72px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: color-mix(in srgb, var(--text-primary) 50%, transparent);
}

.entry-copy {
  flex: 1;
  min-width: 0;
}

.entry-title {
  display: flex;
  align-items: baseline;
  gap: 9px;
  font-size: calc(17px * var(--text-scale, 1));
  line-height: calc(22px * var(--text-scale, 1));
  font-weight: 600;
}

.entry-title em {
  font-style: normal;
  font-size: calc(12px * var(--text-scale, 1));
  font-weight: 400;
  color: var(--text-tertiary);
}

.entry-note {
  display: block;
  margin-top: 3px;
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(19px * var(--text-scale, 1));
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-stars {
  display: flex;
  gap: 1px;
  color: var(--fill-3);
  font-size: calc(17px * var(--text-scale, 1));
  letter-spacing: -1px;
}

.entry-stars .on {
  color: var(--accent);
}

.aside {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-card,
.mindful {
  padding: 24px;
  border: 1px solid var(--line-subtle);
  border-radius: 20px;
  background: var(--fill-2);
}

.eyebrow {
  margin: 0 0 12px;
  font-size: calc(13px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.big {
  font-size: calc(44px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -1.4px;
}

.big span {
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 400;
  letter-spacing: 0;
  color: var(--text-secondary);
}

.bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 76px;
  margin-top: 18px;
}

.bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
}

.bar-track {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 16px;
  height: 52px;
}

.bar-fill {
  display: block;
  width: 16px;
  border-radius: 5px;
  background: var(--accent);
}

.bar-fill.zero {
  background: var(--fill-3);
}

.bar-col em {
  font-style: normal;
  font-size: calc(11px * var(--text-scale, 1));
  color: var(--text-tertiary);
}

.mindful {
  padding: 22px;
}

.mind-title {
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: calc(16px * var(--text-scale, 1));
  font-weight: 600;
}

.mind-title span {
  color: var(--status-ready);
}

.mind-copy {
  margin: 0;
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(19px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.mind-progress {
  height: 5px;
  margin-top: 16px;
  border-radius: 999px;
  background: var(--fill-3);
  overflow: hidden;
}

.mind-progress i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--status-ready);
}

.mind-count {
  margin: 7px 0 14px;
  font-size: calc(11px * var(--text-scale, 1));
  color: var(--text-tertiary);
}

.mindful button {
  border: 0;
  background: transparent;
  color: var(--text-primary);
  padding: 0;
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.empty {
  padding: 70px 0;
  text-align: center;
}

.empty h2 {
  margin: 0 0 6px;
}

.empty p {
  margin: 0;
  color: var(--text-secondary);
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 112px;
  z-index: 30;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--text-on-accent);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
  white-space: nowrap;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}

[data-text-large='true'] .page-head {
  flex-direction: column;
  gap: 18px;
}

[data-text-large='true'] .head-actions {
  width: 100%;
  flex-wrap: wrap;
}

[data-text-large='true'] .tabs {
  flex-wrap: wrap;
}

[data-text-large='true'] .tabs button,
[data-text-large='true'] .new {
  height: auto;
  min-height: 48px;
  padding-block: 8px;
}

[data-text-large='true'] .layout {
  grid-template-columns: minmax(0, 1fr);
}

[data-text-large='true'] .entry {
  min-height: 0;
  padding: 16px;
  border-radius: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}

[data-text-large='true'] .entry-title {
  flex-wrap: wrap;
  gap: 8px;
}

[data-text-large='true'] .entry-stars {
  margin-left: 88px;
}
</style>
