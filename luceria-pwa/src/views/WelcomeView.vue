<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function start() {
  router.push('/tonight')
}

function account() {
  router.push('/signin')
}
</script>

<template>
  <div class="welcome">
    <div class="art" aria-hidden="true">
      <img class="art-negroni" src="/art/negroni.png" alt="" />
      <img class="art-margarita" src="/art/margarita.png" alt="" />
      <img class="art-russian" src="/art/black-russian.png" alt="" />
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
  right: 94px;
  top: 110px;
  width: 500px;
  height: 620px;
  pointer-events: none;
}

.art img {
  position: absolute;
  object-fit: contain;
  filter: drop-shadow(0 30px 55px rgba(0, 0, 0, 0.42));
}

.art-negroni {
  width: 60%;
  height: 63%;
  left: 20%;
  top: 0;
}

.art-margarita {
  width: 50%;
  height: 27%;
  left: 0;
  top: 61%;
}

.art-russian {
  width: 40.6%;
  height: 42%;
  left: 58.6%;
  top: 48%;
}

.copy {
  position: relative;
  z-index: 1;
  width: 560px;
  padding-top: 76px;
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
  line-height: calc(92px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -4px;
}

.lede {
  max-width: 480px;
  margin: 18px 0 0;
  color: var(--text-secondary);
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(25px * var(--text-scale, 1));
}

.points {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 40px 0 0;
  padding: 0;
  list-style: none;
  color: var(--text-primary);
  font-size: calc(17px * var(--text-scale, 1));
}

.points li {
  display: flex;
  align-items: center;
  gap: 14px;
}

.points span {
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 50%;
  background: var(--fill-2);
  color: var(--text-primary);
  display: grid;
  place-items: center;
  font-size: calc(17px * var(--text-scale, 1));
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 46px;
}

button {
  min-width: 220px;
  height: 64px;
  padding: 0 24px;
  border: 0;
  border-radius: 999px;
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.primary {
  background: var(--accent);
  color: var(--text-on-accent);
}

.ghost {
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
  scrollbar-width: none;
}

[data-text-large='true'] .welcome::-webkit-scrollbar {
  display: none;
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
