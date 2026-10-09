import type { CanonicalAddress, Package } from '#shared/types/domain'
import type { CarrierRate } from '#shared/contracts/carrier'
import { configuredStallionClient, StallionApiError } from './client'

function stallionAddress(address: CanonicalAddress) {
  const country = address.countryCode.trim().toUpperCase()
  const postal = address.postalCode.trim().toUpperCase().replace(/\s+/g, '')
  const postalCode = country === 'CA' && /^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/.test(postal)
    ? postal.slice(0, 3) + ' ' + postal.slice(3)
    : postal
  return {
    name: address.contactName.trim(),
    address1: address.address1.trim(),
    city: address.city.trim(),
    province_code: address.region.trim().toUpperCase(),
    postal_code: postalCode,
    country_code: country
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
  _sender: CanonicalAddress,
  recipient: CanonicalAddress,
  packages: Package[]
) {
  return {
    // Stateless Stallion rates use the account origin; sender stays in SigmaShip.
    // Do not send undocumented origin fields to POST /rates.
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
  const request = toStallionRateRequest(sender, recipient, packages)
  try {
    const response = await client.quoteRates<StallionRate[]>(request)
    return mapStallionRates(response.data)
  } catch (error) {
    if (error instanceof StallionApiError && error.status === 422) {
      // This is a read-only alternative endpoint: it never creates a shipment.
      // The estimate endpoint uses the account origin, as in Stallion's UI.
      const estimateRequest = request
      console.info('[stallion] Trying alternative stateless rate estimate endpoint')
      try {
        const estimate = await client.estimateRates<StallionRate[]>(estimateRequest)
        return mapStallionRates(estimate.data)
      } catch (estimateError) {
        console.warn('[stallion] Estimate endpoint failed', {
          status: estimateError instanceof StallionApiError ? estimateError.status : 'unknown'
        })
      }
    }
    throw error
  }
}
