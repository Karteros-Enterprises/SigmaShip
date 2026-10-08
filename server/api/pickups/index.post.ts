import { z } from 'zod'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, Json } from '~/types/database.types'
import type { CanonicalAddress } from '#shared/types/domain'
import { getSandboxCarrier } from '../../utils/carrier'
import { requireShippingContext } from '../../utils/shipping-context'

const schema = z.object({
  shipmentIds: z.array(z.string().uuid()).min(1).max(50),
  windowStart: z.string().datetime({ offset: true }),
  windowEnd: z.string().datetime({ offset: true }),
  instructions: z.string().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const { user, organizationId } = await requireShippingContext(event)
  const body = schema.parse(await readBody(event))
  const start = new Date(body.windowStart).getTime()
  const end = new Date(body.windowEnd).getTime()
  if (start <= Date.now() || end <= start || end - start > 8 * 60 * 60 * 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Select a future pickup window of up to eight hours.' })
  }
  const shipmentIds = [...new Set(body.shipmentIds)]
  if (shipmentIds.length !== body.shipmentIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'Duplicate shipments are not allowed.' })
  }
  const service = serverSupabaseServiceRole<Database>(event)
  const { data: shipments, error } = await service.from('shipments')
    .select('id,carrier,status,tracking_number,sender_address')
    .eq('organization_id', organizationId).in('id', shipmentIds)
  if (error || !shipments || shipments.length !== shipmentIds.length) {
    throw createError({ statusCode: 400, statusMessage: 'One or more shipments do not belong to this workspace.' })
  }
  if (shipments.some(s => s.carrier !== 'sandbox' || s.status !== 'label_created' || !s.tracking_number)) {
    throw createError({ statusCode: 400, statusMessage: 'Only sandbox shipments with created labels can be scheduled currently.' })
  }
  const sender = JSON.stringify(shipments[0]?.sender_address)
  if (shipments.some(s => JSON.stringify(s.sender_address) !== sender)) {
    throw createError({ statusCode: 400, statusMessage: 'All pickup shipments must have the same sender address.' })
  }
  const { data: existing } = await service.from('pickup_shipments')
    .select('shipment_id,pickups!inner(status)').in('shipment_id', shipmentIds)
  if (existing?.length) {
    throw createError({ statusCode: 409, statusMessage: 'A selected shipment is already associated with a pickup.' })
  }
  const address = shipments[0]!.sender_address as unknown as CanonicalAddress
  const carrier = getSandboxCarrier()
  const scheduled = await carrier.schedulePickup({
    organizationId, carrier: 'sandbox', address,
    window: { startAt: body.windowStart, endAt: body.windowEnd },
    parcels: shipments.map(s => ({ shipmentId: s.id, trackingNumber: s.tracking_number! })),
    instructions: body.instructions
  })
  const { data: pickup, error: insertError } = await service.from('pickups').insert({
    organization_id: organizationId, provider: 'sandbox',
    confirmation_number: scheduled.confirmationNumber, status: 'scheduled',
    address: address as unknown as Json, window_start: body.windowStart,
    window_end: body.windowEnd, instructions: body.instructions ?? null, created_by: user.id
  }).select('id').single()
  if (insertError || !pickup) {
    await carrier.cancelPickup(scheduled.confirmationNumber)
    throw createError({ statusCode: 500, statusMessage: 'Unable to save pickup; sandbox reservation cancelled.' })
  }
  const { error: linkError } = await service.from('pickup_shipments').insert(
    shipmentIds.map(shipmentId => ({ pickup_id: pickup.id, shipment_id: shipmentId }))
  )
  if (linkError) {
    await carrier.cancelPickup(scheduled.confirmationNumber)
    await service.from('pickups').delete().eq('id', pickup.id)
    throw createError({ statusCode: 500, statusMessage: 'Unable to link pickup shipments.' })
  }
  return { pickup: { id: pickup.id, confirmationNumber: scheduled.confirmationNumber, status: 'scheduled' } }
})
