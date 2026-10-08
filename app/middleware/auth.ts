import type { Database } from '~/types/database.types'

export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient<Database>()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user?.id) {
    return navigateTo('/login')
  }
})
