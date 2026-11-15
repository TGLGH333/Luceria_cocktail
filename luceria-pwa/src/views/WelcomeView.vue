<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DrinkGlass from '../components/DrinkGlass.vue'

const router = useRouter()
const toast = ref('')

function start() {
  router.push('/tonight')
}

function account() {
  toast.value = 'Accounts are not part of this demo yet.'
  window.setTimeout(() => {
    toast.value = ''
  }, 2400)
}
</script>

<template>
  <div class="welcome">
    <div class="art" aria-hidden="true">
      <DrinkGlass liquid="#F0A64B" hue="#2E1C1D" />
    </div>

    <div class="copy">
      <p class="eyebrow">Welcome to Luceria</p>
      <h1>Your bar,<br />tonight.</h1>
      <p class="lede">
        Tell us what’s in your bar and we’ll show what you can make, then guide you through
        every step.
      </p>

      <ul class="points">
        <li><span>▤</span> Cocktails from the bottles you own</li>
        <li><span>◷</span> Hands-free, step-by-step mixing</li>
        <li><span>▱</span> A list that knows what unlocks the most</li>
      </ul>

      <div class="actions">
        <button class="primary" type="button" @click="start">Get started</button>
        <button class="ghost" type="button" @click="account">I have an account</button>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.welcome {
  position: relative;
  height: 100%;
  overflow: hidden;
  padding: 54px 40px 40px;
  background:
    radial-gradient(1100px 760px at 78% 42%, rgba(240, 166, 75, 0.12), transparent 62%),
    radial-gradient(900px 620px at 18% 0%, rgba(180, 70, 45, 0.16), transparent 65%),
    var(--bg-base);
  color: var(--text-primary);
}

.art {
  position: absolute;
  right: -10px;
  top: 76px;
  width: 520px;
  opacity: 0.95;
  filter: drop-shadow(0 40px 70px rgba(0, 0, 0, 0.45));
  pointer-events: none;
}

.copy {
  position: relative;
  z-index: 1;
  width: 560px;
  padding-top: 32px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: calc(12px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: calc(88px * var(--text-scale, 1));
  line-height: 0.95;
  font-weight: 700;
  letter-spacing: -4px;
}

.lede {
  max-width: 470px;
  margin: 18px 0 0;
  color: var(--text-secondary);
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(25px * var(--text-scale, 1));
}

.points {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 34px 0 0;
  padding: 0;
  list-style: none;
  color: var(--text-secondary);
  font-size: calc(16px * var(--text-scale, 1));
}

.points li {
  display: flex;
  align-items: center;
  gap: 15px;
}

.points span {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--fill-2);
  color: var(--text-primary);
  display: grid;
  place-items: center;
  font-size: calc(15px * var(--text-scale, 1));
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 52px;
}

button {
  height: 52px;
  border: 0;
  border-radius: 999px;
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.primary {
  min-width: 138px;
  background: var(--accent);
  color: var(--text-on-accent);
}

.ghost {
  min-width: 168px;
  background: var(--fill-2);
  color: var(--text-primary);
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 42px;
  transform: translateX(-50%);
  max-width: calc(100% - 80px);
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--text-on-accent);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
}

[data-text-large='true'] .welcome {
  overflow-y: auto;
  padding: 54px 40px 96px;
  scrollbar-width: thin;
}

[data-text-large='true'] .art {
  display: none;
}

[data-text-large='true'] .copy {
  width: 100%;
  max-width: 900px;
  padding-top: 0;
}

[data-text-large='true'] h1 {
  font-size: calc(76px * var(--text-scale, 1));
  letter-spacing: -2px;
}

[data-text-large='true'] .lede {
  max-width: 760px;
}

[data-text-large='true'] .points {
  max-width: 760px;
}

[data-text-large='true'] .points span {
  width: 48px;
  height: 48px;
  flex: none;
}

[data-text-large='true'] .actions {
  flex-wrap: wrap;
  margin-top: 36px;
}

[data-text-large='true'] .actions button {
  height: auto;
  min-height: 60px;
  padding: 0 24px;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>
