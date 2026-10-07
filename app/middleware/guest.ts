import type { Database } from '~/types/database.types'

export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient<Database>()

  if (!user.value) return

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.value.id)
    .limit(1)
    .maybeSingle()

  return navigateTo(membership?.organization_id ? '/ship' : '/onboarding')
})
