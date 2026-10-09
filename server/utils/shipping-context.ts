import type { H3Event } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

export async function requireShippingContext(event: H3Event) {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required.'
    })
  }

  // Authenticated user ID comes from Supabase Auth; use the service client for
  // the membership lookup so an RLS/read error cannot masquerade as no workspace.
  const service = serverSupabaseServiceRole<Database>(event)
  const { data: membership, error } = await service
    .from('memberships')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[shipping/context] Membership lookup failed', { code: error.code, message: error.message, details: error.details, hint: error.hint })
    throw createError({
      statusCode: 503,
      statusMessage: 'Unable to verify your ΣigmaSpace membership. Please try again.'
    })
  }

  if (!membership?.organization_id) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your account has no ΣigmaSpace membership. Complete account setup before shipping.'
    })
  }

  const { data: organization, error: organizationError } = await service.from('organizations')
    .select('is_active').eq('id', membership.organization_id).maybeSingle()
  if (organizationError || !organization) {
    console.error('[shipping/context] Organization lookup failed', { code: organizationError?.code, message: organizationError?.message })
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
