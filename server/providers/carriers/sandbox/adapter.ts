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

function money(
  amount: number,
  currency: string
) {
  return {
    amount: Number(amount.toFixed(2)),
    currency
  }
}

export class SandboxCarrierAdapter implements CarrierAdapter {
  readonly key = 'sandbox'

  async getRates(
    request: RateRequest
  ): Promise<CarrierRate[]> {
    const weight = totalWeight(request)
    const base = 9.75 + weight * 0.82

    return [
      {
        provider: this.key,
        serviceCode: 'ground',
        serviceName: 'Sandbox Ground',
        carrierCost: money(base, request.currency),
        transitDays: 4
      },
      {
        provider: this.key,
        serviceCode: 'express',
        serviceName: 'Sandbox Express',
        carrierCost: money(base * 1.7, request.currency),
        transitDays: 2
      },
      {
        provider: this.key,
        serviceCode: 'priority',
        serviceName: 'Sandbox Priority',
        carrierCost: money(base * 2.35, request.currency),
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

    return {
      provider: this.key,
      trackingNumber: `SIG${suffix}`,
      trackingUrl: `/tracking/SIG${suffix}`,
      labelUrl: `/api/poc/labels/${request.shipmentId}`,
      carrierCost: money(14.25, 'CAD'),
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
