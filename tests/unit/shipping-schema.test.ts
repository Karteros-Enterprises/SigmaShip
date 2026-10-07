import { describe, expect, it } from 'vitest'
import {
  purchaseShipmentSchema,
  quoteRequestSchema
} from '../../shared/schemas/shipping'

const validRequest = {
  sender: {
    contactName: 'SigmaShip',
    address1: '1 Origin Street',
    city: 'Toronto',
    region: 'ON',
    postalCode: 'M5V 1A1',
    countryCode: 'ca'
  },
  recipient: {
    contactName: 'Customer',
    address1: '2 Destination Street',
    city: 'Ottawa',
    region: 'ON',
    postalCode: 'K1A 0B1',
    countryCode: 'CA'
  },
  packages: [{
    weight: 2,
    weightUnit: 'lb',
    length: 10,
    width: 8,
    height: 4,
    dimensionUnit: 'in'
  }]
}

describe('shipping request schemas', () => {
  it('normalizes country codes and defaults quotes to CAD', () => {
    const parsed = quoteRequestSchema.parse(validRequest)

    expect(parsed.sender.countryCode).toBe('CA')
    expect(parsed.currency).toBe('CAD')
  })

  it('rejects empty package lists', () => {
    const result = quoteRequestSchema.safeParse({
      ...validRequest,
      packages: []
    })

    expect(result.success).toBe(false)
  })

  it('rejects non-positive parcel dimensions and weights', () => {
    const result = quoteRequestSchema.safeParse({
      ...validRequest,
      packages: [{
        ...validRequest.packages[0],
        weight: 0
      }]
    })

    expect(result.success).toBe(false)
  })

  it('caps a quote at 25 packages', () => {
    const result = quoteRequestSchema.safeParse({
      ...validRequest,
      packages: Array.from({ length: 26 }, () => validRequest.packages[0])
    })

    expect(result.success).toBe(false)
  })

  it('requires a UUID quote id before purchasing', () => {
    expect(purchaseShipmentSchema.safeParse({
      ...validRequest,
      quoteId: 'not-a-quote-id'
    }).success).toBe(false)

    expect(purchaseShipmentSchema.safeParse({
      ...validRequest,
      quoteId: '00000000-0000-4000-8000-000000000001'
    }).success).toBe(true)
  })
})
