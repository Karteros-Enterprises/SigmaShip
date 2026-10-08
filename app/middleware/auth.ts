export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/login')
})
