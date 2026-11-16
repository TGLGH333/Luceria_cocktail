<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('mira@luceria.app')
const error = ref('')

function send() {
  const value = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error.value = 'Enter a valid email address.'
    return
  }
  error.value = ''
  router.push({ path: '/signin/code', query: { email: value } })
}
</script>

<template>
  <div class="email-page">
    <header class="top">
      <button class="round" type="button" aria-label="Back" @click="router.push('/signin')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
    </header>

    <main class="content">
      <h1>Sign in with email</h1>
      <p class="lede">We’ll email you a 6-digit code. No password needed.</p>

      <label class="field-label" for="email">Email</label>
      <div class="field" :class="{ invalid: error }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M4 7l8 6 8-6" />
        </svg>
        <input id="email" v-model="email" type="email" inputmode="email" autocomplete="email" @keyup.enter="send" />
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <button class="send" type="button" @click="send">Send code</button>
      <p class="fine">We’ll only use this to sync your bar and journal.</p>
    </main>
  </div>
</template>

<style scoped>
.email-page {
  height: 100%;
  overflow-y: auto;
  padding: 40px;
  background: var(--bg-base);
  color: var(--text-primary);
}

.top {
  height: 52px;
}

.top .round {
  width: 52px;
  height: 52px;
}

.content {
  width: 520px;
  max-width: 100%;
  margin: 58px auto 0;
}

h1 {
  margin: 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.lede {
  margin: 18px 0 0;
  color: var(--text-secondary);
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(26px * var(--text-scale, 1));
}

.field-label {
  display: block;
  margin: 30px 0 8px;
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 600;
}

.field {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 60px;
  padding: 0 18px;
  border: 1px solid var(--line-strong);
  border-radius: 16px;
  background: var(--fill-1);
  color: var(--text-secondary);
}

.field:focus-within {
  border-color: var(--accent);
  outline: 2px solid color-mix(in srgb, var(--accent) 32%, transparent);
}

.field.invalid {
  border-color: var(--status-out);
}

.field input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: calc(17px * var(--text-scale, 1));
}

.error {
  margin: 8px 0 0;
  color: var(--status-out);
  font-size: calc(14px * var(--text-scale, 1));
}

.send {
  width: 100%;
  height: 60px;
  margin-top: 20px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.fine {
  margin: 18px 0 0;
  color: var(--text-tertiary);
  font-size: calc(13px * var(--text-scale, 1));
  text-align: center;
}

[data-text-large='true'] .content {
  margin-top: 24px;
}
</style>
