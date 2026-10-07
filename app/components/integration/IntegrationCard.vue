<script setup lang="ts">
const props = defineProps<{
  providerKey: string
  name: string
  domain: string
  description: string
}>()

const setupPath = computed(() => {
  return `/integrations/${props.providerKey}`
})
</script>

<template>
  <UCard class="integration-card">
    <div class="integration-card-content">
      <div class="integration-logo">
        <img
          :src="`https://www.google.com/s2/favicons?domain=${domain}&sz=128`"
          :alt="`${name} logo`"
          loading="lazy"
        >
      </div>

      <div class="integration-copy">
        <UBadge
          color="neutral"
          variant="subtle"
          size="xs"
        >
          Not configured
        </UBadge>

        <h3>{{ name }}</h3>
        <p>{{ description }}</p>
      </div>

      <UButton
        :to="setupPath"
        color="neutral"
        variant="outline"
      >
        Set up
      </UButton>
    </div>
  </UCard>
</template>
