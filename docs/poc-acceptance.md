# SigmaShip proof-of-concept acceptance criteria

The POC is successful only when the workflows below execute end to end. A screen
that is not connected to underlying state does not count as complete.

## User registration

- A new user can create an account with email and password.
- Supabase Auth owns credentials.
- A matching SigmaShip profile is created.
- Duplicate or invalid registration produces a useful error.
- The user is sent to onboarding after authentication.

## User sign in

- An existing user can sign in and sign out.
- Protected portal routes reject anonymous users.
- Authenticated sessions survive a browser refresh.
- Users cannot access another organization's data.

## User onboarding

- The user creates or names their organization.
- The first user becomes the organization owner.
- Basic sender/contact defaults can be captured.
- Completion is persisted.
- Completed users go to Ship instead of onboarding.

## Rate estimates and quotes

- Sender, recipient and package details are validated server-side.
- The rate engine calls registered carrier adapters.
- Carrier responses are normalized into SigmaShip rates.
- Customer price is calculated separately from carrier cost.
- Quotes expire and can be persisted.

## Shipment creation

- The user selects a valid quote.
- The server purchases the label through the carrier adapter.
- Purchase is idempotent.
- Tracking and label references are persisted.
- Financial values are snapshotted at purchase time.
- The shipment appears in Tracking.

## Shipment cancellation and voiding

- Only eligible purchased shipments can be voided.
- The carrier adapter is called before SigmaShip marks the shipment cancelled.
- Cancellation time, reason and carrier reference are persisted.
- Repeated cancellation is safe.

## Pickup scheduling

- The user selects eligible shipments and a pickup window.
- The server calls the selected carrier adapter.
- The confirmation number and parcel relationships are persisted.
- The pickup appears in Pick Ups.

## Pickup cancellation

- Only an active pickup can be cancelled.
- The carrier adapter receives the cancellation.
- SigmaShip records cancellation after a successful provider response.
- Repeated cancellation is safe.

## POC carrier strategy

The SigmaShip Sandbox adapter exercises the complete carrier contract without
making the application depend on a production carrier account.

Production carrier adapters implement the same contract. Core UI and workflow
code must not contain sandbox-specific branches.
