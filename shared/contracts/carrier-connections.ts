/**
 * Carrier onboarding requirements. Fields are metadata only; secret values
 * belong in a server-side encrypted secret store, never integrations.configuration.
 * An account is not connected until the carrier adapter validates it.
 */
export type CarrierCode = 'stallion' | 'ups' | 'fedex' | 'purolator' | 'canada_post'
export type CarrierCredentialField = {
  key: string
  label: string
  secret: boolean
  required: boolean
  help?: string
}
export type CarrierConnectionDefinition = {
  code: CarrierCode
  displayName: string
  auth: 'bearer' | 'oauth2' | 'api_key' | 'basic'
  fields: CarrierCredentialField[]
  supports: { rates: boolean; labels: boolean; tracking: boolean; pickups: boolean }
  notes: string
}
export const CARRIER_CONNECTIONS: Record<CarrierCode, CarrierConnectionDefinition> = {
  stallion: {
    code: 'stallion', displayName: 'Stallion Express', auth: 'bearer',
    fields: [
      { key: 'apiToken', label: 'API v5 token', secret: true, required: true },
      { key: 'environment', label: 'Environment (sandbox/production)', secret: false, required: true }
    ],
    supports: { rates: true, labels: true, tracking: false, pickups: false },
    notes: 'Verify v5 endpoints and account permissions before enabling live writes.'
  },
  ups: {
    code: 'ups', displayName: 'UPS', auth: 'oauth2',
    fields: [
      { key: 'clientId', label: 'OAuth client ID', secret: true, required: true },
      { key: 'clientSecret', label: 'OAuth client secret', secret: true, required: true },
      { key: 'shipperNumber', label: 'UPS shipper account number', secret: false, required: true },
      { key: 'environment', label: 'Environment', secret: false, required: true }
    ],
    supports: { rates: false, labels: false, tracking: false, pickups: false },
    notes: 'Client credentials must be authorized for the shipper account.'
  },
  fedex: {
    code: 'fedex', displayName: 'FedEx', auth: 'oauth2',
    fields: [
      { key: 'clientId', label: 'API key / client ID', secret: true, required: true },
      { key: 'clientSecret', label: 'Secret key', secret: true, required: true },
      { key: 'accountNumber', label: 'FedEx account number', secret: false, required: true },
      { key: 'childKey', label: 'Customer key (compatible-provider onboarding)', secret: true, required: false },
      { key: 'childSecret', label: 'Customer password (compatible-provider onboarding)', secret: true, required: false },
      { key: 'environment', label: 'Environment', secret: false, required: true }
    ],
    supports: { rates: false, labels: false, tracking: false, pickups: false },
    notes: 'Compatible-provider customer credential registration may require customer name and matching billing address.'
  },
  purolator: {
    code: 'purolator', displayName: 'Purolator', auth: 'api_key',
    fields: [
      { key: 'apiKey', label: 'E-Ship API / activation key', secret: true, required: true },
      { key: 'apiPassword', label: 'API password (if issued)', secret: true, required: false },
      { key: 'accountNumber', label: 'Purolator billing account number', secret: false, required: true },
      { key: 'environment', label: 'Environment', secret: false, required: true }
    ],
    supports: { rates: false, labels: false, tracking: false, pickups: false },
    notes: 'Confirm exact credentials and service permissions in the customer E-Ship developer portal.'
  },
  canada_post: {
    code: 'canada_post', displayName: 'Canada Post', auth: 'basic',
    fields: [
      { key: 'username', label: 'Developer API username', secret: true, required: true },
      { key: 'password', label: 'Developer API password', secret: true, required: true },
      { key: 'customerNumber', label: 'Customer number', secret: false, required: true },
      { key: 'contractId', label: 'Contract number (contract shipping)', secret: false, required: false },
      { key: 'platformId', label: 'Platform ID (merchant onboarding)', secret: false, required: false },
      { key: 'environment', label: 'Environment', secret: false, required: true }
    ],
    supports: { rates: false, labels: false, tracking: false, pickups: false },
    notes: 'Merchant onboarding has a separate registration-token flow; contract and non-contract shipping differ.'
  }
}
export function getCarrierConnectionDefinition(code: string): CarrierConnectionDefinition {
  if (!Object.prototype.hasOwnProperty.call(CARRIER_CONNECTIONS, code)) {
    throw new Error('Unsupported carrier')
  }
  return CARRIER_CONNECTIONS[code as CarrierCode]
}
