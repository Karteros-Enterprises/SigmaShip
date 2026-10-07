# SigmaShip provider architecture

Carrier and commerce integrations are isolated behind provider contracts.

## Adding a carrier

A new carrier should require:

1. A provider manifest.
2. One adapter implementing `CarrierAdapter`.
3. Credential validation.
4. Mapping provider rates into `CarrierRate`.
5. Mapping labels into `PurchasedLabel`.
6. Mapping tracking events into the canonical tracking model.
7. Contract tests and provider fixtures.

The Shipping, Tracking, Accounting and customer portal layers must not import
carrier SDKs directly.

## Adding a commerce or marketplace provider

A new sales channel should require:

1. A provider manifest.
2. One adapter implementing `CommerceAdapter`.
3. OAuth/API-key handling in the server layer.
4. Mapping external orders into `NormalizedOrder`.
5. Mapping SigmaShip fulfillment back into the provider format.
6. Webhook verification and handling where supported.
7. Contract tests and provider fixtures.

Pages must not contain Shopify, Amazon, Etsy or other provider-specific API
logic.

## Secrets

Provider manifests may describe which credentials are required, but secret
values must never be stored in manifests, browser state or source control.
Only opaque secret references belong in the SigmaShip database.

## Design rule

The core application depends on contracts. Provider adapters depend on vendor
APIs. Vendor APIs never become dependencies of the core shipping domain.
