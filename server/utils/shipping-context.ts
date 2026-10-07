import type { H3Event } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
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
      statusMessage: 'A SigmaShip workspace is required.'
    })
  }

  return {
    user,
    organizationId: membership.organization_id
  }
}
