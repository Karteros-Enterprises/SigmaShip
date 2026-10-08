import type { CarrierRate } from '#shared/contracts/carrier'

export interface CustomerMarkup {
  percent: number
  fixed: number
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function priceCarrierRate(rate: CarrierRate, markup: CustomerMarkup = { percent: 15, fixed: 0 }) {
  const percentageMarkup = rate.carrierCost.amount * (markup.percent / 100)
  const markupAmount = roundMoney(percentageMarkup + markup.fixed)
  const customerPrice = roundMoney(rate.carrierCost.amount + markupAmount)
  return { markupAmount, customerPrice }
}
