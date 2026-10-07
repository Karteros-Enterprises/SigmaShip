<script setup lang="ts">
interface IntegrationSummary {
  key: string
  name: string
  domain: string
  description: string
}

definePageMeta({
  layout: 'portal'
})

useHead({
  title: 'Integrations'
})

const salesChannels: IntegrationSummary[] = [
  { key: 'amazon', name: 'Amazon', domain: 'amazon.com', description: 'Marketplace & commerce' },
  { key: 'bluelink', name: 'BlueLink', domain: 'bluelinkerp.com', description: 'ERP & order management' },
  { key: 'shopify', name: 'Shopify', domain: 'shopify.com', description: 'Commerce platform' },
  { key: 'woocommerce', name: 'WooCommerce', domain: 'woocommerce.com', description: 'Commerce platform' },
  { key: 'wix', name: 'Wix', domain: 'wix.com', description: 'Commerce platform' },
  { key: 'bigcommerce', name: 'BigCommerce', domain: 'bigcommerce.com', description: 'Commerce platform' },
  { key: 'magento2', name: 'Magento 2', domain: 'adobe.com', description: 'Commerce platform' },
  { key: 'lightspeed', name: 'Lightspeed', domain: 'lightspeedhq.com', description: 'Retail & commerce' },
  { key: 'squarespace', name: 'Squarespace', domain: 'squarespace.com', description: 'Commerce platform' },
  { key: 'ecwid', name: 'Ecwid', domain: 'ecwid.com', description: 'Commerce platform' }
]

const marketplaces: IntegrationSummary[] = [
  { key: 'amazon', name: 'Amazon', domain: 'amazon.com', description: 'Marketplace' },
  { key: 'temu', name: 'Temu', domain: 'temu.com', description: 'Marketplace' },
  { key: 'etsy', name: 'Etsy', domain: 'etsy.com', description: 'Marketplace' },
  { key: 'walmart', name: 'Walmart', domain: 'walmart.com', description: 'Marketplace' },
  { key: 'bestbuy', name: 'Best Buy', domain: 'bestbuy.ca', description: 'Marketplace' },
  { key: 'ebay', name: 'eBay', domain: 'ebay.com', description: 'Marketplace' },
  { key: 'reverb', name: 'Reverb', domain: 'reverb.com', description: 'Marketplace' },
  { key: 'reebelo', name: 'Reebelo', domain: 'reebelo.com', description: 'Marketplace' }
]
</script>

<template>
  <div class="page-stack">
    <AppPageHeader
      eyebrow="Integrations"
      title="Connect where you sell"
      description="Import orders into one SigmaShip queue and send fulfillment and tracking back after label purchase."
    />

    <section class="page-section">
      <AppSectionHeading
        title="Sales channels"
        description="Commerce and ERP systems that can feed orders into SigmaShip."
      />

      <div class="integration-grid">
        <IntegrationCard
          v-for="provider in salesChannels"
          :key="provider.key"
          :provider-key="provider.key"
          :name="provider.name"
          :domain="provider.domain"
          :description="provider.description"
        />
      </div>
    </section>

    <section class="page-section">
      <AppSectionHeading
        title="Marketplaces"
        description="Marketplace seller accounts managed through the same fulfillment workspace."
      />

      <div class="integration-grid">
        <IntegrationCard
          v-for="provider in marketplaces"
          :key="provider.key"
          :provider-key="provider.key"
          :name="provider.name"
          :domain="provider.domain"
          :description="provider.description"
        />
      </div>
    </section>
  </div>
</template>
