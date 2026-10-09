import type { CanonicalAddress, Package } from '#shared/types/domain'
import type { CarrierRate } from '#shared/contracts/carrier'
import { configuredStallionClient, StallionApiError } from './client'

function stallionAddress(address: CanonicalAddress) {
  // Only include the documented minimum fields for stateless parcel quotes.
  return {
    name: address.contactName,
    address1: address.address1,
    city: address.city,
    province_code: address.region,
    postal_code: address.postalCode.replace(/\s+/g, '').toUpperCase(),
    country_code: address.countryCode.toUpperCase()
  }
}

function stallionPackage(parcel: Package) {
  const lb = parcel.weightUnit === 'kg' ? parcel.weight * 2.2046226218 : parcel.weight
  const inches = parcel.dimensionUnit === 'cm' ? 1 / 2.54 : 1
  return {
    weight: Number(lb.toFixed(3)),
    weight_unit: 'lbs',
    length: Number((parcel.length * inches).toFixed(2)),
    width: Number((parcel.width * inches).toFixed(2)),
    height: Number((parcel.height * inches).toFixed(2)),
    package_contents: 'Merchandise'
  }
}

export function toStallionRateRequest(
  sender: CanonicalAddress,
  recipient: CanonicalAddress,
  packages: Package[]
) {
  return {
    // Stallion parcel rates use the account origin; retain sender in SigmaShip
    // for shipment records and carriers that support explicit origins.
    to_address: stallionAddress(recipient),
    packages: packages.map(stallionPackage),
    timeout: 20
  }
}

interface StallionRate {
  service?: string
  service_name?: string
  total?: number | string
  currency?: string
  estimated_delivery_days?: number
  transit_days?: number
  carrier?: string | { name?: string, service_code?: string }
}

export function mapStallionRates(input: unknown): CarrierRate[] {
  if (!Array.isArray(input)) {
    throw new Error('Stallion returned an invalid rate list.')
  }
  return input.map((item: StallionRate) => {
    const serviceCode = typeof item.carrier === 'object' ? item.carrier?.service_code || item.service : item.service
    const total = Number(item.total)
    if (!serviceCode || !Number.isFinite(total) || total < 0 || !item.currency) {
      throw new Error('Stallion returned an incomplete rate.')
    }
    const carrierName = typeof item.carrier === 'string'
      ? item.carrier
      : item.carrier?.name
    return {
      provider: 'stallion',
      serviceCode,
      serviceName: item.service_name || carrierName || serviceCode,
      carrierCost: { amount: total, currency: item.currency },
      transitDays: item.transit_days ?? item.estimated_delivery_days,
      metadata: { carrier: carrierName }
    }
  })
}

export async function getStallionRates(
  sender: CanonicalAddress,
  recipient: CanonicalAddress,
  packages: Package[]
) {
  const client = configuredStallionClient()
  const payload = toStallionRateRequest(sender, recipient, packages)
  try {
    const response = await client.quoteRates<StallionRate[]>(payload)
    return mapStallionRates(response.data)
  } catch (error) {
    // Shipment creation persists data. Never silently create a production
    // shipment while the user is only requesting a quote.
    if (!(error instanceof StallionApiError) || error.status !== 422) throw error
    if (process.env.STALLION_SHIPMENT_RATE_DIAGNOSTIC !== 'true') throw error
    if (client.environment !== 'sandbox') {
      console.warn('[stallion] Shipment rate diagnostic skipped: production writes are prohibited')
      throw error
    }
    console.info('[stallion] Comparing sandbox shipment-based rate workflow')
    const created = await client.createShipment<{ id: string }>(
      { ...payload, type: 'courier' },
      crypto.randomUUID()
    )
    if (!created.data?.id) throw new Error('Stallion sandbox shipment response did not include an id.')
    const rated = await client.getShipmentRates<StallionRate[]>(created.data.id)
    console.info('[stallion] Sandbox shipment rate diagnostic completed', {
      rateCount: Array.isArray(rated.data) ? rated.data.length : null
    })
    return mapStallionRates(rated.data)
  }
}
