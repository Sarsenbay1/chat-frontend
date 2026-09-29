import { computed, onScopeDispose, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService } from '../services/userService'
import { getApiError } from '../services/axiosInstance'
import type { User, UserSortField } from '../types/user'

const PAGE_SIZE = 20
const DEBOUNCE_MS = 300
const SORT_FIELDS = new Set<UserSortField>(['username', 'email', 'created_at'])
function queryValue(value: unknown): string { return typeof value === 'string' ? value : '' }
function validSort(value: unknown): UserSortField { return SORT_FIELDS.has(value as UserSortField) ? value as UserSortField : 'created_at' }

export function useUsersFetch() {
  const route = useRoute()
  const router = useRouter()
  const users = ref<User[]>([])
  const total = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)
  const error = ref('')
  const search = ref(queryValue(route.query.search))
  const sortBy = ref<UserSortField>(validSort(route.query.sortBy))
  const page = computed(() => Math.max(1, Number(route.query.page) || 1))
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let activeController: AbortController | undefined
  let requestId = 0

  async function fetchUsers(): Promise<void> {
    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    const currentRequest = ++requestId
    loading.value = true
    error.value = ''
    try {
      const result = await userService.list({
        search: queryValue(route.query.search) || undefined,
        sortBy: validSort(route.query.sortBy),
        sortOrder: 'asc',
        page: Math.max(1, Number(route.query.page) || 1),
        limit: PAGE_SIZE,
      }, controller.signal)
      if (currentRequest !== requestId) return
      users.value = result.items
      total.value = result.pagination.total
      totalPages.value = result.pagination.total_pages
    } catch (cause) {
      if (controller.signal.aborted || currentRequest !== requestId) return
      error.value = getApiError(cause, 'Не удалось загрузить список пользователей.')
    } finally {
      if (currentRequest === requestId) loading.value = false
    }
  }

  function replaceQuery(next: Record<string, string | undefined>): void {
    const query = { ...route.query, ...next }
    if (JSON.stringify(query) === JSON.stringify(route.query)) return
    void router.replace({ query })
  }

  function updateSearchQuery(): void {
    replaceQuery({ search: search.value.trim() || undefined, page: undefined })
  }

  function setSort(value: UserSortField): void {
    sortBy.value = value
    replaceQuery({ sortBy: value, page: undefined })
  }

  function setPage(value: number): void {
    const nextPage = Math.max(1, Math.min(value, Math.max(totalPages.value, 1)))
    replaceQuery({ page: nextPage === 1 ? undefined : String(nextPage) })
  }

  const stopRouteWatch = watch(() => route.query, (query) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    search.value = queryValue(query.search)
    sortBy.value = validSort(query.sortBy)
    void fetchUsers()
  }, { immediate: true })
  const stopSearchWatch = watch(search, () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(updateSearchQuery, DEBOUNCE_MS)
  })

  onScopeDispose(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    activeController?.abort()
    stopRouteWatch()
    stopSearchWatch()
  })

  return { users, total, totalPages, loading, error, search, sortBy, page, setSort, setPage, refresh: fetchUsers }
}
