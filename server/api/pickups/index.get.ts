import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import { requireShippingContext } from '../../utils/shipping-context'

export default defineEventHandler(async (event) => {
  const { organizationId } = await requireShippingContext(event)
  const service = serverSupabaseServiceRole<Database>(event)
  const { data, error } = await service.from('pickups')
    .select('id,provider,confirmation_number,status,window_start,window_end,instructions,created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  if (error) throw createError({ statusCode: 500, statusMessage: 'Unable to load pickups.' })
  return { pickups: data ?? [] }
})
