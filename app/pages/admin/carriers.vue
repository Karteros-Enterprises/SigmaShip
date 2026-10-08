<script setup lang="ts">
import { CARRIER_CONNECTIONS } from '#shared/contracts/carrier-connections'
definePageMeta({ layout: 'admin', middleware: ['platform-admin'] })
useHead({ title: 'Carrier Accounts · Admin' })
interface CarrierAccount { id:string; organization_id:string|null; provider:string; ownership:string; display_name:string; external_account_id:string|null; status:string; enabled:boolean; validated_at:string|null; last_error:string|null }
interface CarrierResponse { accounts: CarrierAccount[] }
const carriers = Object.values(CARRIER_CONNECTIONS)
const { data, error, refresh } = await useFetch<CarrierResponse>('/api/admin/carriers')
const accounts = computed(() => data.value?.accounts ?? [])
function accountFor(code:string){ return accounts.value.filter(account => account.provider === code) }
</script>
<template><div class="page-stack">
<AppPageHeader eyebrow="Rate Sources" title="Carrier accounts" description="Manage SigmaShip master rates and customer BYO carrier accounts. A carrier is only connected after credential validation succeeds."/>
<div v-if="error" class="empty-state"><h3>Carrier accounts could not load</h3><p>{{ error.statusMessage || error.message }}</p></div>
<div class="integration-grid"><UCard v-for="carrier in carriers" :key="carrier.code"><div class="integration-card-content"><div class="integration-logo"><UIcon name="i-lucide-truck"/></div><div class="integration-copy"><p class="eyebrow">{{ carrier.auth }}</p><h3>{{ carrier.displayName }}</h3><p>{{ carrier.fields.length }} connection parameters · {{ accountFor(carrier.code).length }} configured account(s)</p><p v-for="account in accountFor(carrier.code)" :key="account.id"><strong>{{ account.display_name }}</strong> · {{ account.ownership }} · {{ account.status }}<span v-if="account.last_error"> · {{ account.last_error }}</span></p></div><UButton color="neutral" variant="outline" disabled>Configure</UButton></div></UCard></div>
<UButton icon="i-lucide-refresh-cw" variant="outline" @click="refresh()">Refresh accounts</UButton>
</div></template>