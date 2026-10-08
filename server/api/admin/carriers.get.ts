import { requirePlatformAdmin } from '../../utils/platform-admin'

export default defineEventHandler(async (event) => {
  const { service } = await requirePlatformAdmin(event)
  const { data, error } = await service
    .from('carrier_accounts')
    .select('id,organization_id,provider,ownership,display_name,external_account_id,status,enabled,validated_at,last_error')
    .order('display_name')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { accounts: data ?? [] }
})
