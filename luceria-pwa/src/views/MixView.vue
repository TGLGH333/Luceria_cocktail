<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DrinkArt from '../components/DrinkArt.vue'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()

const recipe = computed(() => store.recipeBySlug(String(route.params.slug)))
const servings = computed(() => Math.max(1, Number(route.query.servings) || store.settings.defaultServings))
const stage = ref<'plan' | 'steps' | 'done'>('plan')
const stepIndex = ref(0)
const remaining = ref(0)
const paused = ref(false)
const running = ref(false)
const startedAt = ref(Date.now())
const finishedAt = ref(0)
const rating = ref(4)
const taste = ref<'too-bitter' | 'just-right' | 'too-sweet'>('just-right')
const note = ref('')
const saved = ref(false)
const captionText = ref('')
const flashOn = ref(false)
const showSavedToast = ref(false)
const savedEntryId = ref('')
const savedBarSnapshot = ref<Record<string, string> | null>(null)
let timerId: number | undefined
let autoNextId: number | undefined
let toastId: number | undefined
let flashId: number | undefined
let wakeLock: { release: () => Promise<void> } | undefined

const progressKey = computed(() => `luceria.mix.${String(route.params.slug)}`)

function readProgress(): { stepIndex: number; startedAt: number; savedAt: number } | null {
  try {
    const raw = window.localStorage.getItem(progressKey.value)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveProgress() {
  if (stage.value !== 'steps') return
  window.localStorage.setItem(
    progressKey.value,
    JSON.stringify({ stepIndex: stepIndex.value, startedAt: startedAt.value, savedAt: Date.now() }),
  )
}

function clearProgress() {
  window.localStorage.removeItem(progressKey.value)
}

async function requestWakeLock() {
  if (!store.settings.keepAwake || wakeLock) return
  const api = (navigator as Navigator & {
    wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> }
  }).wakeLock
  try {
    wakeLock = await api?.request('screen')
  } catch {
    wakeLock = undefined
  }
}

function releaseWakeLock() {
  void wakeLock?.release().catch(() => undefined)
  wakeLock = undefined
}

function chime() {
  try {
    const AudioCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (AudioCtor) {
      const context = new AudioCtor()
      const gain = context.createGain()
      gain.gain.value = 0.08
      gain.connect(context.destination)
      const oscillator = context.createOscillator()
      oscillator.frequency.value = 880
      oscillator.connect(gain)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.16)
      oscillator.onended = () => void context.close()
    }
    navigator.vibrate?.([40, 60, 40])
  } catch {
    // Sound is optional; the timer still advances.
  }
  flashScreen()
}

function flashScreen() {
  if (!store.settings.flash) return
  flashOn.value = true
  if (flashId) window.clearTimeout(flashId)
  flashId = window.setTimeout(() => {
    flashOn.value = false
  }, 360)
}

function speakStep() {
  if (!step.value) return
  const text = `${step.value.title}. ${step.value.instruction}`
  captionText.value = text
  if (!store.settings.readAloud || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    window.speechSynthesis.speak(utterance)
  } catch {
    // Speech is optional; captions still work.
  }
}

const baseSteps = computed(() => recipe.value?.steps ?? [])
const steps = computed(() => {
  if (!store.settings.oneInstruction) return baseSteps.value
  return baseSteps.value.flatMap((item) => (item.parts?.length ? item.parts : [item]))
})
const step = computed(() => steps.value[stepIndex.value])
const progress = computed(() => (steps.value.length ? (stepIndex.value + 1) / steps.value.length : 0))
const timerTotal = computed(() => step.value?.timer ?? 0)
const timerDash = computed(() => {
  const total = timerTotal.value || 1
  return 301.6 * (1 - remaining.value / total)
})
const elapsedLabel = computed(() => {
  const end = finishedAt.value || Date.now()
  const seconds = Math.max(0, Math.round((end - startedAt.value) / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
})

function clearTimer() {
  if (timerId) window.clearInterval(timerId)
  if (autoNextId) window.clearTimeout(autoNextId)
  timerId = undefined
  autoNextId = undefined
  running.value = false
}

function runTimer() {
  if (timerId || !timerTotal.value) return
  running.value = true
  timerId = window.setInterval(() => {
    if (paused.value) return
    remaining.value = Math.max(0, remaining.value - 1)
    if (remaining.value === 0) {
      clearTimer()
      chime()
      advanceAfterTimer()
    }
  }, 1000)
}

function advanceAfterTimer() {
  if (store.settings.extraTime) return
  autoNextId = window.setTimeout(() => {
    if (paused.value) return
    if (stepIndex.value >= steps.value.length - 1) finish()
    else beginStep(stepIndex.value + 1)
  }, 2000)
}

function beginStep(index: number) {
  clearTimer()
  stepIndex.value = index
  const timer = steps.value[index]?.timer ?? 0
  remaining.value = timer
  paused.value = false
  window.setTimeout(speakStep, 80)
  if (timer && store.settings.autoTimers) runTimer()
}

function startMixing() {
  startedAt.value = Date.now()
  stage.value = 'steps'
  beginStep(stepIndex.value || 0)
  void requestWakeLock()
}

function showPlan() {
  clearTimer()
  window.speechSynthesis?.cancel()
  captionText.value = ''
  stage.value = 'plan'
}

function nextStep() {
  if (stepIndex.value >= steps.value.length - 1) {
    finish()
    return
  }
  beginStep(stepIndex.value + 1)
}

function onStepClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('button, a, input, textarea, select, label, .timer-actions, .step-foot')) return
  nextStep()
}

function previousStep() {
  if (stepIndex.value === 0) {
    clearTimer()
    stage.value = 'plan'
    return
  }
  beginStep(stepIndex.value - 1)
}

function finish() {
  clearTimer()
  window.speechSynthesis?.cancel()
  captionText.value = ''
  releaseWakeLock()
  clearProgress()
  finishedAt.value = Date.now()
  stage.value = 'done'
}

function close() {
  if (stage.value === 'steps' && stepIndex.value < steps.value.length) {
    const ok = window.confirm('Stop mixing? Your progress is kept for 10 minutes.')
    if (!ok) return
    saveProgress()
  }
  releaseWakeLock()
  router.back()
}

function addTen() {
  remaining.value += 10
}

function resetTimer() {
  remaining.value = timerTotal.value
}

function saveJournal() {
  if (!recipe.value || saved.value) return
  saved.value = true
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  savedEntryId.value = store.addJournal({
    recipeSlug: recipe.value.slug,
    date,
    servings: servings.value,
    rating: rating.value,
    taste: taste.value,
    note: note.value.trim() || undefined,
  })
  if (store.settings.updateBar) {
    savedBarSnapshot.value = { ...store.bar }
    const nextLevel = { full: 'half', half: 'low', low: 'out', out: 'out' } as const
    for (const item of recipe.value.ingredients) {
      if (item.optional) continue
      const current = store.bar[item.slug]
      if (current) store.setLevel(item.slug, nextLevel[current])
    }
  }
  showSavedToast.value = true
  if (toastId) window.clearTimeout(toastId)
  toastId = window.setTimeout(() => {
    showSavedToast.value = false
    router.push('/journal')
  }, 4000)
}

function undoSave() {
  if (!savedEntryId.value) return
  store.removeJournal(savedEntryId.value)
  if (savedBarSnapshot.value) {
    for (const [slug, level] of Object.entries(savedBarSnapshot.value)) {
      store.setLevel(slug, level as 'full' | 'half' | 'low' | 'out')
    }
  }
  saved.value = false
  savedEntryId.value = ''
  savedBarSnapshot.value = null
  showSavedToast.value = false
  if (toastId) window.clearTimeout(toastId)
}

function goJournal() {
  if (toastId) window.clearTimeout(toastId)
  showSavedToast.value = false
  router.push('/journal')
}

onMounted(() => {
  const savedProgress = readProgress()
  if (savedProgress && Date.now() - savedProgress.savedAt < 10 * 60 * 1000) {
    startedAt.value = savedProgress.startedAt
    stage.value = 'steps'
    beginStep(Math.min(savedProgress.stepIndex, steps.value.length - 1))
    void requestWakeLock()
  }
})

onBeforeUnmount(() => {
  clearTimer()
  window.speechSynthesis?.cancel()
  if (toastId) window.clearTimeout(toastId)
  if (flashId) window.clearTimeout(flashId)
  releaseWakeLock()
  saveProgress()
})
</script>

<template>
  <div v-if="recipe" class="mix-page">
    <header class="mix-head">
      <button class="round" type="button" aria-label="Close" @click="close">×</button>
      <span class="head-title">{{ stage === 'plan' ? 'Before you start' : stage === 'done' ? 'All done' : `Step ${stepIndex + 1} of ${steps.length}` }}</span>
      <div class="head-right">
        <span class="head-recipe">{{ recipe.name }} · {{ servings }} drinks</span>
        <button class="head-btn" type="button" @click="showPlan">All steps</button>
        <button class="round small" type="button" aria-label="Read steps aloud">◖</button>
      </div>
      <div v-if="stage === 'steps'" class="progress">
        <i v-for="(item, index) in steps" :key="item.title" :class="{ 'is-done': index <= stepIndex }" />
      </div>
    </header>

    <main v-if="stage === 'plan'" class="plan">
      <section class="plan-art">
        <div class="plan-art-glow" />
        <DrinkArt :recipe="recipe" />
        <div class="plan-art-copy">
          <h2>{{ recipe.name }} · {{ servings }} drinks</h2>
          <div class="plan-meta">
            <span>About {{ recipe.minutes }} min</span>
            <span>{{ steps.length }} steps</span>
            <span>{{ steps.filter((item) => item.timer).length }} timer</span>
          </div>
        </div>
      </section>

      <section class="plan-copy">
        <h1>Here’s the plan</h1>
        <div class="plan-steps">
          <div v-for="(item, index) in steps" :key="item.title" class="plan-step">
            <span class="plan-num">{{ index + 1 }}</span>
            <span class="plan-step-title">{{ item.title }}</span>
            <span class="plan-step-time">{{ item.timer ? `◷ ${item.timer} s` : `${item.duration} s` }}</span>
          </div>
        </div>
        <p class="need-label">You’ll need</p>
        <div class="equipment">
          <span v-for="item in recipe.equipment" :key="item">{{ item }}</span>
        </div>
        <button class="wide primary" type="button" @click="startMixing">Gather ingredients →</button>
      </section>
    </main>

    <main v-else-if="stage === 'steps' && step" :key="stepIndex" class="step" @click="onStepClick">
      <section class="step-copy">
        <p class="step-overline">STEP {{ stepIndex + 1 }}</p>
        <h1>{{ step.title }}.</h1>
        <p class="step-instruction">{{ step.instruction }}</p>
        <div class="glass-tabs">
          <span class="glass-tab active">Glass 1</span>
          <span class="glass-tab">Glass 2</span>
        </div>
        <div class="step-tip">
          <span>◷</span>
          Move the ice, not the drink.
        </div>
      </section>

      <section class="step-visual">
        <div v-if="step.timer" class="timer">
          <svg viewBox="0 0 240 240" class="timer-ring" aria-hidden="true">
            <circle cx="120" cy="120" r="96" class="ring-bg" />
            <circle cx="120" cy="120" r="96" class="ring-value" :class="{ paused }" :style="{ strokeDashoffset: timerDash }" />
          </svg>
          <div class="timer-copy">
            <strong aria-live="polite">{{ Math.floor(remaining / 60) }}:{{ String(remaining % 60).padStart(2, '0') }}</strong>
            <span>{{ remaining }} s left · glass 1</span>
          </div>
        </div>
        <div v-else class="step-art">
          <DrinkArt :recipe="recipe" />
        </div>
        <div v-if="step.timer" class="timer-actions">
          <button class="round" type="button" aria-label="Reset timer" @click="resetTimer">↺</button>
          <button v-if="!running" class="timer-btn" type="button" @click="runTimer">Start</button>
          <button v-else class="timer-btn" type="button" @click="paused = !paused">{{ paused ? 'Resume' : 'Pause' }}</button>
          <button class="round add-time" type="button" aria-label="Add 10 seconds" @click="addTen">+10 s</button>
        </div>
      </section>

      <footer class="step-foot">
        <button class="wide ghost" type="button" @click="previousStep">← Back</button>
        <button class="wide primary" type="button" @click="nextStep">
          {{ stepIndex >= steps.length - 1 ? 'Finish' : `Next: ${steps[stepIndex + 1]?.title.toLowerCase()} →` }}
        </button>
      </footer>
    </main>

    <main v-else class="done">
      <section class="done-copy">
        <p class="done-overline">✓ {{ servings }} {{ recipe.name }}{{ servings === 1 ? '' : 's' }}, done in {{ elapsedLabel }}</p>
        <h1>Cheers, Mira.</h1>
        <p class="done-lede">That’s your 4th {{ recipe.name }}. You’re getting good at this.</p>

        <p class="rate-label">How was it?</p>
        <div class="stars">
          <button v-for="star in 5" :key="star" type="button" :class="{ on: star <= rating }" :aria-label="`${star} stars`" @click="rating = star">★</button>
        </div>

        <div class="taste">
          <button type="button" :class="{ active: taste === 'too-bitter' }" @click="taste = 'too-bitter'">Too bitter</button>
          <button type="button" :class="{ active: taste === 'just-right' }" @click="taste = 'just-right'">Just right</button>
          <button type="button" :class="{ active: taste === 'too-sweet' }" @click="taste = 'too-sweet'">Too sweet</button>
        </div>

        <textarea v-model="note" class="note" rows="3" placeholder="Add a note, e.g. “a touch less Campari next time”" />

        <div class="done-actions">
          <button class="wide primary" type="button" @click="saveJournal">Save to journal</button>
          <button class="wide ghost" type="button" @click="router.push('/tonight')">Done</button>
        </div>
      </section>
      <section class="done-art">
        <div class="done-glow" />
        <DrinkArt :recipe="recipe" />
      </section>
    </main>

    <div v-if="flashOn" class="flash" aria-hidden="true" />
    <p v-if="store.settings.captions && stage === 'steps' && captionText" class="captions" aria-live="polite">
      {{ captionText }}
    </p>
    <div v-if="showSavedToast" class="toast" role="status">
      <span>Saved to your journal</span>
      <button type="button" @click="undoSave">Undo</button>
      <button type="button" class="open" @click="goJournal">Open</button>
    </div>
  </div>
</template>

<style scoped>
.mix-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg-base);
  color: var(--text-primary);
}

[data-text-large='true'] .mix-page {
  overflow-y: auto;
  padding-bottom: 40px;
}

[data-text-large='true'] .step {
  height: auto;
  min-height: calc(100% - 104px);
  grid-template-columns: 1fr;
  padding: 24px 40px 28px;
  gap: 28px;
}

[data-text-large='true'] .step-copy,
[data-text-large='true'] .step-visual {
  width: 100%;
}

[data-text-large='true'] .step-visual {
  min-height: 380px;
}

[data-text-large='true'] .step-foot {
  position: static;
  margin-top: 12px;
}

[data-text-large='true'] .captions {
  position: static;
  margin: 20px 40px 0;
}

[data-text-large='true'] .toast {
  position: sticky;
  bottom: 18px;
  margin: 20px auto 0;
}

.mix-head {
  position: relative;
  height: 104px;
  padding: 28px 40px 22px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.round {
  width: 44px;
  height: 44px;
  border: 1px solid var(--line-subtle);
  border-radius: 50%;
  background: var(--fill-2);
  color: var(--text-primary);
  display: grid;
  place-items: center;
  font-size: calc(20px * var(--text-scale, 1));
  line-height: 1;
  cursor: pointer;
}

.round.small {
  width: 38px;
  height: 38px;
  font-size: calc(15px * var(--text-scale, 1));
}

.round.add-time {
  width: auto;
  min-width: 76px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 600;
}

.head-title {
  font-size: calc(16px * var(--text-scale, 1));
  font-weight: 500;
}

.head-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.head-recipe {
  font-size: calc(13px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.head-btn {
  height: 38px;
  padding: 0 16px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-primary);
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
}

.progress {
  position: absolute;
  left: 100px;
  bottom: 8px;
  display: flex;
  gap: 5px;
}

.progress i {
  width: 52px;
  height: 3px;
  border-radius: 999px;
  background: var(--fill-3);
}

.progress i.is-done {
  background: var(--accent);
}

.plan {
  display: grid;
  grid-template-columns: 420px minmax(0, 1fr);
  gap: 54px;
  padding: 10px 60px 0 40px;
  height: calc(100% - 104px);
}

.plan-art {
  position: relative;
  height: 610px;
  border-radius: 26px;
  background: linear-gradient(180deg, var(--fill-2) 0%, var(--fill-1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.plan-art :deep(.glass) {
  width: 300px;
  margin-top: -20px;
}

.plan-art-glow {
  position: absolute;
  width: 330px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%);
  filter: blur(18px);
}

.plan-art-copy {
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: 26px;
}

.plan-art-copy h2 {
  margin: 0 0 10px;
  font-size: calc(24px * var(--text-scale, 1));
  line-height: calc(30px * var(--text-scale, 1));
  font-weight: 600;
}

.plan-meta {
  display: flex;
  gap: 8px;
}

.plan-meta span {
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-secondary);
  font-size: calc(12px * var(--text-scale, 1));
}

.plan-copy {
  padding-top: 18px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

h1 {
  margin: 0 0 22px;
  font-size: calc(46px * var(--text-scale, 1));
  line-height: calc(52px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.5px;
}

.plan-steps {
  border-top: 1px solid var(--line-subtle);
}

.plan-step {
  height: 54px;
  border-bottom: 1px solid var(--line-subtle);
  display: flex;
  align-items: center;
  gap: 14px;
}

.plan-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--fill-2);
  color: var(--text-secondary);
  display: grid;
  place-items: center;
  font-size: calc(12px * var(--text-scale, 1));
}

.plan-step-title {
  flex: 1;
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 500;
}

.plan-step-time {
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-tertiary);
}

.need-label {
  margin: 22px 0 10px;
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.equipment {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.equipment span {
  padding: 9px 13px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: calc(12px * var(--text-scale, 1));
}

.wide {
  height: 52px;
  border: 0;
  border-radius: 999px;
  font-size: calc(16px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.wide.primary {
  background: var(--accent);
  color: var(--text-on-accent);
}

.wide.ghost {
  background: var(--fill-2);
  color: var(--text-primary);
}

.plan-copy .wide {
  margin-top: auto;
  margin-bottom: 34px;
}

.step {
  height: calc(100% - 104px);
  padding: 20px 60px 0 100px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 460px;
  gap: 40px;
  position: relative;
  animation: step-in 300ms ease-out both;
}

@keyframes step-in {
  from {
    opacity: 0.65;
    transform: translateX(18px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-copy {
  padding-top: 50px;
}

.step-overline {
  margin: 0 0 12px;
  font-size: calc(12px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--text-secondary);
}

.step h1 {
  margin: 0 0 16px;
  font-size: calc(56px * var(--text-scale, 1));
  line-height: calc(62px * var(--text-scale, 1));
  letter-spacing: -1.8px;
}

.step-instruction {
  margin: 0;
  max-width: 470px;
  font-size: calc(16px * var(--text-scale, 1));
  line-height: calc(24px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.glass-tabs {
  display: flex;
  gap: 8px;
  margin-top: 28px;
}

.glass-tab {
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-secondary);
  font-size: calc(12px * var(--text-scale, 1));
}

.glass-tab.active {
  background: var(--accent);
  color: var(--text-on-accent);
}

.step-tip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 26px;
  padding: 11px 15px;
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-secondary);
  font-size: calc(12px * var(--text-scale, 1));
}

.step-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
}

.timer {
  position: relative;
  width: 330px;
  height: 330px;
  display: grid;
  place-items: center;
}

.timer-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-bg,
.ring-value {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
}

.ring-bg {
  stroke: var(--fill-3);
}

.ring-value {
  stroke: var(--accent);
  stroke-dasharray: 603.2;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.3s linear;
}

.ring-value.paused {
  stroke: var(--text-tertiary);
}

.timer-copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.timer-copy strong {
  font-size: calc(86px * var(--text-scale, 1));
  line-height: calc(90px * var(--text-scale, 1));
  font-weight: 300;
  letter-spacing: -4px;
}

.timer-copy span {
  font-size: calc(13px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.step-art {
  width: 360px;
  display: grid;
  place-items: center;
}

.step-art :deep(.glass) {
  width: 320px;
}

.timer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}

.timer-btn {
  height: 48px;
  padding: 0 26px;
  border: 0;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--bg-base);
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.step-foot {
  position: absolute;
  left: 100px;
  right: 60px;
  bottom: 24px;
  display: flex;
  gap: 16px;
}

.step-foot .wide:first-child {
  width: 210px;
  flex: 0 0 210px;
}

.done {
  height: calc(100% - 104px);
  padding: 36px 60px 0 100px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 450px;
  gap: 32px;
}

.done-overline {
  margin: 0 0 16px;
  color: var(--status-ready);
  font-size: calc(14px * var(--text-scale, 1));
}

.done h1 {
  margin: 0 0 12px;
  font-size: calc(72px * var(--text-scale, 1));
  line-height: calc(76px * var(--text-scale, 1));
  letter-spacing: -2.4px;
}

.done-lede {
  margin: 0;
  font-size: calc(16px * var(--text-scale, 1));
  line-height: calc(24px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.rate-label {
  margin: 28px 0 8px;
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 600;
}

.stars {
  display: flex;
  gap: 5px;
}

.stars button {
  width: 34px;
  height: 34px;
  border: 0;
  background: transparent;
  color: var(--fill-3);
  font-size: calc(30px * var(--text-scale, 1));
  line-height: 1;
  cursor: pointer;
}

.stars button.on {
  color: var(--accent);
}

.taste {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.taste button {
  height: 36px;
  padding: 0 15px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-secondary);
  font-size: calc(13px * var(--text-scale, 1));
  cursor: pointer;
}

.taste button.active {
  background: var(--text-primary);
  color: var(--bg-base);
  border-color: var(--text-primary);
}

.note {
  width: 100%;
  max-width: 540px;
  margin-top: 18px;
  padding: 14px 16px;
  border: 1px solid var(--line-subtle);
  border-radius: 16px;
  background: var(--fill-2);
  color: var(--text-primary);
  font: inherit;
  font-size: calc(14px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
  resize: none;
  outline: none;
}

.done-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.flash {
  position: absolute;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  background: #fff;
  animation: flash-pulse 0.18s steps(1) 2;
}

@keyframes flash-pulse {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 0.82;
  }
}

.captions {
  position: absolute;
  left: 240px;
  right: 240px;
  bottom: 112px;
  z-index: 20;
  margin: 0;
  padding: 14px 20px;
  border: 1px solid var(--line-subtle);
  border-radius: 14px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: calc(15px * var(--text-scale, 1));
  line-height: 1.45;
  text-align: center;
  box-shadow: var(--shadow-soft);
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 28px;
  z-index: 70;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 16px 12px 20px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: calc(14px * var(--text-scale, 1));
  box-shadow: var(--shadow-soft);
}

.toast button {
  border: 0;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.toast .open {
  color: var(--text-secondary);
}

.done-actions .wide {
  padding: 0 30px;
}

.done-actions .wide.primary {
  min-width: 210px;
}

.done-art {
  position: relative;
  display: grid;
  place-items: center;
}

.done-art :deep(.glass) {
  width: 400px;
}

.done-glow {
  position: absolute;
  width: 400px;
  height: 350px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 24%, transparent), transparent 70%);
  filter: blur(20px);
}
</style>
