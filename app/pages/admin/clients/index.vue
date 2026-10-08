<script setup lang="ts">
definePageMeta({layout:'admin',middleware:['platform-admin']});useHead({title:'Clients · Admin'})
const search=ref('');const {data,error,refresh}=await useFetch('/api/admin/clients')
const clients=computed(()=>{const q=search.value.trim().toLowerCase();return (data.value?.clients??[]).filter((organization)=>!q||[organization.name,organization.slug].join(' ').toLowerCase().includes(q))})
const changing = ref<string | null>(null)
const statusError = ref('')
async function toggleStatus(client: { id: string; is_active: boolean; name: string }) {
  const next = !client.is_active
  if (!confirm(`${next ? 'Activate' : 'Deactivate'} ${client.name}?`)) return
  changing.value = client.id
  statusError.value = ''
  try {
    await $fetch('/api/admin/clients/' + client.id + '/status', { method: 'PATCH', body: { active: next } })
    await refresh()
  } catch (error) {
    statusError.value = error instanceof Error ? error.message : 'Unable to change account status.'
  } finally { changing.value = null }
}
</script><template><div class="page-stack"><AppPageHeader eyebrow="Clients" title="Customer accounts" description="Manage every SigmaShip organization, its users, carrier sources, markup and billing status."/><UCard><p v-if="statusError" role="alert">{{ statusError }}</p><div class="admin-toolbar"><UInput v-model="search" icon="i-lucide-search" placeholder="Search clients"/><UButton icon="i-lucide-refresh-cw" variant="outline" @click="refresh()">Refresh</UButton></div><div v-if="error" class="empty-state"><h3>Clients could not load</h3><p>{{ error.statusMessage || error.message }}</p></div><div v-else-if="!clients.length" class="empty-state"><h3>No client organizations found</h3><p>Once customer ΣigmaSpaces exist in the organizations table they will appear here automatically.</p></div><div v-else class="data-table-scroll"><table class="data-table"><thead><tr><th>Client</th><th>ΣigmaSpace</th><th>Created</th><th>Status</th><th></th></tr></thead><tbody><tr v-for="client in clients" :key="client.id"><td><strong>{{client.name}}</strong></td><td>{{client.slug}}</td><td>{{new Date(client.created_at).toLocaleDateString()}}</td><td><UBadge :color="client.is_active ? 'success' : 'error'" variant="subtle">{{ client.is_active ? 'Active' : 'Inactive' }}</UBadge></td><td><UButton size="sm" :loading="changing === client.id" :color="client.is_active ? 'error' : 'success'" variant="outline" @click="toggleStatus(client)">{{ client.is_active ? 'Deactivate' : 'Activate' }}</UButton> <UButton :to="'/admin/clients/'+client.id" color="neutral" variant="outline" size="sm">Open</UButton></td></tr></tbody></table></div></UCard></div></template>