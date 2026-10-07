<script setup lang="ts">
definePageMeta({ layout: 'portal' })

useHead({ title: 'Ship' })

const steps = [
  { title: 'Sender', description: 'Origin address' },
  { title: 'Recipient', description: 'Destination address' },
  { title: 'Package', description: 'Weight and dimensions' },
  { title: 'Rates', description: 'Compare services' },
  { title: 'Review & pay', description: 'Confirm shipment' },
  { title: 'Label', description: 'Print and track' }
]
</script>

<template>
  <div class="page-stack">
    <AppPageHeader
      eyebrow="Shipping"
      title="Create shipment"
      description="Build the shipment once. SigmaShip will compare eligible carrier services and keep the order, label and tracking lifecycle together."
    >
      <template #actions>
        <UButton color="neutral" variant="outline" icon="i-lucide-book-open">
          Address Book
        </UButton>
      </template>
    </AppPageHeader>

    <div class="shipment-layout">
      <section class="shipment-form-stack">
        <UCard>
          <template #header>
            <div class="card-heading">
              <div>
                <p class="eyebrow">Step 1</p>
                <h2>Sender</h2>
              </div>
              <UBadge color="neutral" variant="subtle">Required</UBadge>
            </div>
          </template>

          <div class="placeholder-grid">
            <UFormField label="Contact name"><UInput class="w-full" /></UFormField>
            <UFormField label="Company"><UInput class="w-full" /></UFormField>
            <UFormField label="Street address" class="span-2"><UInput class="w-full" /></UFormField>
            <UFormField label="City"><UInput class="w-full" /></UFormField>
            <UFormField label="Province / State"><USelect class="w-full" :items="['Ontario']" /></UFormField>
            <UFormField label="Postal / ZIP"><UInput class="w-full" /></UFormField>
            <UFormField label="Country"><USelect class="w-full" :items="['Canada', 'United States']" /></UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="card-heading">
              <div>
                <p class="eyebrow">Step 2</p>
                <h2>Recipient</h2>
              </div>
              <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-up-down">
                Swap
              </UButton>
            </div>
          </template>

          <p class="section-placeholder">
            Recipient, international customs and package components migrate here next.
          </p>
        </UCard>
      </section>

      <aside class="shipment-overview">
        <UCard>
          <template #header>
            <div>
              <p class="eyebrow">Shipment overview</p>
              <h2>Ready when you are</h2>
            </div>
          </template>

          <div class="overview-steps">
            <div v-for="(step, index) in steps" :key="step.title" class="overview-step">
              <span>{{ index + 1 }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <p>{{ step.description }}</p>
              </div>
            </div>
          </div>
        </UCard>
      </aside>
    </div>
  </div>
</template>
