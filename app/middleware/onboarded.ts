import type { Database } from '~/types/database.types'

export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient<Database>()

  if (!user.value) {
    return navigateTo('/login')
  }

  const { data, error } = await supabase
    .from('onboarding_states')
    .select('organization_id, completed')
    .eq('user_id', user.value.id)
    .maybeSingle()

  if (error) {
    console.error('Unable to read onboarding state', error)
    return navigateTo('/onboarding')
  }

  if (!data?.organization_id || !data.completed) {
    return navigateTo('/onboarding')
  }
})
