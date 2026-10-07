import type { Database } from '~/types/database.types'

export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient<Database>()

  if (!user.value) {
    return navigateTo('/login')
  }

  const { data: onboardingState, error: onboardingError } = await supabase
    .from('onboarding_states')
    .select('organization_id, completed')
    .eq('user_id', user.value.id)
    .maybeSingle()

  if (
    !onboardingError &&
    onboardingState?.organization_id &&
    onboardingState.completed
  ) {
    return
  }

  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.value.id)
    .limit(1)
    .maybeSingle()

  if (membershipError) {
    console.error('Unable to read organization membership', membershipError)
    return navigateTo('/onboarding')
  }

  if (membership?.organization_id) {
    return
  }

  if (onboardingError) {
    console.error('Unable to read onboarding state', onboardingError)
  }

  return navigateTo('/onboarding')
})
