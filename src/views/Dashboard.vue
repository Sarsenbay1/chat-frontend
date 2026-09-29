<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useUsersFetch } from '../composables/useUsersFetch'
import type { UserSortField } from '../types/user'

const auth = useAuthStore()
const { users, total, totalPages, loading, error, search, sortBy, page, setSort, setPage, refresh } = useUsersFetch()
function onSortChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value as UserSortField
  setSort(value)
}
</script>

<template>
  <main class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white"><div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><div><p class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Realtime chat</p><h1 class="mt-1 text-xl font-bold text-slate-900">Пользователи</h1></div><div class="flex items-center gap-4"><div class="hidden text-right sm:block"><p class="font-semibold text-slate-900">{{ auth.user?.username }}</p><p class="text-sm text-slate-500">{{ auth.user?.email }}</p></div><button class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="auth.logout()">Выйти</button></div></div></header>
    <section class="mx-auto max-w-6xl px-5 py-10"><div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h2 class="text-2xl font-bold tracking-tight text-slate-900">Участники</h2><p class="mt-1 text-sm text-slate-500">Всего пользователей: {{ total }}</p></div><div class="flex flex-col gap-3 sm:flex-row"><label class="text-sm font-medium text-slate-600">Поиск<input v-model="search" type="search" placeholder="Имя или email" class="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-64" /></label><label class="text-sm font-medium text-slate-600">Сортировать по<select :value="sortBy" class="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-48" @change="onSortChange"><option value="created_at">Дате регистрации</option><option value="username">Имени</option><option value="email">Email</option></select></label></div></div>
      <div v-if="error" role="alert" class="mb-4 flex items-center justify-between rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{{ error }}</span><button class="font-semibold underline" @click="refresh">Повторить</button></div>
      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div v-if="loading" class="p-10 text-center text-sm text-slate-500">Загружаем пользователей…</div><div v-else-if="users.length === 0" class="p-10 text-center text-sm text-slate-500">Пользователи не найдены.</div><table v-else class="w-full text-left text-sm"><thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-6 py-4 font-semibold">Пользователь</th><th class="px-6 py-4 font-semibold">Email</th><th class="hidden px-6 py-4 font-semibold sm:table-cell">ID</th></tr></thead><tbody class="divide-y divide-slate-100"><tr v-for="person in users" :key="person.id" class="hover:bg-slate-50"><td class="px-6 py-4"><div class="flex items-center gap-3"><div class="flex size-10 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700">{{ person.username.slice(0, 1).toUpperCase() }}</div><span class="font-semibold text-slate-900">{{ person.username }}</span></div></td><td class="px-6 py-4 text-slate-600">{{ person.email }}</td><td class="hidden px-6 py-4 font-mono text-xs text-slate-400 sm:table-cell">{{ person.id }}</td></tr></tbody></table></div>
      <nav v-if="totalPages > 1" aria-label="Страницы пользователей" class="mt-5 flex items-center justify-between"><button :disabled="page <= 1" class="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40" @click="setPage(page - 1)">Назад</button><span class="text-sm text-slate-500">Страница {{ page }} из {{ totalPages }}</span><button :disabled="page >= totalPages" class="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40" @click="setPage(page + 1)">Далее</button></nav>
    </section>
  </main>
</template>
