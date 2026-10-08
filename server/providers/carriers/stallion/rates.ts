import type { CanonicalAddress, Package } from '#shared/types/domain'
import type { CarrierRate } from '#shared/contracts/carrier'
import { configuredStallionClient } from './client'

function stallionAddress(address: CanonicalAddress) {
  return {
    name: address.contactName,
    company: address.company,
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    province_code: address.region,
    postal_code: address.postalCode,
    country_code: address.countryCode,
    phone: address.phone,
    email: address.email,
    is_residential: address.residential ?? false
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
    type: 'courier',
    from_address: stallionAddress(sender),
    to_address: stallionAddress(recipient),
    packages: packages.map(stallionPackage)
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
    const serviceCode = item.service || (typeof item.carrier === 'object' ? item.carrier?.service_code : undefined)
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
  const response = await client.quoteRates<StallionRate[]>(
    toStallionRateRequest(sender, recipient, packages)
  )
  return mapStallionRates(response.data)
}
