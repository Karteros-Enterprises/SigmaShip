import { describe, expect, it } from 'vitest'
import { priceCarrierRate } from '../../server/services/pricing'
import type { CarrierRate } from '../../shared/contracts/carrier'

function rate(amount: number): CarrierRate {
  return {
    provider: 'sandbox',
    serviceCode: 'ground',
    serviceName: 'Sandbox Ground',
    carrierCost: { amount, currency: 'CAD' }
  }
}

describe('priceCarrierRate', () => {
  it('applies the 15 percent customer markup', () => {
    expect(priceCarrierRate(rate(20))).toEqual({
      markupAmount: 3,
      customerPrice: 23
    })
  })

  it('rounds money to cents without losing the pricing invariant', () => {
    const priced = priceCarrierRate(rate(23.55))

    expect(priced).toEqual({
      markupAmount: 3.53,
      customerPrice: 27.08
    })
    expect(Math.round(priced.customerPrice * 100)).toBe(\n      Math.round((23.55 + priced.markupAmount) * 100)\n    )
  })

  it('never mutates the carrier cost supplied by the adapter', () => {
    const carrierRate = rate(13.85)

    priceCarrierRate(carrierRate)

    expect(carrierRate.carrierCost).toEqual({
      amount: 13.85,
      currency: 'CAD'
    })
  })
})
