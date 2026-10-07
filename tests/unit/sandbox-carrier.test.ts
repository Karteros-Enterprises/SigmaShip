import { describe, expect, it } from 'vitest'
import { SandboxCarrierAdapter } from '../../../server/providers/carriers/sandbox/adapter'
import type { LabelPurchaseRequest, RateRequest } from '../../../shared/contracts/carrier'

const sender = {
  contactName: 'SigmaShip',
  address1: '1 Origin Street',
  city: 'Toronto',
  region: 'ON',
  postalCode: 'M5V 1A1',
  countryCode: 'CA'
}

const recipient = {
  contactName: 'Customer',
  address1: '2 Destination Street',
  city: 'Ottawa',
  region: 'ON',
  postalCode: 'K1A 0B1',
  countryCode: 'CA'
}

function rateRequest(): RateRequest {
  return {
    organizationId: 'org-1',
    sender,
    recipient,
    currency: 'CAD',
    packages: [
      {
        weight: 2,
        weightUnit: 'lb',
        length: 10,
        width: 8,
        height: 4,
        dimensionUnit: 'in'
      },
      {
        weight: 3,
        weightUnit: 'lb',
        length: 12,
        width: 9,
        height: 5,
        dimensionUnit: 'in'
      }
    ]
  }
}

function purchaseRequest(serviceCode = 'express'): LabelPurchaseRequest {
  return {
    ...rateRequest(),
    shipmentId: '00000000-0000-0000-0000-1234567890ab',
    serviceCode,
    idempotencyKey: 'purchase-1'
  }
}

describe('SandboxCarrierAdapter', () => {
  const carrier = new SandboxCarrierAdapter()

  it('returns ground, express and priority rates from total package weight', async () => {
    const rates = await carrier.getRates(rateRequest())

    expect(rates).toHaveLength(3)
    expect(rates.map(rate => rate.serviceCode)).toEqual([
      'ground',
      'express',
      'priority'
    ])
    expect(rates.map(rate => rate.carrierCost.amount)).toEqual([
      13.85,
      23.55,
      32.55
    ])
    expect(rates.every(rate => rate.carrierCost.currency === 'CAD')).toBe(true)
  })

  it('uses the selected quoted service cost when purchasing a label', async () => {
    const label = await carrier.purchaseLabel(purchaseRequest('express'))

    expect(label.provider).toBe('sandbox')
    expect(label.carrierCost).toEqual({
      amount: 23.55,
      currency: 'CAD'
    })
    expect(label.trackingNumber).toBe('SIG1234567890')
    expect(label.metadata).toMatchObject({
      serviceCode: 'express',
      idempotencyKey: 'purchase-1'
    })
  })

  it('rejects an unknown service instead of silently purchasing', async () => {
    await expect(
      carrier.purchaseLabel(purchaseRequest('teleport'))
    ).rejects.toThrow('Unknown sandbox service "teleport".')
  })

  it('returns a normalized label-created tracking event', async () => {
    const events = await carrier.getTracking('SIG123')

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({
      provider: 'sandbox',
      providerStatus: 'LABEL_CREATED',
      description: 'Label created for SIG123'
    })
    expect(Number.isNaN(Date.parse(events[0]!.occurredAt))).toBe(false)
  })

  it('schedules a pickup with the requested window and parcel count', async () => {
    const request = {
      organizationId: 'org-1',
      address: sender,
      window: {
        date: '2026-10-08',
        readyTime: '09:00',
        closeTime: '17:00'
      },
      parcels: rateRequest().packages
    }

    const pickup = await carrier.schedulePickup(request)

    expect(pickup.provider).toBe('sandbox')
    expect(pickup.status).toBe('scheduled')
    expect(pickup.window).toEqual(request.window)
    expect(pickup.metadata).toEqual({ parcelCount: 2 })
    expect(pickup.confirmationNumber).toMatch(/^PU[A-F0-9]{10}$/)
  })

  it('supports idempotent-style void and pickup cancellation calls', async () => {
    await expect(carrier.cancelLabel('SIG123')).resolves.toBeUndefined()
    await expect(carrier.cancelPickup('PU123')).resolves.toBeUndefined()
  })
})
