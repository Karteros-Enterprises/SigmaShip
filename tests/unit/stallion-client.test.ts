import { describe, expect, it, vi } from 'vitest'
import { createStallionClient, StallionApiError } from '../../server/providers/carriers/stallion/client'

describe('Stallion v5 transport', () => {
  it('rejects missing credentials', () => {
    expect(() => createStallionClient({ token: '' })).toThrow('STALLION_TOKEN')
  })

  it('rejects untrusted API hosts', () => {
    expect(() => createStallionClient({
      token: 'test',
      baseUrl: 'https://untrusted.example/api/v5'
    })).toThrow('Unsupported Stallion')
  })

  it('sends authenticated sandbox rate requests', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }))
    const client = createStallionClient({ token: 'sandbox-test-token', fetcher: fetcher as typeof fetch })
    await client.quoteRates({ packages: [] })
    expect(fetcher).toHaveBeenCalledOnce()
    const [url, init] = fetcher.mock.calls[0]!
    expect(url).toBe('https://sandbox.stallion.ca/api/v5/rates')
    expect(init.headers.Authorization).toBe('Bearer sandbox-test-token')
    expect(init.method).toBe('POST')
  })

  it('blocks production purchases unless explicitly enabled', async () => {
    const fetcher = vi.fn()
    const client = createStallionClient({
      token: 'test',
      baseUrl: 'https://ship.stallion.ca/api/v5',
      fetcher: fetcher as typeof fetch
    })
    await expect(client.purchaseLabel('123', 'ups.ground', 'idempotent-1'))
      .rejects.toThrow('Live Stallion writes are disabled')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('does not leak API error response bodies', async () => {
    const fetcher = vi.fn(async () => new Response('{"error":"sensitive"}', { status: 401 }))
    const client = createStallionClient({ token: 'test', fetcher: fetcher as typeof fetch })
    await expect(client.quoteRates({})).rejects.toBeInstanceOf(StallionApiError)
    await expect(client.quoteRates({})).rejects.toThrow('HTTP 401')
  })

  it('uses idempotency keys for shipment creation', async () => {
    const fetcher = vi.fn(async () => new Response('{"data":{"id":"abc"}}', { status: 200 }))
    const client = createStallionClient({ token: 'test', fetcher: fetcher as typeof fetch })
    await client.createShipment({ type: 'courier' }, 'retry-safe')
    expect(fetcher.mock.calls[0]![1].headers['Idempotency-Key']).toBe('retry-safe')
  })
})
