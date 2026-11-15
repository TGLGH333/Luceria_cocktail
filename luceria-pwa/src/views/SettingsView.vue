<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'
import type { Settings, Theme, Unit } from '../types'

const router = useRouter()
const route = useRoute()
const store = useDemoStore()

type Section = 'appearance' | 'accessibility' | 'mixing' | 'about'
const validSections: Section[] = ['appearance', 'accessibility', 'mixing', 'about']
const requestedSection = String(route.query.tab ?? '') as Section
const section = ref<Section>(validSections.includes(requestedSection) ? requestedSection : 'appearance')

watch(
  () => route.query.tab,
  (tab) => {
    const next = String(tab ?? '') as Section
    if (validSections.includes(next)) section.value = next
  },
)

const sections: { id: Section; label: string; icon: string }[] = [
  { id: 'appearance', label: 'Appearance', icon: '◐' },
  { id: 'accessibility', label: 'Accessibility', icon: '◉' },
  { id: 'mixing', label: 'Mixing & units', icon: '◷' },
  { id: 'about', label: 'About', icon: '○' },
]

const themes: { id: Theme; label: string; sub: string }[] = [
  { id: 'auto', label: 'Automatic', sub: 'Follows your iPad' },
  { id: 'dark', label: 'Dark', sub: 'Evening bar' },
  { id: 'light', label: 'Light', sub: 'Daylight' },
]

const scales = [
  { value: 1, label: 'Default' },
  { value: 1.35, label: 'Larger' },
  { value: 1.7, label: 'Large' },
  { value: 2, label: 'Largest' },
]

const currentScale = computed(() => store.settings.textScale)

function setTheme(theme: Theme) {
  store.updateSettings({ theme })
}

function chooseSection(id: Section) {
  section.value = id
  void router.replace({ query: { ...route.query, tab: id } })
}

function setScale(value: number) {
  store.updateSettings({ textScale: value })
}

function setUnit(units: Unit) {
  store.updateSettings({ units })
}

type ToggleKey =
  | 'reduceMotion'
  | 'largeTargets'
  | 'keepAwake'
  | 'autoTimers'
  | 'extraTime'
  | 'updateBar'
  | 'readAloud'
  | 'captions'
  | 'flash'
  | 'oneInstruction'

function toggleSetting(key: ToggleKey) {
  store.updateSettings({ [key]: !store.settings[key] } as Partial<Settings>)
}

function shrink() {
  store.updateSettings({ defaultServings: Math.max(1, store.settings.defaultServings - 1) })
}

function grow() {
  store.updateSettings({ defaultServings: Math.min(8, store.settings.defaultServings + 1) })
}

function reset() {
  if (!window.confirm('Reset the demo bar, journal and settings?')) return
  store.resetDemo()
  router.push('/tonight')
}
</script>

<template>
  <div class="settings-page">
    <header class="top">
      <button class="back" type="button" aria-label="Back" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <h1>Settings</h1>
    </header>

    <div class="body">
      <nav class="side" aria-label="Settings sections">
        <button
          v-for="item in sections"
          :key="item.id"
          type="button"
          class="side-item"
          :class="{ active: section === item.id }"
          @click="chooseSection(item.id)"
        >
          <span class="side-icon">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </nav>

      <section class="panel">
        <template v-if="section === 'appearance'">
          <p class="label">Theme</p>
          <div class="theme-grid">
            <button
              v-for="theme in themes"
              :key="theme.id"
              class="theme-card"
              :class="{ active: store.settings.theme === theme.id }"
              type="button"
              @click="setTheme(theme.id)"
            >
              <span class="theme-check">{{ store.settings.theme === theme.id ? '✓' : '' }}</span>
              <strong>{{ theme.label }}</strong>
              <span>{{ theme.sub }}</span>
            </button>
          </div>
          <button class="row clickable" type="button" @click="store.settings.theme === 'hc' ? setTheme('auto') : store.updateSettings({ theme: 'hc' })">
            <span class="row-icon">◉</span>
            <span class="row-copy">
              <strong>High contrast</strong>
              <span>Pure black and white, stronger outlines</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.theme === 'hc' }"><i /></span>
          </button>
          <p class="hint">Automatic follows your iPad: dark in the evening, light by day.</p>
        </template>

        <template v-else-if="section === 'accessibility'">
          <div class="row column">
            <div class="row-head">
              <span class="row-copy">
                <strong>Text size</strong>
                <span>Applies across Luceria</span>
              </span>
              <span class="value">{{ Math.round(currentScale * 100) }}%</span>
            </div>
            <div class="scale-options">
              <button v-for="item in scales" :key="item.value" type="button" :class="{ active: currentScale === item.value }" @click="setScale(item.value)">
                {{ item.label }}
              </button>
            </div>
          </div>
          <button class="row clickable" type="button" @click="store.settings.theme === 'hc' ? setTheme('auto') : setTheme('hc')">
            <span class="row-icon">◐</span>
            <span class="row-copy">
              <strong>Increase contrast</strong>
              <span>Stronger outlines and pure-black backgrounds</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.theme === 'hc' }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('reduceMotion')">
            <span class="row-icon">◎</span>
            <span class="row-copy">
              <strong>Reduce motion</strong>
              <span>Simple fades instead of slides</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.reduceMotion }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('largeTargets')">
            <span class="row-icon">⊕</span>
            <span class="row-copy">
              <strong>Larger touch targets</strong>
              <span>Buttons grow from 52 to 64 pt</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.largeTargets }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('extraTime')">
            <span class="row-icon">◷</span>
            <span class="row-copy">
              <strong>Extra time on timers</strong>
              <span>Wait for Done instead of moving on</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.extraTime }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('readAloud')">
            <span class="row-icon">◖</span>
            <span class="row-copy">
              <strong>Read steps aloud</strong>
              <span>Hands-free while you mix</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.readAloud }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('captions')">
            <span class="row-icon">▭</span>
            <span class="row-copy">
              <strong>Show captions</strong>
              <span>Spoken text appears while you mix</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.captions }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('flash')">
            <span class="row-icon">☀</span>
            <span class="row-copy">
              <strong>Flash when timer ends</strong>
              <span>A short screen pulse for noisy kitchens</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.flash }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('oneInstruction')">
            <span class="row-icon">≡</span>
            <span class="row-copy">
              <strong>One instruction per screen</strong>
              <span>Split combined pours into separate steps</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.oneInstruction }"><i /></span>
          </button>
          <p class="hint">The demo keeps these choices local to this browser.</p>
        </template>

        <template v-else-if="section === 'mixing'">
          <p class="label">Units</p>
          <div class="row">
            <span class="row-icon">▱</span>
            <span class="row-copy">
              <strong>Volume</strong>
              <span>Recipe amounts are stored in ml</span>
            </span>
            <div class="unit-toggle">
              <button v-for="unit in (['ml', 'oz', 'cl'] as Unit[])" :key="unit" type="button" :class="{ active: store.settings.units === unit }" @click="setUnit(unit)">
                {{ unit }}
              </button>
            </div>
          </div>
          <div class="row">
            <span class="row-icon">◫</span>
            <span class="row-copy">
              <strong>Default servings</strong>
              <span>Used when you open a recipe</span>
            </span>
            <div class="stepper">
              <button type="button" @click="shrink">−</button>
              <span>{{ store.settings.defaultServings }}</span>
              <button type="button" @click="grow">+</button>
            </div>
          </div>
          <p class="label second">While mixing</p>
          <button class="row clickable" type="button" @click="toggleSetting('keepAwake')">
            <span class="row-icon">☀</span>
            <span class="row-copy">
              <strong>Keep screen awake</strong>
              <span>Prevents the iPad from sleeping</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.keepAwake }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('autoTimers')">
            <span class="row-icon">◷</span>
            <span class="row-copy">
              <strong>Start timers automatically</strong>
              <span>Timers start when a step opens</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.autoTimers }"><i /></span>
          </button>
          <button class="row clickable" type="button" @click="toggleSetting('updateBar')">
            <span class="row-icon">▤</span>
            <span class="row-copy">
              <strong>Update my bar after mixing</strong>
              <span>Lowers stock levels as you pour</span>
            </span>
            <span class="toggle" :class="{ on: store.settings.updateBar }"><i /></span>
          </button>
        </template>

        <template v-else>
          <div class="about-head">
            <span class="logo">Y</span>
            <div>
              <strong>Luceria</strong>
              <span>Version 2.1 (214) · demo build</span>
            </div>
          </div>
          <div class="row">
            <span class="row-copy">
              <strong>Recipe specs</strong>
              <span>Follows the design handoff and Difford’s Guide references</span>
            </span>
            <span class="chev">›</span>
          </div>
          <div class="row">
            <span class="row-copy">
              <strong>Privacy</strong>
              <span>Everything in this demo stays in your browser</span>
            </span>
            <span class="chev">›</span>
          </div>
          <button class="row clickable" type="button" @click="reset">
            <span class="row-copy">
              <strong>Reset demo data</strong>
              <span>Restore the bar, journal and settings</span>
            </span>
            <span class="chev">›</span>
          </button>
          <p class="hint">Please enjoy responsibly. Never drink and drive.</p>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  height: 100%;
  padding: 34px 40px 40px;
  background: var(--bg-base);
  color: var(--text-primary);
  overflow-y: auto;
  scrollbar-width: none;
}

.settings-page::-webkit-scrollbar {
  display: none;
}

.top {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
}

.back {
  width: 44px;
  height: 44px;
  border: 1px solid var(--line-subtle);
  border-radius: 50%;
  background: var(--fill-2);
  color: var(--text-primary);
  display: grid;
  place-items: center;
  cursor: pointer;
}

h1 {
  margin: 0;
  font-size: calc(26px * var(--text-scale, 1));
  line-height: calc(32px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -0.5px;
}

.body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 40px;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.side-item {
  height: 46px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 13px;
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.side-item.active {
  background: var(--fill-2);
  color: var(--text-primary);
}

.side-icon {
  width: 18px;
  text-align: center;
  color: var(--text-tertiary);
}

.side-item.active .side-icon {  color: var(--accent);
}

.panel {
  max-width: 620px;
}

.label {
  margin: 0 0 10px;
  font-size: calc(13px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.label.second {
  margin-top: 28px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.theme-card {
  position: relative;
  height: 92px;
  padding: 16px;
  border: 1px solid var(--line-subtle);
  border-radius: 16px;
  background: var(--fill-2);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.theme-card.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.theme-card strong {
  display: block;
  font-size: calc(15px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
  font-weight: 600;
}

.theme-card span:not(.theme-check) {
  display: block;
  margin-top: 2px;
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.theme-check {
  position: absolute;
  top: 10px;
  right: 12px;
  color: var(--accent);
  font-size: calc(14px * var(--text-scale, 1));
}

.row {
  width: 100%;
  min-height: 62px;
  margin-top: 10px;
  padding: 12px 16px;
  border: 0;
  border-radius: 16px;
  background: var(--fill-2);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 13px;
  text-align: left;
}

.row.clickable {
  cursor: pointer;
}

.row.column {
  display: block;
  padding: 16px;
}

.row-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.row-icon {
  width: 20px;
  text-align: center;
  color: var(--text-secondary);
}

.row-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-copy strong {
  font-size: calc(15px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
  font-weight: 600;
}

.row-copy span {
  font-size: calc(12px * var(--text-scale, 1));
  line-height: calc(17px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.value {
  color: var(--accent);
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 600;
}

.toggle {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: var(--fill-3);
  padding: 3px;
  flex: 0 0 42px;
}

.toggle i {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-primary);
}

.toggle.on {
  background: var(--status-ready);
}

.toggle.on i {
  transform: translateX(18px);
  background: #fff;
}

.scale-options {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.scale-options button {
  flex: 1;
  height: 38px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-secondary);
  font-size: calc(13px * var(--text-scale, 1));
  cursor: pointer;
}

.scale-options button.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.unit-toggle {
  display: flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--fill-3);
}

.unit-toggle button {
  height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: calc(12px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.unit-toggle button.active {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stepper button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: var(--fill-3);
  color: var(--text-primary);
  font-size: calc(16px * var(--text-scale, 1));
  cursor: pointer;
}

.stepper span {
  min-width: 22px;
  text-align: center;
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
}

.hint {
  margin: 14px 0 0;
  font-size: calc(12px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
  color: var(--text-tertiary);
}

.about-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.logo {
  width: 52px;
  height: 52px;
  border-radius: 13px;
  background: var(--accent);
  color: var(--text-on-accent);
  display: grid;
  place-items: center;
  font-size: calc(24px * var(--text-scale, 1));
  font-weight: 700;
}

.about-head strong {
  display: block;
  font-size: calc(18px * var(--text-scale, 1));
  font-weight: 600;
}

.about-head span {
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.chev {
  color: var(--text-tertiary);
  font-size: calc(20px * var(--text-scale, 1));
}

[data-text-large='true'] .body {
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 22px;
}

[data-text-large='true'] .side-item {
  height: auto;
  min-height: 52px;
  padding: 10px 16px;
}

[data-text-large='true'] .row {
  min-height: 76px;
  padding: 16px;
  align-items: flex-start;
}

[data-text-large='true'] .row .toggle {
  margin-top: 4px;
}

[data-text-large='true'] .theme-card {
  height: auto;
  min-height: 112px;
}

[data-text-large='true'] .scale-options button {
  height: auto;
  min-height: 52px;
}
</style>
