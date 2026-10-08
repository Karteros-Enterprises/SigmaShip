<script setup lang="ts">
const route=useRoute()
const nav=[
{to:'/admin',label:'Overview',icon:'i-lucide-layout-dashboard'},
{to:'/admin/clients',label:'Clients',icon:'i-lucide-building-2'},
{to:'/admin/tracking',label:'Global Tracking',icon:'i-lucide-map-pin'},
{to:'/admin/carriers',label:'Carrier Accounts',icon:'i-lucide-truck'},
{to:'/admin/pricing',label:'Pricing & Accessorials',icon:'i-lucide-badge-dollar-sign'},
{to:'/admin/billing',label:'Billing',icon:'i-lucide-receipt-text'},
{to:'/admin/documents',label:'Documents',icon:'i-lucide-files'},
{to:'/admin/audit',label:'Audit Log',icon:'i-lucide-scroll-text'}]
const active=(p:string)=>route.path===p||route.path.startsWith(p+'/')
</script>
<template><div class="portal-shell admin-shell"><aside class="portal-sidebar"><NuxtLink to="/admin" class="portal-brand"><span class="portal-brand-mark">Σ</span><span>SigmaShip <small>ADMIN</small></span></NuxtLink><nav class="portal-navigation"><section class="portal-nav-group"><p>PLATFORM</p><NuxtLink v-for="i in nav" :key="i.to" :to="i.to" class="portal-nav-link" :class="{'is-active':active(i.to)}"><UIcon :name="i.icon"/><span>{{i.label}}</span></NuxtLink></section></nav><div class="portal-sidebar-footer"><NuxtLink to="/ship">← Customer portal</NuxtLink></div></aside><div class="portal-main"><header class="portal-topbar"><div><p class="eyebrow">SigmaShip Control</p><strong>Platform administration</strong></div><UBadge color="success" variant="subtle">Platform admin</UBadge></header><main class="portal-workspace"><slot/></main></div></div></template>