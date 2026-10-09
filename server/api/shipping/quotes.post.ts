import { serverSupabaseServiceRole } from '#supabase/server'
import { quoteRequestSchema } from '#shared/schemas/shipping'
import type { Database } from '~/types/database.types'
import { getSandboxCarrier } from '../../utils/carrier'
import { getStallionRates } from '../../providers/carriers/stallion/rates'
import { requireShippingContext } from '../../utils/shipping-context'
import { priceCarrierRate } from '../../services/pricing'

const QUOTE_LIFETIME_MINUTES = 15

export default defineEventHandler(async (event) => {
  const { organizationId } = await requireShippingContext(event)
  const body = quoteRequestSchema.parse(await readBody(event))
  const service = serverSupabaseServiceRole<Database>(event)

  const { data: organization, error: organizationError } = await service.from('organizations').select('markup_percent,markup_fixed').eq('id', organizationId).single()
  if (organizationError || !organization) {
    console.error('[shipping/quotes] Organization pricing lookup failed', { organizationId, code: organizationError?.code, message: organizationError?.message })
    throw createError({ statusCode: 503, statusMessage: 'Shipping pricing is temporarily unavailable. Please contact support.' })
  }

  let carrierRates
  try {
    carrierRates = process.env.STALLION_TOKEN
      ? await getStallionRates(body.sender, body.recipient, body.packages)
      : await getSandboxCarrier().getRates({
          organizationId,
          sender: body.sender,
          recipient: body.recipient,
          packages: body.packages,
          currency: body.currency.toUpperCase()
        })
  } catch (error) {
    console.error('[shipping/quotes] Carrier quote failed', error)
    throw createError({ statusCode: 502, statusMessage: 'The carrier could not return rates. Please try again shortly.' })
  }

  const expiresAt = new Date(
    Date.now() + QUOTE_LIFETIME_MINUTES * 60_000
  ).toISOString()

  const quoteRows = carrierRates.map((rate) => {
    const pricing = priceCarrierRate(rate, { percent: Number(organization.markup_percent), fixed: Number(organization.markup_fixed) })

    return {
      organization_id: organizationId,
      provider: rate.provider,
      service_code: rate.serviceCode,
      service_name: rate.serviceName,
      carrier_cost: rate.carrierCost.amount,
      customer_price: pricing.customerPrice,
      markup_amount: pricing.markupAmount,
      currency: rate.carrierCost.currency,
      transit_days: rate.transitDays ?? null,
      estimated_delivery: rate.estimatedDelivery ?? null,
      expires_at: expiresAt
    }
  })

  const { data, error } = await service
    .from('rate_quotes')
    .insert(quoteRows)
    .select('id, provider, service_code, service_name, customer_price, currency, transit_days, estimated_delivery, expires_at')

  if (error) {
    console.error('[shipping/quotes] Rate persistence failed', { code: error.code, message: error.message, organizationId })
    throw createError({
      statusCode: 503,
      statusMessage: 'Rates were returned but could not be saved. Please contact support.'
    })
  }

  return {
    quotes: data.map((quote) => ({
      id: quote.id,
      provider: quote.provider,
      serviceCode: quote.service_code,
      serviceName: quote.service_name,
      customerPrice: Number(quote.customer_price),
      currency: quote.currency,
      transitDays: quote.transit_days,
      estimatedDelivery: quote.estimated_delivery,
      expiresAt: quote.expires_at
    }))
  }
})
