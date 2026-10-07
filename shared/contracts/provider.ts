export type ProviderCategory =
  | 'carrier'
  | 'commerce'
  | 'marketplace'
  | 'erp'

export type CredentialFieldType =
  | 'text'
  | 'url'
  | 'secret'
  | 'select'

export interface CredentialField {
  key: string
  label: string
  type: CredentialFieldType
  required: boolean
  secret?: boolean
  placeholder?: string
  options?: string[]
}

export interface ProviderCapability {
  key: string
  label: string
}

export interface ProviderManifest {
  key: string
  name: string
  category: ProviderCategory
  domain: string
  description: string
  authType: string
  capabilities: ProviderCapability[]
  credentials: CredentialField[]
  documentationUrl?: string
}
