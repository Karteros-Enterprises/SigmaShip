import { configuredStallionClient } from './client'
import { toStallionRateRequest } from './rates'
import type { CanonicalAddress, Package } from '#shared/types/domain'

interface CreatedShipment { id: string }
interface LabelResponse {
  tracking_code: string
  label_url: string
  tracking_url?: string
}

export interface StallionPurchaseInput {
  sender: CanonicalAddress
  recipient: CanonicalAddress
  packages: Package[]
  serviceCode: string
  idempotencyKey: string
}

/**
 * Writes are opt-in even in sandbox: never create a carrier shipment
 * merely because someone requests a rate.
 */
export async function purchaseStallionLabel(input: StallionPurchaseInput) {
  if (process.env.STALLION_WRITES_ENABLED !== 'true') {
    throw new Error('Stallion shipment creation is disabled.')
  }
  const client = configuredStallionClient()
  const request = toStallionRateRequest(input.sender, input.recipient, input.packages)
  const created = await client.createShipment<CreatedShipment>(
    request, `${input.idempotencyKey}:create`
  )
  if (!created.data?.id) {
    throw new Error('Stallion did not return a shipment ID.')
  }
  const rates = await client.getShipmentRates<Array<{
    service?: string
    carrier?: { service_code?: string }
  }>>(created.data.id)
  if (!rates.data.some(rate =>
    (rate.carrier?.service_code || rate.service) === input.serviceCode
  )) {
    throw new Error('Selected Stallion service is no longer available.')
  }
  const label = await client.purchaseLabel<LabelResponse>(
    created.data.id, input.serviceCode, `${input.idempotencyKey}:label`
  )
  if (!label.data?.tracking_code || !label.data?.label_url) {
    throw new Error('Stallion did not return a complete label.')
  }
  return {
    providerShipmentId: created.data.id,
    trackingNumber: label.data.tracking_code,
    labelUrl: label.data.label_url,
    trackingUrl: label.data.tracking_url
  }
}
