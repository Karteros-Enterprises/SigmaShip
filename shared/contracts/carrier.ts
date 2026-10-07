import type { CanonicalAddress, Money, Package } from '#shared/types/domain'
import type { PickupAdapter } from '#shared/contracts/pickup'

export interface RateRequest {
  organizationId: string
  sender: CanonicalAddress
  recipient: CanonicalAddress
  packages: Package[]
  currency: string
}

export interface CarrierRate {
  provider: string
  serviceCode: string
  serviceName: string
  carrierCost: Money
  transitDays?: number
  estimatedDelivery?: string
  metadata?: Record<string, unknown>
}

export interface LabelPurchaseRequest {
  organizationId: string
  shipmentId: string
  serviceCode: string
  sender: CanonicalAddress
  recipient: CanonicalAddress
  packages: Package[]
  idempotencyKey: string
}

export interface PurchasedLabel {
  provider: string
  trackingNumber: string
  trackingUrl?: string
  labelUrl: string
  carrierCost: Money
  metadata?: Record<string, unknown>
}

export interface CarrierTrackingEvent {
  provider: string
  providerStatus: string
  description: string
  occurredAt: string
  location?: {
    city?: string
    region?: string
    countryCode?: string
  }
}

export interface CarrierAdapter extends PickupAdapter {
  readonly key: string

  getRates(
    request: RateRequest
  ): Promise<CarrierRate[]>

  purchaseLabel(
    request: LabelPurchaseRequest
  ): Promise<PurchasedLabel>

  cancelLabel?(
    trackingNumber: string
  ): Promise<void>

  getTracking(
    trackingNumber: string
  ): Promise<CarrierTrackingEvent[]>

  validateCredentials?(): Promise<boolean>
}
