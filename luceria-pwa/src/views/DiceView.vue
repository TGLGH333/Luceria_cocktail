<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const count = ref(3)
const dice = ref([4, 6, 1])
const history = ref([10, 13, 11])
const rolling = ref(false)
const hasRolled = ref(false)
let rollTimer: number | undefined
let tickTimer: number | undefined

const pipMap: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
}

const total = computed(() => dice.value.reduce((sum, value) => sum + value, 0))

function setCount(value: number) {
  if (rolling.value) return
  count.value = value
  dice.value = Array.from({ length: value }, () => 1)
  hasRolled.value = false
}

function roll() {
  if (rolling.value) return
  if (rollTimer) window.clearTimeout(rollTimer)
  rolling.value = true
  hasRolled.value = false
  if (tickTimer) window.clearInterval(tickTimer)
  tickTimer = window.setInterval(() => {
    dice.value = dice.value.map(() => 1 + Math.floor(Math.random() * 6))
  }, 70)

  rollTimer = window.setTimeout(() => {
    if (tickTimer) window.clearInterval(tickTimer)
    tickTimer = undefined
    dice.value = dice.value.map(() => 1 + Math.floor(Math.random() * 6))
    rolling.value = false
    hasRolled.value = true
    history.value = [dice.value.reduce((sum, value) => sum + value, 0), ...history.value].slice(0, 4)
  }, 680)
}

function close() {
  router.push('/party')
}

onBeforeUnmount(() => {
  if (rollTimer) window.clearTimeout(rollTimer)
  if (tickTimer) window.clearInterval(tickTimer)
})
</script>

<template>
  <div class="dice-page">
    <header class="game-top">
      <button class="round" type="button" aria-label="Close game" @click="close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <h1>Dice</h1>
      <span class="flex" />
      <span class="game-label">Dice</span>
      <div class="segmented" role="group" aria-label="Number of dice">
        <button v-for="value in [2, 3, 5]" :key="value" type="button" :class="{ selected: count === value }" @click="setCount(value)">
          {{ value }}
        </button>
      </div>
    </header>

    <section class="table" :class="{ rolling }" aria-live="polite">
      <div v-for="(value, index) in dice" :key="index" class="die" :class="{ odd: index % 2 === 0 }">
        <i v-for="pos in pipMap[value]" :key="pos" :class="`p${pos}`" />
      </div>
    </section>

    <section class="result">
      <div class="last">
        <p>{{ hasRolled ? 'New roll' : 'Last roll' }}</p>
        <strong>{{ total }}</strong>
      </div>
      <span class="result-line" />
      <p class="history">History {{ history.slice(0, 3).join(' · ') }}</p>
      <button class="roll" type="button" :disabled="rolling" @click="roll">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 12a8 8 0 1 1-2.3-5.7" />
          <path d="M20 4v5h-5" />
        </svg>
        {{ hasRolled ? 'Roll again' : 'Roll' }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.dice-page {
  height: 100%;
  overflow-y: auto;
  padding: 42px 40px 40px;
  background: #0c0b0a;
  color: var(--text-primary);
  scrollbar-width: none;
}

.dice-page::-webkit-scrollbar {
  display: none;
}

.game-top {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 56px;
}

.game-top .round {
  width: 56px;
  height: 56px;
  background: #282522;
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

.game-label {
  color: var(--text-secondary);
  font-size: calc(15px * var(--text-scale, 1));
}

.segmented {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 999px;
  background: #1d1b19;
}

.segmented button {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: calc(15px * var(--text-scale, 1));
  cursor: pointer;
}

.segmented button.selected {
  background: #282522;
  color: var(--text-primary);
}

.table {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  height: 440px;
  margin-top: 32px;
  padding: 24px;
  border-radius: 24px;
  background: #1d1b19;
}

.die {
  position: relative;
  width: 170px;
  height: 170px;
  flex: none;
  border-radius: 34px;
  background: #f6ebd6;
  box-shadow: 0 26px 48px rgba(0, 0, 0, 0.38);
  transform: rotate(-3deg);
}

.die:nth-child(2n) {
  transform: translateY(-18px) rotate(4deg);
}

.die:nth-child(3n) {
  transform: translateY(8px) rotate(8deg);
}

.die.odd {
  background: #efe1c7;
}

.die i {
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #7e1f2a;
}

.die:nth-child(3) i {
  background: #d9473a;
}

.p1 { left: 18%; top: 18%; }
.p2 { left: 50%; top: 18%; transform: translateX(-50%); }
.p3 { right: 18%; top: 18%; }
.p4 { left: 18%; top: 50%; transform: translateY(-50%); }
.p5 { left: 50%; top: 50%; transform: translate(-50%, -50%); }
.p6 { right: 18%; top: 50%; transform: translateY(-50%); }
.p7 { left: 18%; bottom: 18%; }
.p8 { left: 50%; bottom: 18%; transform: translateX(-50%); }
.p9 { right: 18%; bottom: 18%; }

.table.rolling .die {
  animation: shake 0.18s linear infinite;
}

@keyframes shake {
  0% { transform: rotate(-4deg) scale(0.98); }
  50% { transform: rotate(4deg) scale(1.02); }
  100% { transform: rotate(-4deg) scale(0.98); }
}

.result {
  display: flex;
  align-items: center;
  gap: 22px;
  height: 120px;
  margin-top: 12px;
}

.last {
  min-width: 285px;
}

.last p {
  margin: 0;
  color: var(--text-secondary);
  font-size: calc(15px * var(--text-scale, 1));
}

.last strong {
  display: block;
  margin-top: 2px;
  font-size: calc(48px * var(--text-scale, 1));
  line-height: calc(58px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.result-line {
  flex: 1;
  height: 1px;
  background: var(--line-subtle);
}

.history {
  margin: 0;
  color: var(--text-tertiary);
  font-size: calc(15px * var(--text-scale, 1));
  white-space: nowrap;
}

.roll {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 260px;
  height: 88px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.roll:disabled {
  opacity: 0.7;
  cursor: wait;
}

[data-text-large='true'] .table {
  height: auto;
  min-height: 300px;
  flex-wrap: wrap;
  padding: 32px 24px;
}

[data-text-large='true'] .result {
  height: auto;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  padding: 24px 0;
}

[data-text-large='true'] .result-line {
  display: none;
}

[data-text-large='true'] .last {
  min-width: 0;
}

[data-text-large='true'] .history {
  white-space: normal;
}

[data-text-large='true'] .roll {
  width: 100%;
  max-width: 360px;
  height: auto;
  min-height: 88px;
  padding-block: 16px;
}

@media (prefers-reduced-motion: reduce) {
  .table.rolling .die {
    animation: none;
  }
}
</style>
