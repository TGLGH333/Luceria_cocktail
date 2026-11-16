<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()

const email = computed(() => String(route.query.email || 'mira@luceria.app'))
const digits = ref<string[]>(['', '', '', '', '', ''])
const error = ref('')
const inputs = ref<HTMLInputElement[]>([])
const seconds = ref(42)
const resendLabel = computed(() => `Resend in 0:${String(seconds.value).padStart(2, '0')}`)
let timer: number | undefined

function focus(index: number) {
  nextTick(() => inputs.value[Math.max(0, Math.min(5, index))]?.focus())
}

function onInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(-1)
  digits.value[index] = value
  target.value = value
  error.value = ''
  if (value && index < 5) focus(index + 1)
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    focus(index - 1)
  }
  if (event.key === 'ArrowLeft') focus(index - 1)
  if (event.key === 'ArrowRight') focus(index + 1)
}

function onPaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
  if (!text) return
  event.preventDefault()
  digits.value = Array.from({ length: 6 }, (_, index) => text[index] ?? '')
  focus(text.length - 1)
}

function verify() {
  const code = digits.value.join('')
  if (code.length !== 6) {
    error.value = 'Enter all 6 digits.'
    return
  }
  store.signIn(email.value)
  router.push('/tonight')
}

function resend() {
  if (seconds.value > 0) return
  seconds.value = 42
  digits.value = ['', '', '', '', '', '']
  error.value = ''
  focus(0)
}

onMounted(() => {
  focus(0)
  timer = window.setInterval(() => {
    if (seconds.value > 0) seconds.value -= 1
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <div class="code-page">
    <header class="top">
      <button class="round" type="button" aria-label="Back" @click="router.push('/signin/email')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
    </header>

    <main class="content">
      <h1>Check your email</h1>
      <p class="lede">We sent a code to {{ email }}. It expires in 10 minutes.</p>

      <div class="digits" @paste="onPaste">
        <input
          v-for="(_, index) in digits"
          :key="index"
          ref="inputs"
          :value="digits[index]"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="1"
          :aria-label="`Digit ${index + 1}`"
          @input="onInput(index, $event)"
          @keydown="onKeydown(index, $event)"
        />
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>

      <button class="resend" type="button" :disabled="seconds > 0" @click="resend">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        {{ seconds > 0 ? resendLabel : 'Resend code' }}
      </button>

      <button class="verify" type="button" @click="verify">Verify</button>
      <p class="hint">Demo mode: any 6 digits will sign you in.</p>
    </main>
  </div>
</template>

<style scoped>
.code-page {
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

.digits {
  display: grid;
  grid-template-columns: repeat(6, 64px);
  gap: 12px;
  margin-top: 30px;
}

.digits input {
  width: 64px;
  height: 76px;
  border: 1px solid var(--line-subtle);
  border-radius: 14px;
  outline: 0;
  background: var(--fill-1);
  color: var(--text-primary);
  font: inherit;
  font-size: calc(40px * var(--text-scale, 1));
  font-weight: 700;
  text-align: center;
  caret-color: var(--accent);
}

.digits input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 26%, transparent);
}

.error {
  margin: 10px 0 0;
  color: var(--status-out);
  font-size: calc(14px * var(--text-scale, 1));
}

.resend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 22px 0 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  font-size: calc(15px * var(--text-scale, 1));
  cursor: pointer;
}

.resend:disabled {
  color: var(--text-tertiary);
  cursor: default;
}

.verify {
  width: 100%;
  height: 60px;
  margin-top: 22px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.hint {
  margin: 16px 0 0;
  color: var(--text-tertiary);
  font-size: calc(13px * var(--text-scale, 1));
  text-align: center;
}

[data-text-large='true'] .digits {
  grid-template-columns: repeat(6, minmax(44px, 64px));
}

[data-text-large='true'] .content {
  margin-top: 24px;
}
</style>
