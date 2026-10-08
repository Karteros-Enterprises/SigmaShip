export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/login')
  try {
    await $fetch('/api/admin/overview')
  } catch (error: unknown) {
    const status = typeof error === 'object' && error !== null && 'statusCode' in error
      ? Number((error as { statusCode?: number }).statusCode)
      : 0
    if (status === 403) return navigateTo('/ship')
    if (status === 401) return navigateTo('/login')
  }
})
