import { createRouter, createWebHashHistory } from 'vue-router'
import TonightView from './views/TonightView.vue'
import RecipesView from './views/RecipesView.vue'
import RecipeView from './views/RecipeView.vue'
import MixView from './views/MixView.vue'
import BarView from './views/BarView.vue'
import ListView from './views/ListView.vue'
import JournalView from './views/JournalView.vue'
import SettingsView from './views/SettingsView.vue'
import WelcomeView from './views/WelcomeView.vue'
import LaunchView from './views/LaunchView.vue'
import SignInView from './views/SignInView.vue'
import EmailSignInView from './views/EmailSignInView.vue'
import VerifyCodeView from './views/VerifyCodeView.vue'
import PartyView from './views/PartyView.vue'
import DiceView from './views/DiceView.vue'
import WheelView from './views/WheelView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'launch', component: LaunchView, meta: { transition: 'none' } },
    { path: '/welcome', name: 'welcome', component: WelcomeView, meta: { transition: 'none' } },
    { path: '/signin', name: 'signin', component: SignInView, meta: { transition: 'push' } },
    { path: '/signin/email', name: 'signin-email', component: EmailSignInView, meta: { transition: 'push' } },
    { path: '/signin/code', name: 'signin-code', component: VerifyCodeView, meta: { transition: 'push' } },
    { path: '/party', name: 'party', component: PartyView, meta: { transition: 'push' } },
    { path: '/party/dice', name: 'party-dice', component: DiceView, meta: { transition: 'push' } },
    { path: '/party/wheel', name: 'party-wheel', component: WheelView, meta: { transition: 'push' } },
    { path: '/tonight', name: 'tonight', component: TonightView, meta: { tab: 'tonight', transition: 'none' } },
    { path: '/recipes', name: 'recipes', component: RecipesView, meta: { tab: 'recipes', transition: 'none' } },
    { path: '/recipe/:slug', name: 'recipe', component: RecipeView, meta: { transition: 'push' } },
    { path: '/mix/:slug', name: 'mix', component: MixView, meta: { transition: 'push' } },
    { path: '/bar', name: 'bar', component: BarView, meta: { tab: 'bar', transition: 'none' } },
    { path: '/list', name: 'list', component: ListView, meta: { tab: 'list', transition: 'none' } },
    { path: '/journal', name: 'journal', component: JournalView, meta: { tab: 'journal', transition: 'none' } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { transition: 'none' } },
    { path: '/:pathMatch(.*)*', redirect: '/tonight' },
  ],
})

export default router
