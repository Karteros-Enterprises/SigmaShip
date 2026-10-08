import type { Database } from '~/types/database.types'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const supabase = useSupabaseClient<Database>()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  const userId = authData.user?.id

  if (authError || !userId) {
    return navigateTo('/login')
  }

  const { data: onboardingState, error: onboardingError } = await supabase
    .from('onboarding_states')
    .select('organization_id, completed')
    .eq('user_id', userId)
    .maybeSingle()

  if (!onboardingError && onboardingState?.organization_id && onboardingState.completed) return

  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (membership?.organization_id) return

  if (membershipError) console.error('Unable to read organization membership', membershipError)
  if (onboardingError) console.error('Unable to read onboarding state', onboardingError)

  return navigateTo('/onboarding')
})
