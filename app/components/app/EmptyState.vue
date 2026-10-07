<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state-icon">
      <UIcon :name="icon" />
    </div>

    <h3>{{ title }}</h3>
    <p>{{ description }}</p>

    <div v-if="$slots.actions">
      <slot name="actions" />
    </div>
  </div>
</template>
