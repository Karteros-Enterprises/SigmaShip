import type { CarrierAdapter } from '#shared/contracts/carrier'
import type { CommerceAdapter } from '#shared/contracts/commerce'
import type { ProviderManifest } from '#shared/contracts/provider'

type CarrierFactory = () => CarrierAdapter
type CommerceFactory = () => CommerceAdapter

const manifests = new Map<string, ProviderManifest>()
const carrierFactories = new Map<string, CarrierFactory>()
const commerceFactories = new Map<string, CommerceFactory>()

export function registerProvider(
  manifest: ProviderManifest
) {
  if (manifests.has(manifest.key)) {
    throw new Error(
      `Provider "${manifest.key}" is already registered.`
    )
  }

  manifests.set(manifest.key, manifest)
}

export function registerCarrier(
  manifest: ProviderManifest,
  factory: CarrierFactory
) {
  registerProvider(manifest)
  carrierFactories.set(manifest.key, factory)
}

export function registerCommerceProvider(
  manifest: ProviderManifest,
  factory: CommerceFactory
) {
  registerProvider(manifest)
  commerceFactories.set(manifest.key, factory)
}

export function getProviderManifest(
  key: string
) {
  return manifests.get(key)
}

export function listProviderManifests() {
  return [...manifests.values()]
}

export function createCarrierAdapter(
  key: string
) {
  const factory = carrierFactories.get(key)

  if (!factory) {
    throw new Error(
      `Carrier adapter "${key}" is not registered.`
    )
  }

  return factory()
}

export function createCommerceAdapter(
  key: string
) {
  const factory = commerceFactories.get(key)

  if (!factory) {
    throw new Error(
      `Commerce adapter "${key}" is not registered.`
    )
  }

  return factory()
}
