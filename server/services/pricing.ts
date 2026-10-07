import type { CarrierRate } from '#shared/contracts/carrier'

const DEFAULT_MARKUP_RATE = 0.15

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function priceCarrierRate(rate: CarrierRate) {
  const markupAmount = roundMoney(rate.carrierCost.amount * DEFAULT_MARKUP_RATE)
  const customerPrice = roundMoney(rate.carrierCost.amount + markupAmount)

  return {
    markupAmount,
    customerPrice
  }
}
