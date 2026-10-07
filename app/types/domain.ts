export type MembershipRole = 'owner' | 'admin' | 'shipper' | 'accounting' | 'viewer'

export type IntegrationStatus =
  | 'not_configured'
  | 'pending'
  | 'connected'
  | 'degraded'
  | 'disconnected'

export type ShipmentStatus =
  | 'draft'
  | 'rated'
  | 'purchased'
  | 'label_created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'cancelled'

export interface Address {
  id: string
  organizationId: string
  contactName: string
  company?: string
  address1: string
  address2?: string
  city: string
  region: string
  postalCode: string
  countryCode: string
  phone?: string
  email?: string
  residential: boolean
  poBox: boolean
}

export interface Package {
  weight: number
  weightUnit: 'lb' | 'kg'
  length: number
  width: number
  height: number
  dimensionUnit: 'in' | 'cm'
}

export interface CustomsItem {
  description: string
  countryOfOrigin: string
  hsCode?: string
  sku?: string
  quantity: number
  unitValue: number
  weight: number
}

export interface Money {
  amount: number
  currency: string
}

export interface Rate {
  id: string
  carrier: string
  service: string
  transitDays?: number
  estimatedDelivery?: string
  carrierCost: Money
  customerPrice: Money
  markup: Money
  byoaFee?: Money
}

export interface TrackingEvent {
  id: string
  status: ShipmentStatus
  carrierStatus?: string
  description: string
  occurredAt: string
  city?: string
  region?: string
  countryCode?: string
}
