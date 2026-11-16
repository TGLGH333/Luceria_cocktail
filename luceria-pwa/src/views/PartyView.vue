<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const toast = ref('')
let toastTimer: number | undefined

function showToast(message: string) {
  if (toastTimer) window.clearTimeout(toastTimer)
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2400)
}

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="party-page">
    <header class="party-top">
      <button class="round" type="button" aria-label="Back" @click="router.push('/journal')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <h1>Host a party</h1>
      <span class="flex" />
      <div class="segmented" role="tablist" aria-label="Party mode">
        <button type="button" role="tab" :aria-selected="false" @click="showToast('Party planner is coming next.')">Planner</button>
        <button class="selected" type="button" role="tab" :aria-selected="true">Games</button>
      </div>
    </header>

    <main class="content">
      <div class="content-head">
        <h2>Pick a game</h2>
        <p>It opens full screen. Pass the iPad around the table.</p>
      </div>

      <div class="games">
        <article class="game-card">
          <div class="preview dice-preview" aria-hidden="true">
            <span class="die">
              <i class="p1" /><i class="p3" /><i class="p5" /><i class="p7" /><i class="p9" />
            </span>
            <span class="die mid">
              <i class="p1" /><i class="p3" /><i class="p4" /><i class="p6" /><i class="p7" /><i class="p9" />
            </span>
            <span class="die third">
              <i class="p5" />
            </span>
          </div>
          <div class="game-copy">
            <h3>Dice</h3>
            <p>Roll up to five dice. Highest roll picks the next drink.</p>
            <div class="game-meta">
              <span>2–10 players · 1 min</span>
              <button type="button" @click="router.push('/party/dice')">Play</button>
            </div>
          </div>
        </article>

        <article class="game-card">
          <div class="preview wheel-preview" aria-hidden="true">
            <span class="wheel">
              <i v-for="segment in 8" :key="segment" :style="{ transform: `rotate(${segment * 45}deg)` }" />
              <b />
            </span>
          </div>
          <div class="game-copy">
            <h3>Spin the wheel</h3>
            <p>Eight forfeits and treats. Edit them to suit your crowd.</p>
            <div class="game-meta">
              <span>Any group · 30 s a turn</span>
              <button type="button" @click="router.push('/party/wheel')">Play</button>
            </div>
          </div>
        </article>
      </div>
    </main>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.party-page {
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 42px 40px 40px;
  background: var(--bg-base);
  color: var(--text-primary);
  scrollbar-width: none;
}

.party-page::-webkit-scrollbar {
  display: none;
}

.party-top {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 52px;
}

.party-top .round {
  width: 52px;
  height: 52px;
}

.party-top h1 {
  margin: 0;
  font-size: calc(20px * var(--text-scale, 1));
  line-height: calc(26px * var(--text-scale, 1));
  font-weight: 600;
}

.flex {
  flex: 1;
}

.segmented {
  display: flex;
  gap: 0;
  padding: 4px;
  border-radius: 999px;
  background: var(--fill-1);
}

.segmented button {
  height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
}

.segmented button.selected {
  background: var(--fill-3);
  color: var(--text-primary);
}

.content {
  margin-top: 24px;
}

.content-head h2 {
  margin: 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.content-head p {
  margin: 4px 0 0;
  color: var(--text-secondary);
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(26px * var(--text-scale, 1));
}

.games {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 24px;
}

.game-card {
  height: 544px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px;
  background: var(--fill-1);
}

.preview {
  position: relative;
  height: 300px;
  overflow: hidden;
  background: var(--fill-2);
}

.dice-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
}

.die {
  position: relative;
  display: block;
  width: 132px;
  height: 132px;
  border-radius: 28px;
  background: #f6ebd6;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.32);
  transform: rotate(-8deg);
}

.die.mid {
  transform: rotate(5deg) translateY(-10px);
}

.die.third {
  transform: rotate(12deg);
  background: #efe1c7;
}

.die i {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #7e1f2a;
}

.die.third i {
  background: #d9473a;
}

.p1 { left: 20%; top: 20%; }
.p2 { left: 50%; top: 20%; transform: translateX(-50%); }
.p3 { right: 20%; top: 20%; }
.p4 { left: 20%; top: 50%; transform: translateY(-50%); }
.p5 { left: 50%; top: 50%; transform: translate(-50%, -50%); }
.p6 { right: 20%; top: 50%; transform: translateY(-50%); }
.p7 { left: 20%; bottom: 20%; }
.p8 { left: 50%; bottom: 20%; transform: translateX(-50%); }
.p9 { right: 20%; bottom: 20%; }

.wheel-preview {
  display: grid;
  place-items: center;
}

.wheel {
  position: relative;
  display: block;
  width: 230px;
  height: 230px;
  border-radius: 50%;
  background: #f6ebd6;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.35);
}

.wheel i {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 50%;
  background: rgba(30, 24, 18, 0.2);
  transform-origin: 50% 100%;
}

.wheel b {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--accent);
  transform: translate(-50%, -50%);
}

.game-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.game-copy h3 {
  margin: 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.game-copy p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(26px * var(--text-scale, 1));
}

.game-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
  padding-top: 22px;
}

.game-meta span {
  color: var(--text-tertiary);
  font-size: calc(13px * var(--text-scale, 1));
}

.game-meta button {
  min-width: 96px;
  height: 52px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: calc(17px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 44px;
  transform: translateX(-50%);
  z-index: 20;
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--bg-base);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}

[data-text-large='true'] .games {
  grid-template-columns: 1fr;
}

[data-text-large='true'] .game-card {
  max-width: 640px;
}
</style>
