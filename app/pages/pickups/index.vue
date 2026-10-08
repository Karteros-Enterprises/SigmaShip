<script setup lang="ts">
definePageMeta({ layout: 'portal' })
useHead({ title: 'Pick Ups' })
interface PickupRow { id:string; provider:string; confirmation_number:string; status:string; window_start:string; window_end:string; instructions:string|null }
const { data, error, refresh } = await useFetch<{ pickups: PickupRow[] }>('/api/pickups')
const showForm = ref(false)
const shipmentIds = ref('')
const windowStart = ref('')
const windowEnd = ref('')
const instructions = ref('')
const saving = ref(false)
const submitError = ref('')
const success = ref('')
async function schedule() {
  saving.value = true
  submitError.value = ''
  success.value = ''
  try {
    const ids = shipmentIds.value.split(/[\s,]+/).map(s => s.trim()).filter(Boolean)
    if (!windowStart.value || !windowEnd.value) throw new Error('Choose a start and end time.')
    const result = await $fetch<{ pickup: { confirmationNumber: string } }>('/api/pickups', {
      method: 'POST',
      body: { shipmentIds: ids, windowStart: new Date(windowStart.value).toISOString(), windowEnd: new Date(windowEnd.value).toISOString(), instructions: instructions.value }
    })
    success.value = 'Sandbox pickup scheduled: ' + result.pickup.confirmationNumber
    showForm.value = false
    shipmentIds.value = ''
    await refresh()
  } catch (cause) {
    submitError.value = cause instanceof Error ? cause.message : 'Unable to schedule pickup.'
  } finally { saving.value = false }
}
</script>
<template><div class="page-stack">
<AppPageHeader eyebrow="Pick Ups" title="Carrier pickups" description="Schedule and review collections for your shipments. Sandbox scheduling is available; live carrier pickups are not enabled yet.">
<template #actions><UButton icon="i-lucide-calendar-plus" @click="showForm = !showForm">Schedule sandbox pickup</UButton></template>
</AppPageHeader>
<UCard v-if="showForm"><template #header><h3>Schedule a sandbox pickup</h3></template>
<div class="page-stack"><UFormField label="Shipment IDs (UUIDs, comma or space separated)"><UTextarea v-model="shipmentIds" placeholder="Paste shipment IDs from your created labels"/></UFormField>
<UFormField label="Pickup window start"><UInput v-model="windowStart" type="datetime-local"/></UFormField>
<UFormField label="Pickup window end"><UInput v-model="windowEnd" type="datetime-local"/></UFormField>
<UFormField label="Driver instructions"><UTextarea v-model="instructions" placeholder="Optional instructions"/></UFormField>
<p v-if="submitError">{{ submitError }}</p><UButton :loading="saving" @click="schedule">Confirm sandbox pickup</UButton></div></UCard>
<p v-if="success">{{ success }}</p>
<div v-if="error" class="empty-state"><h3>Pickups could not load</h3><p>{{ error.statusMessage || error.message }}</p></div>
<div v-else-if="!data?.pickups.length" class="empty-state"><h3>No pickups scheduled</h3><p>Once you schedule a pickup, it will appear here.</p></div>
<div v-else class="card-list"><UCard v-for="pickup in data.pickups" :key="pickup.id">
<template #header><div class="pickup-heading"><div><p class="eyebrow">{{ pickup.confirmation_number }}</p><h2>{{ pickup.provider }}</h2><p>{{ new Date(pickup.window_start).toLocaleString() }} – {{ new Date(pickup.window_end).toLocaleString() }}</p></div><UBadge variant="subtle">{{ pickup.status }}</UBadge></div></template>
<p v-if="pickup.instructions">{{ pickup.instructions }}</p>
</UCard></div>
</div></template>