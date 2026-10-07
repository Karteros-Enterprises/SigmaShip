<script setup lang="ts">
definePageMeta({
  layout: 'portal'
})

useHead({
  title: 'Pick Ups'
})

const pickups = [
  {
    id: 'PU-1048',
    carrier: 'Purolator',
    window: 'Today · 2:00 PM – 5:00 PM',
    status: 'Scheduled',
    parcels: [
      {
        shipment: 'SS-10482',
        service: 'Purolator Ground',
        tracking: 'PRL-782901284',
        destination: 'Vancouver, BC',
        package: '8.2 lb · 14 × 10 × 8 in'
      },
      {
        shipment: 'SS-10483',
        service: 'Purolator Express',
        tracking: 'PRL-782901285',
        destination: 'Ottawa, ON',
        package: '3.4 lb · 12 × 9 × 6 in'
      },
      {
        shipment: 'SS-10484',
        service: 'Purolator Ground',
        tracking: 'PRL-782901286',
        destination: 'Halifax, NS',
        package: '11.0 lb · 18 × 12 × 10 in'
      }
    ]
  },
  {
    id: 'PU-1047',
    carrier: 'UPS',
    window: 'Oct 06 · 1:00 PM – 4:00 PM',
    status: 'Completed',
    parcels: [
      {
        shipment: 'SS-10480',
        service: 'UPS Standard',
        tracking: '1Z84A921039',
        destination: 'Montréal, QC',
        package: '5.1 lb · 12 × 10 × 8 in'
      },
      {
        shipment: 'SS-10481',
        service: 'UPS Standard',
        tracking: '1Z84A921040',
        destination: 'Québec, QC',
        package: '6.8 lb · 14 × 10 × 8 in'
      }
    ]
  }
]
</script>

<template>
  <div class="page-stack">
    <AppPageHeader
      eyebrow="Pick Ups"
      title="Carrier pickups"
      description="Schedule collections and see every parcel included before the driver arrives."
    >
      <template #actions>
        <UButton icon="i-lucide-calendar-plus">
          Schedule pickup
        </UButton>
      </template>
    </AppPageHeader>

    <div class="card-list">
      <UCard
        v-for="pickup in pickups"
        :key="pickup.id"
      >
        <template #header>
          <div class="pickup-heading">
            <div>
              <p class="eyebrow">{{ pickup.id }}</p>
              <h2>{{ pickup.carrier }}</h2>
              <p>{{ pickup.window }}</p>
            </div>

            <div class="pickup-heading-meta">
              <UBadge
                :color="pickup.status === 'Completed' ? 'success' : 'info'"
                variant="subtle"
              >
                {{ pickup.status }}
              </UBadge>

              <span>{{ pickup.parcels.length }} parcels</span>
            </div>
          </div>
        </template>

        <div class="data-table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Service / Tracking</th>
                <th>Ship To</th>
                <th>Package</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="parcel in pickup.parcels"
                :key="parcel.tracking"
              >
                <td>{{ parcel.shipment }}</td>

                <td>
                  <strong>{{ parcel.service }}</strong>
                  <span>{{ parcel.tracking }}</span>
                </td>

                <td>{{ parcel.destination }}</td>
                <td>{{ parcel.package }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>
  </div>
</template>
