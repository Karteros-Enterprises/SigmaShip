/**
 * Stallion Express API v5 transport.
 * Credentials are only read on the server. Sandbox is the default.
 * Do not enable live label purchases until commercial access is approved.
 */
const SANDBOX_URL = 'https://sandbox.stallion.ca/api/v5'
const PRODUCTION_URL = 'https://ship.stallion.ca/api/v5'

export interface StallionEnvelope<T> {
  data: T
  meta?: Record<string, unknown>
  links?: Record<string, unknown>
}

export class StallionApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly validationFields: string[] = []
  ) {
    super(message)
    this.name = 'StallionApiError'
  }
}

export interface StallionClientOptions {
  baseUrl?: string
  token: string
  fetcher?: typeof fetch
}

export function createStallionClient(options: StallionClientOptions) {
  const baseUrl = (options.baseUrl || SANDBOX_URL).replace(/\/$/, '')

  if (![SANDBOX_URL, PRODUCTION_URL].includes(baseUrl)) {
    throw new Error('Unsupported Stallion API base URL.')
  }
  if (!options.token.trim()) {
    throw new Error('STALLION_TOKEN is not configured.')
  }

  const fetcher = options.fetcher ?? fetch
  const isProduction = baseUrl === PRODUCTION_URL

  async function request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    body?: unknown,
    idempotencyKey?: string
  ): Promise<StallionEnvelope<T>> {
    if (!path.startsWith('/') || path.startsWith('//')) {
      throw new Error('Stallion request path must be relative.')
    }
    if (isProduction && method !== 'GET' && !(method === 'POST' && path === '/rates') && process.env.STALLION_LIVE_WRITES_ENABLED !== 'true') {
      throw new Error('Live Stallion writes are disabled.')
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    try {
      const response = await fetcher(baseUrl + path, {
        method,
        headers: {
          Authorization: `Bearer ${options.token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'SigmaShip-Integration/1.0',
          ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: controller.signal
      })
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        // Only report field names, never submitted addresses or credentials.
        const errorPayload = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
        const errors = errorPayload.errors
        const fields = errors && typeof errors === 'object' && !Array.isArray(errors)
          ? Object.keys(errors).slice(0, 20)
          : []
        const validationFields = fields.filter(field => /^[a-zA-Z0-9_.\[\]-]{1,100}$/.test(field))
        if (response.status === 422) {
          console.error('[stallion] Validation rejected request; fields:', validationFields.length ? validationFields : '(not provided by API)')
        }
        throw new StallionApiError(
          response.status,
          `Stallion request failed (HTTP ${response.status})${validationFields.length ? `: invalid fields: ${validationFields.join(', ')}` : ''}.`,
          validationFields
        )
      }
      if (!payload || typeof payload !== 'object' || !('data' in payload)) {
        throw new StallionApiError(502, 'Unexpected Stallion API response.')
      }
      return payload as StallionEnvelope<T>
    } finally {
      clearTimeout(timeout)
    }
  }

  return {
    environment: isProduction ? 'production' : 'sandbox',
    quoteRates: <T>(body: unknown) => request<T>('POST', '/rates', body, crypto.randomUUID()),
    createShipment: <T>(body: unknown, key: string) => request<T>('POST', '/shipments', body, key),
    getShipmentRates: <T>(shipmentId: string) =>
      request<T>('GET', `/rates/${encodeURIComponent(shipmentId)}`),
    purchaseLabel: <T>(shipmentId: string, service: string, key: string) =>
      request<T>('POST', `/labels/${encodeURIComponent(shipmentId)}`, { service }, key),
    schedulePickup: <T>(shipmentIds: string[], key: string) =>
      request<T>('POST', '/pickups', { shipment_ids: shipmentIds }, key)
  }
}

export function configuredStallionClient() {
  return createStallionClient({
    token: process.env.STALLION_TOKEN ?? '',
    baseUrl: process.env.STALLION_BASE_URL || SANDBOX_URL
  })
}
