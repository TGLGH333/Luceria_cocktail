import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { applyDemoReset } from './demoReset'
import './styles/tokens.css'
import './styles/base.css'

// Must run before any store is created, because stores read localStorage when
// they are first instantiated.
applyDemoReset()

createApp(App).use(createPinia()).use(router).mount('#app')

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline shell is an enhancement; the app still works without it.
    })
  })
}
