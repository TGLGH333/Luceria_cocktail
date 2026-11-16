<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

interface WheelOption {
  label: string
  hint: string
}

const router = useRouter()
const STORAGE_KEY = 'luceria.wheel.v1'

const defaultOptions: WheelOption[] = [
  { label: 'Sing a line', hint: 'Pick a song everyone knows and sing the first line.' },
  { label: 'Tell a story', hint: 'Share your best night out. Then pass the iPad on.' },
  { label: 'Make a toast', hint: 'Two sentences, glass raised. No pressure.' },
  { label: 'Dance for 15 s', hint: 'Everyone counts out loud. Commit to it.' },
  { label: 'Pick the next drink', hint: 'Choose something for the person on your left.' },
  { label: 'Do an impression', hint: 'A bartender, a regular, or someone at the table.' },
  { label: 'Share a secret', hint: 'Keep it harmless. The table keeps it.' },
  { label: 'Pass the iPad', hint: 'Hand it to the quietest person here and let them spin.' },
]

const colors = [
  '#c8463d',
  '#eaceaa',
  '#e58a3a',
  '#2e4a2a',
  '#eec646',
  '#7e1f2a',
  '#4aa3e6',
  '#d9a05b',
]

function readOptions(): WheelOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultOptions.map((option) => ({ ...option }))
    const parsed = JSON.parse(raw) as WheelOption[]
    if (!Array.isArray(parsed) || parsed.length !== 8) return defaultOptions.map((option) => ({ ...option }))
    return parsed.map((option, index) => ({
      label: String(option.label || defaultOptions[index].label).slice(0, 42),
      hint: String(option.hint || defaultOptions[index].hint).slice(0, 120),
    }))
  } catch {
    return defaultOptions.map((option) => ({ ...option }))
  }
}

const options = ref<WheelOption[]>(readOptions())
const rotation = ref(0)
const spinning = ref(false)
const hasSpun = ref(false)
const resultIndex = ref(0)
const displayIndex = ref(0)
const showEditor = ref(false)
const draft = ref<WheelOption[]>([])
const toast = ref('')
let spinTimer: number | undefined
let toastTimer: number | undefined

const activeOption = computed(() => options.value[displayIndex.value] ?? options.value[0])
const gradient = computed(() => {
  const stops = colors.map((color, index) => {
    const start = index * 45
    return `${color} ${start}deg ${start + 45}deg`
  })
  return `conic-gradient(from 0deg, ${stops.join(', ')})`
})

const reduceMotion = computed(() => {
  if (typeof window === 'undefined') return false
  if (document.documentElement.dataset.reduceMotion === 'true') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function saveOptions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options.value))
}

function spin() {
  if (spinning.value) return
  const index = Math.floor(Math.random() * options.value.length)
  const current = rotation.value
  const desired = (360 - (index * 45 + 22.5) + 360) % 360
  const delta = (desired - (current % 360) + 360) % 360
  rotation.value = current + 360 * 5 + delta
  spinning.value = true
  hasSpun.value = false
  resultIndex.value = index

  if (spinTimer) window.clearTimeout(spinTimer)
  spinTimer = window.setTimeout(() => {
    displayIndex.value = resultIndex.value
    hasSpun.value = true
    spinning.value = false
    saveOptions()
  }, reduceMotion.value ? 120 : 3800)
}

function openEditor() {
  draft.value = options.value.map((option) => ({ ...option }))
  showEditor.value = true
}

function saveEditor() {
  options.value = draft.value.map((option, index) => ({
    label: option.label.trim() || defaultOptions[index].label,
    hint: option.hint.trim() || defaultOptions[index].hint,
  }))
  saveOptions()
  showEditor.value = false
  showToast('Wheel options saved.')
}

function resetEditor() {
  draft.value = defaultOptions.map((option) => ({ ...option }))
}

function showToast(message: string) {
  if (toastTimer) window.clearTimeout(toastTimer)
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
}

onBeforeUnmount(() => {
  if (spinTimer) window.clearTimeout(spinTimer)
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="wheel-page">
    <header class="game-top">
      <button class="round close" type="button" aria-label="Close game" @click="router.push('/party')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <h1>Spin the wheel</h1>
      <span class="flex" />
      <button class="edit" type="button" @click="openEditor">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
          <path d="M14.5 6.5l3 3" />
        </svg>
        Edit options
      </button>
    </header>

    <main class="wheel-layout">
      <section class="wheel-stage" aria-label="Spin the wheel">
        <div class="wheel-wrap">
          <div class="pointer" aria-hidden="true"><i /></div>
          <div
            class="wheel"
            :class="{ spinning }"
            :style="{ background: gradient, transform: `rotate(${rotation}deg)` }"
            aria-hidden="true"
          >
            <span class="tick" v-for="tick in 16" :key="tick" :style="{ transform: `rotate(${tick * 22.5}deg) translateY(-244px)` }" />
            <span class="hub" />
          </div>
        </div>
      </section>

      <aside class="wheel-side" aria-live="polite">
        <p class="result-label">{{ hasSpun ? 'You got' : 'Last result' }}</p>
        <h2 :class="{ accent: hasSpun }">{{ activeOption.label }}</h2>
        <p v-if="hasSpun" class="result-hint">{{ activeOption.hint }}</p>
        <div class="space" />
        <button class="spin" type="button" :disabled="spinning" @click="spin">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 11a8 8 0 1 0-2.3 5.7" />
            <path d="M20 4v7h-7" />
          </svg>
          {{ spinning ? 'Spinning…' : hasSpun ? 'Spin again' : 'Spin' }}
        </button>
        <p class="note">{{ options.length }} options · saved for next time</p>
      </aside>
    </main>

    <Transition name="sheet">
      <div v-if="showEditor" class="editor-scrim" @click.self="showEditor = false">
        <section class="editor" role="dialog" aria-modal="true" aria-labelledby="wheel-editor-title">
          <header>
            <div>
              <p class="eyebrow">Make it yours</p>
              <h2 id="wheel-editor-title">Edit options</h2>
            </div>
            <button class="round" type="button" aria-label="Close editor" @click="showEditor = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>
          <div class="editor-list">
            <label v-for="(option, index) in draft" :key="index">
              <span>{{ index + 1 }}</span>
              <input v-model="option.label" maxlength="42" />
            </label>
          </div>
          <footer>
            <button class="reset" type="button" @click="resetEditor">Reset</button>
            <span class="flex" />
            <button class="cancel" type="button" @click="showEditor = false">Cancel</button>
            <button class="save" type="button" @click="saveEditor">Save options</button>
          </footer>
        </section>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.wheel-page {
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 40px;
  background: #0c0b0a;
  color: var(--text-primary);
  scrollbar-width: none;
}

.wheel-page::-webkit-scrollbar {
  display: none;
}

.game-top {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 56px;
}

.game-top h1 {
  margin: 0;
  font-size: calc(24px * var(--text-scale, 1));
  line-height: calc(30px * var(--text-scale, 1));
  font-weight: 600;
}

.flex {
  flex: 1;
}

.round {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  min-width: 56px;
  border: 0;
  border-radius: 50%;
  background: #282522;
  color: var(--text-primary);
  cursor: pointer;
}

.edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  min-width: 175px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: #1d1b19;
  color: var(--text-primary);
  font-size: calc(17px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.wheel-layout {
  display: grid;
  grid-template-columns: 560px 334px;
  gap: 113px;
  width: 1007px;
  margin: 8px 0 0 107px;
  align-items: start;
}

.wheel-stage {
  position: relative;
  width: 560px;
  height: 600px;
}

.wheel-wrap {
  position: absolute;
  left: 20px;
  top: 60px;
  width: 520px;
  height: 520px;
}

.pointer {
  position: absolute;
  z-index: 4;
  left: 50%;
  top: -30px;
  width: 36px;
  height: 48px;
  transform: translateX(-50%);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
}

.pointer::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #f4f0e9;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.pointer i {
  position: absolute;
  left: 50%;
  top: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c8463d;
  transform: translateX(-50%);
}

.wheel {
  position: relative;
  width: 520px;
  height: 520px;
  border-radius: 50%;
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.45);
  transition: transform 3.6s cubic-bezier(0.16, 0.84, 0.2, 1);
  will-change: transform;
}

.wheel::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px solid rgba(246, 235, 214, 0.18);
}

.tick {
  position: absolute;
  left: calc(50% - 3px);
  top: calc(50% - 3px);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f6ebd6;
  transform-origin: 50% 50%;
}

.hub {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 94px;
  height: 94px;
  border-radius: 50%;
  background: #1a120f;
  border: 1px solid rgba(246, 235, 214, 0.16);
  transform: translate(-50%, -50%);
}

.wheel-side {
  width: 334px;
  min-height: 244px;
  margin-top: 136px;
}

.result-label {
  margin: 0;
  color: var(--text-tertiary);
  font-size: calc(15px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
  font-weight: 500;
}

.wheel-side h2 {
  margin: 8px 0 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.wheel-side h2.accent {
  color: var(--accent);
}

.result-hint {
  margin: 12px 0 0;
  max-width: 320px;
  color: var(--text-secondary);
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(26px * var(--text-scale, 1));
}

.space {
  height: 8px;
}

.spin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 260px;
  height: 88px;
  margin-top: 32px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.spin:disabled {
  cursor: default;
  opacity: 0.72;
}

.note {
  margin: 16px 0 0;
  color: var(--text-tertiary);
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
}

.editor-scrim {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  background: var(--scrim);
}

.editor {
  width: 520px;
  height: 100%;
  overflow-y: auto;
  padding: 36px 32px 28px;
  background: var(--bg-elevated);
  border-left: 1px solid var(--stroke-1);
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.35);
  scrollbar-width: none;
}

.editor::-webkit-scrollbar {
  display: none;
}

.editor header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--text-tertiary);
  font-size: calc(12px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.editor h2 {
  margin: 0;
  font-size: calc(30px * var(--text-scale, 1));
  line-height: calc(36px * var(--text-scale, 1));
  letter-spacing: -0.6px;
}

.editor-list {
  display: grid;
  gap: 10px;
  margin-top: 28px;
}

.editor-list label {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  padding: 8px 14px;
  border-radius: 14px;
  background: var(--fill-1);
}

.editor-list span {
  width: 20px;
  color: var(--text-tertiary);
  font-size: calc(13px * var(--text-scale, 1));
  font-variant-numeric: tabular-nums;
}

.editor-list input {
  flex: 1;
  min-width: 0;
  height: 40px;
  border: 1px solid var(--stroke-1);
  border-radius: 10px;
  padding: 0 12px;
  background: var(--bg-base);
  color: var(--text-primary);
  font: inherit;
  font-size: calc(15px * var(--text-scale, 1));
}

.editor footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--stroke-1);
}

.editor footer button {
  height: 48px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.reset,
.cancel {
  background: var(--fill-2);
  color: var(--text-primary);
}

.save {
  background: var(--accent);
  color: var(--text-on-accent);
}

.sheet-enter-active .editor,
.sheet-leave-active .editor {
  transition: transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.sheet-enter-from .editor,
.sheet-leave-to .editor {
  transform: translateX(36px);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 250ms ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 40px;
  z-index: 30;
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--bg-base);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
  transform: translateX(-50%);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

[data-text-large='true'] .wheel-page {
  padding: 28px 24px;
}

[data-text-large='true'] .wheel-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  margin: 16px 0 0;
}

[data-text-large='true'] .wheel-stage {
  width: 100%;
  height: auto;
  min-height: 500px;
}

[data-text-large='true'] .wheel-wrap {
  position: relative;
  left: auto;
  top: auto;
  margin: 50px auto 0;
}

[data-text-large='true'] .wheel-side {
  width: 100%;
  margin: 0;
}

[data-text-large='true'] .spin {
  width: 100%;
  max-width: 360px;
  height: auto;
  min-height: 88px;
  padding-block: 14px;
}

[data-text-large='true'] .editor {
  width: min(560px, 100%);
}
</style>
