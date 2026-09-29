import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import { pinia } from '../pinia'
import { useAuthStore } from '../stores/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: { name: 'dashboard' } },
    { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: Register, meta: { guestOnly: true } },
    { path: '/dashboard', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore(pinia)
  // localStorage/store token is checked as a fast signal; `/users/me` is the
  // source of truth because the current API keeps its JWT in an HttpOnly cookie.
  const hasStoredToken = Boolean(auth.token || localStorage.getItem('access_token'))
  if (!auth.initialized || (hasStoredToken && !auth.user)) await auth.restoreSession()
  const authenticated = auth.isAuthenticated
  if (to.meta.requiresAuth && !authenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.guestOnly && authenticated) return { name: 'dashboard' }
})
