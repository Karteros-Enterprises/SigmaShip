import { describe, expect, it } from 'vitest'
import { mapStallionRates, toStallionRateRequest } from '../../server/providers/carriers/stallion/rates'

const address = {
  contactName: 'Test Sender',
  address1: '123 Main Street',
  city: 'Toronto',
  region: 'ON',
  postalCode: 'M5V 2T6',
  countryCode: 'CA'
}

describe('Stallion rate mapping', () => {
  it('maps addresses and converts kilograms and centimetres', () => {
    const body = toStallionRateRequest(address, address, [{
      weight: 1,
      weightUnit: 'kg',
      length: 25.4,
      width: 10,
      height: 5,
      dimensionUnit: 'cm'
    }])
    expect(body.type).toBe('courier')
    expect(body.to_address.province_code).toBe('ON')
    expect(body.packages[0]?.weight).toBeCloseTo(2.205)
    expect(body.packages[0]?.length).toBe(10)
  })

  it('uses Stallion total price including taxes', () => {
    const rates = mapStallionRates([{
      service: 'ups.standard',
      service_name: 'UPS Standard',
      total: '14.75',
      currency: 'CAD',
      transit_days: 3
    }])
    expect(rates[0]?.carrierCost.amount).toBe(14.75)
    expect(rates[0]?.provider).toBe('stallion')
  })

  it('rejects incomplete rates rather than inventing prices', () => {
    expect(() => mapStallionRates([{ service: 'ups.standard', currency: 'CAD' }])).toThrow()
  })
})
