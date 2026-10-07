<script setup lang="ts">
definePageMeta({
  layout: 'portal'
})

useHead({
  title: 'Tracking'
})

const search = ref('')

const shipments = [
  {
    service: 'Purolator Ground',
    tracking: 'PRL-782901284',
    recipient: 'Alex Morgan',
    address: '1285 W Pender St, Vancouver, BC V6E 4B1',
    createdAt: 'Oct 07, 2026 · 8:14 AM',
    charge: '$18.42 CAD',
    status: 'In transit'
  },
  {
    service: 'UPS Standard',
    tracking: '1Z84A921039',
    recipient: 'Jamie Lee',
    address: '1250 René-Lévesque Blvd W, Montréal, QC H3B 4W8',
    createdAt: 'Oct 06, 2026 · 4:32 PM',
    charge: '$16.90 CAD',
    status: 'Delivered'
  },
  {
    service: 'FedEx Ground',
    tracking: '78410293401',
    recipient: 'Sam Rivera',
    address: '205 9 Ave SE, Calgary, AB T2G 0R3',
    createdAt: 'Oct 06, 2026 · 11:05 AM',
    charge: '$20.14 CAD',
    status: 'Exception'
  }
]

const filteredShipments = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (!query) {
    return shipments
  }

  return shipments.filter((shipment) => {
    return Object.values(shipment)
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
})

function statusColor(status: string) {
  if (status === 'Delivered') return 'success'
  if (status === 'Exception') return 'error'
  return 'info'
}
</script>

<template>
  <div class="page-stack">
    <AppPageHeader
      eyebrow="Tracking"
      title="Shipment tracking"
      description="Search purchased labels, review delivery status and open the complete shipment history."
    />

    <div class="metric-grid">
      <UCard>
        <p class="metric-label">In transit</p>
        <strong>18</strong>
        <span>Active shipments</span>
      </UCard>

      <UCard>
        <p class="metric-label">Delivered</p>
        <strong>142</strong>
        <span>This month</span>
      </UCard>

      <UCard>
        <p class="metric-label">Exceptions</p>
        <strong>3</strong>
        <span>Require attention</span>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <AppSectionHeading
          title="Tracking ledger"
          description="Each tracking number appears once, with the service, destination, creation time, charge and current status."
        >
          <template #actions>
            <UInput
              v-model="search"
              class="tracking-search"
              icon="i-lucide-search"
              placeholder="Search tracking"
            />
          </template>
        </AppSectionHeading>
      </template>

      <div class="data-table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Service Used</th>
              <th>Ship To</th>
              <th>Date & Time Created</th>
              <th>Charge</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="shipment in filteredShipments"
              :key="shipment.tracking"
            >
              <td>
                <strong>{{ shipment.service }}</strong>
                <span>{{ shipment.tracking }}</span>
              </td>

              <td>
                <strong>{{ shipment.recipient }}</strong>
                <span>{{ shipment.address }}</span>
              </td>

              <td>{{ shipment.createdAt }}</td>
              <td>{{ shipment.charge }}</td>

              <td>
                <UBadge
                  :color="statusColor(shipment.status)"
                  variant="subtle"
                >
                  {{ shipment.status }}
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
