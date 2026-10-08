import { requirePlatformAdmin } from '../../../utils/platform-admin'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Client id is required.' })
  const { service } = await requirePlatformAdmin(event)

  const [organization, memberships, shipments, carriers] = await Promise.all([
    service.from('organizations').select('id,name,slug,created_at,markup_percent,markup_fixed,accessorial_markup_percent,accessorial_markup_fixed').eq('id', id).single(),
    service.from('memberships').select('user_id,role,created_at').eq('organization_id', id),
    service.from('shipments').select('id,status,carrier,service,tracking_number,customer_charge,carrier_cost,markup_amount,currency,created_at').eq('organization_id', id).order('created_at', { ascending: false }).limit(100),
    service.from('carrier_accounts').select('id,provider,ownership,display_name,external_account_id,status,enabled,validated_at,last_error').eq('organization_id', id)
  ])

  if (organization.error) throw createError({ statusCode: organization.error.code === 'PGRST116' ? 404 : 500, statusMessage: organization.error.message })
  if (memberships.error) throw createError({ statusCode: 500, statusMessage: memberships.error.message })
  if (shipments.error) throw createError({ statusCode: 500, statusMessage: shipments.error.message })
  if (carriers.error) throw createError({ statusCode: 500, statusMessage: carriers.error.message })

  return { client: organization.data, users: memberships.data ?? [], shipments: shipments.data ?? [], carrierAccounts: carriers.data ?? [] }
})
