import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export async function requireShippingContext(event: H3Event) {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required.'
    })
  }

  const supabase = await serverSupabaseClient<Database>(event)
  const { data: membership, error } = await supabase
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error || !membership?.organization_id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'A ΣigmaSpace is required. Complete account setup before shipping.'
    })
  }

  const service = serverSupabaseServiceRole<Database>(event)
  const { data: organization, error: organizationError } = await service.from('organizations')
    .select('is_active').eq('id', membership.organization_id).maybeSingle()
  if (organizationError || !organization) {
    throw createError({ statusCode: 503, statusMessage: 'Unable to verify ΣigmaSpace status.' })
  }
  if (!organization.is_active) {
    throw createError({ statusCode: 403, statusMessage: 'This ΣigmaSpace is inactive. Contact SigmaShip support to restore access.' })
  }

  return {
    user,
    organizationId: membership.organization_id
  }
}
