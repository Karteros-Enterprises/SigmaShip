import { requirePlatformAdmin } from '../../utils/platform-admin'

export default defineEventHandler(async (event) => {
  const { service } = await requirePlatformAdmin(event)

  const [{ data: orgs, error: orgError }, { data: ships, error: shipmentError }] = await Promise.all([
    service.from('organizations').select('id,name,slug,created_at').order('created_at', { ascending: false }),
    service.from('shipments').select('id,organization_id,status,carrier,service,tracking_number,customer_charge,currency,created_at').order('created_at', { ascending: false }).limit(500)
  ])

  if (orgError) {
    console.error('Platform organizations query failed', orgError)
    throw createError({ statusCode: 500, statusMessage: `Unable to load clients: ${orgError.message}` })
  }

  if (shipmentError) {
    console.error('Platform shipments query failed', shipmentError)
    throw createError({ statusCode: 500, statusMessage: `Unable to load shipments: ${shipmentError.message}` })
  }

  return { organizations: orgs ?? [], shipments: ships ?? [] }
})
