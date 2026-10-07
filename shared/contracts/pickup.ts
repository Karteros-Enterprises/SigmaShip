import type { CanonicalAddress } from '#shared/contracts/carrier'

export type PickupStatus =
  | 'scheduled'
  | 'cancelled'
  | 'completed'

export interface PickupWindow {
  startAt: string
  endAt: string
}

export interface PickupParcel {
  shipmentId: string
  trackingNumber: string
}

export interface PickupRequest {
  organizationId: string
  carrier: string
  address: CanonicalAddress
  window: PickupWindow
  parcels: PickupParcel[]
  instructions?: string
}

export interface ScheduledPickup {
  provider: string
  confirmationNumber: string
  status: PickupStatus
  window: PickupWindow
  metadata?: Record<string, unknown>
}

export interface PickupAdapter {
  schedulePickup(
    request: PickupRequest
  ): Promise<ScheduledPickup>

  cancelPickup(
    confirmationNumber: string
  ): Promise<void>
}
