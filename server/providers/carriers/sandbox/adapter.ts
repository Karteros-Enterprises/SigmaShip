import type {
  CarrierAdapter,
  CarrierRate,
  CarrierTrackingEvent,
  LabelPurchaseRequest,
  PurchasedLabel,
  RateRequest
} from '#shared/contracts/carrier'
import type {
  PickupRequest,
  ScheduledPickup
} from '#shared/contracts/pickup'

function totalWeight(
  request: RateRequest
) {
  return request.packages.reduce(
    (total, parcel) => total + parcel.weight,
    0
  )
}

function moneyFromCents(
  amountInCents: number,
  currency: string
) {
  return {
    amount: amountInCents / 100,
    currency
  }
}

function applyRateMultiplier(
  amountInCents: number,
  multiplierPercent: number
) {
  return Math.round(
    amountInCents * multiplierPercent / 100
  )
}

export class SandboxCarrierAdapter implements CarrierAdapter {
  readonly key = 'sandbox'

  async getRates(
    request: RateRequest
  ): Promise<CarrierRate[]> {
    const weight = totalWeight(request)
    const baseInCents = Math.round(
      975 + weight * 82
    )

    return [
      {
        provider: this.key,
        serviceCode: 'ground',
        serviceName: 'Sandbox Ground',
        carrierCost: moneyFromCents(baseInCents, request.currency),
        transitDays: 4
      },
      {
        provider: this.key,
        serviceCode: 'express',
        serviceName: 'Sandbox Express',
        carrierCost: moneyFromCents(
          applyRateMultiplier(baseInCents, 170),
          request.currency
        ),
        transitDays: 2
      },
      {
        provider: this.key,
        serviceCode: 'priority',
        serviceName: 'Sandbox Priority',
        carrierCost: moneyFromCents(
          applyRateMultiplier(baseInCents, 235),
          request.currency
        ),
        transitDays: 1
      }
    ]
  }

  async purchaseLabel(
    request: LabelPurchaseRequest
  ): Promise<PurchasedLabel> {
    const suffix = request.shipmentId
      .replaceAll('-', '')
      .slice(-10)
      .toUpperCase()

    const rates = await this.getRates({
      organizationId: request.organizationId,
      sender: request.sender,
      recipient: request.recipient,
      packages: request.packages,
      currency: request.currency
    })
    const selectedRate = rates.find(
      (rate) => rate.serviceCode === request.serviceCode
    )

    if (!selectedRate) {
      throw new Error(`Unknown sandbox service "${request.serviceCode}".`)
    }

    return {
      provider: this.key,
      trackingNumber: `SIG${suffix}`,
      trackingUrl: `/tracking/SIG${suffix}`,
      labelUrl: `/api/poc/labels/${request.shipmentId}`,
      carrierCost: selectedRate.carrierCost,
      metadata: {
        serviceCode: request.serviceCode,
        idempotencyKey: request.idempotencyKey
      }
    }
  }

  async cancelLabel(
    _trackingNumber: string
  ): Promise<void> {
    return Promise.resolve()
  }

  async getTracking(
    trackingNumber: string
  ): Promise<CarrierTrackingEvent[]> {
    return [
      {
        provider: this.key,
        providerStatus: 'LABEL_CREATED',
        description: `Label created for ${trackingNumber}`,
        occurredAt: new Date().toISOString()
      }
    ]
  }

  async schedulePickup(
    request: PickupRequest
  ): Promise<ScheduledPickup> {
    const confirmation = crypto.randomUUID()
      .replaceAll('-', '')
      .slice(0, 10)
      .toUpperCase()

    return {
      provider: this.key,
      confirmationNumber: `PU${confirmation}`,
      status: 'scheduled',
      window: request.window,
      metadata: {
        parcelCount: request.parcels.length
      }
    }
  }

  async cancelPickup(
    _confirmationNumber: string
  ): Promise<void> {
    return Promise.resolve()
  }
}
