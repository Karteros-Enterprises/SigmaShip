<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['platform-admin'] })
useHead({ title: 'Pricing & Accessorials · Admin' })

interface Client {
  id: string
  name: string
  slug: string
  markup_percent: number
  markup_fixed: number
  accessorial_markup_percent: number
  accessorial_markup_fixed: number
}
const { data, error, refresh } = await useFetch<{ clients: Client[] }>('/api/admin/clients')
const search = ref('')
const clients = computed(() => (data.value?.clients ?? []).filter(client =>
  (client.name + ' ' + client.slug).toLowerCase().includes(search.value.toLowerCase())
))
const drafts = reactive<Record<string, {
  markupPercent: number
  markupFixed: number
  accessorialMarkupPercent: number
  accessorialMarkupFixed: number
}>>({})
const saving = ref<string | null>(null)
const message = ref('')
const failure = ref('')
function edit(client: Client) {
  drafts[client.id] = {
    markupPercent: Number(client.markup_percent),
    markupFixed: Number(client.markup_fixed),
    accessorialMarkupPercent: Number(client.accessorial_markup_percent),
    accessorialMarkupFixed: Number(client.accessorial_markup_fixed)
  }
}
async function save(client: Client) {
  const draft = drafts[client.id]
  if (!draft) return
  failure.value = ''
  message.value = ''
  if (Object.values(draft).some(value => !Number.isFinite(value) || value < 0)) {
    failure.value = 'All pricing values must be non-negative numbers.'
    return
  }
  saving.value = client.id
  try {
    await $fetch('/api/admin/clients/' + client.id, { method: 'PATCH', body: draft })
    delete drafts[client.id]
    await refresh()
    message.value = client.name + ' pricing updated. New quotes will use the new markup.'
  } catch (err) {
    failure.value = err instanceof Error ? err.message : 'Unable to save pricing.'
  } finally {
    saving.value = null
  }
}
</script>
<template>
  <div class="page-stack">
    <AppPageHeader eyebrow="Commercial Control" title="Pricing & accessorials" description="Set customer-specific shipping and accessorial markups. These values are private to platform administrators." />
    <UCard>
      <div class="admin-toolbar">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Search customer organizations" />
        <UButton icon="i-lucide-refresh-cw" variant="outline" @click="refresh()">Refresh</UButton>
      </div>
      <p v-if="message" role="status">{{ message }}</p>
      <p v-if="failure" role="alert">{{ failure }}</p>
      <p v-if="error" role="alert">Unable to load pricing settings.</p>
      <div v-else-if="!clients.length" class="empty-state">No matching clients.</div>
      <div v-else class="page-stack">
        <UCard v-for="client in clients" :key="client.id">
          <div class="card-heading">
            <div><h3>{{ client.name }}</h3><p class="eyebrow">{{ client.slug }}</p></div>
            <UButton v-if="!drafts[client.id]" icon="i-lucide-pencil" variant="outline" @click="edit(client)">Edit pricing</UButton>
          </div>
          <div v-if="drafts[client.id]" class="placeholder-grid">
            <UFormField label="Shipping markup (%)"><UInput v-model.number="drafts[client.id]!.markupPercent" type="number" min="0" max="1000" step="0.01" /></UFormField>
            <UFormField label="Shipping fixed markup (CAD)"><UInput v-model.number="drafts[client.id]!.markupFixed" type="number" min="0" step="0.01" /></UFormField>
            <UFormField label="Accessorial markup (%)"><UInput v-model.number="drafts[client.id]!.accessorialMarkupPercent" type="number" min="0" max="1000" step="0.01" /></UFormField>
            <UFormField label="Accessorial fixed markup (CAD)"><UInput v-model.number="drafts[client.id]!.accessorialMarkupFixed" type="number" min="0" step="0.01" /></UFormField>
            <div class="span-2" style="display:flex;gap:.75rem;flex-wrap:wrap">
              <UButton :loading="saving === client.id" @click="save(client)">Save pricing</UButton>
              <UButton color="neutral" variant="outline" @click="delete drafts[client.id]">Cancel</UButton>
            </div>
          </div>
          <div v-else class="placeholder-grid">
            <p>Shipping: {{ client.markup_percent }}% + {{ client.markup_fixed }} fixed</p>
            <p>Accessorials: {{ client.accessorial_markup_percent }}% + {{ client.accessorial_markup_fixed }} fixed</p>
          </div>
        </UCard>
      </div>
    </UCard>
  </div>
</template>
