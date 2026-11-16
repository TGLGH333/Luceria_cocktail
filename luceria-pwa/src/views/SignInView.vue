<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const store = useDemoStore()
const toast = ref('')
let toastTimer: number | undefined

const ready = computed(() => store.counts.ready)

function showToast(message: string) {
  if (toastTimer) window.clearTimeout(toastTimer)
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2400)
}

function guest() {
  router.push('/tonight')
}

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="signin-page">
    <header class="onboarding-top">
      <div class="steps" aria-label="Step 5 of 5">
        <i />
        <i />
        <i />
        <i />
        <i class="wide" />
      </div>
      <span class="step-label">Step 5 of 5</span>
      <button class="skip" type="button" @click="guest">Skip</button>
    </header>

    <main class="content">
      <section class="copy">
        <h1>Keep your bar safe</h1>
        <p class="lede">Sign in to sync your bar, saved drinks and journal across devices. You can do this later.</p>

        <div class="providers">
          <button class="provider apple" type="button" @click="showToast('Apple sign-in is not connected in this demo.')">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.4 12.9c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.5-.2-2.9.9-3.6.9-.8 0-1.9-.9-3.1-.9-1.6 0-3.1.9-3.9 2.3-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.3.9-1.4 1.3-2.8 1.3-2.9-.1 0-2.9-1.1-2.9-4.6zM14.2 5.9c.7-.9 1.1-2.1 1-3.3-1 .1-2.2.7-2.9 1.6-.6.7-1.2 2-1.1 3.1 1.1.1 2.2-.5 3-1.4z" />
            </svg>
            Continue with Apple
          </button>
          <button class="provider google" type="button" @click="showToast('Google sign-in is not connected in this demo.')">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7.1 0-.7-.1-1.4-.2-2.1H12z" />
              <path fill="#34A853" d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.1-2.4c-.9.6-2 .9-3.5.9-2.6 0-4.8-1.7-5.6-4.1l-3.2 2.5C5 19.9 8.2 22 12 22z" />
              <path fill="#FBBC05" d="M6.4 14c-.2-.7-.3-1.3-.3-2s.1-1.3.3-2L3.2 7.5C2.4 9 2 10.5 2 12s.4 3 1.2 4.5L6.4 14z" />
              <path fill="#4285F4" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3 14.7 2 12 2 8.2 2 5 4.1 3.2 7.5L6.4 10c.8-2.4 3-4.1 5.6-4.1z" />
            </svg>
            Continue with Google
          </button>
          <button class="provider email" type="button" @click="router.push('/signin/email')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M4 7l8 6 8-6" />
            </svg>
            Continue with email
          </button>
        </div>

        <p class="terms">By continuing you agree to the Terms and Privacy Policy.</p>
      </section>

      <aside class="summary">
        <p class="summary-title">You’re all set</p>
        <p class="summary-line">
          <span>▤</span>
          {{ store.barCount }} ingredients in your bar
        </p>
        <p class="summary-line">
          <span>✦</span>
          Sour, bitter and fruity
        </p>
        <p class="summary-line">
          <span>◐</span>
          Automatic theme · larger text
        </p>
        <hr />
        <p class="summary-ready">
          <span>✓</span>
          {{ ready }} cocktails ready tonight
        </p>
      </aside>
    </main>

    <footer class="onboarding-foot">
      <button class="round" type="button" aria-label="Back" @click="router.push('/welcome')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <button class="guest" type="button" @click="guest">
        Continue as guest
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </footer>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.signin-page {
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 40px 40px 30px;
  background: var(--bg-base);
  color: var(--text-primary);
  scrollbar-width: none;
}

.signin-page::-webkit-scrollbar {
  display: none;
}

.onboarding-top {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 48px;
}

.steps {
  display: flex;
  align-items: center;
  gap: 8px;
}

.steps i {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--accent);
}

.steps i.wide {
  width: 40px;
}

.step-label {
  font-size: calc(13px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.skip {
  margin-left: auto;
  width: 87px;
  height: 48px;
  border: 0;
  border-radius: 999px;
  background: var(--fill-1);
  color: var(--text-primary);
  font-size: calc(17px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.content {
  display: grid;
  grid-template-columns: 638px 420px;
  gap: 56px;
  padding: 42px 0 0;
}

h1 {
  margin: 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.lede {
  width: 460px;
  max-width: 100%;
  margin: 16px 0 0;
  color: var(--text-secondary);
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(26px * var(--text-scale, 1));
}

.providers {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  width: 440px;
}

.provider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 64px;
  border: 0;
  border-radius: 999px;
  font-size: calc(17px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.provider.apple {
  background: var(--text-primary);
  color: var(--bg-base);
}

.provider.google {
  background: var(--fill-1);
  color: var(--text-primary);
}

.provider.email {
  background: var(--fill-2);
  color: var(--text-primary);
}

.terms {
  width: 440px;
  margin: 22px 0 0;
  color: var(--text-tertiary);
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
}

.summary {
  align-self: start;
  margin-top: 81px;
  padding: 30px;
  border-radius: 24px;
  background: var(--fill-1);
}

.summary-title {
  margin: 0 0 18px;
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
}

.summary-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 14px;
  font-size: calc(17px * var(--text-scale, 1));
  line-height: calc(24px * var(--text-scale, 1));
}

.summary-line span {
  width: 20px;
  color: var(--text-secondary);
  text-align: center;
}

.summary hr {
  margin: 18px 0 16px;
  border: 0;
  border-top: 1px solid var(--line-subtle);
}

.summary-ready {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: var(--status-ready);
  font-size: calc(17px * var(--text-scale, 1));
  font-weight: 600;
}

.onboarding-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 142px;
}

.onboarding-foot .round {
  width: 64px;
  height: 64px;
}

.guest {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 280px;
  height: 64px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 48px;
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

[data-text-large='true'] .signin-page {
  padding-bottom: 80px;
}

[data-text-large='true'] .content {
  grid-template-columns: 1fr;
  gap: 36px;
}

[data-text-large='true'] .lede,
[data-text-large='true'] .providers,
[data-text-large='true'] .terms {
  width: 100%;
  max-width: 760px;
}

[data-text-large='true'] .summary {
  width: 100%;
  max-width: 760px;
  margin-top: 0;
}

[data-text-large='true'] .onboarding-foot {
  flex-wrap: wrap;
  margin-top: 40px;
}
</style>
