import { serverSupabaseServiceRole } from '#supabase/server'
import { purchaseShipmentSchema } from '#shared/schemas/shipping'
import type { Database, Json } from '~/types/database.types'
import { getSandboxCarrier } from '../../utils/carrier'
import { requireShippingContext } from '../../utils/shipping-context'

export default defineEventHandler(async (event) => {
  const { user, organizationId } = await requireShippingContext(event)
  const body = purchaseShipmentSchema.parse(await readBody(event))
  const service = serverSupabaseServiceRole<Database>(event)

  const { data: quote, error: quoteError } = await service
    .from('rate_quotes')
    .select('*')
    .eq('id', body.quoteId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (quoteError || !quote) {
    throw createError({
      statusCode: 404,
      statusMessage: 'The selected rate is no longer available.'
    })
  }

  if (quote.shipment_id) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This quote has already been used to create a shipment. View the existing shipment instead of purchasing another label.'
    })
  }

  if (new Date(quote.expires_at).getTime() <= Date.now()) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This rate expired. Please compare rates again.'
    })
  }

  if (quote.provider === 'stallion') {
    console.warn('[shipping/shipments] Stallion purchase blocked: carrier booking and label workflow not implemented', {
      quoteId: quote.id,
      serviceCode: quote.service_code,
      environment: process.env.STALLION_BASE_URL?.includes('sandbox') ? 'sandbox' : 'production'
    })
    throw createError({
      statusCode: 409,
      statusMessage: 'Stallion rates are available, but purchasing Stallion labels is not yet enabled. No shipment was created or charged.'
    })
  }

  if (quote.provider !== 'sandbox') {
    throw createError({
      statusCode: 400,
      statusMessage: 'This shipping provider does not support label purchase yet.'
    })
  }

  const shipmentId = crypto.randomUUID()
  const idempotencyKey = crypto.randomUUID()
  const carrier = getSandboxCarrier()
  const purchased = await carrier.purchaseLabel({
    organizationId,
    shipmentId,
    serviceCode: quote.service_code,
    sender: body.sender,
    recipient: body.recipient,
    packages: body.packages,
    currency: quote.currency,
    idempotencyKey
  })

  const carrierCost = purchased.carrierCost.amount
  const customerCharge = Number(quote.customer_price)
  const markupAmount = Number(quote.markup_amount)
  const grossMargin = customerCharge - carrierCost
  const purchasedAt = new Date().toISOString()

  const { error: shipmentError } = await service
    .from('shipments')
    .insert({
      id: shipmentId,
      organization_id: organizationId,
      status: 'label_created',
      sender_address: body.sender as unknown as Json,
      recipient_address: body.recipient as unknown as Json,
      currency: quote.currency,
      carrier: purchased.provider,
      service: quote.service_name,
      tracking_number: purchased.trackingNumber,
      tracking_url: purchased.trackingUrl ?? null,
      label_url: purchased.labelUrl,
      carrier_cost: carrierCost,
      customer_charge: customerCharge,
      markup_amount: markupAmount,
      byoa_fee: 0,
      tax_amount: 0,
      processor_fee: 0,
      final_revenue: customerCharge,
      gross_margin: grossMargin,
      idempotency_key: idempotencyKey,
      purchased_at: purchasedAt,
      created_by: user.id
    })

  if (shipmentError) {
    await carrier.cancelLabel?.(purchased.trackingNumber)

    throw createError({
      statusCode: 500,
      statusMessage: 'Shipment persistence failed. The carrier label was voided.'
    })
  }

  const packageRows = body.packages.map((parcel) => ({
    shipment_id: shipmentId,
    weight: parcel.weight,
    weight_unit: parcel.weightUnit,
    length: parcel.length,
    width: parcel.width,
    height: parcel.height,
    dimension_unit: parcel.dimensionUnit
  }))

  const { error: packageError } = await service
    .from('shipment_packages')
    .insert(packageRows)

  if (packageError) {
    await carrier.cancelLabel?.(purchased.trackingNumber)
    await service.from('shipments').delete().eq('id', shipmentId)

    throw createError({
      statusCode: 500,
      statusMessage: 'Package persistence failed. The carrier label was voided.'
    })
  }

  await service
    .from('rate_quotes')
    .update({ shipment_id: shipmentId })
    .eq('id', quote.id)

  return {
    shipment: {
      id: shipmentId,
      carrier: purchased.provider,
      service: quote.service_name,
      trackingNumber: purchased.trackingNumber,
      trackingUrl: purchased.trackingUrl,
      labelUrl: purchased.labelUrl,
      customerCharge,
      currency: quote.currency
    }
  }
})
