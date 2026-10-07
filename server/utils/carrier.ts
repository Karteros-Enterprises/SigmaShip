import { createCarrierAdapter, getProviderManifest } from '../providers/registry'
import { registerSandboxCarrier } from '../providers/carriers/sandbox'

export function getSandboxCarrier() {
  if (!getProviderManifest('sandbox')) {
    registerSandboxCarrier()
  }

  return createCarrierAdapter('sandbox')
}
