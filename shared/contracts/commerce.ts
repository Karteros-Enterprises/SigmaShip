export interface ExternalOrderAddress {
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
}

export interface ExternalOrderItem {
  externalItemId?: string
  sku?: string
  title: string
  quantity: number
  unitPrice?: number
  weight?: number
  metadata?: Record<string, unknown>
}

export interface NormalizedOrder {
  externalOrderId: string
  orderNumber?: string
  currency: string
  orderedAt?: string
  recipient: ExternalOrderAddress
  items: ExternalOrderItem[]
  metadata?: Record<string, unknown>
}

export interface FulfillmentUpdate {
  externalOrderId: string
  carrier: string
  service?: string
  trackingNumber: string
  trackingUrl?: string
  shippedAt: string
}

export interface CommerceAdapter {
  readonly key: string

  getAuthorizationUrl?(
    state: string
  ): Promise<string>

  exchangeAuthorizationCode?(
    code: string
  ): Promise<void>

  refreshCredentials?(): Promise<void>

  importOrders(
    cursor?: string
  ): Promise<{
    orders: NormalizedOrder[]
    nextCursor?: string
  }>

  getOrder(
    externalOrderId: string
  ): Promise<NormalizedOrder>

  pushFulfillment(
    update: FulfillmentUpdate
  ): Promise<void>

  verifyWebhook?(
    headers: Headers,
    rawBody: string
  ): Promise<boolean>

  handleWebhook?(
    headers: Headers,
    rawBody: string
  ): Promise<void>

  disconnect(): Promise<void>
}
