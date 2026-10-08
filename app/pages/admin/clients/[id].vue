<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['platform-admin'] })
const route = useRoute()
const id = String(route.params.id)
interface ClientDetailResponse {
  client: { id: string; name: string; slug: string; markup_percent: number; markup_fixed: number; accessorial_markup_percent: number; accessorial_markup_fixed: number }
  users: Array<{ user_id: string; role: string; created_at: string }>
  shipments: Array<{ id: string; status: string; carrier: string | null; tracking_number: string | null; customer_charge: number | null; carrier_cost: number | null; markup_amount: number | null }>
  carrierAccounts: Array<{ id: string; display_name: string; provider: string; status: string }>
}
const { data, error, refresh } = await useFetch<ClientDetailResponse>('/api/admin/clients/' + id)
const form = reactive({ markupPercent: 0, markupFixed: 0, accessorialMarkupPercent: 0, accessorialMarkupFixed: 0 })
watchEffect(() => {
  const client = data.value?.client
  if (!client) return
  form.markupPercent = Number(client.markup_percent)
  form.markupFixed = Number(client.markup_fixed)
  form.accessorialMarkupPercent = Number(client.accessorial_markup_percent)
  form.accessorialMarkupFixed = Number(client.accessorial_markup_fixed)
})
const saving = ref(false)
const saved = ref(false)
async function saveMarkup() {
  saving.value = true
  saved.value = false
  try {
    await $fetch('/api/admin/clients/' + id, { method: 'PATCH', body: form })
    await refresh()
    saved.value = true
  } finally { saving.value = false }
}
</script>
<template><div class="page-stack">
<div v-if="error" class="empty-state"><h3>Client could not load</h3><p>{{ error.statusMessage || error.message }}</p></div>
<template v-else-if="data?.client">
<AppPageHeader eyebrow="Client" :title="data.client.name" :description="'Workspace: ' + data.client.slug"/>
<div class="metric-grid"><UCard><p class="metric-label">Users</p><strong>{{ data.users.length }}</strong><span>Workspace members</span></UCard><UCard><p class="metric-label">Shipments</p><strong>{{ data.shipments.length }}</strong><span>Recent shipments</span></UCard><UCard><p class="metric-label">Carrier accounts</p><strong>{{ data.carrierAccounts.length }}</strong><span>Configured sources</span></UCard></div>
<div class="admin-two-column"><UCard><template #header><strong>Customer markup</strong></template><div class="page-stack">
<UFormField label="Shipping markup (%)"><UInput v-model.number="form.markupPercent" type="number" min="0" step="0.01"/></UFormField>
<UFormField label="Shipping fixed markup"><UInput v-model.number="form.markupFixed" type="number" min="0" step="0.01"/></UFormField>
<UFormField label="Accessorial markup (%)"><UInput v-model.number="form.accessorialMarkupPercent" type="number" min="0" step="0.01"/></UFormField>
<UFormField label="Accessorial fixed markup"><UInput v-model.number="form.accessorialMarkupFixed" type="number" min="0" step="0.01"/></UFormField>
<div><UButton :loading="saving" @click="saveMarkup">Save markup</UButton><span v-if="saved"> Saved</span></div></div></UCard>
<UCard><template #header><strong>Carrier accounts</strong></template><div v-if="!data.carrierAccounts.length" class="empty-state"><p>No customer carrier accounts configured.</p></div><div v-else><p v-for="account in data.carrierAccounts" :key="account.id"><strong>{{ account.display_name }}</strong> · {{ account.provider }} · {{ account.status }}</p></div></UCard></div>
<UCard><template #header><strong>Recent shipments</strong></template><div v-if="!data.shipments.length" class="empty-state"><p>No shipments yet.</p></div><div v-else class="data-table-scroll"><table class="data-table"><thead><tr><th>Tracking</th><th>Carrier</th><th>Status</th><th>Customer charge</th><th>Carrier cost</th><th>Markup</th></tr></thead><tbody><tr v-for="shipment in data.shipments" :key="shipment.id"><td>{{ shipment.tracking_number || '—' }}</td><td>{{ shipment.carrier || '—' }}</td><td>{{ shipment.status }}</td><td>{{ shipment.customer_charge ?? '—' }}</td><td>{{ shipment.carrier_cost ?? '—' }}</td><td>{{ shipment.markup_amount ?? '—' }}</td></tr></tbody></table></div></UCard>
</template></div></template>