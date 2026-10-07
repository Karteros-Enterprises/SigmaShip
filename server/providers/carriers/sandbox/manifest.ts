import type { ProviderManifest } from '#shared/contracts/provider'

export const sandboxCarrierManifest: ProviderManifest = {
  key: 'sandbox',
  name: 'SigmaShip Sandbox',
  category: 'carrier',
  domain: 'sigmaship.local',
  description: 'Deterministic carrier simulator for proof-of-concept workflows.',
  authType: 'none',
  capabilities: [
    { key: 'rates', label: 'Rate estimates' },
    { key: 'labels', label: 'Shipment creation' },
    { key: 'voids', label: 'Shipment cancellation' },
    { key: 'tracking', label: 'Tracking' },
    { key: 'pickups', label: 'Pickup scheduling' },
    { key: 'pickup-cancellation', label: 'Pickup cancellation' }
  ],
  credentials: []
}
