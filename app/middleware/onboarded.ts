export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  if (!user.value) {
    return navigateTo('/login')
  }

  const { data, error } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.value.id)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load your SigmaShip workspace.'
    })
  }

  if (!data?.organization_id) {
    return navigateTo('/onboarding')
  }
})
