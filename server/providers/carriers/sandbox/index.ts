import { registerCarrier } from '../../registry'
import { SandboxCarrierAdapter } from './adapter'
import { sandboxCarrierManifest } from './manifest'

export function registerSandboxCarrier() {
  registerCarrier(
    sandboxCarrierManifest,
    () => new SandboxCarrierAdapter()
  )
}
