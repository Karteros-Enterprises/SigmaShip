<script setup lang="ts">
definePageMeta({
  layout: 'portal'
})

useHead({
  title: 'Integrations'
})

const salesChannels = [
  ['amazon', 'Amazon', 'amazon.com', 'Marketplace & commerce'],
  ['bluelink', 'BlueLink', 'bluelinkerp.com', 'ERP & order management'],
  ['shopify', 'Shopify', 'shopify.com', 'Commerce platform'],
  ['woocommerce', 'WooCommerce', 'woocommerce.com', 'Commerce platform'],
  ['wix', 'Wix', 'wix.com', 'Commerce platform'],
  ['bigcommerce', 'BigCommerce', 'bigcommerce.com', 'Commerce platform'],
  ['magento2', 'Magento 2', 'adobe.com', 'Commerce platform'],
  ['lightspeed', 'Lightspeed', 'lightspeedhq.com', 'Retail & commerce'],
  ['squarespace', 'Squarespace', 'squarespace.com', 'Commerce platform'],
  ['ecwid', 'Ecwid', 'ecwid.com', 'Commerce platform']
]

const marketplaces = [
  ['amazon', 'Amazon', 'amazon.com'],
  ['temu', 'Temu', 'temu.com'],
  ['etsy', 'Etsy', 'etsy.com'],
  ['walmart', 'Walmart', 'walmart.com'],
  ['bestbuy', 'Best Buy', 'bestbuy.ca'],
  ['ebay', 'eBay', 'ebay.com'],
  ['reverb', 'Reverb', 'reverb.com'],
  ['reebelo', 'Reebelo', 'reebelo.com']
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
          v-for="[key, name, domain, description] in salesChannels"
          :key="key"
          :provider-key="key"
          :name="name"
          :domain="domain"
          :description="description"
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
          v-for="[key, name, domain] in marketplaces"
          :key="key"
          :provider-key="key"
          :name="name"
          :domain="domain"
          description="Marketplace"
        />
      </div>
    </section>
  </div>
</template>
